// Direct File Export System
// บันทึกไฟล์โดยตรงไปยัง folder ที่เลือก + จดจำสถานะ

interface ExportSettings {
  selectedFolder: string;
  projectName: string;
  autoExport: boolean;
  organizeByFont: boolean;
}

interface ExportProgress {
  totalImages: number;
  exportedImages: number;
  currentFont: string;
  currentFile: string;
  startTime: number;
  lastExportTime: number;
  estimatedTimeRemaining: number;
}

interface GeneratedImage {
  dataUrl: string;
  text: string;
  font: string;
  style: string;
  fileName: string;
  effectType: string;
  fontName: string;
}

class DirectFileExporter {
  private settings: ExportSettings;
  private progress: ExportProgress;
  private isExporting: boolean = false;
  private progressCallback?: (progress: ExportProgress) => void;
  private storageKey = 'lao-dataset-export-settings';
  private progressKey = 'lao-dataset-export-progress';

  constructor() {
    // โหลดการตั้งค่าจาก localStorage
    this.settings = this.loadSettings();
    this.progress = this.loadProgress();
  }

  // บันทึกและโหลดการตั้งค่า
  private saveSettings() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
  }

  private loadSettings(): ExportSettings {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading export settings:', error);
    }
    return {
      selectedFolder: '',
      projectName: `lao-dataset-${new Date().toISOString().split('T')[0]}`,
      autoExport: true,
      organizeByFont: true
    };
  }

  private saveProgress() {
    localStorage.setItem(this.progressKey, JSON.stringify(this.progress));
  }

  private loadProgress(): ExportProgress {
    try {
      const saved = localStorage.getItem(this.progressKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading export progress:', error);
    }
    return {
      totalImages: 0,
      exportedImages: 0,
      currentFont: '',
      currentFile: '',
      startTime: Date.now(),
      lastExportTime: Date.now(),
      estimatedTimeRemaining: 0
    };
  }

  // เลือก folder สำหรับ export
  async selectExportFolder(): Promise<string> {
    try {
      // ใช้ File System Access API (Chrome/Edge)
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite'
        });
        this.settings.selectedFolder = dirHandle.name;
        this.saveSettings();
        return dirHandle.name;
      }
      // Fallback สำหรับ browser อื่น
      else {
        const folderPath = prompt('กรุณาระบุ path ของ folder ที่ต้องการเก็บไฟล์:', 'C:\\Dataset\\Lao-OCR');
        if (folderPath) {
          this.settings.selectedFolder = folderPath;
          this.saveSettings();
          return folderPath;
        }
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
    return '';
  }

  // ตั้งค่า export
  updateSettings(newSettings: Partial<ExportSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // เริ่มต้น export session ใหม่
  startNewSession(totalImages: number) {
    this.progress = {
      totalImages,
      exportedImages: 0,
      currentFont: '',
      currentFile: '',
      startTime: Date.now(),
      lastExportTime: Date.now(),
      estimatedTimeRemaining: 0
    };
    this.saveProgress();
    this.isExporting = true;
  }

  // ทำต่อจาก session เดิม
  resumeSession(): boolean {
    const saved = this.loadProgress();
    if (saved.totalImages > 0 && saved.exportedImages < saved.totalImages) {
      this.progress = saved;
      this.isExporting = true;
      return true;
    }
    return false;
  }

  // export รูปภาพแต่ละรูป
  async exportImage(image: GeneratedImage): Promise<boolean> {
    if (!this.settings.selectedFolder || !this.settings.autoExport) {
      return false;
    }

    try {
      // สร้างชื่อ folder ตามฟอนต์
      const folderName = this.settings.organizeByFont ?
        `${this.settings.projectName}/${image.fontName}` :
        this.settings.projectName;

      // สร้างชื่อไฟล์
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${image.fileName}_${timestamp}.png`;

      // แปลง dataUrl เป็น blob
      const response = await fetch(image.dataUrl);
      const blob = await response.blob();

      // บันทึกไฟล์ (ถ้า browser รองรับ File System Access API)
      if ('showDirectoryPicker' in window) {
        await this.saveToFileSystem(folderName, fileName, blob);
      }
      // Fallback: ใช้ download link
      else {
        this.downloadFile(blob, fileName);
      }

      // อัพเดท progress
      this.progress.exportedImages++;
      this.progress.currentFont = image.fontName;
      this.progress.currentFile = fileName;
      this.progress.lastExportTime = Date.now();

      // คำนวณเวลาที่เหลือ
      const elapsed = this.progress.lastExportTime - this.progress.startTime;
      const rate = this.progress.exportedImages / elapsed; // images per ms
      const remaining = this.progress.totalImages - this.progress.exportedImages;
      this.progress.estimatedTimeRemaining = remaining / rate;

      this.saveProgress();

      // แจ้ง callback
      if (this.progressCallback) {
        this.progressCallback(this.progress);
      }

      console.log(`✅ Exported: ${fileName} to ${folderName}`);
      return true;

    } catch (error) {
      console.error('Error exporting image:', error);
      return false;
    }
  }

  // บันทึกไฟล์ด้วย File System Access API
  private async saveToFileSystem(folderPath: string, fileName: string, blob: Blob) {
    try {
      // แยก path ออกเป็น folder levels
      const folders = folderPath.split('/');
      let currentHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });

      // สร้าง nested folders
      for (const folder of folders) {
        try {
          currentHandle = await currentHandle.getDirectoryHandle(folder, { create: true });
        } catch (error) {
          console.error(`Error creating folder ${folder}:`, error);
        }
      }

      // สร้างไฟล์
      const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

    } catch (error) {
      console.error('Error saving to file system:', error);
      // Fallback to download
      this.downloadFile(blob, fileName);
    }
  }

  // Fallback: ดาวน์โหลดไฟล์
  private downloadFile(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // หยุด export
  pauseExport() {
    this.isExporting = false;
    this.saveProgress();
  }

  // เสร็จสิ้น export
  completeExport() {
    this.isExporting = false;
    this.progress.exportedImages = this.progress.totalImages;
    this.saveProgress();

    if (this.progressCallback) {
      this.progressCallback(this.progress);
    }
  }

  // ล้างข้อมูล progress
  clearProgress() {
    localStorage.removeItem(this.progressKey);
    this.progress = {
      totalImages: 0,
      exportedImages: 0,
      currentFont: '',
      currentFile: '',
      startTime: Date.now(),
      lastExportTime: Date.now(),
      estimatedTimeRemaining: 0
    };
  }

  // Getters
  getSettings(): ExportSettings {
    return { ...this.settings };
  }

  getProgress(): ExportProgress {
    return { ...this.progress };
  }

  isCurrentlyExporting(): boolean {
    return this.isExporting;
  }

  canResume(): boolean {
    return this.progress.totalImages > 0 &&
           this.progress.exportedImages < this.progress.totalImages;
  }

  // Set progress callback
  setProgressCallback(callback: (progress: ExportProgress) => void) {
    this.progressCallback = callback;
  }

  // สถิติ
  getStats() {
    const { totalImages, exportedImages, startTime, lastExportTime } = this.progress;
    const elapsed = lastExportTime - startTime;
    const rate = exportedImages && elapsed > 0 ? exportedImages / (elapsed / 1000) : 0; // images per second
    const percentage = totalImages > 0 ? (exportedImages / totalImages) * 100 : 0;

    return {
      percentage: Math.round(percentage || 0),
      rate: Math.round((rate || 0) * 100) / 100,
      elapsed: Math.round((elapsed || 0) / 1000),
      remaining: Math.round((this.progress.estimatedTimeRemaining || 0) / 1000),
      totalFiles: totalImages || 0,
      exportedFiles: exportedImages || 0
    };
  }
}

export default DirectFileExporter;
export type { ExportSettings, ExportProgress, GeneratedImage };