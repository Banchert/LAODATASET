import React from 'react';
import { Book, Users, MapPin, Hash } from 'lucide-react';
// Remove heavy import to improve initial load time
// Literature vocabulary will be loaded on demand

// ตัวอย่างการผสมคำจริงๆ ที่จะได้ใน Dataset
const realDatasetExamples = [
  {
    title: '🔤 ພະຍາງເດີ່ຍ (Single Syllables)',
    titleEn: 'Systematic Single Syllables',
    description: '37 ພະຍັນຊະນະ × 28 ສະຣະ × 5 ວັນນະຍຸດ = 5,180 ຮູບ',
    words: ['ກະ', 'ກາ', 'ກິ', 'ກີ', 'ກຸ', 'ກູ', 'ເກະ', 'ເກາ', 'ແກະ', 'ແກາ', 'ໂກະ', 'ໂກາ', 'ເກົາ', 'ກວະ', 'ກວາ', 'ກ່າ', 'ກ້າ', 'ກ໊າ', 'ກ໋າ', 'ຂະ', 'ຂາ', 'ຄະ', 'ຄາ', 'ງະ', 'ງາ', 'ຈະ', 'ຈາ', 'ສະ', 'ສາ', 'ຍະ', 'ຍາ', 'ດະ', 'ດາ', 'ຕະ', 'ຕາ', 'ຖະ', 'ຖາ', 'ທະ', 'ທາ', 'ນະ', 'ນາ', 'ບະ', 'ບາ', 'ປະ', 'ປາ', 'ຜະ', 'ຜາ', 'ຝະ', 'ຝາ', 'ພະ', 'ພາ', 'ຟະ', 'ຟາ', 'ມະ', 'ມາ', 'ຢະ', 'ຢາ', 'ຣະ', 'ຣາ', 'ລະ', 'ລາ', 'ວະ', 'ວາ', 'ຫະ', 'ຫາ', 'ອະ', 'ອາ', 'ຮະ', 'ຮາ']
  },
  {
    title: '🔗 ຄຳສອງພະຍາງ (Two Syllables)',
    titleEn: 'Systematic Two-Syllable Words',
    description: 'ການຜະສົມພະຍາງແບບເປັນລະບຽບ',
    words: ['ກະລາ', 'ກະສາ', 'ກະນາ', 'ກະມາ', 'ກະຍາ', 'ກະວາ', 'ກະຫາ', 'ກະອາ', 'ກະຮາ', 'ຂະລາ', 'ຂະສາ', 'ຄະລາ', 'ງະລາ', 'ຈະລາ', 'ສະລາ', 'ຍະລາ', 'ດະລາ', 'ຕະລາ', 'ຖະລາ', 'ທະລາ', 'ນະລາ', 'ບະລາ', 'ປະລາ', 'ຜະລາ', 'ຝະລາ', 'ພະລາ', 'ຟະລາ', 'ມະລາ', 'ຢະລາ', 'ຣະລາ', 'ລະກາ', 'ວະລາ', 'ຫະລາ', 'ອະລາ', 'ຮະລາ']
  },
  {
    title: '📚 ວັນນະກຳລາວ (Lao Literature)',
    titleEn: 'Traditional Literature Content',
    description: 'ເນື້ອຫາຈາກວັນນະກຳແລະນິທານລາວ',
    words: ['ນະໂມພຸທທາຍ', 'ທັມມາຍສັງຄາຍ', 'ເອວັມເມສຸຕັງ', 'ພະຄະວາສາວັຕຖິຍັງ', 'ວິຫະຣະຕິເຊຕະວະເນ', 'ອະນາຖະບິນດິກັສສະອາຣາເມ', 'ບົດກອນເທດ', 'ສຼອງເຮືອໄຟ', 'ສຼອງເຂົ້າແຈກ', 'ນິທານເທວະດາ', 'ເຣື້ອງເລົ່າບູຮານ', 'ປັນຍາຊົນລາວ', 'ຄຳສອນບູຮານ', 'ອຸທາຫອນລາວ', 'ແນວຄິດດັ້ງເດີມ']
  },
  {
    title: '💬 ປະໂຫຍກ (Sentences & Phrases)',
    titleEn: 'Real Sentences & Phrases',
    description: 'ປະໂຫຍກແລະວະລີທີ່ໃຊ້ໃນຊີວິດປະຈຳວັນ',
    words: ['ສະບາຍດີຕອນເຊົ້າ', 'ຂ້ອຍຮັກເຈົ້າຫຼາຍ', 'ເຈົ້າເປັນຄົນດີ', 'ລາວເປັນປະເທດສວຍງາມ', 'ອາຫານລາວແຊບຫຼາຍ', 'ຂ້ອຍຢາກໄປໂຮງຮຽນ', 'ພໍ່ແມ່ເຮັດວຽກຫນັກ', 'ເດັກນ້ອຍຫຼິ້ນຢູ່ສວນ', 'ວຽງຈັນເປັນນະຄອນຫຼວງ', 'ຂ້ອຍຮຽນພາສາລາວ', 'ແມ່ເຮັດອາຫານໃຫ້ກິນ', 'ພໍ່ໄປເຮັດວຽກ', 'ນ້ອງຮຽນຢູ່ໂຮງຮຽນ', 'ອ້າຍຫຼິ້ນບານເຕະ', 'ເອື້ອຍອ່ານຫນັງສື']
  },
  {
    title: '💻 ຄຳສັບທັນສະໄໝ (Modern Vocabulary)',
    titleEn: 'Modern & Technology Terms',
    description: 'ຄຳສັບເທັກໂນໂລຊີແລະສັງຄົມທັນສະໄໝ',
    words: ['ຄອມພິວເຕີ', 'ອິນເຕີເນັດ', 'ໂທລະສັບ', 'ສະມາດໂຟນ', 'ແອັບພລິເຄຊັນ', 'ເວັບໄຊ', 'ອີເມວ', 'ເຟສບຸກ', 'ຢູທູບ', 'ກູໂກລ', 'ໄລນ', 'ວັດສະອັບ', 'ຊອຟແວ', 'ຮາດແວ', 'ດາຕາເບດ', 'ເນັດເວີກ', 'ໄວຟາຍ', 'ບລູທູດ', 'ຈີພີເອສ', 'ເອທີເອັມ']
  },
  {
    title: '🎯 ຄຳສັບເຉພາະທາງ (Specialized Terms)',
    titleEn: 'Professional & Academic Terms',
    description: 'ຄຳສັບທາງວິຊາການແລະເຉພາະທາງ',
    words: ['ກົດໝາຍ', 'ລັດຖະທຳມະນູນ', 'ການເມືອງ', 'ເສດຖະກິດ', 'ສັງຄົມສາດ', 'ຈິດຕະວິທະຍາ', 'ຊີວະວິທະຍາ', 'ເຄມີສາດ', 'ຟີຊິກສາດ', 'ຄະນິດສາດ', 'ພູມິສາດ', 'ປະຫວັດສາດ', 'ວັນນະຄະດີ', 'ປັດຊະຍາ', 'ທັດສະນະວິທະຍາ', 'ມານຸດສາດ', 'ສິລະປະກຳ', 'ສະຖາປັດຕະຍະກຳ', 'ວິສະວະກຳ', 'ແພດສາດ']
  },
  {
    title: '🌍 ຄຳຍືມນານາຊາດ (International Loanwords)',
    titleEn: 'International & Borrowed Terms',
    description: 'ຄຳຍືມຈາກພາສາອື່ນທີ່ໃຊ້ໃນລາວ',
    words: ['ໂຮງແຮມ', 'ຮັດສະດາ', 'ມະຫາວິທະຍາໄລ', 'ໂຮງພະຍາບານ', 'ສະໜາມບິນ', 'ທະນາຄານ', 'ຮ້ານອາຫານ', 'ຊຸບເປີມາເກັດ', 'ເດປາດເມັນ', 'ອົບຟິດ', 'ບິວໂຣ', 'ເຊັນເຕີ', 'ສະເຕຊັນ', 'ເທີມິນານ', 'ແກລເລີຣີ', 'ມິວເຊຍມ', 'ຄາເຟ', 'ເຣດສະຕໍຣັງ', 'ບາ', 'ຄລັບ']
  },
  {
    title: '✨ ຮູບແບບພິເສດ (Special Variants)',
    titleEn: 'Special Character Variants',
    description: 'ຮູບແບບພິເສດ: ຫຼ = ຣ = ຫຣ',
    words: ['ຫຼາຍ', 'ຣາຍ', 'ຫຣາຍ', 'ຫຼັງ', 'ຣັງ', 'ຫຣັງ', 'ຫຼິ້ນ', 'ຣິ້ນ', 'ຫຣິ້ນ', 'ຫຼຸດ', 'ຣຸດ', 'ຫຣຸດ', 'ຫຼົບ', 'ຣົບ', 'ຫຣົບ', 'ຫຼຽວ', 'ຣຽວ', 'ຫຣຽວ', 'ຫຼື', 'ຣື', 'ຫຣື', 'ຫຼືອ', 'ຣືອ', 'ຫຣືອ', 'ຫຼຽນ', 'ຣຽນ', 'ຫຣຽນ', 'ຫຼຽງ', 'ຣຽງ', 'ຫຣຽງ']
  }
];

const vocabularyCategories = realDatasetExamples;

// Enhanced Lao vocabulary from literature and cultural texts
export const laoVocabulary = [
  // Basic vocabulary for fast initial load
  // Literature vocabulary will be loaded dynamically
  
  // Additional existing vocabulary
  'ສະບາຍດີ', 'ສະບາຍດີບໍ່', 'ຂອບໃຈ', 'ຂໍໂທດ', 'ລາກ່ອນ', 'ຍິນດີຕ້ອນຮັບ', 'ໂຊກດີ',
  'ສະບາຍດີຕອນເຊົ້າ', 'ສະບາຍດີຕອນແລງ', 'ສະບາຍດີຕອນບ່າຍ', 'ຂໍອະໄພ', 'ຂໍໂທດດ້ວຍ',
  'ພໍ່', 'ແມ່', 'ລູກ', 'ເດັກ', 'ຄອບຄົວ', 'ອ້າຍ', 'ເອື້ອຍ', 'ປູ່', 'ຍ່າ', 'ລຸງ', 'ປ້າ', 'ນ້ອງ',
  'ຜົວ', 'ເມຍ', 'ພີ່ນ້ອງ', 'ຍາດ', 'ຫລານ', 'ເຂີຍ', 'ລູກເຂີຍ', 'ລູກສະໄພ', 'ເພື່ອນ', 'ຄົນຮັກ',
  'ວຽງຈັນ', 'ລາວ', 'ເມືອງ', 'ບ້ານ', 'ໂຮງຮຽນ', 'ຕະຫຼາດ', 'ໂຮງໝໍ', 'ວັດ', 'ສະໜາມບິນ',
  'ທະນາຄານ', 'ຮ້ານອາຫານ', 'ສວນ', 'ປ່າ', 'ພູ', 'ແມ່ນ້ຳ', 'ທະເລສາບ', 'ຫາດຊາຍ', 'ເກາະ',
  'ແກງ', 'ເຂົ້າ', 'ປາ', 'ຫມູ', 'ໄກ່', 'ຜັກ', 'ໝາກໄມ້', 'ລາບ', 'ຕຳໝາກຫຸ່ງ', 'ເຂົ້າປຽກ',
  'ເຂົ້າຫນຽວ', 'ນ້ຳ', 'ແກງໜໍ່ໄມ້', 'ແກງສົ້ມ', 'ຊີ້ນ', 'ໄຂ່', 'ນົມ', 'ເບຍ', 'ກາເຟ', 'ຊາ',
  '໐', '໑', '໒', '໓', '໔', '໕', '໖', '໗', '໘', '໙', '໑໐', '໑໑', '໑໒', '໑໓', '໑໔', '໑໕',
  'ມື້ນີ້', 'ມື້ວານ', 'ມື້ອື່ນ', 'ເວລາ', 'ຊົ່ວໂມງ', 'ນາທີ', 'ອາທິດ', 'ເດືອນ', 'ປີ',
  'ແດງ', 'ຂຽວ', 'ຟ້າ', 'ເຫຼືອງ', 'ດຳ', 'ຂາວ', 'ບົວ', 'ສົ້ມ', 'ມ່ວງ', 'ນ້ຳຕານ', 'ເທົາ',
  'ໝາ', 'ແມວ', 'ຊ້າງ', 'ງົວ', 'ຄວາຍ', 'ໝູ', 'ແບ້', 'ນົກ', 'ປາ', 'ກົບ', 'ແມງໄມ້', 'ເສືອ',
  'ຄູ', 'ໝໍ', 'ຊາວນາ', 'ຊ່າງ', 'ຄ້າຂາຍ', 'ນັກຮຽນ', 'ນັກສຶກສາ', 'ຕຳຫຼວດ', 'ທະຫານ',
  'ຫົວ', 'ຕາ', 'ຫູ', 'ດັງ', 'ປາກ', 'ແຂນ', 'ຂາ', 'ມື', 'ຕີນ', 'ໜ້າ', 'ຄໍ', 'ໜ້າເອິກ',
  'ກິນ', 'ດື່ມ', 'ນອນ', 'ເຮັດວຽກ', 'ຮຽນ', 'ຫຼິ້ນ', 'ແລ່ນ', 'ຍ່າງ', 'ອ່ານ', 'ຂຽນ', 'ຟັງ',

  // Adjectives & Descriptions
  'ດີ', 'ງາມ', 'ໃຫຍ່', 'ນ້ອຍ', 'ສູງ', 'ຕໍ່າ', 'ໄວ', 'ຊ້າ', 'ໃໝ່', 'ເກົ່າ', 'ຮ້ອນ', 'ເຢັນ',
  'ແຊບ', 'ຂົມ', 'ຫວານ', 'ເຄັມ', 'ເຜັດ', 'ສົດ', 'ເໝັນ', 'ແຫ້ງ', 'ປຽກ', 'ສະອາດ', 'ເປື້ອນ',
  'ແຂງ', 'ອ່ອນ', 'ໜັກ', 'ເບົາ', 'ເຂັ້ມ', 'ອ່ອນ', 'ສະຫວ່າງ', 'ມືດ', 'ດັງ', 'ງຽບ',

  // === วลีสั้น (Short Phrases) ===
  'ຂ້ອຍຮັກເຈົ້າ', 'ເຈົ້າເປັນຄົນດີ', 'ລາວສວຍງາມ', 'ອາຫານແຊບ', 'ເວລາດີ', 'ໂຊກດີແດ່',
  'ຄອບຄົວອົບອຸ່ນ', 'ການສຶກສາສຳຄັນ', 'ຄົນລາວໃຈດີ', 'ປະເທດລາວ', 'ວັດທະນະທຳລາວ',
  'ຂ້ອຍຢາກໄປ', 'ເຈົ້າມາແຕ່ໃສ', 'ນີ້ແມ່ນຫຍັງ', 'ຢູ່ໃສ', 'ໄປໃສ', 'ເມື່ອໃດ', 'ຈັກໂມງ',
  'ເທົ່າໃດ', 'ຫຼາຍປານໃດ', 'ແປວໜຶ່ງ', 'ອີກຄັ້ງ', 'ບໍ່ເປັນຫຍັງ', 'ບໍ່ມີບັນຫາ',

  // === ประโยคยาว (Long Sentences) ===
  'ຂ້ອຍຢາກໄປໂຮງຮຽນ', 'ພໍ່ແມ່ເຮັດວຽກຫນັກ', 'ເດັກນ້ອຍຫຼິ້ນຢູ່ສວນ', 'ອາຫານລາວແຊບຫຼາຍ',
  'ວຽງຈັນເປັນນະຄອນຫຼວງ', 'ຂ້ອຍຮຽນພາສາລາວ', 'ແມ່ເຮັດອາຫານໃຫ້ກິນ', 'ພໍ່ໄປເຮັດວຽກ',
  'ນ້ອງຮຽນຢູ່ໂຮງຮຽນ', 'ອ້າຍຫຼິ້ນບານເຕະ', 'ເອື້ອຍອ່ານຫນັງສື', 'ປູ່ເລົ່ານິທານ',
  'ຂ້ອຍຢາກເປັນຄູ', 'ເຈົ້າຢາກເປັນຫຍັງ', 'ມື້ນີ້ອາກາດດີ', 'ຝົນຕົກຫຼາຍ',

  // === เนื้อหาแบบหนังสือ (Book-like Content) ===
  'ນິທານເລື່ອງໜຶ່ງ', 'ກາລະຄັ້ງໜຶ່ງ', 'ມີເດັກນ້ອຍຄົນໜຶ່ງ', 'ອາໄສຢູ່ບ້ານນ້ອຍ',
  'ໃນປ່າໃຫຍ່', 'ມີສັດນ້ອຍໃຫຍ່', 'ອາໄສຢູ່ຮ່ວມກັນ', 'ດ້ວຍຄວາມສຸກ',
  'ວັນໜຶ່ງ', 'ເດັກນ້ອຍໄດ້ພົບ', 'ກັບສັດນ້ອຍ', 'ທີ່ໜ້າຮັກ',
  'ເລື່ອງເລົ່າເລີ່ມຕົ້ນ', 'ໃນຍາມເຊົ້າ', 'ແສງແດດສ່ອງແສງ', 'ນົກຮ້ອງເພງ',
  'ລົມພັດເຊົາໆ', 'ໃບໄມ້ໄຫວ', 'ດອກໄມ້ບານ', 'ກິ່ນຫອມລອຍມາ',

  // === เนื้อหาการศึกษา (Educational Content) ===
  'ການສຶກສາມີຄຸນຄ່າ', 'ຄວາມຮູ້ເປັນແສງສະຫວ່າງ', 'ການອ່ານຫນັງສືດີ', 'ຄວາມຂຍັນເປັນກຸນແຈ',
  'ການເຮັດວຽກຮ່ວມກັນ', 'ຄວາມສາມັກຄີ', 'ການຊ່ວຍເຫຼືອກັນ', 'ຄວາມເມດຕາ',
  'ຄວາມຊື່ສັດ', 'ຄວາມກ້າຫານ', 'ຄວາມອົດທົນ', 'ຄວາມມີລະເບຽບ',
  'ການເຄົາລົບຜູ້ໃຫຍ່', 'ການຮັກສາສິ່ງແວດລ້ອມ', 'ການປົກປ້ອງທຳມະຊາດ',

  // === เนื้อหาวัฒนธรรม (Cultural Content) ===
  'ບຸນປີໃໝ່ລາວ', 'ບຸນທາດຫຼວງ', 'ບຸນບັງໄຟ', 'ບຸນຂ້າວປະດັບດິນ',
  'ເຄື່ອງດົນຕີລາວ', 'ແຂນລາວ', 'ລຳວົງ', 'ຊິນໄຊ', 'ຜ້າຊິນ', 'ຜ້າສະບົງ',
  'ສຸພາບ', 'ວັດທະນະທຳ', 'ປະເພນີ', 'ຮີດຄອງ', 'ພິທີກຳ', 'ງານບຸນ',
  'ການແຕ່ງງານ', 'ການສູ່ຂວັນ', 'ການບາດສີ', 'ການເຮັດບຸນ',

  // === ประโยคสนทนา (Conversational Sentences) ===
  'ເຈົ້າເປັນຄົນໃສ', 'ຂ້ອຍເປັນຄົນລາວ', 'ເຈົ້າມາຈາກໃສ', 'ຂ້ອຍມາຈາກວຽງຈັນ',
  'ເຈົ້າເຮັດວຽກຫຍັງ', 'ຂ້ອຍເປັນນັກຮຽນ', 'ເຈົ້າຢູ່ໃສ', 'ຂ້ອຍຢູ່ບ້ານ',
  'ເຈົ້າກິນຫຍັງແລ້ວ', 'ຂ້ອຍກິນເຂົ້າແລ້ວ', 'ເຈົ້າໄປໃສ', 'ຂ້ອຍໄປຕະຫຼາດ',
  'ເຈົ້າຊື້ຫຍັງ', 'ຂ້ອຍຊື້ເຂົ້າ', 'ເທົ່າໃດ', 'ສິບພັນກີບ',

  // === ประโยคบรรยาย (Descriptive Sentences) ===
  'ທ້ອງຟ້າສີຟ້າໃສ', 'ເມກຂາວລອຍຢູ່', 'ແສງແດດສ່ອງແສງ', 'ລົມພັດເຊົາໆ',
  'ດອກໄມ້ບານສະຫວຍ', 'ກິ່ນຫອມລອຍມາ', 'ນົກຮ້ອງເພງໄພເລາະ', 'ແມງໄມ້ບິນໄປມາ',
  'ນ້ຳໃສໄຫລຜ່ານ', 'ປາລອຍຢູ່ໃນນ້ຳ', 'ຕົ້ນໄມ້ເຕີບໃຫຍ່', 'ໃບໄມ້ເຂຍວຂຸ່ມ',

  // === ประโยคเล่าเรื่อง (Narrative Sentences) ===
  'ເມື່ອຫຼາຍປີກ່ອນ', 'ມີຊາວບ້ານຄົນໜຶ່ງ', 'ເຂົາອາໄສຢູ່ບ້ານນ້ອຍ', 'ທ່າມກາງປ່າໃຫຍ່',
  'ທຸກໆມື້', 'ເຂົາໄປເຮັດສວນ', 'ປູກຜັກປູກໝາກ', 'ເພື່ອລ້ຽງຄອບຄົວ',
  'ວັນໜຶ່ງ', 'ເຂົາພົບເຫັນ', 'ສິ່ງແປກປະຫຼາດ', 'ຢູ່ໃນປ່າ',
  'ມັນເປັນສັດນ້ອຍ', 'ທີ່ບາດເຈັບ', 'ເຂົາຈຶ່ງຊ່ວຍເຫຼືອ', 'ດ້ວຍຄວາມເມດຕາ'
];

interface VocabularyDisplayProps {
  customTexts?: string[];
}

const VocabularyDisplay: React.FC<VocabularyDisplayProps> = ({ customTexts = [] }) => {
  const totalTexts = laoVocabulary.length + customTexts.length;
  
  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold gradient-text lao-text">
          📚 ຄຳສັບພາສາລາວທີ່ໃຊ້ໃນ Dataset
        </h2>
        <p className="text-sm text-muted-foreground">
          Lao vocabulary for realistic book-style OCR dataset generation
        </p>
        <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
          <p className="lao-text">ຈຳລອງຫນັງສື: ຊັດເຈນ, ມົວ, ເກົ່າ, ມີເງົາ, ບິດເບື້ອນ, ຂະໜາດຕ່າງໆ, ສີຕ່າງໆ</p>
          <p>Simulates: Clear text, Blurred, Aged, Shadows, Distortions, Various sizes & colors</p>
        </div>
        
        {/* Built-in Vocabulary Summary */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{laoVocabulary.length}</div>
            <div className="text-sm font-medium text-green-600 lao-text">ຄຳສັບພື້ນຖານ</div>
            <div className="text-xs text-green-500">Built-in Vocabulary</div>
          </div>
        </div>
      </div>

      {/* Real Dataset Examples */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-indigo-800 lao-text mb-2">
            🎯 ຕົວຢ່າງການຜະສົມຄຳຈິງໆ ທີ່ຈະໄດ້ໃນ Dataset
          </h3>
          <p className="text-sm text-indigo-600">
            Real examples of word combinations you'll get in the dataset
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vocabularyCategories.map((category, index) => {
            const gradients = [
              'from-blue-50 to-indigo-50 border-blue-200',
              'from-purple-50 to-pink-50 border-purple-200', 
              'from-green-50 to-emerald-50 border-green-200',
              'from-orange-50 to-red-50 border-orange-200',
              'from-cyan-50 to-blue-50 border-cyan-200',
              'from-pink-50 to-rose-50 border-pink-200',
              'from-yellow-50 to-orange-50 border-yellow-200',
              'from-indigo-50 to-purple-50 border-indigo-200'
            ];
            const gradient = gradients[index % gradients.length];
            
            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-bold lao-text text-gray-800">{category.title}</h4>
                    <p className="text-sm font-medium text-gray-600">{category.titleEn}</p>
                    <p className="text-xs text-gray-500 bg-white/70 p-2 rounded-lg lao-text">
                      {category.description}
                    </p>
                  </div>

                  {/* Word Examples */}
                  <div className="bg-white/70 p-4 rounded-xl border border-white/50 max-h-40 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {category.words.slice(0, 30).map((word, wordIndex) => (
                        <span
                          key={wordIndex}
                          className="inline-block px-3 py-1 bg-white/90 text-sm rounded-lg border border-gray-200 lao-text font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
                        >
                          {word}
                        </span>
                      ))}
                      {category.words.length > 30 && (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-sm rounded-lg border border-gray-300 text-gray-600 font-medium">
                          +{category.words.length - 30} ອື່ນໆ...
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Count */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full border border-white/50">
                      <span className="text-sm font-bold text-gray-700">
                        {category.words.length} ຕົວຢ່າງ
                      </span>
                      <span className="text-xs text-gray-500">examples</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>Total vocabulary: {totalTexts} words and phrases</p>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-bold text-green-800 lao-text">
              🎯 ລະບົບສ້າງ Dataset 15,000 ຮູບ! ຄົບຖ້ວນແລະເປັນລະບຽບ
            </p>
            <p className="text-sm font-medium text-green-700">
              Complete 15K Dataset Generator! From 1 Font = 15,000 Professional Images
            </p>
            <div className="text-sm text-green-600 lao-text bg-white/70 p-2 rounded-lg">
              ✨ 37 ພະຍັນຊະນະ × 28 ສະຣະ × 5 ວັນນະຍຸດ + ຄຳສັບພິເສດ + ວັນນະກຳ + ປະໂຫຍກ
            </div>
          </div>
        </div>
        
        {/* Dataset Breakdown */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
          <h4 className="text-center font-bold text-blue-800 mb-3 lao-text">📊 ການແຈກແຈງ Dataset ແບບເປັນລະບຽບ</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="bg-white/70 p-3 rounded-lg border border-blue-200 text-center">
              <div className="font-bold text-blue-700 text-lg">5,180</div>
              <div className="text-blue-600 lao-text">🔤 ພະຍາງເດີ່ຍ</div>
              <div className="text-blue-500 text-xs">Single Syllables</div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-purple-200 text-center">
              <div className="font-bold text-purple-700 text-lg">2,000</div>
              <div className="text-purple-600 lao-text">🔗 ຫຼາຍພະຍາງ</div>
              <div className="text-purple-500 text-xs">Multi-Syllables</div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-green-200 text-center">
              <div className="font-bold text-green-700 text-lg">2,500</div>
              <div className="text-green-600 lao-text">📚 ວັນນະກຳ</div>
              <div className="text-green-500 text-xs">Literature</div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-orange-200 text-center">
              <div className="font-bold text-orange-700 text-lg">2,000</div>
              <div className="text-orange-600 lao-text">💬 ປະໂຫຍກ</div>
              <div className="text-orange-500 text-xs">Sentences</div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-cyan-200 text-center">
              <div className="font-bold text-cyan-700 text-lg">1,500</div>
              <div className="text-cyan-600 lao-text">💻 ທັນສະໄໝ</div>
              <div className="text-cyan-500 text-xs">Modern</div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-pink-200 text-center">
              <div className="font-bold text-pink-700 text-lg">900</div>
              <div className="text-pink-600 lao-text">🎯 ເຉພາະທາງ</div>
              <div className="text-pink-500 text-xs">Specialized</div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-yellow-200 text-center">
              <div className="font-bold text-yellow-700 text-lg">500</div>
              <div className="text-yellow-600 lao-text">🌍 ນານາຊາດ</div>
              <div className="text-yellow-500 text-xs">International</div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-red-200 text-center">
              <div className="font-bold text-red-700 text-lg">420</div>
              <div className="text-red-600 lao-text">✨ ພິເສດ</div>
              <div className="text-red-500 text-xs">Special</div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-lg border-2 border-green-300">
              <div className="text-xl font-bold text-green-800 lao-text">📊 ລວມທັງໝົດ: 15,000 ຮູບພາບ</div>
              <div className="text-sm text-green-700">Total: 15,000 Professional Quality Images</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="font-bold text-blue-700">{laoVocabulary.filter(word => word.length <= 20).length}</div>
            <div className="text-xs text-blue-600 lao-text">ສັ້ນ (≤20)</div>
          </div>
          <div className="text-center bg-purple-50 p-3 rounded-lg border border-purple-200">
            <div className="font-bold text-purple-700">{laoVocabulary.filter(word => word.length > 20 && word.length <= 50).length}</div>
            <div className="text-xs text-purple-600 lao-text">ກາງ (21-50)</div>
          </div>
          <div className="text-center bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="font-bold text-orange-700">{laoVocabulary.filter(word => word.length > 50).length}</div>
            <div className="text-xs text-orange-600 lao-text">ຍາວ (&gt;50)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyDisplay;