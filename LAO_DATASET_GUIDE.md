# คำแนะนำการใช้งานระบบสร้าง Dataset ภาษาลาวแบบเป็นระเบียบ
# Systematic Lao Dataset Generator - User Guide

## 🎯 ภาพรวม (Overview)

ระบบนี้สร้างขึ้นเพื่อสร้าง OCR Dataset ภาษาลาวที่ครอบคลุมและเป็นระเบียบ โดยใช้หลักการทางภาษาศาสตร์และการประสมคำในภาษาลาว

### สิ่งที่ได้รับ:
- **5,180 พยางค์เดี่ยว** - ครอบคลุมทุกการผสมที่เป็นไปได้
- **1,000+ คำหลายพยางค์** - 2, 3, 4+ พยางค์แบบเป็นระเบียบ
- **210+ รูปแบบพิเศษ** - ຫຼ = ຣ = ຫຣ และอื่นๆ
- **รวม 6,390+ รายการ** - พร้อมใช้งานทันที

## 📊 โครงสร้างข้อมูล (Data Structure)

### 1. พยัญชนะ (Consonants)
```
พยัญชนะเดี่ยว (27 ตัว): ກ ຂ ຄ ງ ຈ ຊ ຍ ດ ຕ ຖ ທ ນ ບ ປ ຜ ຝ ພ ຟ ມ ຢ ຣ ລ ວ ສ ຫ ອ ຮ
พยัญชนะคู่ (10 คู่): ຫງ ຫຍ ຫນ ຫມ ຫລ ຫວ ຫຣ ຫຼ ຫຢ ຫອ
รวม: 37 พยัญชนะ
```

### 2. สระ (Vowels)
```
สระเดี่ยว (10 รูป): ະ າ ິ ີ ຶ ື ຸ ູ ົ ອ
สระ เ- (8 รูป): ເະ ເາ ເິະ ເີາ ເຶອ ເືອ ເຸອ ເູອ
สระ แ- (2 รูป): ແະ ແາ
สระ ໂ- (2 รูป): ໂະ ໂາ
สระพิเศษ (6 รูป): ໄ ໃ ຳ ຽ ຽະ ຽາ
รวม: 28 สระ
```

### 3. วรรณยุกต์ (Tones)
```
1. ไม่มีเครื่องหมาย - เสียงสามัญ (Mid Tone)
2. ່ - ໄມ້ເອກ (Low Tone)
3. ້ - ໄມ້ໂທ (Falling Tone)
4. ໋ - ໄມ້ຕີ (High Tone)
5. ໌ - ໄມ້ຈັດຕະວາ (Rising Tone)
รวม: 5 วรรณยุกต์
```

## 🔢 การคำนวณ (Calculations)

### สูตรพื้นฐาน:
```
37 พยัญชนะ × 28 สระ × 5 วรรณยุกต์ = 5,180 พยางค์
```

### การแบ่งประเภท:
- **พยัญชนะเดี่ยว**: 27 × 28 × 5 = 3,780 พยางค์
- **พยัญชนะคู่**: 10 × 28 × 5 = 1,400 พยางค์
- **รวม**: 5,180 พยางค์

## 🔤 ตัวอย่างการเรียงลำดับ (Ordering Examples)

### พยัญชนะ ກ + สระทั้งหมด:
```
ກະ ກ່ະ ກ້ະ ກ໋ະ ກ໌ະ  (ກ + ະ + วรรณยุกต์ 5 เสียง)
ກາ ກ່າ ກ້າ ກ໋າ ກ໌າ  (ກ + າ + วรรณยุกต์ 5 เสียง)
ກິ ກິ່ ກິ້ ກິ໋ ກິ໌  (ກ + ິ + วรรณยุกต์ 5 เสียง)
ກີ ກີ່ ກີ້ ກີ໋ ກີ໌  (ກ + ີ + วรรณยุกต์ 5 เสียง)
... (ต่อไปเรื่อยๆ ครบ 28 สระ)
```

### พยัญชนะ ຂ + สระทั้งหมด:
```
ຂະ ຂ່ະ ຂ້ະ ຂ໋ະ ຂ໌ະ
ຂາ ຂ່າ ຂ້າ ຂ໋າ ຂ໌າ
ຂິ ຂິ່ ຂິ້ ຂິ໋ ຂິ໌
ຂີ ຂີ່ ຂີ້ ຂີ໋ ຂີ໌
... (ต่อไปเรื่อยๆ)
```

### พยัญชนະคู่ ຫງ + สระทั้งหมด:
```
ຫງະ ຫງ່ະ ຫງ້ະ ຫງ໋ະ ຫງ໌ະ
ຫງາ ຫງ່າ ຫງ້າ ຫງ໋າ ຫງ໌າ
ຫງິ ຫງິ່ ຫງິ້ ຫງິ໋ ຫງິ໌
ຫງີ ຫງີ່ ຫງີ້ ຫງີ໋ ຫງີ໌
... (ต่อไปเรื่อยๆ)
```

## 🔗 การประสมคำหลายพยางค์ (Multi-Syllable Combinations)

### คำสองพยางค์:
```
ກາ + ກາ = ກາກາ
ກາ + ຂາ = ກາຂາ
ກາ + ຄາ = ກາຄາ
ກາ + ງາ = ກາງາ
... (ประสมกันแบบเป็นระเบียบ)
```

### คำสามพยางค์:
```
ກາ + ລາ + ວາ = ກາລາວາ
ຂາວ + ງາມ + ໃສ = ຂາວງາມໃສ
ຄາວ + ດີ + ງາມ = ຄາວດີງາມ
... (ประสมกันแบบมีความหมาย)
```

### คำสี่พยางค์:
```
ກາ + ລາ + ວາ + ສາ = ກາລາວາສາ
ຂາວ + ງາມ + ໃສ + ແຈ້ງ = ຂາວງາມໃສແຈ້ງ
... (ประสมกันแบบซับซ้อน)
```

## ✨ รูปแบบพิเศษ (Special Variants)

### ຫຼ = ຣ = ຫຣ (เขียนได้ 3 แบบ ความหมายเดียวกัน):
```
ຫຼາ = ຣາ = ຫຣາ
ຫຼິ = ຣິ = ຫຣິ
ຫຼີ = ຣີ = ຫຣີ
ຫຼຸ = ຣຸ = ຫຣຸ
ຫຼູ = ຣູ = ຫຣູ
... (ทุกสระและวรรณยุกต์)
```

### ตัวอย่างคำที่ใช้จริง:
```
ຫຼາຍ = ຣາຍ = ຫຣາຍ (หลาย)
ຫຼັງ = ຣັງ = ຫຣັງ (หลัง)
ຫຼຸດ = ຣຸດ = ຫຣຸດ (หลุด)
ຫຼິ້ນ = ຣິ້ນ = ຫຣິ້ນ (เล่น)
```

## 🎯 วิธีการใช้งาน (How to Use)

### 1. การเรียกใช้ในโค้ด:
```typescript
import { 
  generateSystematicDataset,
  exportSystematicData 
} from './utils/systematicLaoGenerator';

// สร้าง Dataset แบบครบถ้วน
const dataset = generateSystematicDataset();

// ส่งออกข้อมูลในรูปแบบต่างๆ
const arrayData = exportSystematicData('array');
const groupedData = exportSystematicData('grouped');
const csvData = exportSystematicData('csv');
```

### 2. การเข้าถึงข้อมูลแยกประเภท:
```typescript
// พยางค์เดี่ยว
const singleSyllables = dataset.singleSyllables;

// คำหลายพยางค์
const twoSyllables = dataset.twoSyllableWords;
const threeSyllables = dataset.threeSyllableWords;
const fourSyllables = dataset.fourSyllableWords;

// รูปแบบพิเศษ
const specialVariants = dataset.specialVariants;

// ข้อมูลจัดกลุ่ม
const byConsonant = dataset.organizationData.byConsonant;
const byVowel = dataset.organizationData.byVowel;
const byTone = dataset.organizationData.byTone;
```

### 3. การดูสถิติ:
```typescript
console.log('สถิติ Dataset:', dataset.statistics);
/*
{
  consonants: 37,
  vowels: 28,
  tones: 5,
  totalSyllables: 5180,
  twoSyllableWords: 500,
  threeSyllableWords: 300,
  fourSyllableWords: 200,
  specialVariants: 210,
  grandTotal: 6390
}
*/
```

## 📋 การจัดระเบียบข้อมูล (Data Organization)

### 1. จัดกลุ่มตามพยัญชนะ:
```typescript
const kConsonants = organizationData.byConsonant['ກ'];
// ได้พยางค์ทั้งหมดที่ขึ้นต้นด้วย ກ
// ['ກະ', 'ກ່ະ', 'ກ້ະ', 'ກາ', 'ກ່າ', ...]
```

### 2. จัดกลุ่มตามสระ:
```typescript
const aVowels = organizationData.byVowel['າ'];
// ได้พยางค์ทั้งหมดที่ใช้สระ າ
// ['ກາ', 'ຂາ', 'ຄາ', 'ງາ', ...]
```

### 3. จัดกลุ่มตามวรรณยุกต์:
```typescript
const midTones = organizationData.byTone['ສຽງສາມັນ'];
// ได้พยางค์ทั้งหมดที่ใช้เสียงสามัญ (ไม่มีเครื่องหมาย)
// ['ກະ', 'ກາ', 'ກິ', 'ກີ', ...]
```

## 🔍 การกรองข้อมูล (Data Filtering)

### 1. กรองตามความยาว:
```typescript
// พยางค์สั้น (1-2 ตัวอักษร)
const shortSyllables = dataset.singleSyllables.filter(s => s.length <= 2);

// พยางค์ยาว (3+ ตัวอักษร)
const longSyllables = dataset.singleSyllables.filter(s => s.length >= 3);
```

### 2. กรองตามประเภทสระ:
```typescript
// พยางค์ที่ใช้สระเดี่ยว
const simpleSyllables = dataset.singleSyllables.filter(s => 
  /[ະາິີຶືຸູົອ]/.test(s)
);

// พยางค์ที่ใช้สระประสม
const complexSyllables = dataset.singleSyllables.filter(s => 
  /[ເແໂ]/.test(s)
);
```

### 3. กรองตามการใช้งานจริง:
```typescript
// คำที่มีแนวโน้มจะใช้งานจริง (ตัวอย่าง)
const practicalWords = dataset.twoSyllableWords.filter(word => {
  const commonPatterns = ['ກາ', 'ຂາວ', 'ດີ', 'ງາມ', 'ໃສ'];
  return commonPatterns.some(pattern => word.includes(pattern));
});
```

## 📊 การวิเคราะห์ข้อมูล (Data Analysis)

### 1. การกระจายตัวของพยัญชนะ:
```typescript
const consonantDistribution = {};
allConsonants.forEach(consonant => {
  consonantDistribution[consonant] = organizationData.byConsonant[consonant].length;
});
console.log('การกระจายตัวของพยัญชนะ:', consonantDistribution);
```

### 2. การกระจายตัวของสระ:
```typescript
const vowelDistribution = {};
allVowels.forEach(vowel => {
  vowelDistribution[vowel] = organizationData.byVowel[vowel].length;
});
console.log('การกระจายตัวของสระ:', vowelDistribution);
```

### 3. การกระจายตัวของวรรณยุกต์:
```typescript
const toneDistribution = {};
tones.forEach(tone => {
  toneDistribution[tone.name] = organizationData.byTone[tone.name].length;
});
console.log('การกระจายตัวของวรรณยุกต์:', toneDistribution);
```

## 🎨 การใช้งานใน OCR Training

### 1. การเตรียมข้อมูลสำหรับ Training:
```typescript
// เลือกข้อมูลแบบสมดุล
const trainingData = [
  ...dataset.singleSyllables.slice(0, 1000),      // 1000 พยางค์เดี่ยว
  ...dataset.twoSyllableWords.slice(0, 500),      // 500 คำสองพยางค์
  ...dataset.threeSyllableWords.slice(0, 300),    // 300 คำสามพยางค์
  ...dataset.fourSyllableWords.slice(0, 200),     // 200 คำสี่พยางค์
  ...dataset.specialVariants.slice(0, 100)        // 100 รูปแบบพิเศษ
];
```

### 2. การสร้างภาพสำหรับ Training:
```typescript
// สร้างภาพจากข้อความ
trainingData.forEach((text, index) => {
  generateTextImage(text, font, {
    fontSize: 24,
    width: 200,
    height: 60,
    filename: `lao_${index.toString().padStart(4, '0')}.png`
  });
});
```

### 3. การสร้าง Label File:
```typescript
// สร้างไฟล์ label สำหรับ OCR training
const labels = trainingData.map((text, index) => ({
  filename: `lao_${index.toString().padStart(4, '0')}.png`,
  text: text,
  syllables: text.split('').length, // ประมาณการจำนวนพยางค์
  type: text.length === 1 ? 'single' : 'multi'
}));

// บันทึกเป็น JSON
fs.writeFileSync('labels.json', JSON.stringify(labels, null, 2));
```

## 🚀 เทคนิคขั้นสูง (Advanced Techniques)

### 1. การสร้างข้อมูลแบบ Augmentation:
```typescript
// เพิ่มความหลากหลายด้วยการหมุน, ขยาย, บิดเบือน
const augmentedData = trainingData.flatMap(text => [
  text,                           // ต้นฉบับ
  text + ' ',                     // เพิ่มช่องว่าง
  ' ' + text,                     // เพิ่มช่องว่างหน้า
  ' ' + text + ' '                // เพิ่มช่องว่างทั้งสองข้าง
]);
```

### 2. การสร้างประโยคแบบสุ่ม:
```typescript
// สร้างประโยคจากพยางค์แบบสุ่ม
function generateRandomSentence(length: number): string {
  const syllables = dataset.singleSyllables.slice(0, 100); // ใช้ 100 พยางค์แรก
  const sentence = [];
  for (let i = 0; i < length; i++) {
    const randomSyllable = syllables[Math.floor(Math.random() * syllables.length)];
    sentence.push(randomSyllable);
  }
  return sentence.join('');
}

// สร้างประโยค 100 ประโยค ยาวประโยคละ 3-8 พยางค์
const randomSentences = Array.from({ length: 100 }, () => 
  generateRandomSentence(3 + Math.floor(Math.random() * 6))
);
```

### 3. การตรวจสอบคุณภาพข้อมูล:
```typescript
// ตรวจสอบว่าข้อมูลมีตัวอักษรลาวหรือไม่
function validateLaoText(text: string): boolean {
  const laoRegex = /^[\u0E80-\u0EFF\s]*$/;
  return laoRegex.test(text) && /[\u0E80-\u0EFF]/.test(text);
}

// กรองข้อมูลที่ผ่านการตรวจสอบ
const validatedData = trainingData.filter(validateLaoText);
console.log(`ข้อมูลที่ถูกต้อง: ${validatedData.length}/${trainingData.length}`);
```

## 📈 การติดตามประสิทธิภาพ (Performance Monitoring)

### 1. การวัดความครอบคลุม:
```typescript
// ตรวจสอบว่าครอบคลุมพยัญชนะครบหรือไม่
const usedConsonants = new Set();
dataset.singleSyllables.forEach(syllable => {
  allConsonants.forEach(consonant => {
    if (syllable.startsWith(consonant)) {
      usedConsonants.add(consonant);
    }
  });
});

const coverage = (usedConsonants.size / allConsonants.length) * 100;
console.log(`ความครอบคลุมพยัญชนะ: ${coverage.toFixed(2)}%`);
```

### 2. การวัดความสมดุล:
```typescript
// ตรวจสอบการกระจายตัวของข้อมูล
const lengthDistribution = {};
trainingData.forEach(text => {
  const length = text.length;
  lengthDistribution[length] = (lengthDistribution[length] || 0) + 1;
});

console.log('การกระจายตัวตามความยาว:', lengthDistribution);
```

## 🎯 สรุป (Summary)

ระบบนี้ให้ความสามารถในการ:

1. **สร้างข้อมูลครบถ้วน** - ครอบคลุมทุกพยัญชนะ สระ วรรณยุกต์
2. **จัดระเบียบอย่างเป็นระบบ** - เรียงลำดับตามหลักภาษาศาสตร์
3. **ปรับแต่งได้ตามต้องการ** - เลือกข้อมูลตามประเภทและจำนวน
4. **ตรวจสอบคุณภาพได้** - มีระบบ validation และ monitoring
5. **ใช้งานง่าย** - API ที่เข้าใจง่ายและมีเอกสารครบถ้วน

เหมาะสำหรับการสร้าง OCR Dataset คุณภาพสูงที่สามารถจดจำตัวอักษรลาวได้อย่างแม่นยำในทุกบริบท!

---

**หมายเหตุ**: ระบบนี้ยังสามารถขยายเพิ่มเติมได้ เช่น การรองรับภาษาถิ่น การเพิ่มคำศัพท์เฉพาะทาง หรือการปรับปรุงอัลกอริทึมการประสมคำ