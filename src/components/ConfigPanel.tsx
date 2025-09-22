import React from 'react';
import { Sliders, ImageIcon, Zap, FolderOpen } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface ConfigSettings {
  numSamples: number;
  imageWidth: number;
  imageHeight: number;
  addNoise: boolean;
  addBlur: boolean;
  addRotation: boolean;
  randomColors: boolean;
  projectName: string;
  // autoSave and autoDownload removed - Direct Export handles this
  styleVariations: boolean;
  outputPath: string;
  autoSaveInterval: number;
  enableRealTimeExport?: boolean;
  exportBatchSize?: number;
  enableSpecialEffects: boolean; // เพิ่มเอฟเฟกต์พิเศษ
}

interface ConfigPanelProps {
  settings: ConfigSettings;
  onSettingsChange: (settings: ConfigSettings) => void;
  totalFonts?: number; // เพิ่มจำนวนฟอนต์
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ settings, onSettingsChange, totalFonts = 1 }) => {
  const updateSetting = (key: keyof ConfigSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Sliders className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-blue-800 lao-text">ການຕັ້ງຄ່າການສ້າງ</h3>
          <p className="text-xs text-blue-600">Generation Settings</p>
        </div>
      </div>

      {/* Enhanced Dataset Size */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">#</span>
            </div>
            <Label htmlFor="numSamples" className="font-bold text-green-800 lao-text">
              ຈຳນວນຮູບພາບທີ່ຕ້ອງການ
            </Label>
          </div>
          <Input
            id="numSamples"
            type="number"
            min="10"
            max="100000"
            value={settings.numSamples}
            onChange={(e) => updateSetting('numSamples', parseInt(e.target.value) || 15000)}
            className="bg-white border-2 border-green-200 focus:border-green-400 text-lg font-bold text-center"
          />
          <div className="bg-white/70 p-3 rounded-lg border border-green-200">
            {/* คำนวณจำนวนรูปจริงตามเอฟเฟกต์ */}
            {(() => {
              const baseImages = settings.numSamples;
              const styleMultiplier = settings.styleVariations ? 8 : 1;
              const imagesPerFont = baseImages * styleMultiplier;
              const totalImagesAllFonts = imagesPerFont * totalFonts;
              
              return (
                <div className="space-y-2">
                  <p className="text-xs text-green-700 font-medium">
                    📊 Base texts: {baseImages.toLocaleString()} ข้อความ<br/>
                    {settings.styleVariations && (
                      <>🎨 Style variations: ×8 effects per text<br/>
                      <span className="font-bold text-green-800">🚀 Images per font: {imagesPerFont.toLocaleString()}</span><br/>
                      <span className="font-bold text-purple-800">🎯 Each font gets full dataset!</span><br/></>
                    )}
                    📁 Total fonts: {totalFonts}<br/>
                    <span className="font-bold text-blue-800">🎊 GRAND TOTAL: {totalImagesAllFonts.toLocaleString()} images</span><br/>
                    ⏱️ Estimated time per font: ~{Math.ceil(imagesPerFont / 200)} minutes<br/>
                    🎨 Professional Quality: GPU + Multi-Font Processing
                  </p>
                  
                  {settings.styleVariations && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded border border-purple-300">
                      <p className="text-xs text-purple-800 font-bold lao-text">
                        🎊 ເອຟເຟັກພິເສດເປີດໃຊ້ງານ - 8 Style Variations!
                      </p>
                      <p className="text-xs text-purple-700">
                        Special Effects Enabled: Clear, Blurred, Faded, Distorted, Incomplete, Shadow, Aged, Bold
                      </p>
                      <p className="text-xs text-purple-600 font-bold">
                        📈 Dataset ขยายเป็น {imagesPerFont.toLocaleString()} รูป ต่อ 1 ฟอนต์!
                      </p>
                    </div>
                  )}
                  
                  {settings.numSamples === 15000 && !settings.styleVariations && (
                    <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                      <p className="text-xs text-green-800 font-bold lao-text">
                        ✨ ຄ່າມາດຕະຖານ 15K Dataset - ຄຸນນະພາບສູງສຸດ!
                      </p>
                      <p className="text-xs text-green-700">
                        Standard 15K Dataset - Maximum Quality Coverage!
                      </p>
                    </div>
                  )}
                  
                  {settings.numSamples === 15000 && settings.styleVariations && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded border border-green-300">
                      <p className="text-xs text-green-800 font-bold lao-text">
                        🚀 ຄ່າມາດຕະຖານ 120K Dataset - ເອຟເຟັກພິເສດເຕັມຮູບແບບ!
                      </p>
                      <p className="text-xs text-green-700">
                        Premium 120K Dataset - Full Special Effects Coverage!
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Enhanced Image Dimensions */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-3 w-3 text-white" />
            </div>
            <h4 className="font-bold text-purple-800 lao-text">ຂະໜາດຮູບພາບ</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageWidth" className="text-sm font-medium text-purple-700 lao-text">
                ຄວາມກວ້າງ (px)
              </Label>
              <Input
                id="imageWidth"
                type="number"
                min="128"
                max="1024"
                value={settings.imageWidth}
                onChange={(e) => updateSetting('imageWidth', parseInt(e.target.value) || 256)}
                className="bg-white border-2 border-purple-200 focus:border-purple-400 text-center font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageHeight" className="text-sm font-medium text-purple-700 lao-text">
                ຄວາມສູງ (px)
              </Label>
              <Input
                id="imageHeight"
                type="number"
                min="32"
                max="256"
                value={settings.imageHeight}
                onChange={(e) => updateSetting('imageHeight', parseInt(e.target.value) || 64)}
                className="bg-white border-2 border-purple-200 focus:border-purple-400 text-center font-bold"
              />
            </div>
          </div>
          
          {/* Preview */}
          <div className="bg-white/70 p-3 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between text-xs text-purple-700">
              <span>📐 Size: {settings.imageWidth} × {settings.imageHeight}</span>
              <span>📏 Ratio: {(settings.imageWidth / settings.imageHeight).toFixed(1)}:1</span>
            </div>
            <div className="mt-2 flex justify-center">
              <div 
                className="bg-purple-100 border-2 border-purple-300 rounded"
                style={{
                  width: Math.min(settings.imageWidth / 4, 60),
                  height: Math.min(settings.imageHeight / 4, 15),
                  minWidth: '20px',
                  minHeight: '8px'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Project Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <Label className="font-semibold lao-text">ການຕັ້งຄ່າໂປຣເຈັກ:</Label>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="lao-text">
              ຊື່ໂປຣເຈັກ:
            </Label>
            <Input
              id="projectName"
              type="text"
              value={settings.projectName}
              onChange={(e) => updateSetting('projectName', e.target.value)}
              className="bg-background"
              placeholder="lao-ocr-project"
            />
            <p className="text-xs text-muted-foreground">
              Project name for file organization and auto-save
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outputPath" className="lao-text">
              ທີ່ຢູ່ບັນທຶກ (Output Path):
            </Label>
            <div className="flex gap-2">
              <Input
                id="outputPath"
                type="text"
                value="Use Direct Export System instead"
                disabled={true}
                className="bg-gray-100 text-gray-500 flex-1"
                placeholder="Use Direct Export System"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={true}
                className="px-3 opacity-50"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-green-700 space-y-1 bg-green-50 p-2 rounded border border-green-200">
              <p className="font-medium">📁 Use Direct Export System instead</p>
              <p className="lao-text">ໃຊ້ລະບົບ Direct Export ທີ່ໜ້າຊ້າຍ</p>
              <p className="text-green-600">
                ✨ No more path configuration needed!
              </p>
            </div>
          </div>

          {/* Auto Save & Download removed - Direct Export handles this */}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableSpecialEffects"
              checked={settings.enableSpecialEffects}
              onCheckedChange={(checked) => updateSetting('enableSpecialEffects', checked)}
            />
            <Label htmlFor="enableSpecialEffects" className="text-sm lao-text">
              🎊 ເອຟເຟັກພິເສດ (Special Effects)
            </Label>
          </div>

          {settings.autoSave && (
            <div className="space-y-2 ml-6">
              <Label htmlFor="autoSaveInterval" className="text-sm lao-text">
                ຊ່ວງເວລາບັນທຶກ (Save Interval):
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="autoSaveInterval"
                  type="number"
                  min="100"
                  max="2000"
                  step="100"
                  value={settings.autoSaveInterval}
                  onChange={(e) => updateSetting('autoSaveInterval', parseInt(e.target.value) || 500)}
                  className="bg-background w-20"
                />
                <span className="text-xs text-muted-foreground">images</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Auto-save every N generated images
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Effects */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <Label className="font-semibold lao-text">ເອຟເຟັກພິເສດ:</Label>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="styleVariations"
              checked={settings.styleVariations}
              onCheckedChange={(checked) => updateSetting('styleVariations', checked)}
            />
            <Label htmlFor="styleVariations" className="text-sm lao-text">
              ຮູບແບບຫລາກຫລາຍ
            </Label>
          </div>
          
          {settings.styleVariations && (
            <div className="col-span-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              <p className="lao-text">ຮູບແບບທີ່ຈະສ້າງ: ຊັດເຈນ, ມົວ, ຊີດ, ບິດເບື້ອນ, ບໍ່ສົມບູນ, ມີເງົາ, ເກົ່າ, ຫນາ</p>
              <p>Styles: Clear, Blurred, Faded, Distorted, Incomplete, Shadow, Aged, Bold</p>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="addNoise"
              checked={settings.addNoise}
              onCheckedChange={(checked) => updateSetting('addNoise', checked)}
            />
            <Label htmlFor="addNoise" className="text-sm lao-text">
              ເພີ່ມ Noise
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="addBlur"
              checked={settings.addBlur}
              onCheckedChange={(checked) => updateSetting('addBlur', checked)}
            />
            <Label htmlFor="addBlur" className="text-sm lao-text">
              ເພີ່ມ Blur
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="addRotation"
              checked={settings.addRotation}
              onCheckedChange={(checked) => updateSetting('addRotation', checked)}
            />
            <Label htmlFor="addRotation" className="text-sm lao-text">
              ໝຸນຮູບພາບ
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="randomColors"
              checked={settings.randomColors}
              onCheckedChange={(checked) => updateSetting('randomColors', checked)}
            />
            <Label htmlFor="randomColors" className="text-sm lao-text">
              ສີສຸ່ມ
            </Label>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-semibold mb-2">🎨 ຮູບແບບຫລາກຫລາຍ (8 Style Variations):</p>
          <div className="grid grid-cols-2 gap-1 mb-3">
            <div>• ຊັດເຈນ (Clear)</div>
            <div>• ມົວ (Blurred)</div>
            <div>• ຊີດ (Faded)</div>
            <div>• ບິດເບື້ອວ (Distorted)</div>
            <div>• ບໍ່ສົມບູນ (Incomplete)</div>
            <div>• ມີເງົາ (Shadow)</div>
            <div>• ເກົ່າ (Aged)</div>
            <div>• ໜາ (Bold)</div>
          </div>
          
          {settings.styleVariations && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded border border-purple-200">
              <p className="font-bold text-purple-800 text-center">
                📊 การคำนวณ: {settings.numSamples.toLocaleString()} × 8 = {(settings.numSamples * 8).toLocaleString()} รูป/ฟอนต์
              </p>
              <p className="text-purple-600 text-center text-xs mt-1">
                แต่ละข้อความจะถูกสร้างเป็น 8 รูปแบบที่แตกต่างกัน
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Export Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-primary" />
          <Label className="font-semibold lao-text">📤 Real-time Export:</Label>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableRealTimeExport"
              checked={settings.enableRealTimeExport || false}
              onCheckedChange={(checked) => updateSetting('enableRealTimeExport', checked)}
            />
            <Label htmlFor="enableRealTimeExport" className="text-sm lao-text">
              🚀 Export ทันทีที่สร้างเสร็จ
            </Label>
          </div>

          {settings.enableRealTimeExport && (
            <div className="space-y-3 pl-6 border-l-2 border-green-200">
              <div className="space-y-2">
                <Label htmlFor="exportBatchSize" className="text-sm lao-text">
                  📦 Export Batch Size:
                </Label>
                <Input
                  id="exportBatchSize"
                  type="number"
                  min="1"
                  max="100"
                  value={settings.exportBatchSize || 10}
                  onChange={(e) => updateSetting('exportBatchSize', parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  จำนวนรูปที่ export พร้อมกันในแต่ละ batch
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded p-3">
                <h4 className="text-sm font-medium text-green-800 mb-2">
                  ✨ Real-time Export Features:
                </h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• 🚀 Export ทันทีที่สร้างรูปเสร็จ</li>
                  <li>• 📁 จัดระเบียบไฟล์อัตโนมัติ</li>
                  <li>• 📊 แสดง progress แบบ real-time</li>
                  <li>• 💾 บันทึกตาม path ที่กำหนด</li>
                  <li>• 🎯 ไม่ต้องรอให้สร้างเสร็จทั้งหมด</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;