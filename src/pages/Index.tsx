import React, { useState, useCallback } from 'react';
import { Sparkles, Rocket, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FontUpload from '@/components/FontUpload';
import ConfigPanel from '@/components/ConfigPanel';
import VocabularyDisplay, { laoVocabulary } from '@/components/VocabularyDisplay';
import GenerationProgress from '@/components/GenerationProgress';
import PreviewGrid, { GeneratedImage } from '@/components/PreviewGrid';
import DownloadSection from '@/components/DownloadSection';
import { generateTextImage, ImageGenerationOptions } from '@/utils/imageGenerator';
import { useToast } from '@/hooks/use-toast';

interface ConfigSettings {
  numSamples: number;
  imageWidth: number;
  imageHeight: number;
  addNoise: boolean;
  addBlur: boolean;
  addRotation: boolean;
  randomColors: boolean;
}

const Index = () => {
  const [fonts, setFonts] = useState<File[]>([]);
  const [settings, setSettings] = useState<ConfigSettings>({
    numSamples: 1000,
    imageWidth: 128,
    imageHeight: 32,
    addNoise: true,
    addBlur: true,
    addRotation: true,
    randomColors: true
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedDataset, setGeneratedDataset] = useState<GeneratedImage[]>([]);
  const [previewImages, setPreviewImages] = useState<GeneratedImage[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string>('');

  const { toast } = useToast();

  const generateDataset = useCallback(async () => {
    if (fonts.length === 0) {
      toast({
        title: "No fonts selected",
        description: "Please select at least one font file before generating the dataset.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setIsComplete(false);
    setError('');
    setGeneratedDataset([]);
    setPreviewImages([]);
    setCurrentStep('Initializing generation...');

    const options: ImageGenerationOptions = {
      addNoise: settings.addNoise,
      addBlur: settings.addBlur,
      addRotation: settings.addRotation,
      randomColors: settings.randomColors
    };

    const newDataset: GeneratedImage[] = [];
    const newPreviews: GeneratedImage[] = [];

    try {
      for (let i = 0; i < settings.numSamples; i++) {
        // Random text and font selection
        const text = laoVocabulary[Math.floor(Math.random() * laoVocabulary.length)];
        const fontFile = fonts[Math.floor(Math.random() * fonts.length)];
        
        setCurrentStep(`Generating image ${i + 1} of ${settings.numSamples}: "${text}"`);
        
        try {
          const result = await generateTextImage(
            text,
            fontFile,
            settings.imageWidth,
            settings.imageHeight,
            options
          );
          
          const generatedImage: GeneratedImage = {
            dataUrl: result.dataUrl,
            text: result.text,
            font: result.font
          };
          
          newDataset.push(generatedImage);
          
          // Add to preview (first 20 images only)
          if (i < 20) {
            newPreviews.push(generatedImage);
            setPreviewImages([...newPreviews]);
          }
          
          // Update progress
          const progressPercent = Math.round((i + 1) / settings.numSamples * 100);
          setProgress(progressPercent);
          
          // Periodic UI updates to prevent blocking
          if (i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
          }
          
        } catch (imageError) {
          console.error('Error generating image:', imageError);
          // Continue with next image instead of failing completely
        }
      }

      setGeneratedDataset(newDataset);
      setIsComplete(true);
      setCurrentStep('');
      
      toast({
        title: "Dataset Generated Successfully!",
        description: `Generated ${newDataset.length} images with ${new Set(newDataset.map(img => img.text)).size} unique Lao words.`,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Generation failed: ${errorMessage}`);
      console.error('Generation error:', err);
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [fonts, settings, toast]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="glass-card rounded-3xl p-6 md:p-8 text-center animate-float">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="h-8 w-8 text-primary animate-pulse" />
              <h1 className="text-3xl md:text-4xl font-bold gradient-text lao-text">
                ເຄື່ອງມື ສ້າງ Dataset OCR ລາວ
              </h1>
            </div>
            <p className="text-lg lao-text text-muted-foreground max-w-2xl mx-auto">
              ສ້າງຂໍ້ມູນສຳລັບການຮຽນຮູ້ຂອງເຄື່ອງອ່ານຂໍ້ຄວາມລາວ
            </p>
            <p className="text-muted-foreground">
              Generate synthetic training data for Lao text recognition models
            </p>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Font Upload */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔤</span>
                <h2 className="text-xl font-bold lao-text">ການຕັ້ງຄ່າແລະ Font</h2>
              </div>
              <FontUpload fonts={fonts} onFontsChange={setFonts} />
            </div>

            {/* Configuration Panel */}
            <div className="glass-card rounded-2xl p-6">
              <ConfigPanel settings={settings} onSettingsChange={setSettings} />
            </div>

            {/* Generate Button */}
            <Button
              variant="gradient"
              size="lg"
              onClick={generateDataset}
              disabled={isGenerating || fonts.length === 0}
              className="w-full animate-glow"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                  <span className="lao-text">ກຳລັງສ້າງ...</span>
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  <span className="lao-text">🚀 ເລີ່ມສ້າງ Dataset</span>
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Progress and Status */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📊</span>
                <h2 className="text-xl font-bold lao-text">ຜົນລັບແລະຕົວຢ່າງ</h2>
              </div>
              
              <GenerationProgress
                isGenerating={isGenerating}
                progress={progress}
                currentStep={currentStep}
                isComplete={isComplete}
                error={error}
                totalGenerated={generatedDataset.length}
              />
              
              {/* Preview Grid */}
              <div className="mt-6">
                <PreviewGrid
                  images={previewImages}
                  isVisible={previewImages.length > 0}
                />
              </div>
            </div>

            {/* Download Section */}
            <DownloadSection
              dataset={generatedDataset}
              isVisible={isComplete && generatedDataset.length > 0}
              imageWidth={settings.imageWidth}
              imageHeight={settings.imageHeight}
            />
          </div>
        </div>

        {/* Vocabulary Display */}
        <VocabularyDisplay />

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-muted-foreground">
          <p className="lao-text">
            ສ້າງດ້ວຍ ❤️ ສຳລັບການພັດທະນາ OCR ພາສາລາວ
          </p>
          <p className="mt-1">
            Built with ❤️ for Lao language OCR development
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;