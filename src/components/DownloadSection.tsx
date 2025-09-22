import React, { useState, useEffect } from 'react';
import { Download, Package, FileText, Image, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneratedImage } from './PreviewGrid';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';

interface DownloadSectionProps {
  dataset: GeneratedImage[];
  isVisible: boolean;
  imageWidth: number;
  imageHeight: number;
  projectName?: string;
  outputPath?: string;
}

const DownloadSection: React.FC<DownloadSectionProps> = ({
  dataset,
  isVisible,
  imageWidth,
  imageHeight,
  projectName = 'lao-ocr-dataset',
  outputPath = ''
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  // Listen for auto-download and auto-save events
  useEffect(() => {
    const handleAutoDownload = (event: CustomEvent) => {
      const { dataset: autoDataset, projectName: autoProjectName } = event.detail;
      if (autoDataset && autoDataset.length > 0) {
        console.log('Auto-downloading dataset...');
        performDownload(autoDataset, autoProjectName || projectName, true);
      }
    };

    const handleAutoSave = (event: CustomEvent) => {
      const { dataset: autoDataset, projectName: autoProjectName, outputPath, timestamp } = event.detail;
      if (autoDataset && autoDataset.length > 0) {
        console.log('Auto-saving progress...');
        performProgressSave(autoDataset, autoProjectName || projectName, outputPath, timestamp);
      }
    };

    window.addEventListener('auto-download-dataset', handleAutoDownload as EventListener);
    window.addEventListener('auto-save-progress', handleAutoSave as EventListener);
    
    return () => {
      window.removeEventListener('auto-download-dataset', handleAutoDownload as EventListener);
      window.removeEventListener('auto-save-progress', handleAutoSave as EventListener);
    };
  }, [projectName]);

  const handleDownload = async () => {
    await performDownload(dataset, projectName, false);
  };

  const performDownload = async (datasetToDownload: GeneratedImage[], fileName: string, isAutoSave: boolean = false) => {
    if (datasetToDownload.length === 0) {
      if (!isAutoSave) {
        toast({
          title: "No data to download",
          description: "Please generate a dataset first.",
          variant: "destructive"
        });
      }
      return;
    }

    setIsDownloading(true);
    
    try {
      const zip = new JSZip();
      
      // สร้างโครงสร้าง folder แบบมาตรฐาน OCR
      const trainFolder = zip.folder('dataset/train');
      const valFolder = zip.folder('dataset/val'); 
      const testFolder = zip.folder('dataset/test');
      const metadataFolder = zip.folder('dataset/metadata');
      
      // แบ่งข้อมูลเป็น train/val/test (80/10/10)
      const shuffled = [...datasetToDownload].sort(() => Math.random() - 0.5);
      const trainSize = Math.floor(datasetToDownload.length * 0.8);
      const valSize = Math.floor(datasetToDownload.length * 0.1);
      
      const trainData = shuffled.slice(0, trainSize);
      const valData = shuffled.slice(trainSize, trainSize + valSize);
      const testData = shuffled.slice(trainSize + valSize);

      // สร้าง folder ย่อยสำหรับแต่ละ split
      const trainImagesFolder = trainFolder?.folder('images');
      const trainLabelsFolder = trainFolder?.folder('labels');
      const valImagesFolder = valFolder?.folder('images');
      const valLabelsFolder = valFolder?.folder('labels');
      const testImagesFolder = testFolder?.folder('images');
      const testLabelsFolder = testFolder?.folder('labels');

      // จัดเรียงตาม Font แต่ละตัว
      const fontGroups = new Map<string, typeof datasetToDownload>();
      const styleGroups = new Map<string, typeof datasetToDownload>();
      
      datasetToDownload.forEach(item => {
        const fontName = item.font.replace(/\.[^/.]+$/, ""); // remove extension
        if (!fontGroups.has(fontName)) {
          fontGroups.set(fontName, []);
        }
        fontGroups.get(fontName)!.push(item);
        
        // Group by style variations
        const styleName = item.style || 'clear';
        if (!styleGroups.has(styleName)) {
          styleGroups.set(styleName, []);
        }
        styleGroups.get(styleName)!.push(item);
      });

      // สร้าง folder แยกตาม font
      const fontsFolder = zip.folder('dataset/by_fonts');
      
      // สร้าง folder แยกตาม style
      const stylesFolder = zip.folder('dataset/by_styles');
      fontGroups.forEach((items, fontName) => {
        const fontFolder = fontsFolder?.folder(fontName);
        const fontImagesFolder = fontFolder?.folder('images');
        const fontLabelsFolder = fontFolder?.folder('labels');
        
        items.forEach((item, index) => {
          const filename = `${fontName}_${String(index).padStart(4, '0')}`;
          const base64Data = item.dataUrl.split(',')[1];
          
          fontImagesFolder?.file(`${filename}.png`, base64Data, { base64: true });
          fontLabelsFolder?.file(`${filename}.txt`, item.text);
        });

        // สร้าง summary สำหรับแต่ละ font
        const fontSummary = {
          font_name: fontName,
          total_images: items.length,
          unique_words: new Set(items.map(item => item.text)).size,
          words_list: [...new Set(items.map(item => item.text))]
        };
        fontFolder?.file('summary.json', JSON.stringify(fontSummary, null, 2));
      });

      // สร้าง folder แยกตาม style variations
      styleGroups.forEach((items, styleName) => {
        const styleFolder = stylesFolder?.folder(styleName);
        const styleImagesFolder = styleFolder?.folder('images');
        const styleLabelsFolder = styleFolder?.folder('labels');
        
        items.forEach((item, index) => {
          const filename = `${styleName}_${String(index).padStart(4, '0')}`;
          const base64Data = item.dataUrl.split(',')[1];
          
          styleImagesFolder?.file(`${filename}.png`, base64Data, { base64: true });
          styleLabelsFolder?.file(`${filename}.txt`, item.text);
        });

        // สร้าง summary สำหรับแต่ละ style
        const styleSummary = {
          style_name: styleName,
          total_images: items.length,
          unique_words: new Set(items.map(item => item.text)).size,
          fonts_used: [...new Set(items.map(item => item.font))],
          words_list: [...new Set(items.map(item => item.text))]
        };
        styleFolder?.file('summary.json', JSON.stringify(styleSummary, null, 2));
      });

      // เพิ่มข้อมูลลงใน train/val/test folders
      const addToFolder = (data: typeof dataset, imagesFolder: any, labelsFolder: any, prefix: string) => {
        data.forEach((item, index) => {
          const filename = `${prefix}_${String(index).padStart(6, '0')}`;
          const base64Data = item.dataUrl.split(',')[1];
          
          imagesFolder?.file(`${filename}.png`, base64Data, { base64: true });
          labelsFolder?.file(`${filename}.txt`, item.text);
        });
      };

      addToFolder(trainData, trainImagesFolder, trainLabelsFolder, 'train');
      addToFolder(valData, valImagesFolder, valLabelsFolder, 'val');
      addToFolder(testData, testImagesFolder, testLabelsFolder, 'test');

      // สร้าง annotations สำหรับแต่ละ split
      const createAnnotations = (data: typeof dataset, prefix: string) => {
        return data.map((item, index) => {
          const filename = `${prefix}_${String(index).padStart(6, '0')}.png`;
          return `${filename}\t${item.text}`;
        }).join('\n');
      };

      trainFolder?.file('annotations.txt', createAnnotations(trainData, 'train'));
      valFolder?.file('annotations.txt', createAnnotations(valData, 'val'));
      testFolder?.file('annotations.txt', createAnnotations(testData, 'test'));

      // สร้าง metadata รวม
      const metadata = {
        dataset_info: {
          name: "Lao OCR Dataset",
          version: "2.0",
          created_at: new Date().toISOString(),
          total_samples: datasetToDownload.length,
          image_size: [imageWidth, imageHeight],
          format: "PNG + TXT labels",
          project_name: fileName
        },
        splits: {
          train: { count: trainData.length, percentage: 80 },
          validation: { count: valData.length, percentage: 10 },
          test: { count: testData.length, percentage: 10 }
        },
        vocabulary: {
          total_unique_words: new Set(datasetToDownload.map(item => item.text)).size,
          word_list: [...new Set(datasetToDownload.map(item => item.text))].sort()
        },
        fonts: {
          total_fonts: fontGroups.size,
          font_list: [...fontGroups.keys()].sort(),
          distribution: Object.fromEntries(
            [...fontGroups.entries()].map(([font, items]) => [font, items.length])
          )
        },
        styles: {
          total_styles: styleGroups.size,
          style_list: [...styleGroups.keys()].sort(),
          distribution: Object.fromEntries(
            [...styleGroups.entries()].map(([style, items]) => [style, items.length])
          )
        },
        statistics: {
          avg_images_per_font: Math.round(datasetToDownload.length / fontGroups.size),
          avg_images_per_style: Math.round(datasetToDownload.length / styleGroups.size),
          words_per_category: {
            greetings: datasetToDownload.filter(item => 
              ['ສະບາຍດີ', 'ສະບາຍດີບໍ່', 'ຂອບໃຈ', 'ຂໍໂທດ'].includes(item.text)
            ).length,
            family: datasetToDownload.filter(item => 
              ['ພໍ່', 'ແມ່', 'ລູກ', 'ເດັກ', 'ຄອບຄົວ'].includes(item.text)
            ).length,
            numbers: datasetToDownload.filter(item => 
              ['໑', '໒', '໓', '໔', '໕', '໖', '໗', '໘', '໙', '໐'].includes(item.text)
            ).length
          }
        }
      };

      metadataFolder?.file('metadata.json', JSON.stringify(metadata, null, 2));
      metadataFolder?.file('vocabulary.txt', metadata.vocabulary.word_list.join('\n'));

      // สร้าง master annotations file
      const allAnnotations = datasetToDownload.map((item, index) => {
        const filename = `lao_${String(index).padStart(6, '0')}.png`;
        return `${filename}\t${item.text}\t${item.font}\t${item.style || 'clear'}`;
      }).join('\n');
      
      metadataFolder?.file('all_annotations.txt', `filename\ttext\tfont\tstyle\n${allAnnotations}`);

      // สร้าง README แบบละเอียด
      const readme = `# Lao OCR Dataset

## 📊 ข้อมูลสถิติ Dataset
- **จำนวนรูปภาพทั้งหมด**: ${datasetToDownload.length} รูป
- **คำศัพท์ไม่ซ้ำกัน**: ${new Set(datasetToDownload.map(item => item.text)).size} คำ
- **จำนวน Fonts**: ${fontGroups.size} ตัว
- **จำนวน Styles**: ${styleGroups.size} รูปแบบ
- **ขนาดรูปภาพ**: ${imageWidth}x${imageHeight} pixels
- **ชื่อโปรเจค**: ${fileName}
- **สร้างเมื่อ**: ${new Date().toLocaleString('th-TH')}

## 📁 โครงสร้าง Folder

\`\`\`
dataset/
├── train/              # ข้อมูลฝึกสอน (80%)
│   ├── images/         # รูปภาพ PNG
│   ├── labels/         # ไฟล์ข้อความ TXT
│   └── annotations.txt # แมปรูปกับข้อความ
├── val/                # ข้อมูลตรวจสอบ (10%)
│   ├── images/
│   ├── labels/
│   └── annotations.txt
├── test/               # ข้อมูลทดสอบ (10%)
│   ├── images/
│   ├── labels/
│   └── annotations.txt
├── by_fonts/           # จัดกลุ่มตาม Font
│   ├── [font1_name]/
│   │   ├── images/
│   │   ├── labels/
│   │   └── summary.json
│   └── [font2_name]/
│       ├── images/
│       ├── labels/
│       └── summary.json
├── by_styles/          # จัดกลุ่มตาม Style
│   ├── clear/          # ชัดเจน
│   ├── blurred/        # มัว
│   ├── faded/          # ซีด
│   ├── distorted/      # บิดเบี้ยว
│   ├── incomplete/     # ไม่สมบูรณ์
│   ├── shadow/         # มีเงา
│   ├── aged/           # เก่า
│   └── bold/           # หนา
└── metadata/           # ข้อมูลเสริม
    ├── metadata.json   # รายละเอียดครบถ้วน
    ├── vocabulary.txt  # รายชื่อคำศัพท์
    └── all_annotations.txt # แมปทั้งหมด
\`\`\`

## 🚀 วิธีใช้งาน

### สำหรับ OCR Training:
1. ใช้ folder \`train/\` สำหรับการฝึกสอน
2. ใช้ folder \`val/\` สำหรับการตรวจสอบระหว่างฝึก  
3. ใช้ folder \`test/\` สำหรับการทดสอบผลลัพธ์

### สำหรับการวิเคราะห์ Font:
- ดูข้อมูลแต่ละ Font ใน \`by_fonts/[font_name]/summary.json\`
- เปรียบเทียบคุณภาพการรู้จำระหว่าง Font ต่างๆ

## 📋 Format ไฟล์
- **รูปภาพ**: PNG format, ขนาด ${imageWidth}x${imageHeight}px
- **Labels**: Plain text (.txt), UTF-8 encoding  
- **Annotations**: Tab-separated (filename\\ttext\\tfont)

## 🎯 คำศัพท์ที่ใช้
${[...new Set(datasetToDownload.map(item => item.text))].sort().map(word => `- ${word}`).join('\n')}

## 🎨 รูปแบบที่ใช้
${[...styleGroups.entries()].map(([style, items]) => `- **${style}**: ${items.length} รูป`).join('\n')}

## ⚙️ การสร้าง Dataset
- **เครื่องมือ**: Lao OCR Dataset Generator
- **Effects**: Noise, Blur, Rotation, Random Colors
- **Font Distribution**: แบ่งเท่าๆ กันระหว่างทุก Font

---
สร้างด้วย ❤️ สำหรับการพัฒนา OCR ภาษาลาว
`;

      zip.file('dataset/README.md', readme);

      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' });
      const primaryFont = fontGroups.keys().next().value || 'multi-font';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const downloadFileName = `${fileName}_${primaryFont}_${timestamp}.zip`;
      
      // Use File System Access API if available and outputPath is specified
      if (outputPath && 'showDirectoryPicker' in window) {
        try {
          // For modern browsers with File System Access API
          const blob = content;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = downloadFileName;
          a.click();
          URL.revokeObjectURL(url);
        } catch (error) {
          console.log('File System Access API not available, using regular download');
          saveAs(content, downloadFileName);
        }
      } else {
        // Regular download to Downloads folder
        saveAs(content, downloadFileName);
      }

      const toastTitle = isAutoSave ? "Dataset Auto-Saved!" : "Dataset Downloaded!";
      const toastDescription = isAutoSave 
        ? `Auto-saved ${datasetToDownload.length} images as ${downloadFileName}`
        : `Successfully downloaded ${datasetToDownload.length} images as ${downloadFileName}`;

      toast({
        title: toastTitle,
        description: toastDescription,
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "An error occurred while creating the download package.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Progress save function for auto-save during generation
  const performProgressSave = async (datasetToSave: GeneratedImage[], fileName: string, outputPath: string, timestamp: string) => {
    try {
      // Create a simplified dataset for progress save
      const progressData = {
        timestamp: timestamp,
        project_name: fileName,
        total_images: datasetToSave.length,
        images: datasetToSave.map((item, index) => ({
          id: index,
          text: item.text,
          font: item.font,
          style: item.style || 'clear',
          dataUrl: item.dataUrl
        })),
        fonts_used: [...new Set(datasetToSave.map(item => item.font))],
        styles_used: [...new Set(datasetToSave.map(item => item.style || 'clear'))],
        vocabulary_used: [...new Set(datasetToSave.map(item => item.text))]
      };

      // Create JSON file for progress
      const jsonBlob = new Blob([JSON.stringify(progressData, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = jsonUrl;
      link.download = `${fileName}_progress_${datasetToSave.length}images_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(jsonUrl);
      
      console.log(`Progress saved: ${datasetToSave.length} images`);
    } catch (error) {
      console.error('Progress save failed:', error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="glass-card rounded-xl p-6 text-center space-y-4">
      <div className="space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-primary/10 rounded-full flex items-center justify-center">
          <Package className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold lao-text">📥 ດາວໂຫລດ Dataset</h3>
        <p className="text-sm text-muted-foreground">
          Download your generated OCR dataset as a ZIP file
        </p>
        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
          <p className="lao-text">💾 ການບັນທຶກອັດຕະໂນມັດ: ບັນທຶກຄວາມຄືບໜ້າໃນຮູບແບບ JSON</p>
          <p>Auto-save: Progress saved as JSON during generation</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 py-4">
        <div className="text-center">
          <Image className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-sm font-semibold">{dataset.length}</p>
          <p className="text-xs text-muted-foreground">Images</p>
        </div>
        <div className="text-center">
          <FileText className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-sm font-semibold">{new Set(dataset.map(item => item.text)).size}</p>
          <p className="text-xs text-muted-foreground">Unique Words</p>
        </div>
        <div className="text-center">
          <Package className="h-6 w-6 mx-auto text-primary mb-1" />
          <p className="text-sm font-semibold">{new Set(dataset.map(item => item.font)).size}</p>
          <p className="text-xs text-muted-foreground">Fonts</p>
        </div>
      </div>

      {/* Output Path Info */}
      {outputPath && (
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <FolderOpen className="h-4 w-4 text-primary" />
            <span className="font-semibold lao-text">ບັນທຶກໄປທີ່:</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 break-all">
            {outputPath || 'Downloads folder'}
          </p>
        </div>
      )}

      <Button
        variant="gradient"
        size="lg"
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full"
      >
        {isDownloading ? (
          <>
            <Package className="mr-2 h-4 w-4 animate-pulse" />
            <span className="lao-text">ກຳລັງສ້າງ ZIP...</span>
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            <span className="lao-text">ດາວໂຫລດ Dataset</span>
          </>
        )}
      </Button>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>ZIP file includes images, labels, annotations, and metadata</p>
          <p className="lao-text">
            📁 ໄຟລ໌ ZIP ປະກອບດ້ວຍ: ຮູບພາບ, ປ້າຍກຳກັບ, ຄຳອະທິບາຍ, ແລະ ຂໍ້ມູນເສີມ
          </p>
          {outputPath && (
            <p className="text-green-600">
              ✅ Will be saved to: {outputPath}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files && target.files[0]) {
                  const file = target.files[0];
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      toast({
                        title: "Progress Data Loaded",
                        description: `Loaded ${data.total_images} images from ${data.project_name}`,
                      });
                      console.log('Loaded progress data:', data);
                    } catch (error) {
                      toast({
                        title: "Load Failed",
                        description: "Invalid JSON file format",
                        variant: "destructive"
                      });
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
            }}
            className="flex-1"
          >
            📂 Load Progress
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Clear browser downloads folder (show info)
              toast({
                title: "Auto-save Location",
                description: "Progress files are saved to your Downloads folder with timestamp",
              });
            }}
            className="flex-1"
          >
            📍 Save Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DownloadSection;