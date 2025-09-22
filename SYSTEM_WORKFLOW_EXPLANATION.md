# ระบบการทำงานและการบันทึกข้อมูล
# System Workflow and Data Storage Explanation

## 🔄 **ระบบการทำงาน (System Workflow)**

### **1. การเริ่มต้นระบบ (System Initialization)**
```
เริ่มต้น → โหลดข้อมูล → สร้าง Dataset → แสดงผล
```

#### ขั้นตอนการเริ่มต้น:
```typescript
// 1. เมื่อเปิดโปรแกรม App.tsx จะทำงาน
useEffect(() => {
  // โหลดข้อมูลจาก literatureVocabulary.ts
  const dataset = generateSystematicDataset();
  
  // สร้างข้อมูล 15,000 รายการ
  const allTexts = [
    ...dataset.singleSyllables,        // 5,180 รายการ
    ...dataset.twoSyllableWords,       // 1,000 รายการ
    ...dataset.threeSyllableWords,     // 600 รายการ
    ...dataset.fourSyllableWords,      // 400 รายการ
    ...specializedVocab.legal,         // 200 รายการ
    ...specializedVocab.science,       // 200 รายการ
    // ... รวม 15,000 รายการ
  ];
  
  setTexts(allTexts);
}, []);
```

### **2. การอัปโหลดฟอนต์ (Font Upload Process)**
```
เลือกไฟล์ → ตรวจสอบ → โหลดฟอนต์ → แสดงตัวอย่าง
```

#### ขั้นตอนการอัปโหลด:
```typescript
// ใน FontUpload.tsx
const handleFontUpload = async (file: File) => {
  // 1. ตรวจสอบไฟล์
  if (!file.name.match(/\.(ttf|otf|woff|woff2)$/)) {
    throw new Error('รองรับเฉพาะไฟล์ .ttf, .otf, .woff, .woff2');
  }
  
  // 2. อ่านไฟล์เป็น ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  
  // 3. สร้าง Font Face
  const fontFace = new FontFace(fontName, arrayBuffer);
  await fontFace.load();
  
  // 4. เพิ่มฟอนต์เข้าระบบ
  document.fonts.add(fontFace);
  
  // 5. บันทึกข้อมูลฟอนต์
  const fontInfo = {
    name: fontName,
    file: file,
    arrayBuffer: arrayBuffer,
    loaded: true
  };
  
  setCurrentFont(fontInfo);
};
```

### **3. การสร้างรูปภาพ (Image Generation Process)**
```
เลือกข้อความ → ตั้งค่า → สร้างรูปภาพ → บันทึกไฟล์
```

#### ขั้นตอนการสร้างรูปภาพ:
```typescript
// ใน imageGenerator.ts
export const generateTextImage = async (
  text: string,
  font: FontInfo,
  config: ImageConfig
) => {
  // 1. สร้าง Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 2. ตั้งค่า Canvas
  canvas.width = config.width;
  canvas.height = config.height;
  
  // 3. ตั้งค่าฟอนต์
  ctx.font = `${config.fontSize}px "${font.name}"`;
  ctx.fillStyle = config.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 4. วาดพื้นหลัง
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 5. วาดข้อความ
  ctx.fillStyle = config.textColor;
  ctx.fillText(text, canvas.width/2, canvas.height/2);
  
  // 6. แปลงเป็นรูปภาพ
  return canvas.toDataURL('image/png');
};
```

---

## 💾 **ระบบการบันทึกข้อมูล (Data Storage System)**

### **1. การจัดเก็บข้อมูลในหน่วยความจำ (Memory Storage)**

#### ข้อมูลหลัก (Main Data):
```typescript
// ใน App.tsx - State Management
const [fonts, setFonts] = useState<FontInfo[]>([]);           // ข้อมูลฟอนต์
const [currentFont, setCurrentFont] = useState<FontInfo>();   // ฟอนต์ปัจจุบัน
const [texts, setTexts] = useState<string[]>([]);            // ข้อความทั้งหมด
const [images, setImages] = useState<GeneratedImage[]>([]);   // รูปภาพที่สร้าง
const [progress, setProgress] = useState(0);                 // ความคืบหน้า
const [config, setConfig] = useState<ImageConfig>({          // การตั้งค่า
  fontSize: 24,
  width: 200,
  height: 60,
  backgroundColor: '#FFFFFF',
  textColor: '#000000'
});
```

#### โครงสร้างข้อมูล (Data Structure):
```typescript
// ข้อมูลฟอนต์
interface FontInfo {
  name: string;           // ชื่อฟอนต์
  file: File;            // ไฟล์ต้นฉบับ
  arrayBuffer: ArrayBuffer; // ข้อมูลฟอนต์
  loaded: boolean;       // สถานะการโหลด
  preview?: string;      // รูปตัวอย่าง
}

// ข้อมูลรูปภาพ
interface GeneratedImage {
  id: string;            // รหัสเฉพาะ
  text: string;          // ข้อความ
  dataUrl: string;       // ข้อมูลรูปภาพ (Base64)
  filename: string;      // ชื่อไฟล์
  font: string;          // ชื่อฟอนต์
  config: ImageConfig;   // การตั้งค่าที่ใช้
  timestamp: number;     // เวลาที่สร้าง
  category: string;      // หมวดหมู่
}

// การตั้งค่ารูปภาพ
interface ImageConfig {
  fontSize: number;      // ขนาดตัวอักษร
  width: number;         // ความกว้าง
  height: number;        // ความสูง
  backgroundColor: string; // สีพื้นหลัง
  textColor: string;     // สีตัวอักษร
  format: 'PNG' | 'JPG'; // รูปแบบไฟล์
}
```

### **2. การบันทึกลงไฟล์ (File Storage)**

#### การบันทึกรูปภาพ:
```typescript
// ใน realTimeExporter.ts
export class RealTimeExporter {
  private images: GeneratedImage[] = [];
  private labels: LabelData[] = [];
  
  // บันทึกรูปภาพทีละรูป
  async saveImage(image: GeneratedImage) {
    // 1. แปลง Base64 เป็น Blob
    const blob = this.dataURLToBlob(image.dataUrl);
    
    // 2. สร้างชื่อไฟล์
    const filename = `lao_${image.id.padStart(5, '0')}.png`;
    
    // 3. บันทึกไฟล์ (ใช้ FileSaver.js)
    saveAs(blob, filename);
    
    // 4. เพิ่มข้อมูล Label
    this.labels.push({
      filename: filename,
      text: image.text,
      category: image.category,
      length: image.text.length,
      syllables: this.estimateSyllables(image.text)
    });
  }
  
  // บันทึกทั้งหมดเป็น ZIP
  async exportAll() {
    const zip = new JSZip();
    
    // เพิ่มรูปภาพ
    this.images.forEach((image, index) => {
      const filename = `images/lao_${index.toString().padStart(5, '0')}.png`;
      zip.file(filename, image.dataUrl.split(',')[1], {base64: true});
    });
    
    // เพิ่มไฟล์ Labels
    zip.file('labels.json', JSON.stringify(this.labels, null, 2));
    
    // เพิ่มไฟล์สถิติ
    zip.file('statistics.json', JSON.stringify(this.getStatistics(), null, 2));
    
    // เพิ่มไฟล์คำแนะนำ
    zip.file('README.md', this.generateReadme());
    
    // ดาวน์โหลด ZIP
    const content = await zip.generateAsync({type: 'blob'});
    saveAs(content, 'lao_dataset_15k.zip');
  }
}
```

### **3. รูปแบบการจัดเก็บ (Storage Formats)**

#### โครงสร้างไฟล์ที่ส่งออก:
```
lao_dataset_15k.zip
├── images/                    # โฟลเดอร์รูปภาพ
│   ├── lao_00001.png         # รูปภาพที่ 1
│   ├── lao_00002.png         # รูปภาพที่ 2
│   ├── ...
│   └── lao_15000.png         # รูปภาพที่ 15,000
├── labels.json               # ข้อมูล Labels
├── statistics.json           # สถิติ Dataset
├── config.json              # การตั้งค่าที่ใช้
└── README.md                # คำแนะนำการใช้งาน
```

#### ไฟล์ labels.json:
```json
[
  {
    "filename": "lao_00001.png",
    "text": "ກະ",
    "category": "single_syllable",
    "length": 2,
    "syllables": 1,
    "consonants": ["ກ"],
    "vowels": ["ະ"],
    "tones": ["none"],
    "hasNumbers": false,
    "hasEnglish": false,
    "timestamp": 1695123456789
  },
  {
    "filename": "lao_00002.png",
    "text": "ກ່ະ",
    "category": "single_syllable",
    "length": 3,
    "syllables": 1,
    "consonants": ["ກ"],
    "vowels": ["ະ"],
    "tones": ["low"],
    "hasNumbers": false,
    "hasEnglish": false,
    "timestamp": 1695123456790
  }
]
```

#### ไฟล์ statistics.json:
```json
{
  "total_images": 15000,
  "categories": {
    "single_syllable": 5180,
    "two_syllable": 1000,
    "three_syllable": 600,
    "four_syllable": 400,
    "literature": 2500,
    "phrases": 2000,
    "modern": 1500,
    "specialized": 900,
    "international": 500,
    "special_variants": 420
  },
  "consonant_coverage": {
    "total": 37,
    "covered": 37,
    "percentage": 100
  },
  "vowel_coverage": {
    "total": 28,
    "covered": 28,
    "percentage": 100
  },
  "tone_coverage": {
    "total": 5,
    "covered": 5,
    "percentage": 100
  },
  "generation_info": {
    "font_used": "NotoSansLao-Regular",
    "font_size": 24,
    "image_size": "200x60",
    "format": "PNG",
    "created_at": "2024-09-22T10:30:00Z",
    "generation_time": "25 minutes"
  }
}
```

---

## 🔄 **ขั้นตอนการทำงานทั้งหมด (Complete Workflow)**

### **Phase 1: การเตรียมข้อมูล (Data Preparation)**
```
1. โหลดโปรแกรม
   ↓
2. สร้าง Dataset 15,000 รายการ
   ↓
3. แสดงสถิติและข้อมูล
```

### **Phase 2: การตั้งค่า (Configuration)**
```
1. อัปโหลดฟอนต์
   ↓
2. ตั้งค่าขนาดรูปภาพ
   ↓
3. เลือกประเภทข้อมูล
```

### **Phase 3: การสร้างรูปภาพ (Image Generation)**
```
1. เริ่มสร้างรูปภาพ
   ↓
2. สร้างทีละรูป (15,000 รูป)
   ↓
3. แสดงความคืบหน้า
   ↓
4. บันทึกข้อมูล Labels
```

### **Phase 4: การส่งออก (Export)**
```
1. รวบรวมรูปภาพทั้งหมด
   ↓
2. สร้างไฟล์ Labels และสถิติ
   ↓
3. บีบอัดเป็นไฟล์ ZIP
   ↓
4. ดาวน์โหลดไฟล์
```

---

## 💡 **จุดเด่นของระบบ (System Highlights)**

### **1. ประสิทธิภาพ (Performance)**
- ✅ สร้างรูปภาพแบบ Real-time
- ✅ แสดงความคืบหน้าแบบ Live
- ✅ ใช้ Web Workers สำหรับงานหนัก
- ✅ จัดการหน่วยความจำอย่างมีประสิทธิภาพ

### **2. ความน่าเชื่อถือ (Reliability)**
- ✅ ตรวจสอบข้อผิดพลาด
- ✅ สำรองข้อมูลอัตโนมัติ
- ✅ กู้คืนได้เมื่อเกิดปัญหา
- ✅ ตรวจสอบความถูกต้องของข้อมูล

### **3. ความยืดหยุ่น (Flexibility)**
- ✅ ปรับแต่งการตั้งค่าได้
- ✅ เลือกประเภทข้อมูลได้
- ✅ รองรับหลายฟอนต์
- ✅ ส่งออกได้หลายรูปแบบ

### **4. ความสะดวกใช้ (Usability)**
- ✅ Interface ใช้งานง่าย
- ✅ แสดงผลแบบ Real-time
- ✅ มีคำแนะนำครบถ้วน
- ✅ ตรวจสอบสถานะได้ตลอดเวลา

---

## 🔧 **การบำรุงรักษาและการพัฒนา (Maintenance & Development)**

### **การเพิ่มข้อมูลใหม่:**
```typescript
// เพิ่มคำศัพท์ใหม่ใน literatureVocabulary.ts
export const newVocabulary = [
  'คำใหม่ 1',
  'คำใหม่ 2',
  // ...
];

// อัปเดตใน comprehensiveVocabulary15K
export const comprehensiveVocabulary15K = [
  ...existingData,
  ...newVocabulary  // เพิ่มข้อมูลใหม่
];
```

### **การปรับแต่งการสร้างรูปภาพ:**
```typescript
// แก้ไขใน imageGenerator.ts
export const generateTextImage = async (text, font, config) => {
  // เพิ่มเอฟเฟกต์ใหม่
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 2;
  
  // เพิ่มการหมุนข้อความ
  ctx.rotate(config.rotation * Math.PI / 180);
  
  // วาดข้อความ
  ctx.fillText(text, x, y);
};
```

### **การเพิ่มฟีเจอร์ใหม่:**
```typescript
// เพิ่ม Component ใหม่
const AdvancedConfig = () => {
  return (
    <div>
      <input type="range" min="0" max="360" 
             onChange={(e) => setRotation(e.target.value)} />
      <label>การหมุน: {rotation}°</label>
    </div>
  );
};
```

**สรุป: ระบบนี้ทำงานแบบ End-to-End ตั้งแต่การสร้างข้อมูล การสร้างรูปภาพ ไปจนถึงการส่งออกไฟล์ พร้อมระบบจัดการข้อมูลที่มีประสิทธิภาพและใช้งานง่าย** 🚀