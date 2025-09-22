import React, { useState, useCallback } from 'react';
import { Upload, X, Eye, EyeOff, Plus, Scissors, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LaoTextProcessor, TextChunk } from '@/utils/textProcessor';

interface TextUploadProps {
    customTexts: string[];
    onTextsChange: (texts: string[]) => void;
}

interface ProcessingOptions {
    enableWordSegmentation: boolean;
    enablePhraseSegmentation: boolean;
    enableSentenceSegmentation: boolean;
    enableCompoundWords: boolean;
    enableSyntheticVariations: boolean;
    minTextLength: number;
    maxTextLength: number;
    minConfidence: number;
    complexityFilter: ('simple' | 'medium' | 'complex')[];
}

const TextUpload: React.FC<TextUploadProps> = ({ customTexts, onTextsChange }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [manualText, setManualText] = useState('');
    const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
        enableWordSegmentation: true,
        enablePhraseSegmentation: true,
        enableSentenceSegmentation: true,
        enableCompoundWords: true,
        enableSyntheticVariations: false,
        minTextLength: 1,
        maxTextLength: 150,
        minConfidence: 0.1,
        complexityFilter: ['simple', 'medium', 'complex'],
    });
    const [showProcessingOptions, setShowProcessingOptions] = useState(false);
    const { toast } = useToast();

    const handleFiles = useCallback(async (fileList: FileList | null) => {
        if (!fileList) return;

        // Show loading toast for large files
        if (fileList.length > 1) {
            toast({
                title: "Processing Files",
                description: `Processing ${fileList.length} files... Please wait.`,
            });
        }

        const validExtensions = ['.txt', '.doc', '.docx'];
        const newTexts: string[] = [];
        const rejectedFiles: string[] = [];

        for (const file of Array.from(fileList)) {
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();

            if (!validExtensions.includes(extension)) {
                rejectedFiles.push(`${file.name} (invalid extension)`);
                continue;
            }

            try {
                let content: string;

                if (extension === '.docx') {
                    // For .docx files, try to extract text content
                    console.log(`Processing .docx file: ${file.name}`);

                    // Simple approach: read as text and extract readable content
                    const rawContent = await file.text();

                    // Extract text between common XML tags and clean up
                    const textMatches = rawContent.match(/>([^<]*[\u0E80-\u0EFF][^<]*)</g);
                    if (textMatches) {
                        content = textMatches
                            .map(match => match.replace(/^>|<$/g, '').trim())
                            .filter(text => text.length > 0 && /[\u0E80-\u0EFF]/.test(text))
                            .join(' ');
                    } else {
                        // Fallback: try to find any Lao text in the raw content
                        const laoMatches = rawContent.match(/[\u0E80-\u0EFF\s]+/g);
                        content = laoMatches ? laoMatches.join(' ') : rawContent;
                    }

                    console.log(`Extracted content from ${file.name}: "${content.substring(0, 100)}..."`);
                } else {
                    // For .txt and .doc files
                    content = await file.text();
                }

                // Check if content contains Lao characters
                const laoRegex = /[\u0E80-\u0EFF]/;
                if (!laoRegex.test(content)) {
                    rejectedFiles.push(`${file.name} (no Lao text found)`);
                    continue;
                }

                // Process text using LaoTextProcessor (optimized for performance)
                console.log(`Processing ${file.name} with content length: ${content.length} chars`);

                // Limit content size to prevent performance issues
                const maxContentLength = 5000; // 5KB limit for better performance
                const limitedContent = content.length > maxContentLength
                    ? content.substring(0, maxContentLength)
                    : content;

                if (content.length > maxContentLength) {
                    console.log(`Content truncated from ${content.length} to ${maxContentLength} chars for performance`);
                }

                const processedChunks = LaoTextProcessor.processText(limitedContent);
                console.log(`Initial processing of ${file.name}: ${processedChunks.length} chunks`);

                // Filter chunks based on processing options (limit results for performance)
                const filteredChunks = LaoTextProcessor.filterChunks(processedChunks, {
                    types: [
                        ...(processingOptions.enableWordSegmentation ? ['word' as const, 'fragment' as const] : []),
                        ...(processingOptions.enablePhraseSegmentation ? ['phrase' as const] : []),
                        ...(processingOptions.enableSentenceSegmentation ? ['sentence' as const, 'paragraph' as const] : []),
                        ...(processingOptions.enableCompoundWords ? ['compound' as const] : []),
                    ],
                    minLength: processingOptions.minTextLength,
                    maxLength: processingOptions.maxTextLength,
                    minConfidence: processingOptions.minConfidence,
                    complexity: processingOptions.complexityFilter,
                    maxCount: 500, // Limit to 500 chunks per file for performance
                });

                console.log(`After filtering ${file.name}: ${filteredChunks.length} chunks`);
                console.log('Filter settings:', {
                    minLength: processingOptions.minTextLength,
                    maxLength: processingOptions.maxTextLength,
                    minConfidence: processingOptions.minConfidence,
                    complexity: processingOptions.complexityFilter
                });

                const processedTexts = filteredChunks.map(chunk => chunk.text);

                // Debug: Show sample processed texts
                console.log(`Sample processed texts from ${file.name}:`, processedTexts.slice(0, 3));

                if (processedTexts.length > 0) {
                    // Enhanced validation: ensure variety and quality
                    const cleanTexts = processedTexts.filter(text => {
                        const hasLao = /[\u0E80-\u0EFF]/.test(text);
                        const isReasonable = text.length >= 1 && text.length <= 150;

                        // Filter out obvious garbled patterns
                        const hasObviousGarbage = /[:t^%O\[\]PSw|EVIH|Tj\[|C5nkf|ObBz|Q7bq]/.test(text);

                        // Ensure text has meaningful content (not just repeated characters)
                        const isNotRepeated = !/^(.)\1{3,}$/.test(text.trim());

                        return hasLao && isReasonable && !hasObviousGarbage && isNotRepeated;
                    });

                    // Remove duplicates to ensure variety
                    const uniqueCleanTexts = [...new Set(cleanTexts)];

                    console.log(`Clean texts: ${uniqueCleanTexts.length}/${processedTexts.length} (duplicates removed)`);

                    if (uniqueCleanTexts.length > 0) {
                        newTexts.push(...uniqueCleanTexts);
                        console.log(`Successfully processed ${uniqueCleanTexts.length} unique text chunks from ${file.name}`);
                    } else {
                        console.log(`All texts were filtered out from ${file.name}`);
                        rejectedFiles.push(`${file.name} (all texts filtered out - may contain garbled characters)`);
                    }
                } else {
                    console.log(`No suitable text found in ${file.name}. Original chunks:`, processedChunks.slice(0, 5));
                    rejectedFiles.push(`${file.name} (no suitable text after processing - try lowering quality threshold)`);
                }
            } catch (error) {
                console.error(`Error reading ${file.name}:`, error);
                rejectedFiles.push(`${file.name} (read error)`);
            }
        }

        if (newTexts.length > 0) {
            const uniqueTexts = [...new Set([...customTexts, ...newTexts])];
            onTextsChange(uniqueTexts);

            toast({
                title: "Text Files Processed",
                description: `Added ${newTexts.length} unique text chunks. Total: ${uniqueTexts.length} texts (50/50 mix with built-in)`,
            });
        }

        if (rejectedFiles.length > 0) {
            toast({
                title: "Some Files Were Rejected",
                description: `${rejectedFiles.join(', ')}. Try lowering the quality threshold or adjusting complexity filters.`,
                variant: "destructive",
            });
        }
    }, [customTexts, onTextsChange, toast, processingOptions]);

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

    const addManualText = () => {
        if (manualText.trim()) {
            // Limit manual text length for performance
            const limitedText = manualText.length > 1000 ? manualText.substring(0, 1000) : manualText;

            // Process manual text using LaoTextProcessor
            const processedChunks = LaoTextProcessor.processText(limitedText);

            // Filter chunks based on processing options (limit results)
            const filteredChunks = LaoTextProcessor.filterChunks(processedChunks, {
                types: [
                    ...(processingOptions.enableWordSegmentation ? ['word' as const, 'fragment' as const] : []),
                    ...(processingOptions.enablePhraseSegmentation ? ['phrase' as const] : []),
                    ...(processingOptions.enableSentenceSegmentation ? ['sentence' as const, 'paragraph' as const] : []),
                    ...(processingOptions.enableCompoundWords ? ['compound' as const] : []),
                ],
                minLength: processingOptions.minTextLength,
                maxLength: processingOptions.maxTextLength,
                minConfidence: processingOptions.minConfidence,
                complexity: processingOptions.complexityFilter,
                maxCount: 100, // Limit manual text results
            });

            const processedTexts = filteredChunks.map(chunk => chunk.text);
            const uniqueTexts = [...new Set([...customTexts, ...processedTexts])];
            onTextsChange(uniqueTexts);
            setManualText('');

            toast({
                title: "Manual Text Processed",
                description: `Added ${processedTexts.length} text chunks (limited for performance)`,
            });
        }
    };

    const processAllTexts = () => {
        if (customTexts.length === 0) return;

        // Re-process all existing texts with current options
        const allProcessedChunks: TextChunk[] = [];

        for (const text of customTexts) {
            const chunks = LaoTextProcessor.processText(text);
            allProcessedChunks.push(...chunks);
        }

        const filteredChunks = LaoTextProcessor.filterChunks(allProcessedChunks, {
            types: [
                ...(processingOptions.enableWordSegmentation ? ['word' as const, 'fragment' as const] : []),
                ...(processingOptions.enablePhraseSegmentation ? ['phrase' as const] : []),
                ...(processingOptions.enableSentenceSegmentation ? ['sentence' as const, 'paragraph' as const] : []),
                ...(processingOptions.enableCompoundWords ? ['compound' as const] : []),
            ],
            minLength: processingOptions.minTextLength,
            maxLength: processingOptions.maxTextLength,
            minConfidence: processingOptions.minConfidence,
            complexity: processingOptions.complexityFilter,
        });

        const processedTexts = [...new Set(filteredChunks.map(chunk => chunk.text))];
        onTextsChange(processedTexts);

        toast({
            title: "Texts Reprocessed",
            description: `Generated ${processedTexts.length} text chunks with current settings`,
        });
    };

    const removeText = (index: number) => {
        const newTexts = customTexts.filter((_, i) => i !== index);
        onTextsChange(newTexts);
    };

    const clearAllTexts = () => {
        onTextsChange([]);
        toast({
            title: "All Texts Cleared",
            description: "Custom text list has been cleared",
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground lao-text">
                    📄 ອັບໂຫລດໄຟລ໌ຂໍ້ຄວາມ (ທາງເລືອກ - Optional):
                </label>
                <p className="text-sm text-muted-foreground">
                    Upload text files to add more variety - or use built-in 400+ Lao vocabulary
                </p>
                <div className="bg-green-50 border border-green-200 rounded p-2 mt-1">
                    <p className="text-xs text-green-700 lao-text">
                        ✅ ບໍ່ຈຳເປັນຕ້ອງອັບໂຫລດ! ມີຄຳສັບລາວພ້ອມໃຊ້ 400+ ຄຳ
                    </p>
                    <p className="text-xs text-green-600">
                        No upload needed! 400+ Lao words ready to use.
                    </p>
                </div>
                <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800 mt-2">
                    <p className="font-semibold mb-1">💡 <span className="lao-text">ຖ້າໄຟລ໌ຖືກປະຕິເສດ (If files are rejected):</span></p>
                    <div className="space-y-1 text-xs">
                        <p>1. Lower quality threshold to <strong>0.1</strong></p>
                        <p>2. Set min length to <strong>1</strong>, max length to <strong>150</strong></p>
                        <p>3. For .docx files: Make sure they contain readable Lao text</p>
                        <p>4. Check Console (F12) for detailed processing info</p>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            <div
                className={cn(
                    "glass-card border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300",
                    isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('textInput')?.click()}
            >
                <input
                    id="textInput"
                    type="file"
                    multiple
                    accept=".txt,.doc,.docx"
                    onChange={handleFileInput}
                    className="hidden"
                />
                <div className="space-y-3">
                    <Upload className={cn(
                        "h-10 w-10 mx-auto transition-colors",
                        isDragOver ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div>
                        <p className="font-semibold lao-text">
                            📁 ລາກແລ້ວວາງໄຟລ໌ຂໍ້ຄວາມ ຫຼື ກົດເພື່ອເລືອກ
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Drag & drop text files or click to select
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Files will be auto-segmented into words, phrases & sentences
                        </p>
                    </div>
                </div>
            </div>

            {/* Text Processing Options */}
            <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                    <Label className="font-semibold lao-text">
                        <Scissors className="h-4 w-4 inline mr-2" />
                        ການຕັ້งຄ່າການຕັດຄຳ (Text Segmentation):
                    </Label>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowProcessingOptions(!showProcessingOptions)}
                    >
                        {showProcessingOptions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>

                {showProcessingOptions && (
                    <div className="space-y-4">
                        {/* Basic Segmentation Options */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enableWords"
                                    checked={processingOptions.enableWordSegmentation}
                                    onCheckedChange={(checked) =>
                                        setProcessingOptions(prev => ({ ...prev, enableWordSegmentation: !!checked }))
                                    }
                                />
                                <Label htmlFor="enableWords" className="text-sm lao-text">
                                    ຕັດເປັນຄຳ (Words)
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enablePhrases"
                                    checked={processingOptions.enablePhraseSegmentation}
                                    onCheckedChange={(checked) =>
                                        setProcessingOptions(prev => ({ ...prev, enablePhraseSegmentation: !!checked }))
                                    }
                                />
                                <Label htmlFor="enablePhrases" className="text-sm lao-text">
                                    ຕັດເປັນວະລີ (Phrases)
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enableSentences"
                                    checked={processingOptions.enableSentenceSegmentation}
                                    onCheckedChange={(checked) =>
                                        setProcessingOptions(prev => ({ ...prev, enableSentenceSegmentation: !!checked }))
                                    }
                                />
                                <Label htmlFor="enableSentences" className="text-sm lao-text">
                                    ຕັດເປັນປະໂຫຍກ (Sentences)
                                </Label>
                            </div>
                        </div>

                        {/* Advanced Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enableCompounds"
                                    checked={processingOptions.enableCompoundWords}
                                    onCheckedChange={(checked) =>
                                        setProcessingOptions(prev => ({ ...prev, enableCompoundWords: !!checked }))
                                    }
                                />
                                <Label htmlFor="enableCompounds" className="text-sm lao-text">
                                    ຄຳປະສົມ (Compounds)
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="enableSynthetic"
                                    checked={processingOptions.enableSyntheticVariations}
                                    onCheckedChange={(checked) =>
                                        setProcessingOptions(prev => ({ ...prev, enableSyntheticVariations: !!checked }))
                                    }
                                />
                                <Label htmlFor="enableSynthetic" className="text-sm lao-text">
                                    ສ້າງຄຳໃໝ່ (Synthetic)
                                </Label>
                            </div>
                        </div>

                        {/* Length and Quality Controls */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div>
                                <Label className="lao-text">ຄວາມຍາວຕໍ່າສຸດ:</Label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={processingOptions.minTextLength}
                                    onChange={(e) =>
                                        setProcessingOptions(prev => ({ ...prev, minTextLength: parseInt(e.target.value) || 1 }))
                                    }
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                />
                            </div>
                            <div>
                                <Label className="lao-text">ຄວາມຍາວສູງສຸດ:</Label>
                                <input
                                    type="number"
                                    min="10"
                                    max="200"
                                    value={processingOptions.maxTextLength}
                                    onChange={(e) =>
                                        setProcessingOptions(prev => ({ ...prev, maxTextLength: parseInt(e.target.value) || 100 }))
                                    }
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                />
                            </div>
                            <div>
                                <Label className="lao-text">ຄຸນນະພາບຕໍ່າສຸດ:</Label>
                                <input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={processingOptions.minConfidence}
                                    onChange={(e) =>
                                        setProcessingOptions(prev => ({ ...prev, minConfidence: parseFloat(e.target.value) || 0.3 }))
                                    }
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                />
                            </div>
                        </div>

                        {/* Complexity Filter */}
                        <div className="space-y-2">
                            <Label className="text-sm lao-text">ລະດັບຄວາມຊັບຊ້ອນ (Complexity):</Label>
                            <div className="flex gap-3">
                                {(['simple', 'medium', 'complex'] as const).map((complexity) => (
                                    <div key={complexity} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`complexity-${complexity}`}
                                            checked={processingOptions.complexityFilter.includes(complexity)}
                                            onCheckedChange={(checked) => {
                                                setProcessingOptions(prev => ({
                                                    ...prev,
                                                    complexityFilter: checked
                                                        ? [...prev.complexityFilter, complexity]
                                                        : prev.complexityFilter.filter(c => c !== complexity)
                                                }));
                                            }}
                                        />
                                        <Label htmlFor={`complexity-${complexity}`} className="text-sm capitalize">
                                            {complexity === 'simple' ? 'ງ່າຍ' : complexity === 'medium' ? 'ປານກາງ' : 'ຊັບຊ້ອນ'}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {customTexts.length > 0 && (
                            <Button onClick={processAllTexts} variant="outline" size="sm" className="w-full">
                                <Shuffle className="h-4 w-4 mr-2" />
                                <span className="lao-text">ປະມວນຜົນຂໍ້ຄວາມໃໝ່</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Manual Text Input */}
            <div className="space-y-2">
                <Label htmlFor="manualText" className="lao-text">
                    ✍️ ພິມຂໍ້ຄວາມດ້ວຍມື (Manual Text Input):
                </Label>
                <Textarea
                    id="manualText"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="ພິມຂໍ້ຄວາມພາສາລາວທີ່ນີ້... (จะถูกตัดเป็นคำ วลี ประโยคอัตโนมัติ)&#10;ຕົວຢ່າງ: ສະບາຍດີທຸກຄົນ ຂ້ອຍຮັກປະເທດລາວ&#10;ການສຶກສາເປັນສິ່ງສຳຄັນສຳລັບການພັດທະນາ"
                    className="min-h-[100px] lao-text"
                />
                <div className="flex gap-2">
                    <Button onClick={addManualText} disabled={!manualText.trim()} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="lao-text">ປະມວນຜົນ ແລະ ເພີ່ມ</span>
                    </Button>
                    <Button
                        onClick={() => setManualText('')}
                        variant="outline"
                        size="sm"
                        disabled={!manualText.trim()}
                    >
                        ລ້າງ
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    <span className="lao-text">ຂໍ້ຄວາມຈະຖືກຕັດເປັນ: ຄຳເດີ່ຍວ, ວະລີ, ແລະ ປະໂຫຍກ ຕາມການຕັ້ງຄ່າຂ້າງເທິງ</span><br />
                    Text will be automatically segmented into words, phrases, and sentences
                </p>
            </div>

            {/* Text List */}
            {customTexts.length > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold lao-text">ຂໍ້ຄວາມທີ່ປະມວນຜົນແລ້ວ:</p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary">{customTexts.length} chunks</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPreview(!showPreview)}
                            >
                                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearAllTexts}
                                className="text-destructive hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Enhanced Statistics */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-2 text-xs bg-muted/30 p-2 rounded">
                            <div className="text-center">
                                <span className="font-semibold lao-text">ສັ້ນຫຼາຍ:</span><br />
                                <span className="text-blue-600">{customTexts.filter(text => text.length <= 10).length}</span>
                            </div>
                            <div className="text-center">
                                <span className="font-semibold lao-text">ສັ້ນ:</span><br />
                                <span className="text-green-600">{customTexts.filter(text => text.length > 10 && text.length <= 20).length}</span>
                            </div>
                            <div className="text-center">
                                <span className="font-semibold lao-text">ປານກາງ:</span><br />
                                <span className="text-orange-600">{customTexts.filter(text => text.length > 20 && text.length <= 50).length}</span>
                            </div>
                            <div className="text-center">
                                <span className="font-semibold lao-text">ຍາວ:</span><br />
                                <span className="text-red-600">{customTexts.filter(text => text.length > 50).length}</span>
                            </div>
                        </div>

                        {/* Type Distribution */}
                        <div className="grid grid-cols-3 gap-2 text-xs bg-primary/5 p-2 rounded">
                            <div className="text-center">
                                <span className="font-semibold lao-text">ຄຳ:</span><br />
                                <span className="text-primary">{customTexts.filter(text => text.split(/\s+/).length === 1).length}</span>
                            </div>
                            <div className="text-center">
                                <span className="font-semibold lao-text">ວະລີ:</span><br />
                                <span className="text-primary">{customTexts.filter(text => text.split(/\s+/).length >= 2 && text.split(/\s+/).length <= 5).length}</span>
                            </div>
                            <div className="text-center">
                                <span className="font-semibold lao-text">ປະໂຫຍກ:</span><br />
                                <span className="text-primary">{customTexts.filter(text => text.split(/\s+/).length > 5).length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    {showPreview && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {customTexts.slice(0, 20).map((text, index) => {
                                const wordCount = text.split(/\s+/).length;
                                const isLaoText = /[\u0E80-\u0EFF]/.test(text);
                                const hasNumbers = /[\d\u0ED0-\u0ED9]/.test(text);

                                let typeLabel = 'ຄຳ';
                                let typeColor = 'text-blue-600';
                                if (wordCount === 1) {
                                    typeLabel = 'ຄຳ';
                                    typeColor = 'text-blue-600';
                                } else if (wordCount <= 5) {
                                    typeLabel = 'ວະລີ';
                                    typeColor = 'text-green-600';
                                } else {
                                    typeLabel = 'ປະໂຫຍກ';
                                    typeColor = 'text-purple-600';
                                }

                                return (
                                    <div
                                        key={index}
                                        className="flex items-start justify-between p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
                                    >
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded ${typeColor} bg-current/10`}>
                                                    {typeLabel}
                                                </span>
                                                {hasNumbers && (
                                                    <span className="text-xs bg-orange-100 text-orange-600 px-1 py-0.5 rounded">
                                                        123
                                                    </span>
                                                )}
                                                {!isLaoText && (
                                                    <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">
                                                        Mixed
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm lao-text break-words mb-1">{text}</p>
                                            <div className="flex gap-3 text-xs text-muted-foreground">
                                                <span>{text.length} chars</span>
                                                <span>{wordCount} words</span>
                                                {text.length <= 10 && <span className="text-blue-600">Very Short</span>}
                                                {text.length > 10 && text.length <= 20 && <span className="text-green-600">Short</span>}
                                                {text.length > 20 && text.length <= 50 && <span className="text-orange-600">Medium</span>}
                                                {text.length > 50 && <span className="text-red-600">Long</span>}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeText(index)}
                                            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 ml-2 flex-shrink-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                );
                            })}
                            {customTexts.length > 50 && (
                                <p className="text-xs text-muted-foreground text-center">
                                    Showing 50 of {customTexts.length} text chunks
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TextUpload;