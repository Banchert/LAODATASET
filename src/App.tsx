import { useState, useEffect } from 'react';
import FontUpload from './components/FontUpload';
import ConfigPanel from './components/ConfigPanel';
import VocabularyDisplay from './components/VocabularyDisplay';
import GenerationProgress from './components/GenerationProgress';
import PreviewGrid, { GeneratedImage } from './components/PreviewGrid';
import DownloadSection from './components/DownloadSection';
import FontPreview from './components/FontPreview';

import RealTimeExportProgress from './components/RealTimeExportProgress';
import AdvancedSettings from './components/AdvancedSettings';
import { generateTextImage } from './utils/imageGenerator';
import { ProfessionalFontRenderer, FontInfo } from './utils/fontRenderer';
import { RealTimeExporter, ExportConfig, ExportProgress } from './utils/realTimeExporter';
// Lazy load GPU utilities to improve initial load time
let gpuUtilsCache: any = null;
const loadGPUUtils = async () => {
  if (!gpuUtilsCache) {
    const module = await import('./utils/gpuImageGenerator');
    gpuUtilsCache = module;
  }
  return gpuUtilsCache;
};
import { laoVocabulary } from './components/VocabularyDisplay';
// Lazy load literature vocabulary to improve initial load time
let literatureVocabularyCache: any = null;
const loadLiteratureVocabulary = async () => {
  if (!literatureVocabularyCache) {
    const module = await import('./utils/literatureVocabulary');
    literatureVocabularyCache = module;
  }
  return literatureVocabularyCache;
};
import { Button } from './components/ui/button';
import { Zap } from 'lucide-react';
import { useToast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';
// Remove duplicate imports - these will be loaded lazily

// Extend Window interface for text usage tracking
declare global {
  interface Window {
    textUsageTracker: Map<string, number>;
  }
}

interface ConfigSettings {
  numSamples: number;
  imageWidth: number;
  imageHeight: number;
  addNoise: boolean;
  addBlur: boolean;
  addRotation: boolean;
  randomColors: boolean;
  projectName: string;
  autoSave: boolean;
  autoDownload: boolean; // เพิ่มการดาวน์โหลดอัตโนมัติ
  styleVariations: boolean;
  outputPath: string;
  autoSaveInterval: number;
  enableRealTimeExport?: boolean;
  exportBatchSize?: number;
  enableSpecialEffects: boolean; // เพิ่มเอฟเฟกต์พิเศษ
}

const App = () => {
  const [fonts, setFonts] = useState<File[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<File[]>([]);
  const [skippedFonts, setSkippedFonts] = useState<File[]>([]);
  const [loadedFontInfos, setLoadedFontInfos] = useState<FontInfo[]>([]);
  const [customTexts, setCustomTexts] = useState<string[]>([]);
  
  // Real-time Export States
  const [realTimeExporter, setRealTimeExporter] = useState<RealTimeExporter | null>(null);
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    totalImages: 0,
    exportedImages: 0,
    currentFont: '',
    currentBatch: 0,
    totalBatches: 0,
    isExporting: false,
    lastExportedFile: ''
  });

  // GPU และ Multi-font states
  const [useGPU, setUseGPU] = useState(false); // Will be set after GPU utils load
  const [maxConcurrentFonts, setMaxConcurrentFonts] = useState(1);
  const [singleDownload, setSingleDownload] = useState(true);
  const [gpuGenerator, setGpuGenerator] = useState<any>(null); // Will be typed after GPU utils load
  const [settings, setSettings] = useState<ConfigSettings>({
    numSamples: 15000,
    imageWidth: 256,
    imageHeight: 64,
    addNoise: true,
    addBlur: false,
    addRotation: true,
    randomColors: true,
    projectName: `lao-ocr-${new Date().toISOString().split('T')[0]}`,
    autoSave: true,
    autoDownload: true, // เพิ่มการดาวน์โหลดอัตโนมัติ
    styleVariations: true,
    outputPath: 'C:/OCR_Dataset',
    autoSaveInterval: 500,
    enableRealTimeExport: true,
    exportBatchSize: 10,
    enableSpecialEffects: true, // เพิ่มเอฟเฟกต์พิเศษ
  });
  const [isInitializing, setIsInitializing] = useState(false); // Start with false to skip loading
  const [generationState, setGenerationState] = useState({
    isGenerating: false,
    progress: 0,
    currentStep: '',
    isComplete: false,
    error: undefined,
    totalGenerated: 0,
    currentFontIndex: 0,
    skippedFonts: [] as string[],
    processedFonts: [] as string[],
  });
  const [previewImages, setPreviewImages] = useState<GeneratedImage[]>([]);
  const [generatedFonts, setGeneratedFonts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Initialize GPU availability after component mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing application...');
        
        // Load GPU utilities with timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('GPU loading timeout')), 3000)
        );
        
        try {
          const gpuUtils = await Promise.race([loadGPUUtils(), timeoutPromise]);
          setUseGPU(gpuUtils.isGPUAvailable());
          console.log('✅ GPU utilities loaded');
        } catch (gpuError) {
          console.warn('⚠️ GPU utilities failed to load, using CPU mode:', gpuError);
          setUseGPU(false);
        }
        
        // Small delay to ensure smooth loading
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setIsInitializing(false);
        console.log('✅ Application initialized successfully');
      } catch (error) {
        console.error('❌ Critical initialization error:', error);
        setUseGPU(false);
        setIsInitializing(false);
      }
    };
    
    // Add a maximum timeout for initialization
    const maxTimeout = setTimeout(() => {
      console.warn('⚠️ Initialization timeout, forcing app to load');
      setIsInitializing(false);
      setUseGPU(false);
    }, 5000);
    
    initializeApp().finally(() => {
      clearTimeout(maxTimeout);
    });
  }, []);

  // Initialize Real-time Exporter
  useEffect(() => {
    const exportConfig: ExportConfig = {
      outputPath: settings.outputPath,
      projectName: settings.projectName,
      imageFormat: 'png',
      organizationMode: 'by_font',
      enableRealTimeExport: !singleDownload && (settings.enableRealTimeExport || false),
      batchSize: settings.exportBatchSize || 500,
      singleDownload: singleDownload,
      useGPU: useGPU,
      maxConcurrentFonts: maxConcurrentFonts
    };

    const exporter = new RealTimeExporter(exportConfig);
    exporter.setProgressCallback(setExportProgress);
    setRealTimeExporter(exporter);

    return () => {
      if (exporter) {
        exporter.stop();
      }
    };
  }, [settings.outputPath, settings.projectName, settings.enableRealTimeExport, settings.exportBatchSize]);

  const handleFontsChange = (newFonts: File[]) => {
    setFonts(newFonts);
    // Reset filtered fonts when new fonts are uploaded
    setFilteredFonts([]);
    setSkippedFonts([]);
  };

  const handleFontsFiltered = (laoFonts: File[], skippedFonts: File[]) => {
    setFilteredFonts(laoFonts);
    setSkippedFonts(skippedFonts);
    console.log(`📊 Fonts filtered: ${laoFonts.length} accepted, ${skippedFonts.length} skipped`);
  };

  const handleDatasetSaved = () => {
    toast({
      title: "Dataset Saved Successfully!",
      description: `✅ Dataset saved to specified path\n📁 Images organized and ready for OCR training`,
    });
  };

  const handleTextsChange = (newTexts: string[]) => {
    setCustomTexts(newTexts);
  };

  const handleSettingsChange = (newSettings: ConfigSettings) => {
    setSettings(newSettings);
  };

  const handleGenerate = async () => {
    console.log("handleGenerate: Function started.");
    if (fonts.length === 0) {
      toast({
        title: "No Fonts Selected",
        description: "Please upload at least one font file before generating a dataset.",
        variant: "destructive",
      });
      return;
    }

    // เริ่มต้น GPU Generator ถ้าเปิดใช้งาน
    if (useGPU) {
      const gpuConfig: any = { // Will be typed after GPU utils load
        fontSize: settings.fontSize,
        width: settings.imageWidth,
        height: settings.imageHeight,
        backgroundColor: settings.backgroundColor,
        textColor: settings.textColor,
        format: 'PNG',
        quality: 0.9,
        useGPU: true,
        batchSize: 50
      };
      
      const gpuUtils = await loadGPUUtils();
      const generator = gpuUtils.createGPUImageGenerator(gpuConfig);
      setGpuGenerator(generator);
      console.log('🚀 GPU Generator initialized');
    }

    console.log("handleGenerate: Setting initial generation state.");
    setGenerationState({
      isGenerating: true,
      progress: 0,
      currentStep: 'Starting generation...',
      isComplete: false,
      error: undefined,
      totalGenerated: 0,
      currentFontIndex: 0,
      skippedFonts: [],
      processedFonts: [],
    });
    setPreviewImages([]);
    
    // Reset text usage tracker for new generation
    if (window.textUsageTracker) {
      window.textUsageTracker.clear();
    }
    console.log('Text usage tracker reset for new generation');

    const generatedImages: GeneratedImage[] = [];
    
    // 🎨 คำนวณจำนวนรูปภาพจริงตามเอฟเฟกต์พิเศษ
    const baseImages = settings.numSamples;
    const styleMultiplier = settings.styleVariations ? 8 : 1; // 8 style variations
    const totalImages = baseImages * styleMultiplier;
    
    console.log(`🎯 Base images: ${baseImages}, Style multiplier: ${styleMultiplier}, Total: ${totalImages} images.`);
    
    if (settings.styleVariations) {
      console.log('🎊 Style Variations enabled - generating 8x more images with effects:');
      console.log('   1. Clear, 2. Blurred, 3. Faded, 4. Distorted, 5. Incomplete, 6. Shadow, 7. Aged, 8. Bold');
    }

    // 🎯 การคำนวณใหม่: แต่ละฟอนต์ได้รูปเท่ากับ base images × style multiplier
    // ไม่แบ่งรูประหว่างฟอนต์ แต่ให้แต่ละฟอนต์ได้รูปเต็มจำนวน
    const imagesPerFont = baseImages; // แต่ละฟอนต์ได้ 15,000 ข้อความ
    const totalImagesAllFonts = imagesPerFont * styleMultiplier * fonts.length; // รวมทั้งหมด
    const remainingImages = 0; // ไม่มีเศษ
    
    console.log(`🎯 NEW CALCULATION:`);
    console.log(`   - Images per font: ${imagesPerFont} texts`);
    console.log(`   - Style multiplier: ${styleMultiplier}`);
    console.log(`   - Images per font (with styles): ${imagesPerFont * styleMultiplier}`);
    console.log(`   - Total fonts: ${fonts.length}`);
    console.log(`   - Grand total images: ${totalImagesAllFonts}`);
    
    console.log(`Images per font: ${imagesPerFont}, Remaining: ${remainingImages}`);

    const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));
    let imageIndex = 0;

    // Generate images for each font equally (sequential processing)
    const skippedFonts: string[] = [];
    const processedFonts: string[] = [];
    
    // Use filtered fonts if available, otherwise use all fonts
    const fontsToProcess = filteredFonts.length > 0 ? filteredFonts : fonts;
    console.log(`🎯 Processing ${fontsToProcess.length} fonts (${filteredFonts.length > 0 ? 'filtered' : 'all'})`);
    
    for (let fontIndex = 0; fontIndex < fontsToProcess.length; fontIndex++) {
      const currentFont = fontsToProcess[fontIndex];
      const imagesForThisFont = imagesPerFont + (fontIndex < remainingImages ? 1 : 0);
      
      console.log(`Processing font ${fontIndex + 1}/${fontsToProcess.length}: ${currentFont.name}`);
      
      // Update current font being processed
      setGenerationState(prevState => ({
        ...prevState,
        currentFontIndex: fontIndex,
        currentStep: `Processing font ${fontIndex + 1}/${fontsToProcess.length}: ${currentFont.name}`,
      }));

      // Test if font can generate at least one image
      let fontWorking = false;
      try {
        const testText = laoVocabulary[0]; // Use first vocabulary word for testing
        await generateTextImage(
          testText,
          currentFont,
          settings.imageWidth,
          settings.imageHeight,
          {
            addNoise: false,
            addBlur: false,
            addRotation: false,
            randomColors: false,
            styleVariations: false,
          }
        );
        fontWorking = true;
        console.log(`Font ${currentFont.name} test successful`);
      } catch (error) {
        console.error(`Font ${currentFont.name} test failed:`, error);
        skippedFonts.push(currentFont.name);
        
        setGenerationState(prevState => ({
          ...prevState,
          skippedFonts: [...prevState.skippedFonts, currentFont.name],
          currentStep: `Skipped font ${currentFont.name} (not compatible with Lao text)`,
        }));
        
        // Wait a moment before continuing
        await yieldToMain();
        continue;
      }

      if (fontWorking) {
        console.log(`Generating ${imagesForThisFont} images for font: ${currentFont.name}`);
        
        for (let i = 0; i < imagesForThisFont; i++) {
          // Select text from combined vocabulary (built-in + custom)
          let selectedText: string;
          
          // Combine built-in vocabulary with custom texts
          const allTexts = [...laoVocabulary, ...customTexts];
          
          if (allTexts.length === 0) {
            // Fallback to built-in vocabulary if no texts available
            selectedText = laoVocabulary[Math.floor(Math.random() * laoVocabulary.length)];
          } else {
            // Select text based on variety - prioritize custom texts if available
            const textType = Math.random();
            
            // Smart text selection system - works with or without uploaded files
            console.log(`Selecting text for font: ${currentFont.name}`);
            
            // ระบบสร้าง Dataset ภาษาลาวแบบเป็นระเบียบ - Systematic Lao Dataset Generator
            // Lazy load literature vocabulary for better performance
            let systematicSyllables: string[] = [];
            let systematicTwoSyllables: string[] = [];
            let systematicThreeSyllables: string[] = [];
            let systematicFourSyllables: string[] = [];
            let systematicVariants: string[] = [];
            let contextualPhrases: string[] = [];
            let literatureTexts: string[] = [];
            let literatureSentences: string[] = [];
            let mixedTexts: string[] = [];
            
            try {
              const literatureModule = await loadLiteratureVocabulary();
              console.log('📊 Dataset Statistics:', literatureModule.datasetStatistics);
              console.log('🔤 Organization Data:', literatureModule.organizationData);
              
              // 1. พยางค์เดี่ยวแบบเป็นระเบียบ (Systematic Single Syllables)
              systematicSyllables = literatureModule.generatedSyllables?.filter((syllable: string) => {
                const hasLao = /[\u0E80-\u0EFF]/.test(syllable);
                return hasLao && syllable.length >= 1;
              }) || [];
              
              // 2-9. Load other vocabulary categories
              systematicTwoSyllables = literatureModule.generatedTwoSyllableWords?.filter((word: string) => {
                const hasLao = /[\u0E80-\u0EFF]/.test(word);
                return hasLao && word.length >= 2;
              }) || [];
              
              systematicThreeSyllables = literatureModule.generatedThreeSyllableWords?.filter((word: string) => {
                const hasLao = /[\u0E80-\u0EFF]/.test(word);
                return hasLao && word.length >= 3;
              }) || [];
              
              systematicFourSyllables = literatureModule.generatedFourSyllableWords?.filter((word: string) => {
                const hasLao = /[\u0E80-\u0EFF]/.test(word);
                return hasLao && word.length >= 4;
              }) || [];
              
              systematicVariants = literatureModule.generatedVariants?.filter((variant: string) => {
                const hasLao = /[\u0E80-\u0EFF]/.test(variant);
                return hasLao && variant.length >= 1;
              }) || [];
              
              contextualPhrases = literatureModule.generatedPhrases?.filter((phrase: string) => {
                const hasLao = /[\u0E80-\u0EFF]/.test(phrase);
                return hasLao && phrase.length >= 3;
              }) || [];
              
              literatureTexts = literatureModule.allLiteratureVocabulary?.filter((word: string) => {
                const hasLao = /[\u0E80-\u0EFF]/.test(word);
                const isClean = /^[\u0E80-\u0EFF\s]*$/.test(word);
                return hasLao && isClean && word.length >= 1;
              }) || [];
              
              literatureSentences = literatureModule.complexSentences?.filter((sentence: string) => {
                const hasLao = /[\u0E80-\u0EFF]/.test(sentence);
                return hasLao && sentence.length >= 10;
              }) || [];
              
              mixedTexts = literatureModule.mixedContent?.filter((text: string) => {
                const hasLao = /[\u0E80-\u0EFF]/.test(text);
                return hasLao && text.length >= 1;
              }) || [];
              
              console.log('✅ Literature vocabulary loaded successfully');
            } catch (error) {
              console.warn('⚠️ Failed to load literature vocabulary, using basic vocabulary only:', error);
            }
            
            // รวมข้อมูลทั้งหมดแบบเป็นระเบียบและสมดุล (Systematic & Balanced Distribution)
            const builtInTexts = [
              // 25% - พยางค์เดี่ยวแบบเป็นระเบียบ (Systematic single syllables)
              ...systematicSyllables.slice(0, Math.floor(systematicSyllables.length * 0.2)),
              
              // 20% - คำสองพยางค์ (Two-syllable words)
              ...systematicTwoSyllables.slice(0, Math.floor(systematicTwoSyllables.length * 0.8)),
              
              // 15% - คำสามพยางค์ (Three-syllable words)
              ...systematicThreeSyllables.slice(0, Math.floor(systematicThreeSyllables.length * 0.8)),
              
              // 10% - คำสี่พยางค์ (Four-syllable words)
              ...systematicFourSyllables.slice(0, Math.floor(systematicFourSyllables.length * 0.8)),
              
              // 10% - รูปแบบพิเศษ (Special variants)
              ...systematicVariants.slice(0, Math.floor(systematicVariants.length * 0.6)),
              
              // 10% - วลีและประโยค (Contextual phrases)
              ...contextualPhrases.slice(0, Math.floor(contextualPhrases.length * 0.8)),
              
              // 5% - วรรณกรรม (Literature)
              ...literatureTexts.slice(0, Math.floor(literatureTexts.length * 0.3)),
              
              // 3% - ประโยคซับซ้อน (Complex sentences)
              ...literatureSentences,
              
              // 2% - เนื้อหาผสม (Mixed content)
              ...mixedTexts,
              ...laoVocabulary
            ].filter(word => {
              const hasLao = /[\u0E80-\u0EFF]/.test(word);
              const isClean = /^[\u0E80-\u0EFF\s]*$/.test(word);
              return hasLao && isClean && word.length >= 1;
            });
            
            // If custom texts are available, validate and use sparingly
            let validCustomTexts: string[] = [];
            if (customTexts.length > 0) {
              validCustomTexts = customTexts.filter(text => {
                const hasLao = /[\u0E80-\u0EFF]/.test(text);
                const isReasonableLength = text.length >= 2 && text.length <= 50;
                const isCleanLao = /^[\u0E80-\u0EFF\s\u0020-\u002F\u003A-\u0040]*$/.test(text);
                const noGarbledChars = !text.includes('◊') && !text.includes('�') && 
                                     !text.includes('□') && !text.includes(':t') && 
                                     !text.includes('Tj[') && !text.includes('%O');
                return hasLao && isReasonableLength && isCleanLao && noGarbledChars;
              });
              console.log(`Valid custom texts: ${validCustomTexts.length}/${customTexts.length}`);
            }
            
            // Smart text selection with variety and custom file support
            const allAvailableTexts = [...builtInTexts, ...validCustomTexts];
            
            // Create usage tracking to avoid repetition
            if (!window.textUsageTracker) {
              window.textUsageTracker = new Map();
            }
            
            // Filter out overused texts (used more than 3 times)
            const availableTexts = allAvailableTexts.filter(text => {
              const usageCount = window.textUsageTracker.get(text) || 0;
              return usageCount < 3;
            });
            
            // If we have custom texts, give them higher priority
            if (validCustomTexts.length > 0) {
              // 50% from custom texts when available
              if (textType < 0.5) {
                const availableCustom = validCustomTexts.filter(text => {
                  const usageCount = window.textUsageTracker.get(text) || 0;
                  return usageCount < 2; // Even less repetition for custom texts
                });
                
                if (availableCustom.length > 0) {
                  selectedText = availableCustom[Math.floor(Math.random() * availableCustom.length)];
                  console.log(`Selected custom text: "${selectedText}"`);
                } else {
                  // Fallback to built-in if custom texts are overused
                  selectedText = availableTexts.length > 0 
                    ? availableTexts[Math.floor(Math.random() * availableTexts.length)]
                    : builtInTexts[Math.floor(Math.random() * builtInTexts.length)];
                }
              } else {
                // 50% from built-in for variety
                selectedText = availableTexts.length > 0 
                  ? availableTexts[Math.floor(Math.random() * availableTexts.length)]
                  : builtInTexts[Math.floor(Math.random() * builtInTexts.length)];
              }
            } else {
              // No custom texts - use built-in with variety
              if (textType < 0.4) {
                // 40% single words (varied lengths)
                const singleWords = availableTexts.filter(word => word.length <= 8);
                selectedText = singleWords.length > 0 
                  ? singleWords[Math.floor(Math.random() * singleWords.length)]
                  : availableTexts[Math.floor(Math.random() * availableTexts.length)];
              } else if (textType < 0.7) {
                // 30% medium phrases
                const mediumPhrases = availableTexts.filter(word => word.length > 8 && word.length <= 25);
                selectedText = mediumPhrases.length > 0 
                  ? mediumPhrases[Math.floor(Math.random() * mediumPhrases.length)]
                  : availableTexts[Math.floor(Math.random() * availableTexts.length)];
              } else {
                // 30% longer sentences
                const longSentences = availableTexts.filter(word => word.length > 25);
                selectedText = longSentences.length > 0 
                  ? longSentences[Math.floor(Math.random() * longSentences.length)]
                  : availableTexts[Math.floor(Math.random() * availableTexts.length)];
              }
            }
            
            // Track usage to prevent repetition
            if (selectedText) {
              const currentUsage = window.textUsageTracker.get(selectedText) || 0;
              window.textUsageTracker.set(selectedText, currentUsage + 1);
              console.log(`Selected text: "${selectedText}" (usage: ${currentUsage + 1})`);
            }
            
            // Final validation and fallback
            if (!selectedText || selectedText.length < 1 || !/[\u0E80-\u0EFF]/.test(selectedText)) {
              // Use a guaranteed working text
              const fallbackTexts = ['ສະບາຍດີ', 'ຂອບໃຈ', 'ລາວ', 'ການສຶກສາ', 'ຄອບຄົວ'];
              selectedText = fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)];
              console.log(`Using fallback text: "${selectedText}"`);
            }
          }

          try {
            // 🎨 สร้างรูปภาพตาม Style Variations
            if (settings.styleVariations) {
              // สร้าง 8 รูปจากข้อความเดียวกัน (8 style variations)
              const styleNames = ['clear', 'blurred', 'faded', 'distorted', 'incomplete', 'shadow', 'aged', 'bold'];
              
              for (let styleIndex = 0; styleIndex < styleNames.length; styleIndex++) {
                const styleName = styleNames[styleIndex];
                console.log(`🎨 Generating style "${styleName}" for: ${currentFont.name}`);
                
                const imageData = await generateTextImage(
                  selectedText,
                  currentFont,
                  settings.imageWidth,
                  settings.imageHeight,
                  {
                    addNoise: settings.addNoise,
                    addBlur: settings.addBlur,
                    addRotation: settings.addRotation,
                    randomColors: settings.randomColors,
                    styleVariations: true,
                    forceStyle: styleName, // บังคับใช้ style นี้
                  }
                );
                
                const newImage = {
                  dataUrl: imageData.dataUrl,
                  text: imageData.text,
                  font: `${imageData.font} (${styleName})`,
                  style: styleName,
                };

                generatedImages.push(newImage);

                // 🚀 Real-time Export: Export ทันทีที่สร้างเสร็จ
                if (realTimeExporter && settings.enableRealTimeExport) {
                  await realTimeExporter.addToExportQueue(newImage);
                }

                // Log font usage for debugging
                const isCustomFont = imageData.font.includes('Custom') && !imageData.font.includes('Fallback');
                console.log(`Image ${imageIndex + 1}: Font="${imageData.font}", Style="${styleName}", Custom=${isCustomFont}, Text="${selectedText.substring(0, 20)}..." ${settings.enableRealTimeExport ? '📤 Exported' : ''}`);

                imageIndex++;
                
                // Update progress for each style variation
                setGenerationState(prevState => ({
                  ...prevState,
                  progress: Math.round((imageIndex / totalImages) * 100),
                  currentStep: `Font ${fontIndex + 1}/${fontsToProcess.length}: ${currentFont.name} - Style ${styleIndex + 1}/8 (${styleName}) - Text ${i + 1}/${imagesPerFont}`,
                  totalGenerated: imageIndex,
                }));
                
                // Yield every style to keep UI responsive
                await yieldToMain();
              }
            } else {
              // สร้างรูปแบบปกติ (1 รูปต่อข้อความ)
              console.log(`🎨 Using Professional Font Rendering for: ${currentFont.name}`);
              const imageData = await generateTextImage(
                selectedText,
                currentFont,
                settings.imageWidth,
                settings.imageHeight,
                {
                  addNoise: settings.addNoise,
                  addBlur: settings.addBlur,
                  addRotation: settings.addRotation,
                  randomColors: settings.randomColors,
                  styleVariations: false,
                }
              );
              
              const newImage = {
                dataUrl: imageData.dataUrl,
                text: imageData.text,
                font: imageData.font,
                style: imageData.style,
              };

              generatedImages.push(newImage);

              // 🚀 Real-time Export: Export ทันทีที่สร้างเสร็จ
              if (realTimeExporter && settings.enableRealTimeExport) {
                await realTimeExporter.addToExportQueue(newImage);
              }

              // Log font usage for debugging
              const isCustomFont = imageData.font.includes('Custom') && !imageData.font.includes('Fallback');
              console.log(`Image ${imageIndex + 1}: Font="${imageData.font}", Custom=${isCustomFont}, Text="${selectedText.substring(0, 20)}..." ${settings.enableRealTimeExport ? '📤 Exported' : ''}`);

              imageIndex++;
            }

            // Update preview with first 20 images
            if (imageIndex <= 20) {
              setPreviewImages([...generatedImages]);
            }

            setGenerationState(prevState => ({
              ...prevState,
              progress: Math.round((imageIndex / totalImages) * 100),
              currentStep: `Font ${fontIndex + 1}/${fontsToProcess.length}: ${currentFont.name} - Generated ${i + 1}/${imagesForThisFont} images`,
              totalGenerated: imageIndex,
            }));

            // Auto-save at intervals if enabled
            if (settings.autoSave && imageIndex % settings.autoSaveInterval === 0 && imageIndex > 0) {
              console.log(`Auto-saving at ${imageIndex} images...`);
              try {
                await performAutoSave(generatedImages, settings.projectName, settings.outputPath);
                toast({
                  title: "Auto-saved",
                  description: `Saved ${imageIndex} images to ${settings.outputPath || 'Downloads'}`,
                });
              } catch (error) {
                console.error('Auto-save failed:', error);
              }
            }

            // Auto-save at intervals if enabled
            if (settings.autoSave && imageIndex % settings.autoSaveInterval === 0 && imageIndex > 0) {
              console.log(`Auto-saving at ${imageIndex} images...`);
              
              // Create partial dataset for auto-save
              const partialDataset = generatedImages.slice();
              
              // Trigger auto-save
              const autoSaveEvent = new CustomEvent('auto-save-partial-dataset', {
                detail: { 
                  dataset: partialDataset, 
                  projectName: `${settings.projectName}_partial_${imageIndex}`,
                  imageWidth: settings.imageWidth,
                  imageHeight: settings.imageHeight,
                  outputPath: settings.outputPath
                }
              });
              window.dispatchEvent(autoSaveEvent);
              
              toast({
                title: "Auto-Save",
                description: `Saved ${imageIndex} images to ${settings.outputPath || 'Downloads'}`,
              });
            }

            // Yield to the main thread every 10 images to keep the UI responsive
            if (imageIndex % 10 === 0) {
              await yieldToMain();
            }
          } catch (error) {
            console.error(`Error generating image ${i + 1} for font ${currentFont.name}:`, error);
            // Continue with next image instead of stopping entire process
            continue;
          }
        }
        
        processedFonts.push(currentFont.name);
        setGenerationState(prevState => ({
          ...prevState,
          processedFonts: [...prevState.processedFonts, currentFont.name],
        }));
        
        console.log(`Completed font ${currentFont.name}: generated ${imagesForThisFont} images`);
      }
      
      // Small delay between fonts
      await yieldToMain();
    }

    console.log("handleGenerate: Loop finished. Setting final state.");
    setPreviewImages(generatedImages);
    
    // Calculate font usage statistics
    const fontStats = generatedImages.reduce((stats, img) => {
      const isProfessional = img.font.includes('PROFESSIONAL');
      const isForced = img.font.includes('FORCED CUSTOM');
      const isCustom = img.font.includes('Custom') && !img.font.includes('Fallback');
      const isFallback = img.font.includes('Fallback') || img.font.includes('System');
      
      if (isProfessional) {
        stats.professional++;
      } else if (isForced) {
        stats.forced++;
      } else if (isCustom) {
        stats.custom++;
      } else if (isFallback) {
        stats.fallback++;
      } else {
        stats.system++;
      }
      return stats;
    }, { professional: 0, forced: 0, custom: 0, fallback: 0, system: 0 });
    
    const professionalPercentage = Math.round((fontStats.professional / imageIndex) * 100);
    const forcedPercentage = Math.round((fontStats.forced / imageIndex) * 100);
    const totalCustomPercentage = Math.round(((fontStats.professional + fontStats.forced + fontStats.custom) / imageIndex) * 100);
    
    // Create completion message with font statistics
    const completionMessage = `Dataset generation complete! Generated ${imageIndex} images across ${processedFonts.length} fonts. ` +
      `🎨 PROFESSIONAL: ${fontStats.professional} (${professionalPercentage}%), 🎯 FORCED: ${fontStats.forced} (${forcedPercentage}%), ✅ Custom: ${fontStats.custom}, 🔧 System/Fallback: ${fontStats.fallback + fontStats.system}` +
      (skippedFonts.length > 0 ? `. Skipped ${skippedFonts.length} incompatible fonts.` : '');
    
    setGenerationState(prevState => ({
      ...prevState,
      isGenerating: false,
      isComplete: true,
      progress: 100,
      currentStep: completionMessage,
    }));

    // 🎉 เอฟเฟกต์พิเศษเมื่อเสร็จสิ้น
    if (settings.enableSpecialEffects) {
      // เพิ่มเอฟเฟกต์ confetti หรือ celebration
      console.log('🎊 Triggering special completion effects...');
    }

    // 🚀 ดาวน์โหลดอัตโนมัติเมื่อเสร็จสิ้น
    if (settings.autoDownload || (singleDownload && realTimeExporter)) {
      console.log('📦 Starting automatic download...');
      try {
        await realTimeExporter?.downloadAll();
        toast({
          title: "🎉 ດາວໂຫລດສຳເລັດ! (Download Complete!)",
          description: `✅ ດາວໂຫລດ ${imageIndex.toLocaleString()} ຮູບພາບແລ້ວ\n📁 ໃຊ້ ${processedFonts.length} fonts\n🎨 PROFESSIONAL: ${fontStats.professional} (${professionalPercentage}%)\n🎯 15K DATASET: ຄຸນນະພາບສູງສຸດ!\n🚀 ດາວໂຫລດອັດຕະໂນມັດ: ເປີດໃຊ້ງານ`,
        });
      } catch (downloadError) {
        console.error('Auto-download failed:', downloadError);
        toast({
          title: "ດາວໂຫລດລົ້ມເຫລວ (Download Failed)",
          description: "ການດາວໂຫລດອັດຕະໂນມັດລົ້ມເຫລວ ກະລຸນາລອງໃໝ່",
          variant: "destructive",
        });
      }
    } else {
      // Show enhanced completion toast
      toast({
        title: "🎊 ສຳເລັດການສ້າງ Dataset!",
        description: `✅ ສ້າງ ${imageIndex.toLocaleString()} ຮູບພາບແລ້ວ\n📁 ໃຊ້ ${processedFonts.length} fonts\n🎨 PROFESSIONAL: ${fontStats.professional} (${professionalPercentage}%)\n🎯 FORCED: ${fontStats.forced} (${forcedPercentage}%)\n✅ Custom: ${fontStats.custom}\n🔧 System/Fallback: ${fontStats.fallback + fontStats.system}\n${skippedFonts.length > 0 ? `⚠️ ຂ້າມ ${skippedFonts.length} fonts ທີ່ບໍ່ຮອງຮັບ` : ''}\n🚀 ພ້ອມສຳລັບການດາວໂຫລດ!`,
      });
    }

    const newlyGenerated = new Set(generatedImages.map(img => img.font));
    setGeneratedFonts(prev => new Set([...prev, ...newlyGenerated]));
    
    // Auto-save if enabled
    if (settings.autoSave) {
      console.log("Auto-saving dataset...");
      setTimeout(() => {
        // Trigger download automatically
        const downloadEvent = new CustomEvent('auto-download-dataset', {
          detail: { 
            dataset: generatedImages, 
            projectName: settings.projectName,
            imageWidth: settings.imageWidth,
            imageHeight: settings.imageHeight
          }
        });
        window.dispatchEvent(downloadEvent);
      }, 1000);
    }
    
    console.log("handleGenerate: Function finished.");
  };

  const clearGeneratedFonts = () => {
    setGeneratedFonts(new Set());
  };

  // Auto-save function
  const performAutoSave = async (images: GeneratedImage[], projectName: string, outputPath: string) => {
    // Create auto-save event for DownloadSection to handle
    const autoSaveEvent = new CustomEvent('auto-save-progress', {
      detail: { 
        dataset: images, 
        projectName: projectName,
        outputPath: outputPath,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(autoSaveEvent);
  };

  // Show loading screen during initialization
  if (isInitializing) {
    console.log('🔄 Showing loading screen, isInitializing:', isInitializing);
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
            <span className="text-white text-3xl">🚀</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-indigo-800 lao-text mb-2">ກຳລັງໂຫຼດ...</h2>
            <p className="text-indigo-600">Loading Lao OCR Dataset Generator</p>
            <p className="text-xs text-gray-500 mt-2">Initializing GPU utilities...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
          <button 
            onClick={() => {
              console.log('🔧 Force loading complete');
              setIsInitializing(false);
            }}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Skip loading (Debug)
          </button>
        </div>
      </div>
    );
  }

  console.log('🎯 Rendering main app, isInitializing:', isInitializing, 'useGPU:', useGPU);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-xl border-b border-indigo-100/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo & Title */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <span className="text-3xl">🎨</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs">✨</span>
                </div>
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Lao Font Craft
                </h1>
                <p className="text-lg text-gray-600 lao-text font-medium mt-1">ເຄື່ອງມືສ້າງ Dataset OCR ພາສາລາວ</p>
                <p className="text-sm text-gray-500 mt-1">Professional Lao OCR Dataset Generator</p>
              </div>
            </div>
            
            {/* Status Cards */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">15,000</div>
                  <div className="text-xs opacity-90">Images per Font</div>
                </div>
              </div>
              <div className={`px-6 py-4 rounded-2xl shadow-lg ${useGPU 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'}`}>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {useGPU ? '🚀 GPU' : '💻 CPU'}
                  </div>
                  <div className="text-xs opacity-90">Processing Mode</div>
                </div>
              </div>
              {fonts.length > 0 && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold">{fonts.length}</div>
                    <div className="text-xs opacity-90">Fonts Ready</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        {/* Hero Quick Start Section */}
        <div className="relative bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-sm rounded-3xl shadow-2xl border border-indigo-100/50 p-8 lg:p-12 mb-12 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="relative text-center space-y-8">
            {/* Main CTA Badge */}
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300">
              <span className="text-2xl animate-pulse">🚀</span>
              <span className="font-bold text-lg lao-text">ເລີ່ມສ້າງ Dataset ພາສາລາວ</span>
              <span className="text-2xl animate-bounce">✨</span>
            </div>
            
            {/* Description */}
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 leading-relaxed">
                สร้าง OCR Dataset คุณภาพสูง <span className="text-indigo-600">15,000 รูปภาพ</span> จากฟอนต์ลาวของคุณ
              </h2>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="group bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">✅</div>
                    <div className="text-green-700 font-bold text-lg mb-2">ครอบคลุม 100%</div>
                    <div className="text-green-600 lao-text font-medium">37 ພະຍັນຊະນະ × 28 ສະຣະ × 5 ວັນນະຍຸດ</div>
                    <div className="text-xs text-green-500 mt-2">Complete Coverage</div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🚀</div>
                    <div className="text-blue-700 font-bold text-lg mb-2">เร็วขึ้น 3x</div>
                    <div className="text-blue-600 font-medium">GPU + Multi-Font Processing</div>
                    <div className="text-xs text-blue-500 mt-2">Lightning Fast</div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📦</div>
                    <div className="text-purple-700 font-bold text-lg mb-2">ง่ายขึ้น</div>
                    <div className="text-purple-600 font-medium">ดาวน์โหลด 1 ไฟล์ ZIP</div>
                    <div className="text-xs text-purple-500 mt-2">One-Click Download</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Smart Status Dashboard */}
            {fonts.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200/50 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Font Status */}
                  <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📁</span>
                      </div>
                      <div>
                        <p className="font-bold text-blue-800 lao-text">
                          ມີ {fonts.length} ຟອນ ພ້ອມໃຊ້ງານ
                        </p>
                        <p className="text-xs text-blue-600">
                          {fonts.length} font{fonts.length > 1 ? 's' : ''} uploaded
                          {filteredFonts.length > 0 && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {filteredFonts.length} Lao-compatible
                            </span>
                          )}
                          {skippedFonts.length > 0 && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              {skippedFonts.length} skipped
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {fonts.length > 0 && (
                      <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700 font-medium">
                          Current: <span className="font-mono bg-green-100 px-2 py-1 rounded">{fonts[0]?.name || 'None'}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Text Status */}
                  <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg">📝</span>
                      </div>
                      <div>
                        <p className="font-bold text-purple-800 lao-text">
                          ມີ {customTexts.length > 0 ? `${customTexts.length} + 400+` : '400+'} ຂໍ້ຄວາມ
                        </p>
                        <p className="text-xs text-purple-600">
                          {customTexts.length > 0 
                            ? `${customTexts.length} custom + 400+ built-in` 
                            : '400+ built-in Lao vocabulary'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        50/50 Mix
                      </div>
                      <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        Ready to Use
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Help Section */}
                <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-200/50">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-800 text-sm">⚠️</span>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-yellow-800 lao-text text-sm">ຖ້າເຫັນສັນຍາລັກແປກໆ ແທນອັກສອນລາວ:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/50 p-3 rounded-lg border border-yellow-200">
                          <p className="font-semibold text-yellow-800 mb-1">Status Indicators:</p>
                          <p className="text-yellow-700">✅ = Custom font working</p>
                          <p className="text-yellow-700">🔧 = System fallback</p>
                          <p className="text-yellow-700">ລາວ = Lao • EN = English</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded-lg border border-yellow-200">
                          <p className="font-semibold text-yellow-800 mb-1">Quick Fix:</p>
                          <p className="text-yellow-700">If you see garbled text, use "Built-in Only" button below</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Main Action Button */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <Button 
                  onClick={handleGenerate} 
                  disabled={fonts.length === 0 || generationState.isGenerating} 
                  size="lg" 
                  className={`group relative w-full max-w-2xl mx-auto text-xl py-8 px-12 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 border-0 ${
                    generationState.isGenerating 
                      ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 animate-pulse' 
                      : generationState.isComplete
                      ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'
                      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {generationState.isGenerating ? (
                      <>
                        <div className="animate-spin">⚡</div>
                        <span className="font-bold lao-text">
                          ກຳລັງສ້າງ Dataset... {generationState.progress}%
                        </span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </>
                    ) : generationState.isComplete ? (
                      <>
                        <span className="text-2xl animate-pulse">🎉</span>
                        <span className="font-bold lao-text">
                          ສຳເລັດ! Dataset ພ້ອມດາວໂຫລດ
                        </span>
                        <span className="text-2xl animate-bounce">✅</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-6 w-6 group-hover:animate-pulse" />
                        <span className="font-bold lao-text">
                          ເລີ່ມສ້າງ Dataset 15,000 ຮູບພາບ
                        </span>
                        <span className="text-2xl group-hover:animate-bounce">🚀</span>
                      </>
                    )}
                  </div>
                  
                  {/* Enhanced Progress indicator */}
                  {generationState.isGenerating && (
                    <div className="absolute bottom-0 left-0 h-2 bg-white/20 rounded-full overflow-hidden w-full">
                      <div 
                        className="h-full bg-gradient-to-r from-white via-yellow-200 to-white transition-all duration-500 ease-out progress-bar"
                        style={{ width: `${generationState.progress}%` }}
                      ></div>
                    </div>
                  )}
                </Button>
                
                {/* Status indicators around button */}
                {fonts.length > 0 && !generationState.isGenerating && !generationState.isComplete && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                )}
              </div>
              
              {/* Enhanced Status Display */}
              <div className="text-center space-y-3 max-w-2xl">
                {generationState.isGenerating && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="text-lg font-bold text-blue-800 lao-text">
                          ກຳລັງປະມວນຜົນ... {generationState.progress}% ສຳເລັດແລ້ວ
                        </div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      </div>
                      
                      <div className="bg-white/70 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-700 font-medium">
                          {generationState.currentStep}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="bg-white/70 p-2 rounded-lg border border-blue-200 text-center">
                          <div className="font-bold text-blue-700">{generationState.totalGenerated || 0}</div>
                          <div className="text-blue-600 lao-text">ສ້າງແລ້ວ</div>
                        </div>
                        <div className="bg-white/70 p-2 rounded-lg border border-purple-200 text-center">
                          <div className="font-bold text-purple-700">{15000 - (generationState.totalGenerated || 0)}</div>
                          <div className="text-purple-600 lao-text">ຍັງເຫຼືອ</div>
                        </div>
                        <div className="bg-white/70 p-2 rounded-lg border border-green-200 text-center">
                          <div className="font-bold text-green-700">{generationState.processedFonts?.length || 0}</div>
                          <div className="text-green-600 lao-text">ຟອນສຳເລັດ</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {generationState.isComplete && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl animate-bounce">🎉</span>
                        <div className="text-xl font-bold text-green-800 lao-text">
                          ສຳເລັດ! ສ້າງ Dataset ໄດ້ {generationState.totalGenerated} ຮູບພາບ
                        </div>
                        <span className="text-2xl animate-bounce">✨</span>
                      </div>
                      
                      <div className="text-green-700 font-medium">
                        Dataset พร้อมใช้งาน! คุณสามารถดาวน์โหลดได้ด้านล่าง
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white/70 p-3 rounded-lg border border-green-200 text-center">
                          <div className="font-bold text-green-700">✅ เสร็จสิ้น</div>
                          <div className="text-green-600 lao-text">ສຳເລັດທັງໝົດ</div>
                        </div>
                        <div className="bg-white/70 p-3 rounded-lg border border-green-200 text-center">
                          <div className="font-bold text-green-700">📦 พร้อมดาวน์โหลด</div>
                          <div className="text-green-600 lao-text">ພ້ອມດາວໂຫລດ</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!generationState.isGenerating && !generationState.isComplete && fonts.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
                    <div className="text-indigo-700 font-medium lao-text">
                      ພ້ອມສ້າງ Dataset 15,000 ຮູບພາບຄຸນນະພາບສູງ
                    </div>
                    <div className="text-sm text-indigo-600 mt-1">
                      Ready to generate 15,000 professional quality images
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* No Fonts State */}
            {fonts.length === 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl border-2 border-orange-200/50 shadow-lg max-w-2xl mx-auto">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <span className="text-3xl">📁</span>
                  </div>
                  
                  <div>
                    <p className="text-lg font-bold text-orange-800 lao-text mb-2">
                      ກະລຸນາອັບໂຫລດ Font Files ກ່ອນ
                    </p>
                    <p className="text-gray-600">
                      Please upload font files first to start generating your dataset
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => {
                        // Create a dummy font for testing
                        const dummyFont = new File(['dummy'], 'test-font.ttf', { type: 'font/ttf' });
                        setFonts([dummyFont]);
                        toast({
                          title: "Test Font Added",
                          description: "Added a test font for demonstration. Upload real fonts for better results.",
                        });
                      }}
                      className="group bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                    >
                      <span className="text-2xl mr-3 group-hover:animate-pulse">🧪</span>
                      <div className="text-left">
                        <div className="font-bold lao-text">ໃຊ້ Font ທົດສອບ</div>
                        <div className="text-xs text-gray-500">Test Font</div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="lg"
                      onClick={() => {
                        window.open('font-test-debug.html', '_blank');
                      }}
                      className="group bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                    >
                      <span className="text-2xl mr-3 group-hover:animate-spin">🔧</span>
                      <div className="text-left">
                        <div className="font-bold lao-text">ທດສອບ Font</div>
                        <div className="text-xs text-gray-500">Debug Tool</div>
                      </div>
                    </Button>
                  </div>
                  
                  {/* Quick fix option */}
                  {customTexts.length > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-200/50">
                      <p className="text-sm font-semibold text-yellow-800 mb-3 lao-text">
                        ຖ້າເຫັນສັນຍາລັກແປກໆ ລອງໃຊ້ຄຳສັບພື້ນຖານເທົ່ານັ້ນ:
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setCustomTexts([]);
                          toast({
                            title: "Switched to Built-in Vocabulary",
                            description: "Using only built-in Lao vocabulary that works reliably",
                          });
                        }}
                        className="w-full bg-white hover:bg-yellow-50 border-yellow-300 hover:border-yellow-400"
                      >
                        <span className="mr-2">🔄</span>
                        <span className="lao-text">ໃຊ້ຄຳສັບພື້ນຖານ (Use Built-in Only)</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Central Main Controls */}
        <div className="max-w-4xl mx-auto space-y-8 mb-12">
          {/* Font Upload Section - Center */}
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-indigo-100/50 hover:shadow-3xl transition-all duration-300">
            <FontUpload
              fonts={fonts}
              onFontsChange={handleFontsChange}
              generatedFonts={generatedFonts}
              clearGeneratedFonts={clearGeneratedFonts}
            />
          </div>
          
          {/* Configuration Panel - Center */}
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-blue-100/50 hover:shadow-3xl transition-all duration-300">
            <ConfigPanel settings={settings} onSettingsChange={handleSettingsChange} totalFonts={fonts.length} />
          </div>
        </div>

        {/* Professional Font Preview - Full Width */}
        {fonts.length > 0 && (
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-purple-100/50 hover:shadow-3xl transition-all duration-300 mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🎨</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Professional Font Preview</h3>
                <p className="text-purple-600 lao-text">ຕົວຢ່າງຟອນແບບມືອາຊີບ</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {fonts.slice(0, 6).map((font, index) => (
                <div key={`${font.name}-${index}`} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-100 hover:shadow-lg transition-all duration-300">
                  <FontPreview
                    fontFile={font}
                    sampleText="ສະບາຍດີ ຂ້ອຍຊື່ວິໄລ Hello World 123"
                    fontSize={24}
                    width={350}
                    height={120}
                  />
                </div>
              ))}
            </div>
            {fonts.length > 6 && (
              <div className="text-center mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                <p className="text-purple-700 font-medium lao-text">
                  ແລະ font ອື່ນໆ ອີກ <span className="text-purple-800 font-bold">{fonts.length - 6}</span> ຕົວ...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Preview Grid - Full Width (Moved up) */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-purple-100/50 hover:shadow-3xl transition-all duration-300 mb-12">
          <PreviewGrid images={previewImages} isVisible={true} />
        </div>

        {/* Vocabulary Display - Full Width */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-2 border-orange-100/50 hover:shadow-3xl transition-all duration-300 mb-12">
          <VocabularyDisplay customTexts={customTexts} />
        </div>

        {/* Results and Controls Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Advanced Settings */}
          <div className="xl:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100/50 hover:shadow-2xl transition-all duration-300">
              <AdvancedSettings
                useGPU={useGPU}
                setUseGPU={setUseGPU}
                maxConcurrentFonts={maxConcurrentFonts}
                setMaxConcurrentFonts={setMaxConcurrentFonts}
                singleDownload={singleDownload}
                setSingleDownload={setSingleDownload}
                totalFonts={fonts.length}
              />
            </div>
          </div>
          
          {/* Right Columns - Results */}
          <div className="xl:col-span-2 space-y-6">
            {/* Real-time Export Progress */}
            <RealTimeExportProgress 
              progress={exportProgress}
              isVisible={settings.enableRealTimeExport && (generationState.isGenerating || exportProgress.isExporting)}
            />
            
            {/* Generation Progress - Only when generating or complete */}
            {(generationState.isGenerating || generationState.isComplete || generationState.error) && (
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-indigo-100/50">
                <GenerationProgress {...generationState} />
              </div>
            )}
            

            
            {/* Download Section Card */}
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-blue-100/50">
              <DownloadSection
                dataset={previewImages}
                isVisible={generationState.isComplete}
                imageWidth={settings.imageWidth}
                imageHeight={settings.imageHeight}
                projectName={settings.projectName}
                outputPath={settings.outputPath}
              />
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default App;
