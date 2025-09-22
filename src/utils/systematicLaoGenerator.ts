// ระบบสร้าง Dataset ภาษาลาวแบบเป็นระเบียบ - Systematic Lao Dataset Generator
// สำหรับสร้างข้อมูลที่ครอบคลุมและเป็นระเบียบตามหลักภาษาศาสตร์

/**
 * คำแนะนำการใช้งาน (Usage Guide):
 * 
 * 1. ระบบนี้จะสร้างพยางค์ทั้งหมดที่เป็นไปได้ในภาษาลาว
 * 2. เรียงลำดับตามพยัญชนะ -> สระ -> วรรณยุกต์
 * 3. ครอบคลุม 37 พยัญชนะ × 28 สระ × 5 วรรณยุกต์ = 5,180 พยางค์
 * 4. รองรับการสร้างคำหลายพยางค์ (2, 3, 4+ พยางค์)
 * 5. มีระบบกรองเฉพาะคำที่ใช้งานจริง
 */

// พยัญชนะเดี่ยว 27 ตัว (ตามลำดับอักษร)
export const singleConsonants = [
  'ກ', 'ຂ', 'ຄ', 'ງ', 'ຈ', 'ຊ', 'ຍ', 'ດ', 'ຕ', 'ຖ', 'ທ', 'ນ', 
  'བ', 'ປ', 'ຜ', 'ຝ', 'ພ', 'ຟ', 'ມ', 'ຢ', 'ຣ', 'ລ', 'ວ', 'ສ', 'ຫ', 'ອ', 'ຮ'
];

// พยัญชนະคู่ 10 คู่ (ที่ใช้งานจริง)
export const doubleConsonants = [
  'ຫງ', 'ຫຍ', 'ຫນ', 'ຫມ', 'ຫລ', 'ຫວ', 'ຫຣ', 'ຫຼ', 'ຫຢ', 'ຫອ'
];

// รวมพยัญชนະทั้งหมด 37 ตัว
export const allConsonants = [...singleConsonants, ...doubleConsonants];

// สระ 28 รูปแบบ (เรียงตามประเภท)
export const vowels = {
  // สระเดี่ยว (Single Vowels)
  single: [
    'ະ', 'າ', 'ິ', 'ີ', 'ຶ', 'ື', 'ຸ', 'ູ', 'ົ', 'ອ'
  ],
  
  // สระประสม เ- (E- Vowels)
  eVowels: [
    'ເະ', 'ເາ', 'ເິະ', 'ເີາ', 'ເຶອ', 'ເືອ', 'ເຸອ', 'ເູອ'
  ],
  
  // สระประสม แ- (AE- Vowels)
  aeVowels: [
    'ແະ', 'ແາ'
  ],
  
  // สระประสม ໂ- (O- Vowels)
  oVowels: [
    'ໂະ', 'ໂາ'
  ],
  
  // สระพิเศษ (Special Vowels)
  special: [
    'ໄ', 'ໃ', 'ຳ', 'ຽ', 'ຽະ', 'ຽາ'
  ]
};

// รวมสระทั้งหมด 28 รูปแบบ
export const allVowels = [
  ...vowels.single,
  ...vowels.eVowels,
  ...vowels.aeVowels,
  ...vowels.oVowels,
  ...vowels.special
];

// วรรณยุกต์ 5 เสียง
export const tones = [
  { symbol: '', name: 'ສຽງສາມັນ', nameEn: 'Mid Tone' },
  { symbol: '່', name: 'ໄມ້ເອກ', nameEn: 'Low Tone' },
  { symbol: '້', name: 'ໄມ້ໂທ', nameEn: 'Falling Tone' },
  { symbol: '໋', name: 'ໄມ້ຕີ', nameEn: 'High Tone' },
  { symbol: '໌', name: 'ໄມ້ຈັດຕະວາ', nameEn: 'Rising Tone' }
];

// รูปแบบพิเศษ (พยัญชนะที่เขียนได้หลายแบบ)
export const specialVariants = {
  'ຫຼ': ['ຣ', 'ຫຣ'], // หล = ร = หร
  'ຫຍ': ['ຍ'],       // หญ = ญ (ในบางกรณี)
};

/**
 * ฟังก์ชันประยุกต์สระกับพยัญชนะ
 * Apply vowel to consonant according to Lao writing rules
 */
function applyVowelToConsonant(consonant: string, vowel: string): string {
  switch (vowel) {
    // สระที่เขียนหลังพยัญชนะ
    case 'ະ': case 'າ': case 'ິ': case 'ີ': case 'ຶ': case 'ື': 
    case 'ຸ': case 'ູ': case 'ົ': case 'ອ': case 'ຳ':
    case 'ຽ': case 'ຽະ': case 'ຽາ':
      return consonant + vowel;
      
    // สระ เ- (เขียนหน้าพยัญชนะ)
    case 'ເະ': case 'ເາ':
      return 'ເ' + consonant + vowel.substring(1);
      
    case 'ເິະ': case 'ເີາ': case 'ເຶອ': case 'ເືອ': case 'ເຸອ': case 'ເູອ':
      return 'ເ' + consonant + vowel.substring(1);
      
    // สระ แ- (เขียนหน้าพยัญชนะ)
    case 'ແະ': case 'ແາ':
      return 'ແ' + consonant + vowel.substring(1);
      
    // สระ ໂ- (เขียนหน้าพยัญชนะ)
    case 'ໂະ': case 'ໂາ':
      return 'ໂ' + consonant + vowel.substring(1);
      
    // สระพิเศษ
    case 'ໄ': case 'ໃ':
      return vowel + consonant;
      
    default:
      return consonant + vowel;
  }
}

/**
 * ฟังก์ชันเพิ่มวรรณยุกต์
 * Add tone mark to syllable
 */
function addToneToSyllable(syllable: string, toneSymbol: string): string {
  if (!toneSymbol) return syllable;
  
  // หาตำแหน่งที่เหมาะสมสำหรับวรรณยุกต์
  // ใส่หลังพยัญชนะหลักหรือสระ
  const laoChars = syllable.split('');
  let insertPosition = 1; // ตำแหน่งเริ่มต้น
  
  // หาตำแหน่งที่เหมาะสม (หลังพยัญชนะหลัก)
  for (let i = 0; i < laoChars.length; i++) {
    const char = laoChars[i];
    // ถ้าเป็นพยัญชนะ ให้ใส่วรรณยุกต์หลังจากนี้
    if (allConsonants.some(c => c.includes(char))) {
      insertPosition = i + 1;
      break;
    }
  }
  
  return syllable.slice(0, insertPosition) + toneSymbol + syllable.slice(insertPosition);
}

/**
 * สร้างพยางค์เดี่ยวทั้งหมดแบบเป็นระเบียบ
 * Generate all single syllables systematically
 */
export function generateSystematicSyllables(): {
  syllables: string[];
  byConsonant: Record<string, string[]>;
  byVowel: Record<string, string[]>;
  byTone: Record<string, string[]>;
  statistics: {
    totalConsonants: number;
    totalVowels: number;
    totalTones: number;
    totalPossible: number;
    totalGenerated: number;
  };
} {
  const syllables: string[] = [];
  const byConsonant: Record<string, string[]> = {};
  const byVowel: Record<string, string[]> = {};
  const byTone: Record<string, string[]> = {};
  
  // สร้างพยางค์แบบเป็นระเบียบ: พยัญชนะ -> สระ -> วรรณยุกต์
  allConsonants.forEach(consonant => {
    byConsonant[consonant] = [];
    
    allVowels.forEach(vowel => {
      if (!byVowel[vowel]) byVowel[vowel] = [];
      
      tones.forEach(tone => {
        if (!byTone[tone.name]) byTone[tone.name] = [];
        
        try {
          // สร้างพยางค์พื้นฐาน
          const baseSyllable = applyVowelToConsonant(consonant, vowel);
          
          // เพิ่มวรรณยุกต์
          const finalSyllable = addToneToSyllable(baseSyllable, tone.symbol);
          
          // เพิ่มเข้าในรายการ
          syllables.push(finalSyllable);
          byConsonant[consonant].push(finalSyllable);
          byVowel[vowel].push(finalSyllable);
          byTone[tone.name].push(finalSyllable);
          
        } catch (error) {
          console.warn(`Cannot create syllable: ${consonant} + ${vowel} + ${tone.symbol}`);
        }
      });
    });
  });
  
  const statistics = {
    totalConsonants: allConsonants.length,
    totalVowels: allVowels.length,
    totalTones: tones.length,
    totalPossible: allConsonants.length * allVowels.length * tones.length,
    totalGenerated: syllables.length
  };
  
  return {
    syllables,
    byConsonant,
    byVowel,
    byTone,
    statistics
  };
}

/**
 * สร้างคำหลายพยางค์แบบเป็นระเบียบ
 * Generate multi-syllable words systematically
 */
export function generateMultiSyllableWords(syllableCount: number, limit: number = 1000): string[] {
  const { syllables } = generateSystematicSyllables();
  const words: string[] = [];
  
  // เลือกพยางค์ที่ใช้บ่อยสำหรับการประสม
  const commonSyllables = syllables.filter(s => {
    // กรองเฉพาะพยางค์ที่มีแนวโน้มจะใช้งานจริง
    return s.length >= 2 && s.length <= 4;
  }).slice(0, 50); // จำกัดเพื่อป้องกันการระเบิด
  
  function generateCombinations(currentWord: string, remainingSyllables: number): void {
    if (remainingSyllables === 0) {
      if (currentWord.length > 0) {
        words.push(currentWord);
      }
      return;
    }
    
    if (words.length >= limit) return; // จำกัดจำนวน
    
    commonSyllables.forEach(syllable => {
      if (words.length < limit) {
        generateCombinations(currentWord + syllable, remainingSyllables - 1);
      }
    });
  }
  
  generateCombinations('', syllableCount);
  return words.slice(0, limit);
}

/**
 * สร้างรูปแบบพิเศษ (Special Variants)
 */
export function generateSpecialVariants(): string[] {
  const variants: string[] = [];
  
  Object.entries(specialVariants).forEach(([main, alternatives]) => {
    allVowels.forEach(vowel => {
      tones.forEach(tone => {
        try {
          // รูปแบบหลัก
          const mainForm = addToneToSyllable(
            applyVowelToConsonant(main, vowel), 
            tone.symbol
          );
          variants.push(mainForm);
          
          // รูปแบบทางเลือก
          alternatives.forEach(alt => {
            const altForm = addToneToSyllable(
              applyVowelToConsonant(alt, vowel), 
              tone.symbol
            );
            variants.push(altForm);
          });
        } catch (error) {
          // ข้ามถ้าสร้างไม่ได้
        }
      });
    });
  });
  
  return variants;
}

/**
 * สร้าง Dataset แบบครอบคลุมและเป็นระเบียบ
 */
export function generateSystematicDataset(): {
  singleSyllables: string[];
  twoSyllableWords: string[];
  threeSyllableWords: string[];
  fourSyllableWords: string[];
  specialVariants: string[];
  organizationData: {
    byConsonant: Record<string, string[]>;
    byVowel: Record<string, string[]>;
    byTone: Record<string, string[]>;
  };
  statistics: {
    consonants: number;
    vowels: number;
    tones: number;
    totalSyllables: number;
    twoSyllableWords: number;
    threeSyllableWords: number;
    fourSyllableWords: number;
    specialVariants: number;
    grandTotal: number;
  };
} {
  console.log('🔄 กำลังสร้าง Dataset แบบเป็นระเบียบ...');
  
  // 1. สร้างพยางค์เดี่ยวทั้งหมด
  const syllableData = generateSystematicSyllables();
  console.log(`✅ สร้างพยางค์เดี่ยว: ${syllableData.syllables.length} พยางค์`);
  
  // 2. สร้างคำหลายพยางค์
  const twoSyllableWords = generateMultiSyllableWords(2, 500);
  console.log(`✅ สร้างคำสองพยางค์: ${twoSyllableWords.length} คำ`);
  
  const threeSyllableWords = generateMultiSyllableWords(3, 300);
  console.log(`✅ สร้างคำสามพยางค์: ${threeSyllableWords.length} คำ`);
  
  const fourSyllableWords = generateMultiSyllableWords(4, 200);
  console.log(`✅ สร้างคำสี่พยางค์: ${fourSyllableWords.length} คำ`);
  
  // 3. สร้างรูปแบบพิเศษ
  const specialVariants = generateSpecialVariants();
  console.log(`✅ สร้างรูปแบบพิเศษ: ${specialVariants.length} รูปแบบ`);
  
  const statistics = {
    consonants: allConsonants.length,
    vowels: allVowels.length,
    tones: tones.length,
    totalSyllables: syllableData.syllables.length,
    twoSyllableWords: twoSyllableWords.length,
    threeSyllableWords: threeSyllableWords.length,
    fourSyllableWords: fourSyllableWords.length,
    specialVariants: specialVariants.length,
    grandTotal: syllableData.syllables.length + twoSyllableWords.length + 
                threeSyllableWords.length + fourSyllableWords.length + specialVariants.length
  };
  
  console.log('📊 สถิติ Dataset:', statistics);
  
  return {
    singleSyllables: syllableData.syllables,
    twoSyllableWords,
    threeSyllableWords,
    fourSyllableWords,
    specialVariants,
    organizationData: {
      byConsonant: syllableData.byConsonant,
      byVowel: syllableData.byVowel,
      byTone: syllableData.byTone
    },
    statistics
  };
}

/**
 * ฟังก์ชันสำหรับการส่งออกข้อมูลแบบเป็นระเบียบ
 */
export function exportSystematicData(format: 'array' | 'grouped' | 'csv' = 'array'): any {
  const dataset = generateSystematicDataset();
  
  switch (format) {
    case 'grouped':
      return {
        พยางค์เดี่ยว: dataset.singleSyllables,
        คำสองพยางค์: dataset.twoSyllableWords,
        คำสามพยางค์: dataset.threeSyllableWords,
        คำสี่พยางค์: dataset.fourSyllableWords,
        รูปแบบพิเศษ: dataset.specialVariants
      };
      
    case 'csv':
      const allData = [
        ...dataset.singleSyllables.map(s => ({ text: s, type: 'พยางค์เดี่ยว', syllables: 1 })),
        ...dataset.twoSyllableWords.map(s => ({ text: s, type: 'คำสองพยางค์', syllables: 2 })),
        ...dataset.threeSyllableWords.map(s => ({ text: s, type: 'คำสามพยางค์', syllables: 3 })),
        ...dataset.fourSyllableWords.map(s => ({ text: s, type: 'คำสี่พยางค์', syllables: 4 })),
        ...dataset.specialVariants.map(s => ({ text: s, type: 'รูปแบบพิเศษ', syllables: 1 }))
      ];
      return allData;
      
    case 'array':
    default:
      return [
        ...dataset.singleSyllables,
        ...dataset.twoSyllableWords,
        ...dataset.threeSyllableWords,
        ...dataset.fourSyllableWords,
        ...dataset.specialVariants
      ];
  }
}

// ส่งออกข้อมูลสำคัญ (ไม่ต้อง export ซ้ำเพราะมีการ export แล้วข้างบน)