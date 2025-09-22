// Professional Font Rendering System
// เหมือนการแสดง font ใน Word หรือโปรแกรมออกแบบ

export interface FontRenderingOptions {
  antialiasing: boolean;
  subpixelRendering: boolean;
  hinting: boolean;
  kerning: boolean;
  ligatures: boolean;
  textShaping: boolean;
}

export interface FontMetrics {
  ascent: number;
  descent: number;
  lineHeight: number;
  xHeight: number;
  capHeight: number;
  baseline: number;
}

export interface FontInfo {
  file: File;
  name: string;
  family: string;
  loaded: boolean;
  preview?: string;
}

export class ProfessionalFontRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fontFace: FontFace | null = null;
  private fontName: string = '';

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d', {
      // Enable high-quality rendering
      alpha: true,
      desynchronized: false,
      colorSpace: 'srgb'
    });
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }
    
    this.ctx = ctx;
    
    // Enable high-quality text rendering
    this.ctx.textRenderingOptimization = 'optimizeQuality';
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  async loadFont(fontFile: File): Promise<boolean> {
    try {
      console.log(`🎨 Loading font for professional rendering: ${fontFile.name}`);
      
      const fontUrl = URL.createObjectURL(fontFile);
      this.fontName = `ProfessionalFont_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create FontFace with advanced options
      this.fontFace = new FontFace(this.fontName, `url(${fontUrl})`, {
        display: 'block', // Block rendering until font loads
        stretch: 'normal',
        style: 'normal',
        weight: 'normal',
        unicodeRange: 'U+0000-U+FFFF' // Support full Unicode range
      });

      // Load font with timeout
      const loadedFont = await Promise.race([
        this.fontFace.load(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Font load timeout')), 10000)
        )
      ]) as FontFace;

      // Add to document fonts
      document.fonts.add(loadedFont);
      
      // Wait for font to be fully ready
      await document.fonts.ready;
      
      // Verify font is actually loaded and working
      const isWorking = await this.verifyFontLoading();
      
      if (isWorking) {
        console.log(`✅ Professional font loaded successfully: ${this.fontName}`);
        return true;
      } else {
        console.log(`❌ Font verification failed: ${this.fontName}`);
        this.cleanup();
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Failed to load font professionally:`, error);
      this.cleanup();
      return false;
    }
  }

  private async verifyFontLoading(): Promise<boolean> {
    if (!this.fontFace || !this.fontName) return false;

    try {
      // Test with multiple character sets
      const testSets = [
        { name: 'Lao', chars: ['ສ', 'ະ', 'ບ', 'າ', 'ຍ', 'ດ', 'ີ', 'ຂ', 'ອ', 'ຍ'] },
        { name: 'English', chars: ['A', 'B', 'C', 'a', 'b', 'c', 'M', 'W'] },
        { name: 'Numbers', chars: ['0', '1', '2', '3', '4', '5'] },
        { name: 'Punctuation', chars: ['.', ',', '!', '?', ':', ';'] }
      ];

      let totalTests = 0;
      let passedTests = 0;

      for (const testSet of testSets) {
        for (const char of testSet.chars) {
          totalTests++;
          
          // Test custom font
          this.ctx.font = `24px "${this.fontName}"`;
          const customWidth = this.ctx.measureText(char).width;
          
          // Test system font
          this.ctx.font = '24px Arial';
          const systemWidth = this.ctx.measureText(char).width;
          
          // Character should render with reasonable width
          if (customWidth > 0 && customWidth !== systemWidth) {
            passedTests++;
          }
        }
      }

      const successRate = passedTests / totalTests;
      console.log(`Font verification: ${passedTests}/${totalTests} tests passed (${(successRate * 100).toFixed(1)}%)`);
      
      return successRate > 0.5; // At least 50% of characters should work
      
    } catch (error) {
      console.error('Font verification error:', error);
      return false;
    }
  }

  getFontMetrics(fontSize: number): FontMetrics {
    if (!this.fontName) {
      throw new Error('No font loaded');
    }

    this.ctx.font = `${fontSize}px "${this.fontName}"`;
    
    // Measure various characters to determine font metrics
    const testChars = {
      ascender: 'ດ', // Lao character with ascender
      descender: 'ງ', // Lao character with descender  
      xHeight: 'ະ',  // Lao vowel for x-height
      capHeight: 'ສ', // Lao consonant for cap height
      baseline: 'າ'   // Lao vowel for baseline
    };

    const measurements = {};
    for (const [key, char] of Object.entries(testChars)) {
      const metrics = this.ctx.measureText(char);
      measurements[key] = {
        width: metrics.width,
        actualBoundingBoxAscent: metrics.actualBoundingBoxAscent || fontSize * 0.8,
        actualBoundingBoxDescent: metrics.actualBoundingBoxDescent || fontSize * 0.2,
        fontBoundingBoxAscent: metrics.fontBoundingBoxAscent || fontSize * 0.9,
        fontBoundingBoxDescent: metrics.fontBoundingBoxDescent || fontSize * 0.3
      };
    }

    return {
      ascent: Math.max(...Object.values(measurements).map((m: any) => m.actualBoundingBoxAscent)),
      descent: Math.max(...Object.values(measurements).map((m: any) => m.actualBoundingBoxDescent)),
      lineHeight: fontSize * 1.2,
      xHeight: measurements.xHeight?.actualBoundingBoxAscent || fontSize * 0.5,
      capHeight: measurements.capHeight?.actualBoundingBoxAscent || fontSize * 0.7,
      baseline: 0
    };
  }

  renderText(
    text: string, 
    width: number, 
    height: number, 
    fontSize: number,
    options: Partial<FontRenderingOptions> = {}
  ): HTMLCanvasElement {
    if (!this.fontName) {
      throw new Error('No font loaded');
    }

    // Set canvas size with high DPI support
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    // Scale context for high DPI
    this.ctx.scale(dpr, dpr);
    
    // Apply professional rendering settings
    this.applyRenderingOptions(options);
    
    // Set font with proper sizing
    const scaledFontSize = fontSize;
    this.ctx.font = `${scaledFontSize}px "${this.fontName}"`;
    
    // Get font metrics for proper positioning
    const metrics = this.getFontMetrics(scaledFontSize);
    
    // Clear canvas with white background
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, width, height);
    
    // Set text color
    this.ctx.fillStyle = '#000000';
    
    // Calculate optimal text positioning
    const lines = this.wrapText(text, width * 0.9, scaledFontSize);
    const totalTextHeight = lines.length * metrics.lineHeight;
    const startY = (height - totalTextHeight) / 2 + metrics.ascent;
    
    // Render each line with proper spacing
    lines.forEach((line, index) => {
      const lineY = startY + (index * metrics.lineHeight);
      const lineWidth = this.ctx.measureText(line).width;
      const lineX = (width - lineWidth) / 2;
      
      // Apply text shaping if supported
      if (options.textShaping && 'fontKerning' in this.ctx) {
        (this.ctx as any).fontKerning = 'normal';
      }
      
      // Render the text
      this.ctx.fillText(line, lineX, lineY);
    });
    
    return this.canvas;
  }

  private applyRenderingOptions(options: Partial<FontRenderingOptions>) {
    const defaultOptions: FontRenderingOptions = {
      antialiasing: true,
      subpixelRendering: true,
      hinting: true,
      kerning: true,
      ligatures: true,
      textShaping: true
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    // Apply antialiasing
    if (finalOptions.antialiasing) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
    
    // Apply text rendering optimization
    if (finalOptions.subpixelRendering) {
      this.ctx.textRenderingOptimization = 'optimizeQuality';
    }
    
    // Apply kerning if supported
    if (finalOptions.kerning && 'fontKerning' in this.ctx) {
      (this.ctx as any).fontKerning = 'normal';
    }
    
    // Apply font variant settings if supported
    if (finalOptions.ligatures && 'fontVariantLigatures' in this.ctx) {
      (this.ctx as any).fontVariantLigatures = 'normal';
    }
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = this.ctx.measureText(testLine).width;
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  cleanup() {
    if (this.fontFace) {
      document.fonts.delete(this.fontFace);
      this.fontFace = null;
    }
    this.fontName = '';
  }

  getFontName(): string {
    return this.fontName;
  }

  isLoaded(): boolean {
    return !!this.fontFace && !!this.fontName;
  }
}

// Export utility function for easy use
export async function createProfessionalFontRenderer(fontFile: File): Promise<ProfessionalFontRenderer | null> {
  const renderer = new ProfessionalFontRenderer();
  const success = await renderer.loadFont(fontFile);
  
  if (success) {
    return renderer;
  } else {
    renderer.cleanup();
    return null;
  }
}