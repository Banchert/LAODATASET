/**
 * Advanced Text processing utilities for Lao language
 * Handles intelligent word segmentation, sentence splitting, and text chunking
 * with enhanced Lao language-specific algorithms
 */

// Enhanced Lao word boundary patterns
const LAO_WORD_BOUNDARIES = [
  ' ', '\t', '\n', '\r',  // Whitespace
  '།', '៕', '។',          // Lao punctuation
  ',', '.', '!', '?', ';', ':', // Common punctuation
  '(', ')', '[', ']', '{', '}', // Brackets
  '"', "'", '«', '»', '"', '"', // Quotes
  '-', '–', '—', '/', '\\',     // Dashes and slashes
  '၊', '။',                     // Myanmar punctuation (sometimes used)
  '፣', '፤', '፥', '፦', '፧', '፨'  // Additional punctuation
];

// Enhanced Lao sentence ending patterns
const LAO_SENTENCE_ENDINGS = ['។', '.', '!', '?', '៕', '၊', '။'];

// Advanced Lao syllable patterns for better word segmentation
const LAO_SYLLABLE_PATTERNS = [
  // Basic Lao syllable: consonant + vowel + tone mark
  /[\u0E81-\u0EAE][\u0EB0-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD]*/g,
  // Consonant clusters
  /[\u0E81-\u0EAE][\u0EBA\u0EBB][\u0E81-\u0EAE]/g,
  // Special combinations
  /[\u0E81-\u0EAE][\u0EC0-\u0EC4][\u0E81-\u0EAE]/g,
];

// Common Lao words and particles for better segmentation
const LAO_COMMON_WORDS = [
  'ແລະ', 'ຫຼື', 'ກັບ', 'ຂອງ', 'ທີ່', 'ໃນ', 'ຢູ່', 'ມີ', 'ເປັນ', 'ໄດ້',
  'ຈະ', 'ບໍ່', 'ບໍ', 'ແມ່ນ', 'ກໍ', 'ຍັງ', 'ແລ້ວ', 'ເດີ້', 'ເທົ່ານັ້ນ', 'ພຽງແຕ່',
  'ສຳລັບ', 'ເພື່ອ', 'ຈາກ', 'ໄປ', 'ມາ', 'ຂຶ້ນ', 'ລົງ', 'ອອກ', 'ເຂົ້າ', 'ຜ່ານ'
];

// Lao phrase connectors
const LAO_PHRASE_CONNECTORS = [
  'ແລະ', 'ຫຼື', 'ແຕ່', 'ເພາະວ່າ', 'ຖ້າ', 'ເມື່ອ', 'ໃນຂະນະທີ່', 'ຫຼັງຈາກ',
  'ກ່ອນທີ່', 'ເພື່ອທີ່', 'ເຖິງແມ່ນວ່າ', 'ເນື່ອງຈາກ', 'ດັ່ງນັ້ນ', 'ຢ່າງໃດກໍຕາມ'
];

// Advanced text analysis patterns
const LAO_ANALYSIS_PATTERNS = {
  // Numbers and dates
  numbers: /[\u0ED0-\u0ED9]+/g,
  // Repeated characters (for emphasis)
  repeated: /(.)\1{2,}/g,
  // Mixed script detection
  mixedScript: /[\u0E80-\u0EFF].*[a-zA-Z]|[a-zA-Z].*[\u0E80-\u0EFF]/,
  // URL patterns
  urls: /https?:\/\/[^\s]+/g,
  // Email patterns
  emails: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
};

export interface TextChunk {
  text: string;
  type: 'word' | 'phrase' | 'sentence' | 'paragraph' | 'compound' | 'fragment';
  length: number;
  source: 'original' | 'segmented' | 'analyzed' | 'synthetic';
  confidence?: number;  // Confidence score for segmentation quality
  metadata?: {
    syllableCount?: number;
    wordCount?: number;
    hasNumbers?: boolean;
    hasMixedScript?: boolean;
    complexity?: 'simple' | 'medium' | 'complex';
  };
}

export class LaoTextProcessor {
  
  /**
   * Process input text and generate various text chunks with advanced segmentation
   */
  static processText(inputText: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    
    // Clean and normalize text
    const cleanText = this.cleanText(inputText);
    
    // Analyze text characteristics
    const textAnalysis = this.analyzeText(cleanText);
    
    // Split into lines first (limit for performance)
    const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0).slice(0, 50);
    
    for (const line of lines) {
      const lineChunks = this.processLine(line.trim(), textAnalysis);
      chunks.push(...lineChunks);
      
      // Limit total chunks for performance
      if (chunks.length > 1000) {
        console.log(`Limiting chunks to 1000 for performance`);
        break;
      }
    }
    
    // Generate synthetic variations (only if not too many chunks already)
    if (chunks.length < 500) {
      const syntheticChunks = this.generateSyntheticVariations(chunks);
      chunks.push(...syntheticChunks);
    }
    
    // Remove duplicates and improve quality
    const uniqueChunks = this.removeDuplicates(chunks);
    const qualityChunks = this.improveChunkQuality(uniqueChunks);
    
    // Sort by confidence and length for better variety
    return qualityChunks.sort((a, b) => {
      const confidenceDiff = (b.confidence || 0) - (a.confidence || 0);
      return confidenceDiff !== 0 ? confidenceDiff : a.length - b.length;
    });
  }
  
  /**
   * Analyze text characteristics for better processing
   */
  private static analyzeText(text: string): {
    hasNumbers: boolean;
    hasMixedScript: boolean;
    avgWordLength: number;
    complexity: 'simple' | 'medium' | 'complex';
  } {
    const hasNumbers = LAO_ANALYSIS_PATTERNS.numbers.test(text);
    const hasMixedScript = LAO_ANALYSIS_PATTERNS.mixedScript.test(text);
    
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length || 0;
    
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';
    if (avgWordLength > 8 || hasMixedScript) complexity = 'complex';
    else if (avgWordLength > 5 || hasNumbers) complexity = 'medium';
    
    return { hasNumbers, hasMixedScript, avgWordLength, complexity };
  }

  /**
   * Process a single line of text with enhanced analysis
   */
  private static processLine(line: string, analysis: any): TextChunk[] {
    const chunks: TextChunk[] = [];
    
    // Add original line as paragraph with metadata
    if (line.length > 0) {
      chunks.push({
        text: line,
        type: 'paragraph',
        length: line.length,
        source: 'original',
        confidence: 1.0,
        metadata: {
          wordCount: line.split(/\s+/).length,
          hasNumbers: analysis.hasNumbers,
          hasMixedScript: analysis.hasMixedScript,
          complexity: analysis.complexity
        }
      });
    }
    
    // Advanced sentence splitting
    const sentences = this.advancedSentenceSplit(line);
    for (const sentence of sentences) {
      if (sentence.length > 10) {
        const confidence = this.calculateSentenceConfidence(sentence);
        chunks.push({
          text: sentence,
          type: 'sentence',
          length: sentence.length,
          source: 'segmented',
          confidence,
          metadata: {
            wordCount: sentence.split(/\s+/).length,
            complexity: analysis.complexity
          }
        });
      }
      
      // Advanced phrase extraction
      const phrases = this.advancedPhraseExtraction(sentence);
      chunks.push(...phrases);
    }
    
    // Advanced word segmentation
    const words = this.advancedWordSegmentation(line);
    chunks.push(...words);
    
    // Extract compound words and fragments
    const compounds = this.extractCompoundWords(line);
    chunks.push(...compounds);
    
    return chunks;
  }
  
  /**
   * Clean and normalize text
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .replace(/[""]/g, '"') // Normalize quotes
      .replace(/['']/g, "'") // Normalize apostrophes
      .replace(/[^\u0E80-\u0EFF\u0020-\u007E\s]/g, '') // Remove invalid characters, keep Lao and basic Latin
      .trim();
  }
  
  /**
   * Advanced sentence splitting with context awareness
   */
  private static advancedSentenceSplit(text: string): string[] {
    const sentences: string[] = [];
    let currentSentence = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1] || '';
      const prevChar = text[i - 1] || '';
      
      currentSentence += char;
      
      // Handle quotes
      if (['"', "'", '«', '»', '"', '"'].includes(char)) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (char === quoteChar || (quoteChar === '«' && char === '»') || (quoteChar === '"' && char === '"')) {
          inQuotes = false;
          quoteChar = '';
        }
      }
      
      // Check for sentence endings (but not inside quotes)
      if (!inQuotes && LAO_SENTENCE_ENDINGS.includes(char)) {
        // Look ahead for context
        const remaining = text.slice(i + 1).trim();
        const isEndOfSentence = remaining.length === 0 || 
                               /^[A-Z\u0E81-\u0EAE]/.test(remaining) ||
                               /^\s*[A-Z\u0E81-\u0EAE]/.test(remaining);
        
        // Don't split on abbreviations or numbers
        const isAbbreviation = /[A-Za-z\u0E81-\u0EAE]$/.test(prevChar) && char === '.' && /^[a-z]/.test(nextChar);
        const isNumber = /[\d\u0ED0-\u0ED9]$/.test(prevChar) && char === '.' && /[\d\u0ED0-\u0ED9]/.test(nextChar);
        
        if (isEndOfSentence && !isAbbreviation && !isNumber) {
          sentences.push(currentSentence.trim());
          currentSentence = '';
        }
      }
    }
    
    // Add remaining text as sentence
    if (currentSentence.trim().length > 0) {
      sentences.push(currentSentence.trim());
    }
    
    return sentences.filter(s => s.length > 0);
  }

  /**
   * Calculate confidence score for sentence segmentation
   */
  private static calculateSentenceConfidence(sentence: string): number {
    let confidence = 0.6; // Higher base confidence
    
    // Increase confidence for proper sentence structure
    if (/^[\u0E81-\u0EAE\u0E94-\u0E97A-Z]/.test(sentence)) confidence += 0.1; // Starts with capital
    if (LAO_SENTENCE_ENDINGS.some(ending => sentence.endsWith(ending))) confidence += 0.1; // Proper ending
    if (sentence.split(/\s+/).length >= 2) confidence += 0.1; // At least 2 words
    if (/[\u0E80-\u0EFF]/.test(sentence)) confidence += 0.1; // Contains Lao
    
    // Less harsh penalties
    if (sentence.length < 5) confidence -= 0.1; // Only penalize very short
    if (sentence.length > 300) confidence -= 0.1; // Only penalize very long
    
    return Math.max(0.2, Math.min(1, confidence)); // Minimum 0.2 confidence
  }
  
  /**
   * Advanced phrase extraction with linguistic awareness
   */
  private static advancedPhraseExtraction(text: string): TextChunk[] {
    const phrases: TextChunk[] = [];
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    // Create phrases of different lengths with smart boundaries
    for (let phraseLength = 2; phraseLength <= Math.min(7, words.length); phraseLength++) {
      for (let i = 0; i <= words.length - phraseLength; i++) {
        const phraseWords = words.slice(i, i + phraseLength);
        const phrase = phraseWords.join(' ');
        
        if (phrase.length >= 5 && phrase.length <= 120) {
          const confidence = this.calculatePhraseConfidence(phraseWords);
          
          phrases.push({
            text: phrase,
            type: 'phrase',
            length: phrase.length,
            source: 'segmented',
            confidence,
            metadata: {
              wordCount: phraseWords.length,
              syllableCount: this.countSyllables(phrase),
              complexity: phraseLength > 4 ? 'complex' : phraseLength > 2 ? 'medium' : 'simple'
            }
          });
        }
      }
    }
    
    // Extract meaningful phrases based on connectors
    const meaningfulPhrases = this.extractMeaningfulPhrases(text);
    phrases.push(...meaningfulPhrases);
    
    return phrases;
  }

  /**
   * Calculate confidence score for phrase quality
   */
  private static calculatePhraseConfidence(words: string[]): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for good phrase structure
    if (LAO_COMMON_WORDS.some(common => words.includes(common))) confidence += 0.2;
    if (words.length >= 2 && words.length <= 7) confidence += 0.1; // Reasonable length range
    if (words.some(word => /[\u0E80-\u0EFF]/.test(word))) confidence += 0.2; // Contains Lao
    if (words.every(word => /[\u0E80-\u0EFF]/.test(word))) confidence += 0.1; // All contain Lao
    
    // Less harsh penalties
    if (words.length === 1) confidence -= 0.1; // Single word phrases
    if (words.some(w => w.length > 20)) confidence -= 0.05; // Very long words
    
    return Math.max(0.2, Math.min(1, confidence)); // Minimum 0.2 confidence
  }

  /**
   * Extract meaningful phrases using connectors and patterns
   */
  private static extractMeaningfulPhrases(text: string): TextChunk[] {
    const phrases: TextChunk[] = [];
    
    // Find phrases connected by Lao connectors
    for (const connector of LAO_PHRASE_CONNECTORS) {
      const parts = text.split(connector);
      if (parts.length > 1) {
        for (let i = 0; i < parts.length - 1; i++) {
          const beforeConnector = parts[i].trim().split(/\s+/).slice(-3).join(' ');
          const afterConnector = parts[i + 1].trim().split(/\s+/).slice(0, 3).join(' ');
          
          if (beforeConnector && afterConnector) {
            const meaningfulPhrase = `${beforeConnector} ${connector} ${afterConnector}`;
            if (meaningfulPhrase.length >= 10 && meaningfulPhrase.length <= 100) {
              phrases.push({
                text: meaningfulPhrase,
                type: 'phrase',
                length: meaningfulPhrase.length,
                source: 'analyzed',
                confidence: 0.8,
                metadata: {
                  wordCount: meaningfulPhrase.split(/\s+/).length,
                  complexity: 'medium'
                }
              });
            }
          }
        }
      }
    }
    
    return phrases;
  }
  
  /**
   * Advanced word segmentation with Lao-specific rules
   */
  private static advancedWordSegmentation(text: string): TextChunk[] {
    const words: TextChunk[] = [];
    
    // Enhanced word boundary detection
    const wordCandidates = text.split(/[\s\u0020-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E\u0E2F\u0E46\u0E4F\u0E5A\u0E5B]+/);
    
    for (const word of wordCandidates) {
      const cleanWord = this.cleanWord(word);
      if (cleanWord.length > 0) {
        const confidence = this.calculateWordConfidence(cleanWord);
        const syllableCount = this.countSyllables(cleanWord);
        
        words.push({
          text: cleanWord,
          type: 'word',
          length: cleanWord.length,
          source: 'segmented',
          confidence,
          metadata: {
            syllableCount,
            hasNumbers: LAO_ANALYSIS_PATTERNS.numbers.test(cleanWord),
            complexity: syllableCount > 3 ? 'complex' : syllableCount > 1 ? 'medium' : 'simple'
          }
        });
        
        // For longer words, create sub-words (syllables) with better algorithm
        if (cleanWord.length > 6 && syllableCount > 2) {
          const subWords = this.advancedSyllableSplit(cleanWord);
          words.push(...subWords);
        }
      }
    }
    
    return words;
  }

  /**
   * Clean individual words
   */
  private static cleanWord(word: string): string {
    return word
      .replace(/^[^\u0E80-\u0EFFa-zA-Z\u0ED0-\u0ED9]+/, '') // Remove leading non-letters
      .replace(/[^\u0E80-\u0EFFa-zA-Z\u0ED0-\u0ED9]+$/, '') // Remove trailing non-letters
      .trim();
  }

  /**
   * Calculate confidence score for word quality
   */
  private static calculateWordConfidence(word: string): number {
    let confidence = 0.5; // More conservative base confidence
    
    // Increase confidence for good word characteristics
    if (/[\u0E80-\u0EFF]/.test(word)) confidence += 0.3; // Contains Lao (not necessarily pure)
    if (/^[\u0E80-\u0EFF]+$/.test(word)) confidence += 0.1; // Pure Lao bonus
    if (word.length >= 2 && word.length <= 15) confidence += 0.1; // Reasonable length
    if (LAO_COMMON_WORDS.includes(word)) confidence += 0.1; // Common word
    
    // Less harsh penalties
    if (word.length < 1) confidence -= 0.2; // Only penalize empty
    if (word.length > 25) confidence -= 0.1; // Only penalize very long
    if (/^[0-9]+$/.test(word)) confidence -= 0.05; // Small penalty for pure numbers
    
    return Math.max(0.1, Math.min(1, confidence)); // Minimum 0.1 confidence
  }

  /**
   * Count syllables in Lao text
   */
  private static countSyllables(text: string): number {
    const matches = text.match(/[\u0E81-\u0EAE]/g);
    return matches ? matches.length : 1;
  }
  
  /**
   * Advanced syllable splitting with multiple patterns
   */
  private static advancedSyllableSplit(word: string): TextChunk[] {
    const syllables: TextChunk[] = [];
    
    // Try multiple syllable patterns
    for (const pattern of LAO_SYLLABLE_PATTERNS) {
      const matches = word.match(pattern);
      if (matches && matches.length > 1) {
        for (const syllable of matches) {
          if (syllable.length >= 2) {
            const confidence = this.calculateWordConfidence(syllable);
            syllables.push({
              text: syllable,
              type: 'fragment',
              length: syllable.length,
              source: 'segmented',
              confidence,
              metadata: {
                syllableCount: 1,
                complexity: 'simple'
              }
            });
          }
        }
        break; // Use first successful pattern
      }
    }
    
    // Fallback: simple character-based splitting
    if (syllables.length === 0 && word.length > 8) {
      const midPoint = Math.floor(word.length / 2);
      const firstHalf = word.substring(0, midPoint);
      const secondHalf = word.substring(midPoint);
      
      if (firstHalf.length >= 2) {
        syllables.push({
          text: firstHalf,
          type: 'fragment',
          length: firstHalf.length,
          source: 'segmented',
          confidence: 0.5
        });
      }
      
      if (secondHalf.length >= 2) {
        syllables.push({
          text: secondHalf,
          type: 'fragment',
          length: secondHalf.length,
          source: 'segmented',
          confidence: 0.5
        });
      }
    }
    
    return syllables;
  }

  /**
   * Extract compound words and meaningful combinations
   */
  private static extractCompoundWords(text: string): TextChunk[] {
    const compounds: TextChunk[] = [];
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    // Look for compound word patterns
    for (let i = 0; i < words.length - 1; i++) {
      const word1 = words[i];
      const word2 = words[i + 1];
      
      // Check if words can form meaningful compounds
      if (this.canFormCompound(word1, word2)) {
        const compound = `${word1}${word2}`;
        compounds.push({
          text: compound,
          type: 'compound',
          length: compound.length,
          source: 'analyzed',
          confidence: 0.7,
          metadata: {
            wordCount: 2,
            syllableCount: this.countSyllables(compound),
            complexity: 'medium'
          }
        });
      }
    }
    
    return compounds;
  }

  /**
   * Check if two words can form a meaningful compound
   */
  private static canFormCompound(word1: string, word2: string): boolean {
    // Basic rules for Lao compound formation
    return word1.length >= 2 && 
           word2.length >= 2 && 
           word1.length + word2.length <= 15 &&
           /[\u0E80-\u0EFF]/.test(word1) && 
           /[\u0E80-\u0EFF]/.test(word2);
  }

  /**
   * Generate synthetic variations of existing chunks (optimized)
   */
  private static generateSyntheticVariations(chunks: TextChunk[]): TextChunk[] {
    const synthetic: TextChunk[] = [];
    
    // Limit processing for performance
    const shortChunks = chunks.filter(c => c.type === 'word' && c.length >= 3 && c.length <= 8).slice(0, 10);
    
    for (let i = 0; i < Math.min(shortChunks.length - 1, 5); i++) {
      for (let j = i + 1; j < Math.min(shortChunks.length, i + 3); j++) {
        const chunk1 = shortChunks[i];
        const chunk2 = shortChunks[j];
        
        // Create spaced combination only
        const spacedCombination = `${chunk1.text} ${chunk2.text}`;
        if (spacedCombination.length <= 25) {
          synthetic.push({
            text: spacedCombination,
            type: 'phrase',
            length: spacedCombination.length,
            source: 'synthetic',
            confidence: 0.6,
            metadata: {
              wordCount: 2,
              complexity: 'simple'
            }
          });
        }
      }
    }
    
    return synthetic.slice(0, 20); // Limit synthetic variations for performance
  }

  /**
   * Improve chunk quality by filtering and enhancing
   */
  private static improveChunkQuality(chunks: TextChunk[]): TextChunk[] {
    return chunks
      .filter(chunk => {
        // Filter out very low quality chunks
        if ((chunk.confidence || 0) < 0.2) return false; // More lenient confidence threshold
        if (chunk.length < 1) return false; // Allow single characters
        if (chunk.length > 200) return false; // Allow longer text
        
        // Check for only the most obvious garbled text patterns
        const obviousGarbledPatterns = [
          '◊', '�', '□', ':t^', 'Tj[L', 'PSw*', 'EVIH/', 
          'C5nkf]', 'ObBz+', 'Q7bq', '%OM{', 'j<PSw'
        ];
        
        const hasObviousGarbage = obviousGarbledPatterns.some(pattern => chunk.text.includes(pattern));
        if (hasObviousGarbage) {
          console.log(`Filtering out obviously garbled text: "${chunk.text}"`);
          return false;
        }
        
        // More lenient character validation - allow more characters
        const hasLaoChars = /[\u0E80-\u0EFF]/.test(chunk.text);
        if (!hasLaoChars) {
          console.log(`Filtering out non-Lao text: "${chunk.text}"`);
          return false;
        }
        
        // More lenient Lao character filtering
        const laoCharCount = (chunk.text.match(/[\u0E80-\u0EFF]/g) || []).length;
        const totalCharCount = chunk.text.replace(/\s/g, '').length;
        
        // Accept if it has any Lao characters
        if (laoCharCount > 0) return true;
        
        // Allow short text (might be useful)
        if (totalCharCount <= 5) return true;
        
        return false;
      })
      .map(chunk => {
        // Enhance metadata
        if (!chunk.metadata) {
          chunk.metadata = {};
        }
        
        if (!chunk.metadata.syllableCount) {
          chunk.metadata.syllableCount = this.countSyllables(chunk.text);
        }
        
        if (!chunk.metadata.wordCount) {
          chunk.metadata.wordCount = chunk.text.split(/\s+/).length;
        }
        
        return chunk;
      });
  }
  
  /**
   * Remove duplicate text chunks
   */
  private static removeDuplicates(chunks: TextChunk[]): TextChunk[] {
    const seen = new Set<string>();
    const unique: TextChunk[] = [];
    
    for (const chunk of chunks) {
      const key = chunk.text.toLowerCase().trim();
      if (!seen.has(key) && key.length > 0) {
        seen.add(key);
        unique.push(chunk);
      }
    }
    
    return unique;
  }
  
  /**
   * Filter chunks by type, length, and quality
   */
  static filterChunks(
    chunks: TextChunk[], 
    options: {
      types?: ('word' | 'phrase' | 'sentence' | 'paragraph' | 'compound' | 'fragment')[];
      minLength?: number;
      maxLength?: number;
      maxCount?: number;
      minConfidence?: number;
      complexity?: ('simple' | 'medium' | 'complex')[];
    } = {}
  ): TextChunk[] {
    let filtered = chunks;
    
    // Filter by type
    if (options.types && options.types.length > 0) {
      filtered = filtered.filter(chunk => options.types!.includes(chunk.type));
    }
    
    // Filter by length
    if (options.minLength !== undefined) {
      filtered = filtered.filter(chunk => chunk.length >= options.minLength!);
    }
    
    if (options.maxLength !== undefined) {
      filtered = filtered.filter(chunk => chunk.length <= options.maxLength!);
    }
    
    // Filter by confidence
    if (options.minConfidence !== undefined) {
      filtered = filtered.filter(chunk => (chunk.confidence || 0) >= options.minConfidence!);
    }
    
    // Filter by complexity
    if (options.complexity && options.complexity.length > 0) {
      filtered = filtered.filter(chunk => 
        chunk.metadata?.complexity && options.complexity!.includes(chunk.metadata.complexity)
      );
    }
    
    // Limit count
    if (options.maxCount !== undefined) {
      filtered = filtered.slice(0, options.maxCount);
    }
    
    return filtered;
  }
  
  /**
   * Get balanced selection of text chunks
   */
  static getBalancedSelection(chunks: TextChunk[], totalCount: number): string[] {
    const words = chunks.filter(c => c.type === 'word');
    const phrases = chunks.filter(c => c.type === 'phrase');
    const sentences = chunks.filter(c => c.type === 'sentence');
    const paragraphs = chunks.filter(c => c.type === 'paragraph');
    
    const selection: string[] = [];
    
    // Distribute selection across types
    const wordCount = Math.floor(totalCount * 0.4);      // 40% words
    const phraseCount = Math.floor(totalCount * 0.3);    // 30% phrases
    const sentenceCount = Math.floor(totalCount * 0.2);  // 20% sentences
    const paragraphCount = totalCount - wordCount - phraseCount - sentenceCount; // 10% paragraphs
    
    // Add words
    const selectedWords = this.randomSample(words, wordCount);
    selection.push(...selectedWords.map(w => w.text));
    
    // Add phrases
    const selectedPhrases = this.randomSample(phrases, phraseCount);
    selection.push(...selectedPhrases.map(p => p.text));
    
    // Add sentences
    const selectedSentences = this.randomSample(sentences, sentenceCount);
    selection.push(...selectedSentences.map(s => s.text));
    
    // Add paragraphs
    const selectedParagraphs = this.randomSample(paragraphs, paragraphCount);
    selection.push(...selectedParagraphs.map(p => p.text));
    
    // Shuffle the final selection
    return this.shuffleArray(selection);
  }
  
  /**
   * Random sample from array
   */
  private static randomSample<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffleArray([...array]);
    return shuffled.slice(0, Math.min(count, array.length));
  }
  
  /**
   * Shuffle array
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

export default LaoTextProcessor;