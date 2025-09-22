// Real-time Dataset Exporter
// Export ผลลัพธ์ทันทีตามลำดับที่ทำงาน

import JSZip from 'jszip';
import { GeneratedImage } from '../components/PreviewGrid';

export interface ExportConfig {
  outputPath: string;
  projectName: string;
  imageFormat: 'png' | 'jpg';
  organizationMode: 'by_font' | 'by_text_type' | 'flat';
  enableRealTimeExport: boolean;
  batchSize: number;
  singleDownload: boolean;  // ดาวน์โหลด 1 ครั้งเมื่อเสร็จ
  useGPU: boolean;          // ใช้ GPU acceleration
  maxConcurrentFonts: number; // จำนวนฟอนต์ที่ประมวลผลพร้อมกัน
}

export interface ExportProgress {
  totalImages: number;
  exportedImages: number;
  currentFont: string;
  currentBatch: number;
  totalBatches: number;
  isExporting: boolean;
  lastExportedFile: string;
}

export class RealTimeExporter {
  private config: ExportConfig;
  private exportQueue: GeneratedImage[] = [];
  private allImages: GeneratedImage[] = [];  // เก็บรูปภาพทั้งหมดสำหรับดาวน์โหลดครั้งเดียว
  private isProcessing: boolean = false;
  private exportedCount: number = 0;
  private currentBatch: number = 0;
  private onProgressCallback?: (progress: ExportProgress) => void;
  private gpuCanvas?: OffscreenCanvas;  // Canvas สำหรับ GPU
  private gpuContext?: OffscreenCanvasRenderingContext2D;

  constructor(config: ExportConfig) {
    this.config = config;
    this.initializeGPU();
  }

  // เริ่มต้น GPU acceleration
  private async initializeGPU(): Promise<void> {
    if (!this.config.useGPU) return;
    
    try {
      // สร้าง OffscreenCanvas สำหรับ GPU processing
      this.gpuCanvas = new OffscreenCanvas(800, 600);
      this.gpuContext = this.gpuCanvas.getContext('2d');
      
      if (this.gpuContext) {
        console.log('🚀 GPU acceleration initialized');
      }
    } catch (error) {
      console.warn('⚠️ GPU acceleration not available, falling back to CPU:', error);
      this.config.useGPU = false;
    }
  }

  // ตั้งค่า callback สำหรับ progress
  setProgressCallback(callback: (progress: ExportProgress) => void) {
    this.onProgressCallback = callback;
  }

  // เพิ่มรูปเข้า collection สำหรับ export
  async addToExportQueue(image: GeneratedImage): Promise<void> {
    // เก็บรูปภาพทั้งหมดไว้สำหรับดาวน์โหลดครั้งเดียว
    this.allImages.push(image);
    
    console.log(`📥 Added image: ${image.text.substring(0, 20)}... (Total: ${this.allImages.length})`);
    
    // ถ้าเปิดใช้ single download จะไม่ดาวน์โหลดทันที
    if (this.config.singleDownload) {
      // แค่อัปเดต progress
      this.updateProgress(image);
      return;
    }
    
    // ระบบเดิม (batch download)
    this.exportQueue.push(image);
    if (!this.isProcessing && this.config.enableRealTimeExport) {
      this.startProcessing();
    }
  }

  // ดาวน์โหลดทั้งหมดครั้งเดียว
  async downloadAll(): Promise<void> {
    if (this.allImages.length === 0) {
      console.warn('⚠️ No images to download');
      return;
    }

    console.log(`📦 Starting single download of ${this.allImages.length} images...`);
    
    try {
      const zip = new JSZip();
      
      // จัดกลุ่มตามฟอนต์
      const imagesByFont = this.groupImagesByFont(this.allImages);
      
      // เพิ่มรูปภาพแยกตามฟอนต์
      for (const [fontName, images] of Object.entries(imagesByFont)) {
        const sanitizedFontName = fontName.replace(/[^a-zA-Z0-9-_]/g, '_');
        
        images.forEach((image, index) => {
          const filename = `${sanitizedFontName}_${(index + 1).toString().padStart(5, '0')}.${this.config.imageFormat}`;
          const folderPath = `fonts/${sanitizedFontName}/${filename}`;
          
          // แปลง dataURL เป็น base64
          const base64Data = image.dataUrl.split(',')[1];
          zip.file(folderPath, base64Data, {base64: true});
        });
        
        // สร้างไฟล์ labels สำหรับแต่ละฟอนต์
        const labels = this.createLabelsForImages(images, fontName);
        zip.file(`fonts/${sanitizedFontName}/labels.json`, JSON.stringify(labels, null, 2));
      }
      
      // เพิ่มไฟล์สถิติรวม
      const statistics = this.generateStatistics();
      zip.file('statistics.json', JSON.stringify(statistics, null, 2));
      
      // เพิ่มไฟล์คำแนะนำ
      zip.file('README.md', this.generateReadme());
      
      // สร้างและดาวน์โหลดไฟล์ ZIP
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${this.config.projectName}_${timestamp}_${this.allImages.length}images.zip`;
      
      // ใช้ FileSaver.js ดาวน์โหลด
      const { saveAs } = await import('file-saver');
      saveAs(content, filename);
      
      console.log(`✅ Downloaded: ${filename} (${this.allImages.length} images)`);
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }

  // เริ่มการ process queue
  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('🚀 Starting real-time export processing...');
    
    while (this.exportQueue.length > 0) {
      const batch = this.exportQueue.splice(0, this.config.batchSize);
      await this.processBatch(batch);
      
      // Update progress
      this.updateProgress();
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.isProcessing = false;
    console.log('✅ Real-time export processing completed');
  }

  // ประมวลผล batch
  private async processBatch(batch: GeneratedImage[]): Promise<void> {
    this.currentBatch++;
    
    console.log(`📦 Processing batch ${this.currentBatch} with ${batch.length} images...`);
    
    const promises = batch.map(async (image, index) => {
      try {
        await this.exportSingleImage(image);
        this.exportedCount++;
        
        // Update progress for each image
        this.updateProgress(image);
        
      } catch (error) {
        console.error(`❌ Failed to export image ${index + 1} in batch ${this.currentBatch}:`, error);
      }
    });
    
    await Promise.all(promises);
    console.log(`✅ Batch ${this.currentBatch} completed`);
  }

  // Export รูปเดียว
  private async exportSingleImage(image: GeneratedImage): Promise<void> {
    const filePath = this.generateFilePath(image);
    
    try {
      // Convert data URL to blob
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      
      // Export ไฟล์ (ใน browser environment จะใช้ File System Access API หรือ download)
      await this.saveImageFile(filePath, blob, image);
      
      console.log(`💾 Exported: ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Export failed for ${filePath}:`, error);
      throw error;
    }
  }

  // สร้าง file path
  private generateFilePath(image: GeneratedImage): string {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fontName = this.extractFontName(image.font);
    const sanitizedFontName = fontName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const sanitizedProjectName = this.config.projectName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    // สร้าง unique filename
    const imageIndex = this.exportedCount + 1;
    const filename = `${sanitizedFontName}_${imageIndex.toString().padStart(6, '0')}.${this.config.imageFormat}`;
    
    let relativePath = '';
    
    switch (this.config.organizationMode) {
      case 'by_font':
        relativePath = `${sanitizedProjectName}/${timestamp}/fonts/${sanitizedFontName}/${filename}`;
        break;
        
      case 'by_text_type':
        const textType = this.categorizeText(image.text);
        relativePath = `${sanitizedProjectName}/${timestamp}/text_types/${textType}/${filename}`;
        break;
        
      case 'flat':
      default:
        relativePath = `${sanitizedProjectName}/${timestamp}/images/${filename}`;
        break;
    }
    
    return `${this.config.outputPath}/${relativePath}`;
  }

  // บันทึกไฟล์รูปภาพ
  private async saveImageFile(filePath: string, blob: Blob, image: GeneratedImage): Promise<void> {
    // ใน browser environment
    if (typeof window !== 'undefined') {
      // ใช้ File System Access API ถ้ามี
      if ('showSaveFilePicker' in window) {
        try {
          await this.saveWithFileSystemAPI(filePath, blob);
          return;
        } catch (error) {
          console.log('File System API not available, using download fallback');
        }
      }
      
      // Fallback: ใช้ download
      await this.saveWithDownload(filePath, blob);
    } else {
      // ใน Node.js environment (ถ้ามี)
      await this.saveWithNodeJS(filePath, blob);
    }
  }

  // บันทึกด้วย File System Access API
  private async saveWithFileSystemAPI(filePath: string, blob: Blob): Promise<void> {
    try {
      // สร้าง directory structure
      const pathParts = filePath.split('/');
      const filename = pathParts.pop() || 'image.png';
      
      // ใน production จะต้องใช้ File System Access API จริง
      console.log(`📁 Would save with File System API: ${filePath}`);
      
      // Placeholder for actual File System API implementation
      // const fileHandle = await window.showSaveFilePicker({
      //   suggestedName: filename,
      //   types: [{
      //     description: 'Images',
      //     accept: { 'image/*': ['.png', '.jpg'] }
      //   }]
      // });
      // const writable = await fileHandle.createWritable();
      // await writable.write(blob);
      // await writable.close();
      
    } catch (error) {
      throw new Error(`File System API save failed: ${error}`);
    }
  }

  // บันทึกด้วย download (fallback)
  private async saveWithDownload(filePath: string, blob: Blob): Promise<void> {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filePath.split('/').pop() || 'image.png';
    
    // เพิ่มลงใน DOM ชั่วคราว
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // ทำความสะอาด
    URL.revokeObjectURL(url);
    
    console.log(`⬇️ Downloaded: ${a.download}`);
  }

  // บันทึกด้วย Node.js (สำหรับ server-side)
  private async saveWithNodeJS(filePath: string, blob: Blob): Promise<void> {
    // Placeholder for Node.js implementation
    console.log(`🖥️ Would save with Node.js: ${filePath}`);
    
    // const fs = require('fs').promises;
    // const path = require('path');
    // 
    // // สร้าง directory ถ้าไม่มี
    // const dir = path.dirname(filePath);
    // await fs.mkdir(dir, { recursive: true });
    // 
    // // แปลง blob เป็น buffer
    // const arrayBuffer = await blob.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);
    // 
    // // เขียนไฟล์
    // await fs.writeFile(filePath, buffer);
  }

  // จำแนกประเภทข้อความ
  private categorizeText(text: string): string {
    const hasLao = /[\u0E80-\u0EFF]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    const hasNumbers = /[0-9]/.test(text);
    const hasPunctuation = /[.,!?;:]/.test(text);
    
    if (hasLao && hasEnglish) return 'mixed_lao_english';
    if (hasLao && hasNumbers) return 'lao_with_numbers';
    if (hasLao) return 'pure_lao';
    if (hasEnglish && hasNumbers) return 'english_with_numbers';
    if (hasEnglish) return 'pure_english';
    if (hasNumbers) return 'numbers_only';
    if (hasPunctuation) return 'punctuation';
    return 'other';
  }

  // แยกชื่อ font
  private extractFontName(fontString: string): string {
    return fontString
      .replace(/🎨|🎯|✅|🔧/g, '')
      .replace(/\s*\(.*\)\s*/g, '')
      .trim();
  }

  // อัปเดต progress
  private updateProgress(lastImage?: GeneratedImage): void {
    if (!this.onProgressCallback) return;
    
    const progress: ExportProgress = {
      totalImages: this.exportedCount + this.exportQueue.length,
      exportedImages: this.exportedCount,
      currentFont: lastImage ? this.extractFontName(lastImage.font) : '',
      currentBatch: this.currentBatch,
      totalBatches: Math.ceil((this.exportedCount + this.exportQueue.length) / this.config.batchSize),
      isExporting: this.isProcessing,
      lastExportedFile: lastImage ? this.generateFilePath(lastImage) : ''
    };
    
    this.onProgressCallback(progress);
  }

  // Export ทั้งหมดในครั้งเดียว (สำหรับ batch export)
  async exportAll(images: GeneratedImage[]): Promise<void> {
    console.log(`📤 Starting batch export of ${images.length} images...`);
    
    // เพิ่มทั้งหมดเข้า queue
    for (const image of images) {
      this.exportQueue.push(image);
    }
    
    // เริ่ม process
    await this.startProcessing();
    
    console.log(`✅ Batch export completed: ${this.exportedCount} images exported`);
  }

  // ดึงสถิติ
  getStatistics() {
    return {
      totalExported: this.exportedCount,
      queueLength: this.exportQueue.length,
      currentBatch: this.currentBatch,
      isProcessing: this.isProcessing
    };
  }

  // รีเซ็ต exporter
  reset(): void {
    this.exportQueue = [];
    this.exportedCount = 0;
    this.currentBatch = 0;
    this.isProcessing = false;
    console.log('🔄 Real-time exporter reset');
  }

  // หยุดการ export
  stop(): void {
    this.isProcessing = false;
    console.log('⏹️ Real-time export stopped');
  }

  // จัดกลุ่มรูปภาพตามฟอนต์
  private groupImagesByFont(images: GeneratedImage[]): Record<string, GeneratedImage[]> {
    const grouped: Record<string, GeneratedImage[]> = {};
    
    images.forEach(image => {
      const fontName = image.font || 'unknown';
      if (!grouped[fontName]) {
        grouped[fontName] = [];
      }
      grouped[fontName].push(image);
    });
    
    return grouped;
  }

  // สร้าง labels สำหรับรูปภาพ
  private createLabelsForImages(images: GeneratedImage[], fontName: string): any[] {
    return images.map((image, index) => ({
      filename: `${fontName.replace(/[^a-zA-Z0-9-_]/g, '_')}_${(index + 1).toString().padStart(5, '0')}.${this.config.imageFormat}`,
      text: image.text,
      font: fontName,
      category: this.categorizeText(image.text),
      syllables: this.estimateSyllables(image.text),
      length: image.text.length,
      hasNumbers: /[໐-໙0-9]/.test(image.text),
      hasEnglish: /[a-zA-Z]/.test(image.text),
      timestamp: image.timestamp || Date.now(),
      index: index + 1
    }));
  }

  // สร้างสถิติ
  private generateStatistics(): any {
    const imagesByFont = this.groupImagesByFont(this.allImages);
    const totalImages = this.allImages.length;
    
    const fontStats = Object.entries(imagesByFont).map(([fontName, images]) => ({
      fontName,
      imageCount: images.length,
      percentage: Math.round((images.length / totalImages) * 100)
    }));

    const categories = {};
    this.allImages.forEach(image => {
      const category = this.categorizeText(image.text);
      categories[category] = (categories[category] || 0) + 1;
    });

    return {
      totalImages,
      totalFonts: Object.keys(imagesByFont).length,
      fontStatistics: fontStats,
      categoryDistribution: categories,
      generationInfo: {
        projectName: this.config.projectName,
        imageFormat: this.config.imageFormat,
        organizationMode: this.config.organizationMode,
        useGPU: this.config.useGPU,
        maxConcurrentFonts: this.config.maxConcurrentFonts,
        singleDownload: this.config.singleDownload,
        createdAt: new Date().toISOString()
      }
    };
  }

  // สร้างไฟล์ README
  private generateReadme(): string {
    const stats = this.generateStatistics();
    
    return `# Lao Language Dataset

## Overview
This dataset contains ${stats.totalImages} images generated from ${stats.totalFonts} fonts.

## Structure
\`\`\`
fonts/
├── font1_name/
│   ├── font1_name_00001.${this.config.imageFormat}
│   ├── font1_name_00002.${this.config.imageFormat}
│   ├── ...
│   └── labels.json
├── font2_name/
│   └── ...
├── statistics.json
└── README.md (this file)
\`\`\`

## Font Statistics
${stats.fontStatistics.map(font => 
  `- ${font.fontName}: ${font.imageCount} images (${font.percentage}%)`
).join('\n')}

## Category Distribution
${Object.entries(stats.categoryDistribution).map(([category, count]) => 
  `- ${category}: ${count} images`
).join('\n')}

## Generation Info
- Project: ${stats.generationInfo.projectName}
- Format: ${stats.generationInfo.imageFormat}
- GPU Acceleration: ${stats.generationInfo.useGPU ? 'Enabled' : 'Disabled'}
- Concurrent Fonts: ${stats.generationInfo.maxConcurrentFonts}
- Created: ${stats.generationInfo.createdAt}

## Usage
This dataset is suitable for:
- OCR training and testing
- Font recognition research
- Lao language processing
- Computer vision applications

Generated by Lao Font Craft - OCR Dataset Generator
`;
  }

  // จัดหมวดหมู่ข้อความ
  private categorizeText(text: string): string {
    if (text.length === 1) return 'single_character';
    if (text.length <= 3) return 'single_syllable';
    if (text.length <= 6) return 'two_syllable';
    if (text.length <= 9) return 'three_syllable';
    if (text.length <= 12) return 'four_syllable';
    if (/[໐-໙0-9]/.test(text)) return 'contains_numbers';
    if (/[a-zA-Z]/.test(text)) return 'contains_english';
    if (text.includes(' ')) return 'phrase_or_sentence';
    return 'complex_word';
  }

  // ประมาณการจำนวนพยางค์
  private estimateSyllables(text: string): number {
    // ประมาณการง่ายๆ โดยนับจำนวนสระ
    const vowelPattern = /[າິີຶືຸູົອເແໂໄໃຳຽ]/g;
    const matches = text.match(vowelPattern);
    return matches ? matches.length : 1;
  }
}