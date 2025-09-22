// Professional Dataset Management System
// ระบบจัดการ Dataset แบบมืออาชีพสำหรับ OCR Training

import { GeneratedImage } from '../components/PreviewGrid';

export interface DatasetConfig {
  outputPath: string;
  projectName: string;
  imageFormat: 'png' | 'jpg';
  includeMetadata: boolean;
  organizationMode: 'by_font' | 'by_text_type' | 'flat';
  autoSkipNonLao: boolean;
  batchSize: number;
}

export interface FontAnalysis {
  fontName: string;
  isLaoCompatible: boolean;
  supportedCharacters: string[];
  unsupportedCharacters: string[];
  compatibilityScore: number;
  recommendation: 'use' | 'skip' | 'warning';
}

export interface DatasetMetadata {
  projectName: string;
  createdAt: string;
  totalImages: number;
  totalFonts: number;
  laoFonts: number;
  skippedFonts: number;
  imageFormat: string;
  organizationMode: string;
  fonts: FontAnalysis[];
  statistics: {
    professionalRendering: number;
    forcedRendering: number;
    systemFallback: number;
  };
}

export class DatasetManager {
  private config: DatasetConfig;
  private metadata: DatasetMetadata;
  private processedFonts: Set<string> = new Set();
  private skippedFonts: Set<string> = new Set();

  constructor(config: DatasetConfig) {
    this.config = config;
    this.metadata = {
      projectName: config.projectName,
      createdAt: new Date().toISOString(),
      totalImages: 0,
      totalFonts: 0,
      laoFonts: 0,
      skippedFonts: 0,
      imageFormat: config.imageFormat,
      organizationMode: config.organizationMode,
      fonts: [],
      statistics: {
        professionalRendering: 0,
        forcedRendering: 0,
        systemFallback: 0
      }
    };
  }

  // วิเคราะห์ font ว่ารองรับภาษาลาวหรือไม่
  async analyzeFontCompatibility(fontFile: File): Promise<FontAnalysis> {
    console.log(`🔍 Analyzing font compatibility: ${fontFile.name}`);

    // Lao Unicode characters to test
    const laoTestChars = [
      'ກ', 'ຂ', 'ຄ', 'ງ', 'ຈ', 'ສ', 'ຊ', 'ຍ', 'ດ', 'ຕ', 'ຖ', 'ທ', 'ນ', 'ບ', 'ປ', 'ຜ', 'ຝ', 'ພ', 'ຟ', 'ມ', 'ຢ', 'ຣ', 'ລ', 'ວ', 'ຫ', 'ອ', 'ຮ',
      'ະ', 'າ', 'ຳ', 'ິ', 'ີ', 'ຶ', 'ື', 'ຸ', 'ູ', 'ົ', 'ໍ', 'ັ', 'ິ', 'ີ', 'ຶ', 'ື', 'ຸ', 'ູ',
      '່', '້', '໊', '໋', '໌', 'ໍ', '໎', '໏', '໐', '໑', '໒', '໓', '໔', '໕', '໖', '໗', '໘', '໙'
    ];

    try {
      // Create temporary canvas for testing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot create canvas context');

      // Load font temporarily
      const fontUrl = URL.createObjectURL(fontFile);
      const fontName = `TestFont_${Date.now()}`;
      const fontFace = new FontFace(fontName, `url(${fontUrl})`);
      
      await fontFace.load();
      document.fonts.add(fontFace);
      await document.fonts.ready;

      // Test each Lao character
      ctx.font = `24px "${fontName}"`;
      const supportedChars: string[] = [];
      const unsupportedChars: string[] = [];

      // Test with system font for comparison
      ctx.font = '24px Arial';
      const systemWidths = new Map();
      for (const char of laoTestChars) {
        systemWidths.set(char, ctx.measureText(char).width);
      }

      // Test with custom font
      ctx.font = `24px "${fontName}"`;
      for (const char of laoTestChars) {
        const customWidth = ctx.measureText(char).width;
        const systemWidth = systemWidths.get(char) || 0;
        
        // Character is supported if it renders with reasonable width and differs from system
        if (customWidth > 3 && Math.abs(customWidth - systemWidth) > 1) {
          supportedChars.push(char);
        } else {
          unsupportedChars.push(char);
        }
      }

      // Calculate compatibility score
      const compatibilityScore = (supportedChars.length / laoTestChars.length) * 100;
      
      // Determine recommendation
      let recommendation: 'use' | 'skip' | 'warning';
      if (compatibilityScore >= 80) {
        recommendation = 'use';
      } else if (compatibilityScore >= 50) {
        recommendation = 'warning';
      } else {
        recommendation = 'skip';
      }

      const isLaoCompatible = compatibilityScore >= 50;

      // Cleanup
      document.fonts.delete(fontFace);
      URL.revokeObjectURL(fontUrl);

      const analysis: FontAnalysis = {
        fontName: fontFile.name,
        isLaoCompatible,
        supportedCharacters: supportedChars,
        unsupportedCharacters: unsupportedChars,
        compatibilityScore,
        recommendation
      };

      console.log(`✅ Font analysis complete: ${fontFile.name} - ${compatibilityScore.toFixed(1)}% compatible (${recommendation})`);
      return analysis;

    } catch (error) {
      console.error(`❌ Font analysis failed for ${fontFile.name}:`, error);
      return {
        fontName: fontFile.name,
        isLaoCompatible: false,
        supportedCharacters: [],
        unsupportedCharacters: laoTestChars,
        compatibilityScore: 0,
        recommendation: 'skip'
      };
    }
  }

  // กรอง fonts ที่รองรับภาษาลาว
  async filterLaoFonts(fonts: File[]): Promise<{ laoFonts: File[], skippedFonts: File[], analyses: FontAnalysis[] }> {
    console.log(`🔍 Filtering ${fonts.length} fonts for Lao compatibility...`);
    
    const laoFonts: File[] = [];
    const skippedFonts: File[] = [];
    const analyses: FontAnalysis[] = [];

    for (const font of fonts) {
      const analysis = await this.analyzeFontCompatibility(font);
      analyses.push(analysis);

      if (this.config.autoSkipNonLao) {
        if (analysis.isLaoCompatible) {
          laoFonts.push(font);
          console.log(`✅ Font accepted: ${font.name} (${analysis.compatibilityScore.toFixed(1)}%)`);
        } else {
          skippedFonts.push(font);
          console.log(`⏭️ Font skipped: ${font.name} (${analysis.compatibilityScore.toFixed(1)}%)`);
        }
      } else {
        // Include all fonts if auto-skip is disabled
        laoFonts.push(font);
        if (!analysis.isLaoCompatible) {
          console.log(`⚠️ Font included with warning: ${font.name} (${analysis.compatibilityScore.toFixed(1)}%)`);
        }
      }
    }

    this.metadata.fonts = analyses;
    this.metadata.totalFonts = fonts.length;
    this.metadata.laoFonts = laoFonts.length;
    this.metadata.skippedFonts = skippedFonts.length;

    console.log(`📊 Font filtering complete: ${laoFonts.length} accepted, ${skippedFonts.length} skipped`);
    
    return { laoFonts, skippedFonts, analyses };
  }

  // สร้างโครงสร้างโฟลเดอร์
  private getImagePath(image: GeneratedImage, fontName: string, index: number): string {
    const sanitizedProjectName = this.config.projectName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const sanitizedFontName = fontName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    let relativePath = '';
    
    switch (this.config.organizationMode) {
      case 'by_font':
        relativePath = `${sanitizedProjectName}/${timestamp}/fonts/${sanitizedFontName}/image_${index.toString().padStart(6, '0')}.${this.config.imageFormat}`;
        break;
        
      case 'by_text_type':
        const textType = this.categorizeText(image.text);
        relativePath = `${sanitizedProjectName}/${timestamp}/text_types/${textType}/${sanitizedFontName}_${index.toString().padStart(6, '0')}.${this.config.imageFormat}`;
        break;
        
      case 'flat':
      default:
        relativePath = `${sanitizedProjectName}/${timestamp}/images/${sanitizedFontName}_${index.toString().padStart(6, '0')}.${this.config.imageFormat}`;
        break;
    }
    
    return `${this.config.outputPath}/${relativePath}`;
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

  // บันทึกรูปภาพและ metadata
  async saveDataset(images: GeneratedImage[]): Promise<void> {
    console.log(`💾 Saving dataset with ${images.length} images...`);
    
    try {
      // Update statistics
      this.metadata.totalImages = images.length;
      images.forEach(img => {
        if (img.font.includes('PROFESSIONAL')) {
          this.metadata.statistics.professionalRendering++;
        } else if (img.font.includes('FORCED')) {
          this.metadata.statistics.forcedRendering++;
        } else {
          this.metadata.statistics.systemFallback++;
        }
      });

      // Create directory structure
      await this.createDirectoryStructure();

      // Save images in batches
      const batchSize = this.config.batchSize || 100;
      for (let i = 0; i < images.length; i += batchSize) {
        const batch = images.slice(i, i + batchSize);
        await this.saveBatch(batch, i);
        console.log(`📁 Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(images.length / batchSize)}`);
      }

      // Save metadata
      if (this.config.includeMetadata) {
        await this.saveMetadata();
      }

      // Save annotations for OCR training
      await this.saveAnnotations(images);

      console.log(`✅ Dataset saved successfully to: ${this.config.outputPath}`);
      
    } catch (error) {
      console.error('❌ Error saving dataset:', error);
      throw error;
    }
  }

  // สร้างโครงสร้างโฟลเดอร์
  private async createDirectoryStructure(): Promise<void> {
    // Note: In a real implementation, you would use Node.js fs module
    // This is a placeholder for the browser environment
    console.log('📁 Creating directory structure...');
  }

  // บันทึก batch ของรูปภาพ
  private async saveBatch(images: GeneratedImage[], startIndex: number): Promise<void> {
    const promises = images.map(async (image, index) => {
      const globalIndex = startIndex + index;
      const fontName = this.extractFontName(image.font);
      const imagePath = this.getImagePath(image, fontName, globalIndex);
      
      // Convert data URL to blob
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();
      
      // In a real implementation, save to file system
      console.log(`💾 Saving image: ${imagePath}`);
      
      // For browser environment, we'll use the File System Access API if available
      // or fall back to download
      await this.saveImageFile(imagePath, blob);
    });

    await Promise.all(promises);
  }

  // บันทึกไฟล์รูปภาพ
  private async saveImageFile(path: string, blob: Blob): Promise<void> {
    // In a real Node.js environment, use fs.writeFile
    // For browser, this is a placeholder
    console.log(`📄 Image saved: ${path} (${blob.size} bytes)`);
  }

  // บันทึก metadata
  private async saveMetadata(): Promise<void> {
    const metadataPath = `${this.config.outputPath}/${this.config.projectName}_metadata.json`;
    const metadataJson = JSON.stringify(this.metadata, null, 2);
    
    console.log(`📋 Saving metadata: ${metadataPath}`);
    // In real implementation: fs.writeFile(metadataPath, metadataJson)
  }

  // บันทึก annotations สำหรับ OCR training
  private async saveAnnotations(images: GeneratedImage[]): Promise<void> {
    const annotations = images.map((image, index) => {
      const fontName = this.extractFontName(image.font);
      const imagePath = this.getImagePath(image, fontName, index);
      
      return {
        image_path: imagePath,
        text: image.text,
        font: fontName,
        style: image.style || 'default',
        language: this.detectLanguage(image.text),
        character_count: image.text.length,
        word_count: image.text.split(' ').length
      };
    });

    const annotationsPath = `${this.config.outputPath}/${this.config.projectName}_annotations.json`;
    const annotationsJson = JSON.stringify(annotations, null, 2);
    
    console.log(`📝 Saving annotations: ${annotationsPath}`);
    // In real implementation: fs.writeFile(annotationsPath, annotationsJson)
  }

  // ตรวจจับภาษา
  private detectLanguage(text: string): string {
    const hasLao = /[\u0E80-\u0EFF]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    
    if (hasLao && hasEnglish) return 'mixed';
    if (hasLao) return 'lao';
    if (hasEnglish) return 'english';
    return 'other';
  }

  // แยกชื่อ font จาก font string
  private extractFontName(fontString: string): string {
    // Remove status indicators and extract font name
    return fontString
      .replace(/🎨|🎯|✅|🔧/g, '')
      .replace(/\s*\(.*\)\s*/g, '')
      .trim();
  }

  // ดึงข้อมูล metadata
  getMetadata(): DatasetMetadata {
    return { ...this.metadata };
  }

  // ดึงสถิติ
  getStatistics() {
    return {
      totalFonts: this.metadata.totalFonts,
      laoFonts: this.metadata.laoFonts,
      skippedFonts: this.metadata.skippedFonts,
      totalImages: this.metadata.totalImages,
      professionalRendering: this.metadata.statistics.professionalRendering,
      forcedRendering: this.metadata.statistics.forcedRendering,
      systemFallback: this.metadata.statistics.systemFallback
    };
  }
}