// ระบบการประสมคำลาวแบบครอบคลุม - Comprehensive Lao Word Composition System
// สำหรับสร้าง OCR Dataset ที่แม่นยำและหลากหลาย

// พยัญชนะเดี่ยว 27 ตัว
export const singleConsonants = [
  'ກ', 'ຂ', 'ຄ', 'ງ', 'ຈ', 'ຊ', 'ຍ', 'ດ', 'ຕ', 'ຖ', 'ທ', 'ນ', 
  'བ', 'ປ', 'ຜ', 'ຝ', 'ພ', 'ຟ', 'ມ', 'ຢ', 'ຣ', 'ລ', 'ວ', 'ສ', 'ຫ', 'ອ', 'ຮ'
];

// พยัญชนະคู่ที่ใช้จริง
export const doubleConsonants = [
  'ຫງ', 'ຫຍ', 'ຫນ', 'ຫມ', 'ຫລ', 'ຫວ', 'ຫຣ', 'ຫຼ', 'ຫຢ'
];

// พยัญชนะพิเศษ (รูปแบบเดียวกันแต่เขียนต่างกัน)
export const specialConsonantVariants = {
  'ຫຼ': ['ຣ', 'ຫຣ'], // หล = ร = หร
  'ຫຍ': ['ຍ'], // หญ = ญ (ในบางกรณี)
};

// สระ 28 รูปแบบ
export const vowels = [
  'ະ', 'າ', 'ິ', 'ີ', 'ຶ', 'ື', 'ຸ', 'ູ', 'ົ', 'ອ',
  'ເະ', 'ເາ', 'ແະ', 'ແາ', 'ໂະ', 'ໂາ', 
  'ເິະ', 'ເີາ', 'ເຶອ', 'ເືອ', 'ເຸອ', 'ເູອ',
  'ໄ', 'ໃ', 'ຳ', 'ຽ', 'ຽະ', 'ຽາ'
];

// วรรណยุกต์ 5 เสียง
export const tones = [
  '', // เสียงสามัญ
  '່', // ໄມ້ເອກ
  '້', // ໄມ້ໂທ
  '໋', // ໄມ້ຕີ
  '໌'  // ໄມ້ຈັດຕະວາ
];

// ฟังก์ชันสร้างพยางค์เดี่ยว (1 พยางค์)
export function generateSingleSyllables(): string[] {
  const syllables: string[] = [];
  
  // พยัญชนะเดี่ยว + สระ + วรรณยุกต์
  singleConsonants.forEach(consonant => {
    vowels.forEach(vowel => {
      tones.forEach(tone => {
        const syllable = applyVowelAndTone(consonant, vowel, tone);
        if (syllable) syllables.push(syllable);
      });
    });
  });
  
  // พยัญชนะคู่ + สระ + วรรณยุกต์
  doubleConsonants.forEach(consonant => {
    vowels.forEach(vowel => {
      tones.forEach(tone => {
        const syllable = applyVowelAndTone(consonant, vowel, tone);
        if (syllable) syllables.push(syllable);
      });
    });
  });
  
  return syllables;
}

// ฟังก์ชันสร้างคำ 2 พยางค์
export function generateTwoSyllableWords(): string[] {
  const words: string[] = [];
  const baseSyllables = generateBaseSyllables(); // เลือกพยางค์พื้นฐานที่ใช้บ่อย
  
  baseSyllables.forEach(syllable1 => {
    baseSyllables.forEach(syllable2 => {
      words.push(syllable1 + syllable2);
    });
  });
  
  return words;
}

// ฟังก์ชันสร้างประโยคและวลี
export function generatePhrases(): string[] {
  const phrases: string[] = [];
  
  // รูปแบบประโยคพื้นฐาน
  const subjects = ['ຂ້ອຍ', 'ເຈົ້າ', 'ລາວ', 'ພວກເຮົາ', 'ເຂົາ'];
  const verbs = ['ກິນ', 'ໄປ', 'ມາ', 'ຮຽນ', 'ເຮັດ', 'ເວົ້າ', 'ຟັງ', 'ເບິ່ງ'];
  const objects = ['ເຂົ້າ', 'ນ້ຳ', 'ໜັງສື', 'ວຽກ', 'ໂຮງຮຽນ', 'ບ້ານ'];
  
  // ສ້າງປະໂຫຍກ Subject + Verb + Object
  subjects.forEach(subject => {
    verbs.forEach(verb => {
      objects.forEach(object => {
        phrases.push(`${subject} ${verb} ${object}`);
      });
    });
  });
  
  // เพิ่มวลีทักทาย
  phrases.push(...[
    'ສະບາຍດີ', 'ສະບາຍດີບໍ່', 'ຂອບໃຈ', 'ຂໍໂທດ',
    'ລາກ່ອນ', 'ແລ້ວພົບກັນໃໝ່', 'ຢູ່ດີບໍ່'
  ]);
  
  return phrases;
}

// ฟังก์ชันประยุกต์สระและวรรณยุกต์
function applyVowelAndTone(consonant: string, vowel: string, tone: string): string | null {
  // กฎการประยุกต์สระกับพยัญชนะ
  switch (vowel) {
    case 'ະ':
    case 'າ':
    case 'ິ':
    case 'ີ':
    case 'ຶ':
    case 'ື':
    case 'ຸ':
    case 'ູ':
    case 'ົ':
    case 'ອ':
      return consonant + vowel + tone;
      
    case 'ເະ':
    case 'ເາ':
      return 'ເ' + consonant + vowel.substring(1) + tone;
      
    case 'ແະ':
    case 'ແາ':
      return 'ແ' + consonant + vowel.substring(1) + tone;
      
    case 'ໂະ':
    case 'ໂາ':
      return 'ໂ' + consonant + vowel.substring(1) + tone;
      
    case 'ເິະ':
    case 'ເີາ':
    case 'ເຶອ':
    case 'ເືອ':
    case 'ເຸອ':
    case 'ເູອ':
      return 'ເ' + consonant + vowel.substring(1) + tone;
      
    case 'ໄ':
    case 'ໃ':
      return vowel + consonant + tone;
      
    case 'ຳ':
      return consonant + vowel + tone;
      
    case 'ຽ':
    case 'ຽະ':
    case 'ຽາ':
      return consonant + vowel + tone;
      
    default:
      return null;
  }
}

// ฟังก์ชันสร้างพยางค์พื้นฐานที่ใช้บ่อย
function generateBaseSyllables(): string[] {
  const commonCombinations = [
    // พยัญชนะที่ใช้บ่อย + สระที่ใช้บ่อย
    'ກາ', 'ກິ', 'ກີ', 'ກຸ', 'ກູ', 'ກອ',
    'ຂາ', 'ຂິ', 'ຂີ', 'ຂຸ', 'ຂູ', 'ຂອ',
    'ຄາ', 'ຄິ', 'ຄີ', 'ຄຸ', 'ຄູ', 'ຄອ',
    'ງາ', 'ງິ', 'ງີ', 'ງຸ', 'ງູ', 'ງອ',
    'ຈາ', 'ຈິ', 'ຈີ', 'ຈຸ', 'ຈູ', 'ຈອ',
    'ຊາ', 'ຊິ', 'ຊີ', 'ຊຸ', 'ຊູ', 'ຊອ',
    'ດາ', 'ດິ', 'ດີ', 'ດຸ', 'ດູ', 'ດອ',
    'ຕາ', 'ຕິ', 'ຕີ', 'ຕຸ', 'ຕູ', 'ຕອ',
    'ທາ', 'ທິ', 'ທີ', 'ທຸ', 'ທູ', 'ທອ',
    'ນາ', 'ນິ', 'ນີ', 'ນຸ', 'ນູ', 'ນອ',
    'ບາ', 'ບິ', 'ບີ', 'ບຸ', 'ບູ', 'ບອ',
    'ປາ', 'ປິ', 'ປີ', 'ປຸ', 'ປູ', 'ປອ',
    'ພາ', 'ພິ', 'ພີ', 'ພຸ', 'ພູ', 'ພອ',
    'ຟາ', 'ຟິ', 'ຟີ', 'ຟຸ', 'ຟູ', 'ຟອ',
    'ມາ', 'ມິ', 'ມີ', 'ມຸ', 'ມູ', 'ມອ',
    'ຢາ', 'ຢິ', 'ຢີ', 'ຢຸ', 'ຢູ', 'ຢອ',
    'ລາ', 'ລິ', 'ລີ', 'ລຸ', 'ລູ', 'ລອ',
    'ວາ', 'ວິ', 'ວີ', 'ວຸ', 'ວູ', 'ວອ',
    'ສາ', 'ສິ', 'ສີ', 'ສຸ', 'ສູ', 'ສອ',
    'ຫາ', 'ຫິ', 'ຫີ', 'ຫຸ', 'ຫູ', 'ຫອ',
    'ອາ', 'ອິ', 'ອີ', 'ອຸ', 'ອູ', 'ອອ',
    'ຮາ', 'ຮິ', 'ຮີ', 'ຮຸ', 'ຮູ', 'ຮອ'
  ];
  
  return commonCombinations;
}

// ฟังก์ชันสร้าง Dataset แบบครอบคลุม
export function generateComprehensiveDataset(): {
  singleSyllables: string[];
  twoSyllableWords: string[];
  phrases: string[];
  specialVariants: string[];
  statistics: {
    totalSyllables: number;
    totalWords: number;
    totalPhrases: number;
    totalVariants: number;
    grandTotal: number;
  };
} {
  const singleSyllables = generateSingleSyllables();
  const twoSyllableWords = generateTwoSyllableWords();
  const phrases = generatePhrases();
  
  // สร้างรูปแบบพิเศษ (variants)
  const specialVariants: string[] = [];
  Object.entries(specialConsonantVariants).forEach(([main, variants]) => {
    variants.forEach(variant => {
      vowels.forEach(vowel => {
        tones.forEach(tone => {
          const mainForm = applyVowelAndTone(main, vowel, tone);
          const variantForm = applyVowelAndTone(variant, vowel, tone);
          if (mainForm && variantForm) {
            specialVariants.push(mainForm);
            specialVariants.push(variantForm);
          }
        });
      });
    });
  });
  
  const statistics = {
    totalSyllables: singleSyllables.length,
    totalWords: twoSyllableWords.length,
    totalPhrases: phrases.length,
    totalVariants: specialVariants.length,
    grandTotal: singleSyllables.length + twoSyllableWords.length + phrases.length + specialVariants.length
  };
  
  return {
    singleSyllables,
    twoSyllableWords,
    phrases,
    specialVariants,
    statistics
  };
}

// ฟังก์ชันสร้าง Dataset แบบสุ่ม (สำหรับการทดสอบ)
export function generateRandomSample(count: number): string[] {
  const dataset = generateComprehensiveDataset();
  const allData = [
    ...dataset.singleSyllables,
    ...dataset.twoSyllableWords,
    ...dataset.phrases,
    ...dataset.specialVariants
  ];
  
  // สุ่มเลือก
  const shuffled = allData.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ฟังก์ชันกรองข้อมูลตามประเภท
export function filterDatasetByType(type: 'syllables' | 'words' | 'phrases' | 'variants' | 'all'): string[] {
  const dataset = generateComprehensiveDataset();
  
  switch (type) {
    case 'syllables':
      return dataset.singleSyllables;
    case 'words':
      return dataset.twoSyllableWords;
    case 'phrases':
      return dataset.phrases;
    case 'variants':
      return dataset.specialVariants;
    case 'all':
    default:
      return [
        ...dataset.singleSyllables,
        ...dataset.twoSyllableWords,
        ...dataset.phrases,
        ...dataset.specialVariants
      ];
  }
}