import React, { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isValidLaoFont } from '@/utils/fontValidator';
import { useToast } from '@/hooks/use-toast';
import FontPreview from './FontPreview';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



interface FontUploadProps {
  onFontsChange: (fonts: File[]) => void;
  fonts: File[];
  generatedFonts: Set<string>;
  clearGeneratedFonts: () => void;
}

const FontUpload: React.FC<FontUploadProps> = ({ onFontsChange, fonts, generatedFonts, clearGeneratedFonts }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFont, setSelectedFont] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<string[]>([]);
  const [currentProcessing, setCurrentProcessing] = useState<string>('');
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [cancelProcessing, setCancelProcessing] = useState(false);
  const { toast } = useToast();

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;

    // Prevent multiple simultaneous processing
    if (isProcessing) {
      toast({
        title: "Processing in Progress",
        description: "Please wait for current font processing to complete.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    const files = Array.from(fileList);
    setTotalCount(files.length);
    setProcessedCount(0);
    setProcessingQueue(files.map(f => f.name));

    console.log(`Starting font queue processing: ${files.length} files...`);
    const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
    const newFiles: File[] = [];
    const rejectedFiles: string[] = [];
    const duplicateFiles: string[] = [];
    const nonLaoFonts: string[] = [];

    // Show initial processing notification
    toast({
      title: "Font Queue Started",
      description: `Processing ${files.length} font files in queue...`,
    });

    // Process fonts one by one with queue management
    for (let i = 0; i < files.length; i++) {
      // Check for cancellation
      if (cancelProcessing) {
        console.log('Font processing cancelled by user');
        break;
      }
      
      const file = files[i];
      setCurrentProcessing(file.name);
      setProcessedCount(i + 1);
      
      // Update processing queue display
      setProcessingQueue(prev => prev.filter(name => name !== file.name));
      
      console.log(`Processing file ${i + 1}/${files.length}: ${file.name}, size: ${file.size} bytes`);
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(extension)) {
        console.log(`Rejected ${file.name}: Invalid extension ${extension}`);
        rejectedFiles.push(`${file.name} (invalid extension)`);
        continue;
      }
      
      if (fonts.some(f => f.name === file.name)) {
        console.log(`Rejected ${file.name}: Duplicate file`);
        duplicateFiles.push(file.name);
        continue;
      }

      console.log(`Validating Lao support for: ${file.name}`);
      try {
        const isValid = await isValidLaoFont(file);
        console.log(`Font ${file.name} validation result: ${isValid}`);
        
        if (isValid) {
          newFiles.push(file);
          console.log(`✅ Added ${file.name} to valid fonts - supports Lao characters`);
        } else {
          nonLaoFonts.push(file.name);
          console.log(`❌ Font ${file.name} does not support Lao characters properly`);
        }
      } catch (error) {
        console.error(`Error validating ${file.name}:`, error);
        rejectedFiles.push(`${file.name} (validation error)`);
      }
      
      // Yield to main thread between files for better UX
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Reset processing state
    setIsProcessing(false);
    setCurrentProcessing('');
    setProcessingQueue([]);
    setProcessedCount(0);
    setTotalCount(0);
    setCancelProcessing(false);

    console.log(`Processing complete. Valid: ${newFiles.length}, Non-Lao: ${nonLaoFonts.length}, Rejected: ${rejectedFiles.length}, Duplicates: ${duplicateFiles.length}`);

    // Update fonts list
    if (newFiles.length > 0) {
      onFontsChange([...fonts, ...newFiles]);
      toast({
        title: "Lao Fonts Added Successfully",
        description: `Added ${newFiles.length} Lao font(s). Total: ${fonts.length + newFiles.length} fonts`,
      });
    }

    // Show summary of processing results
    const messages = [];
    if (newFiles.length > 0) {
      messages.push(`✅ ${newFiles.length} Lao fonts added`);
    }
    if (nonLaoFonts.length > 0) {
      messages.push(`⚠️ ${nonLaoFonts.length} fonts skipped (no Lao support)`);
    }
    if (duplicateFiles.length > 0) {
      messages.push(`📋 ${duplicateFiles.length} duplicates skipped`);
    }
    if (rejectedFiles.length > 0) {
      messages.push(`❌ ${rejectedFiles.length} invalid files`);
    }

    // Show final results
    if (cancelProcessing) {
      toast({
        title: "Font Processing Cancelled",
        description: `Processed ${newFiles.length} fonts before cancellation`,
        variant: "destructive"
      });
    } else if (messages.length > 0) {
      toast({
        title: "Font Queue Processing Complete",
        description: messages.join('\n'),
      });
    }

    // Log detailed results for debugging
    if (nonLaoFonts.length > 0) {
      console.log('Non-Lao fonts (skipped):', nonLaoFonts);
    }
    if (rejectedFiles.length > 0) {
      console.log('Rejected fonts:', rejectedFiles);
    }
  }, [fonts, onFontsChange, toast]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFont = (index: number) => {
    const newFonts = fonts.filter((_, i) => i !== index);
    onFontsChange(newFonts);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Upload className="h-4 w-4 text-white" />
          </div>
          <div>
            <label className="text-lg font-bold text-foreground lao-text">
              ເລືອກ Font Files
            </label>
            <p className="text-sm text-muted-foreground">
              Upload .ttf, .otf files for Lao text generation
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Upload Area */}
      <div
        className={cn(
          "relative group border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-500 hover-lift",
          isProcessing 
            ? "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 cursor-not-allowed opacity-75"
            : isDragOver 
              ? "border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl scale-105" 
              : "border-gray-300 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-purple-50/50 cursor-pointer"
        )}
        onDragOver={isProcessing ? undefined : handleDragOver}
        onDragLeave={isProcessing ? undefined : handleDragLeave}
        onDrop={isProcessing ? undefined : handleDrop}
        onClick={isProcessing ? undefined : () => document.getElementById('fontInput')?.click()}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 rounded-3xl overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <input
          id="fontInput"
          type="file"
          multiple
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleFileInput}
          disabled={isProcessing}
          className="hidden"
        />
        
        <div className="relative space-y-4">
          <div className={cn(
            "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300",
            isProcessing 
              ? "bg-blue-100 animate-pulse" 
              : isDragOver 
                ? "bg-indigo-100 scale-110" 
                : "bg-gray-100 group-hover:bg-indigo-100 group-hover:scale-110"
          )}>
            <Upload className={cn(
              "h-8 w-8 transition-all duration-300",
              isProcessing 
                ? "text-blue-600 animate-bounce" 
                : isDragOver 
                  ? "text-indigo-600" 
                  : "text-gray-500 group-hover:text-indigo-600"
            )} />
          </div>
          
          <div className="space-y-2">
            {isProcessing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <p className="text-lg font-bold text-blue-600 lao-text">
                  ກຳລັງປະມວນຜົນ Font Queue...
                </p>
                <p className="text-sm text-blue-500">
                  Processing {processedCount}/{totalCount} fonts
                </p>
                {currentProcessing && (
                  <p className="text-xs text-blue-400 lao-text bg-blue-50 px-3 py-1 rounded-full inline-block">
                    ປະຈຸບັນ: {currentProcessing}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="font-semibold lao-text">
                  📁 ລາກແລ້ວວາງ Font Files ຫຼື ກົດເພື່ອເລືອກ
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag & drop font files or click to select
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports .ttf, .otf, .woff, .woff2 files<br/>
                  <span className="lao-text">ຮອງຮັບພຽງຟອນທີ່ມີຕົວອັກສອນລາວ</span><br/>
                  Only fonts with Lao character support will be added
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Processing Queue Status */}
      {isProcessing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-700 dark:text-blue-400 lao-text">
                🔄 ກຳລັງປະມວນຜົນ Font Queue
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-600 dark:text-blue-300">
                  {processedCount}/{totalCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelProcessing(true)}
                  className="text-xs h-6 px-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  ຍົກເລີກ
                </Button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (processedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            
            {/* Current Processing */}
            {currentProcessing && (
              <div className="text-sm text-blue-600 dark:text-blue-300">
                <span className="lao-text">ກຳລັງກວດສອບ:</span> {currentProcessing}
              </div>
            )}
            
            {/* Queue List */}
            {processingQueue.length > 0 && (
              <div className="text-xs text-blue-500 dark:text-blue-400">
                <span className="lao-text">ຄິວລໍຖ້າ:</span> {processingQueue.slice(0, 3).join(', ')}
                {processingQueue.length > 3 && ` +${processingQueue.length - 3} more...`}
              </div>
            )}
            
            <p className="text-xs text-blue-600 dark:text-blue-300 lao-text">
              ກະລຸນາລໍຖ້າ... ກຳລັງກວດສອບການຮອງຮັບຕົວອັກສອນລາວ
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Font List */}
      {fonts.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-indigo-800 lao-text">ຟອນທີ່ເລືອກ</p>
                <p className="text-xs text-indigo-600">Selected Fonts</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-indigo-600">{fonts.length}</span>
              <p className="text-xs text-indigo-500">fonts ready</p>
            </div>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {fonts.map((font, index) => {
              const isGenerated = generatedFonts.has(font.name);
              return (
                <div
                  key={font.name}
                  className={cn(
                    "group relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 hover-lift",
                    isGenerated 
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg" 
                      : "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-indigo-300 hover:shadow-lg"
                  )}
                >
                  {/* Status Indicator */}
                  <div className={cn(
                    "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg",
                    isGenerated 
                      ? "bg-green-500 text-white animate-pulse" 
                      : "bg-gray-300 text-gray-600"
                  )}>
                    {isGenerated ? "✓" : index + 1}
                  </div>
                  
                  <div className="flex items-center gap-4 flex-grow">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                      isGenerated 
                        ? "bg-green-100 text-green-600" 
                        : "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200"
                    )}>
                      <FileText className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "font-bold text-sm",
                          isGenerated ? "text-green-800" : "text-gray-800"
                        )}>
                          {font.name}
                        </span>
                        {isGenerated && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold lao-text animate-pulse">
                            ສຳເລັດ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          📁 {(font.size / 1024).toFixed(1)} KB
                        </span>
                        <span className="flex items-center gap-1">
                          🎨 {font.type || 'Font File'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFont(index);
                    }}
                    className={cn(
                      "h-10 w-10 p-0 rounded-xl transition-all duration-300",
                      isGenerated 
                        ? "text-gray-400 cursor-not-allowed opacity-50" 
                        : "text-red-500 hover:text-red-700 hover:bg-red-50 hover:scale-110"
                    )}
                    disabled={isGenerated}
                    title={isGenerated ? "Cannot remove font that has been used for generation" : "Remove font"}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              );
            })}
          </div>
          {/* Font Preview Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👁️</span>
              </div>
              <label className="text-lg font-bold text-purple-800 lao-text">
                ດູຕົວຢ່າງ Font
              </label>
            </div>
            
            <Select onValueChange={(value) => setSelectedFont(fonts.find(f => f.name === value) || null)}>
              <SelectTrigger className="bg-white border-2 border-purple-200 hover:border-purple-300 rounded-xl">
                <SelectValue placeholder="Select a font to preview" />
              </SelectTrigger>
              <SelectContent>
                {fonts.map(font => (
                  <SelectItem key={font.name} value={font.name}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {font.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedFont && (
              <div className="mt-6 p-4 bg-white rounded-xl border border-purple-200 shadow-lg">
                <FontPreview fontFile={selectedFont} />
              </div>
            )}
          </div>
          
          {/* Enhanced Statistics */}
          {generatedFonts.size > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-2xl border-2 border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                  <div>
                    <p className="font-bold text-green-800 lao-text">ສະຖິຕິການປະມວນຜົນ</p>
                    <p className="text-xs text-green-600">Processing Statistics</p>
                  </div>
                </div>
                <Button 
                  onClick={clearGeneratedFonts} 
                  variant="outline" 
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  Clear Status
                </Button>
              </div>
              
              {/* Progress Overview */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-700 lao-text">ຄວາມຄືບໜ້າ:</span>
                  <span className="font-bold text-green-800">{generatedFonts.size}/{fonts.length} fonts</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 progress-bar"
                    style={{ width: `${(generatedFonts.size / fonts.length) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Detailed Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-green-200 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{generatedFonts.size}</div>
                  <div className="text-xs text-green-700 font-medium lao-text">ສຳເລັດແລ້ວ</div>
                  <div className="text-xs text-green-500">Completed</div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-blue-200 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{fonts.length - generatedFonts.size}</div>
                  <div className="text-xs text-blue-700 font-medium lao-text">ລໍຖ້າ</div>
                  <div className="text-xs text-blue-500">Pending</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FontUpload;