// GPU-Accelerated Image Generator
// ใช้ GPU เพื่อเพิ่มประสิทธิภาพการสร้างรูปภาพ

import { FontInfo } from './fontRenderer';

export interface GPUImageConfig {
  fontSize: number;
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  format: 'PNG' | 'JPG';
  quality: number;
  useGPU: boolean;
  batchSize: number;
}

export class GPUImageGenerator {
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private config: GPUImageConfig;
  private isGPUAvailable: boolean = false;

  constructor(config: GPUImageConfig) {
    this.config = config;
    this.initializeCanvas();
  }

  private initializeCanvas(): void {
    try {
      if (this.config.useGPU && typeof OffscreenCanvas !== 'undefined') {
        // ใช้ OffscreenCanvas สำหรับ GPU acceleration
        this.canvas = new OffscreenCanvas(this.config.width, this.config.height);
        this.ctx = this.canvas.getContext('2d')!;
        this.isGPUAvailable = true;
        console.log('🚀 GPU Canvas initialized');
      } else {
        // Fallback เป็น regular Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
        this.ctx = this.canvas.getContext('2d')!;
        console.log('💻 CPU Canvas initialized');
      }
    } catch (error) {
      console.warn('⚠️ GPU not available, using CPU:', error);
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
      this.ctx = this.canvas.getContext('2d')!;
      this.isGPUAvailable = false;
    }
  }

  // สร้างรูปภาพเดี่ยว
  async generateSingleImage(text: string, font: FontInfo): Promise<string> {
    // ตั้งค่า Canvas
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
    
    // วาดพื้นหลัง
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    
    // ตั้งค่าฟอนต์
    this.ctx.font = `${this.config.fontSize}px "${font.name}"`;
    this.ctx.fillStyle = this.config.textColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // เพิ่มการปรับปรุงคุณภาพ
    if (this.isGPUAvailable) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
    
    // วาดข้อความ
    const x = this.config.width / 2;
    const y = this.config.height / 2;
    this.ctx.fillText(text, x, y);
    
    // แปลงเป็น DataURL
    if (this.canvas instanceof OffscreenCanvas) {
      const blob = await this.canvas.convertToBlob({
        type: `image/${this.config.format.toLowerCase()}`,
        quality: this.config.quality
      });
      return await this.blobToDataURL(blob);
    } else {
      return this.canvas.toDataURL(
        `image/${this.config.format.toLowerCase()}`,
        this.config.quality
      );
    }
  }

  // สร้างรูปภาพหลายรูปพร้อมกัน (Batch Processing)
  async generateBatchImages(
    texts: string[], 
    font: FontInfo,
    onProgress?: (completed: number, total: number) => void
  ): Promise<string[]> {
    const results: string[] = [];
    const batchSize = this.config.batchSize;
    
    console.log(`🔄 Generating ${texts.length} images in batches of ${batchSize}`);
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      // ประมวลผล batch นี้
      const batchPromises = batch.map(text => this.generateSingleImage(text, font));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      // อัปเดต progress
      if (onProgress) {
        onProgress(results.length, texts.length);
      }
      
      // หน่วงเวลาเล็กน้อยเพื่อไม่ให้ระบบค้าง
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }

  // สร้างรูปภาพสำหรับหลายฟอนต์พร้อมกัน
  async generateMultiFontImages(
    texts: string[],
    fonts: FontInfo[],
    onProgress?: (fontIndex: number, imageIndex: number, totalImages: number) => void
  ): Promise<Map<string, string[]>> {
    const results = new Map<string, string[]>();
    const totalImages = texts.length * fonts.length;
    let completedImages = 0;
    
    console.log(`🎨 Generating images for ${fonts.length} fonts (${totalImages} total images)`);
    
    // ประมวลผลแต่ละฟอนต์
    const fontPromises = fonts.map(async (font, fontIndex) => {
      console.log(`📝 Processing font: ${font.name}`);
      
      const fontImages = await this.generateBatchImages(
        texts,
        font,
        (completed, total) => {
          completedImages = (fontIndex * texts.length) + completed;
          if (onProgress) {
            onProgress(fontIndex, completed, totalImages);
          }
        }
      );
      
      results.set(font.name, fontImages);
      console.log(`✅ Completed font: ${font.name} (${fontImages.length} images)`);
    });
    
    // รอให้ทุกฟอนต์เสร็จ
    await Promise.all(fontPromises);
    
    console.log(`🎉 All fonts completed! Total: ${totalImages} images`);
    return results;
  }

  // Helper function: แปลง Blob เป็น DataURL
  private async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // อัปเดตการตั้งค่า
  updateConfig(newConfig: Partial<GPUImageConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // ถ้าเปลี่ยนขนาด Canvas ต้องสร้างใหม่
    if (newConfig.width || newConfig.height) {
      this.canvas.width = this.config.width;
      this.canvas.height = this.config.height;
    }
  }

  // ตรวจสอบสถานะ GPU
  getGPUStatus(): { available: boolean; type: string } {
    return {
      available: this.isGPUAvailable,
      type: this.isGPUAvailable ? 'OffscreenCanvas' : 'Regular Canvas'
    };
  }

  // ทำความสะอาด resources
  dispose(): void {
    // ไม่จำเป็นต้องทำอะไรพิเศษสำหรับ Canvas
    console.log('🧹 GPU Image Generator disposed');
  }
}

// Helper function สำหรับสร้าง GPU Image Generator
export function createGPUImageGenerator(config: GPUImageConfig): GPUImageGenerator {
  return new GPUImageGenerator(config);
}

// ตรวจสอบว่า GPU acceleration พร้อมใช้งานหรือไม่
export function isGPUAvailable(): boolean {
  try {
    return typeof OffscreenCanvas !== 'undefined' && 
           typeof OffscreenCanvasRenderingContext2D !== 'undefined';
  } catch {
    return false;
  }
}

// ประมาณการประสิทธิภาพ
export function estimatePerformance(imageCount: number, useGPU: boolean): {
  estimatedTime: number; // วินาที
  imagesPerSecond: number;
} {
  const baseSpeed = useGPU ? 50 : 20; // images per second
  const estimatedTime = Math.ceil(imageCount / baseSpeed);
  
  return {
    estimatedTime,
    imagesPerSecond: baseSpeed
  };
}