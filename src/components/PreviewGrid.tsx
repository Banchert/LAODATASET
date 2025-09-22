import React from 'react';
import { ImageIcon } from 'lucide-react';

export interface GeneratedImage {
  dataUrl: string;
  text: string;
  font: string;
  style?: string;
  fileName?: string; // ชื่อไฟล์ที่กำหนดเอง
  effectType?: string; // ประเภท effect (clear, blurred, etc.)
  fontName?: string; // ชื่อฟอนต์ที่สะอาด
}

interface PreviewGridProps {
  images: GeneratedImage[];
  isVisible: boolean;
}

const PreviewGrid: React.FC<PreviewGridProps> = ({ images, isVisible }) => {
  if (!isVisible || images.length === 0) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-2xl p-8 text-center border-2 border-indigo-200">
        <div className="space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-lg">
              <ImageIcon className="h-10 w-10 text-indigo-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-sm">⏳</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-indigo-800 lao-text">ລໍຖ້າຮູບພາບ...</h3>
            <p className="text-indigo-600">กำลังรอการสร้างรูปภาพ Dataset</p>
            <p className="text-sm text-indigo-500">Waiting for image generation to start</p>
            
            <div className="bg-white/70 p-4 rounded-xl border border-indigo-200 mt-4">
              <div className="text-sm text-indigo-700 space-y-3">
                <p className="font-medium lao-text">🎯 ຈະໄດ້ຮັບ:</p>
                
                {/* Enhanced 15K Dataset Highlight */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg border-2 border-green-300">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">120,000</div>
                    <div className="text-sm font-medium text-green-700 lao-text">ຮູບພາບຄຸນນະພາບສູງ</div>
                    <div className="text-xs text-green-600">Professional Quality Images</div>
                    <div className="text-xs text-green-500 mt-1">15K × 8 Style Variations</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>✅ รูปภาพคุณภาพสูง</div>
                  <div>🎨 Professional rendering</div>
                  <div>📊 ครอบคลุม 100%</div>
                  <div>🚀 พร้อมใช้งาน OCR</div>
                  <div>🎊 เอฟเฟกต์พิเศษ</div>
                  <div>🚀 ดาวน์โหลดอัตโนมัติ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const stats = images.reduce((acc, img) => {
    if (img.font.includes('PROFESSIONAL')) acc.professional++;
    else if (img.font.includes('FORCED')) acc.forced++;
    else if (img.font.includes('Custom')) acc.custom++;
    else acc.system++;
    return acc;
  }, { professional: 0, forced: 0, custom: 0, system: 0 });

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Live Statistics */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-indigo-100 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-indigo-800 lao-text">ຕົວຢ່າງຮູບພາບທີ່ສ້າງ</h3>
              <p className="text-indigo-600 font-medium">Live preview of generated dataset images</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg">
              <div className="text-3xl font-bold">{images.length.toLocaleString()}</div>
              <div className="text-sm lao-text">ຮູບພາບແສດງ</div>
              <div className="text-xs opacity-90">of 120,000 total</div>
            </div>
            <div className="mt-2 text-xs text-indigo-600">
              🎊 {Math.round((images.length / 120000) * 100)}% ສຳເລັດ
            </div>
          </div>
        </div>
        
        {/* Enhanced Quality Statistics */}
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="font-bold text-indigo-800 lao-text mb-2">📊 ສະຖິຕິຄຸນນະພາບ (Quality Statistics)</h4>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border-2 border-indigo-200 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-2xl font-bold text-indigo-600 mb-1">{stats.professional}</div>
              <div className="text-sm font-medium text-indigo-700 lao-text">🎨 Professional</div>
              <div className="text-xs text-indigo-500">High-DPI + Antialiasing</div>
              <div className="text-xs text-indigo-400 mt-1">
                {images.length > 0 ? Math.round((stats.professional / images.length) * 100) : 0}%
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.forced}</div>
              <div className="text-sm font-medium text-purple-700 lao-text">🎯 Forced</div>
              <div className="text-xs text-purple-500">Forced Custom Font</div>
              <div className="text-xs text-purple-400 mt-1">
                {images.length > 0 ? Math.round((stats.forced / images.length) * 100) : 0}%
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.custom}</div>
              <div className="text-sm font-medium text-green-700 lao-text">✅ Custom</div>
              <div className="text-xs text-green-500">Standard Custom</div>
              <div className="text-xs text-green-400 mt-1">
                {images.length > 0 ? Math.round((stats.custom / images.length) * 100) : 0}%
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200 text-center hover:shadow-lg transition-all duration-300">
              <div className="text-2xl font-bold text-orange-600 mb-1">{stats.system}</div>
              <div className="text-sm font-medium text-orange-700 lao-text">🔧 System</div>
              <div className="text-xs text-orange-500">System Fallback</div>
              <div className="text-xs text-orange-400 mt-1">
                {images.length > 0 ? Math.round((stats.system / images.length) * 100) : 0}%
              </div>
            </div>
          </div>
          
          {/* Quality Summary */}
          <div className="bg-white/70 p-4 rounded-xl border border-indigo-200">
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-800 lao-text">
                🎯 ຄຸນນະພາບລວມ: {images.length > 0 ? Math.round(((stats.professional + stats.forced) / images.length) * 100) : 0}% Professional
              </div>
              <div className="text-sm text-indigo-600 mt-1">
                Overall Quality: Professional + Forced rendering = High-quality OCR dataset
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {images.slice(0, 24).map((image, index) => (
          <div
            key={index}
            className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center hover-lift border-2 border-gray-100 hover:border-indigo-300 transition-all duration-300"
          >
            {/* Quality Badge */}
            <div className="absolute -top-2 -right-2 z-10">
              {image.font.includes('PROFESSIONAL') ? (
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">🎨</span>
                </div>
              ) : image.font.includes('FORCED') ? (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">🎯</span>
                </div>
              ) : image.font.includes('Custom') ? (
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">✅</span>
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">🔧</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 p-2 border border-gray-200 group-hover:shadow-lg transition-all duration-300">
                <img
                  src={image.dataUrl}
                  alt={image.text}
                  className="w-full h-14 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              {/* Text Content */}
              <div className="space-y-2">
                <p className="text-sm font-bold lao-text truncate bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" title={image.text}>
                  {image.text}
                </p>
                
                {/* Quality Indicator */}
                <div className="text-xs">
                  {image.font.includes('PROFESSIONAL') ? (
                    <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      PROFESSIONAL
                    </span>
                  ) : image.font.includes('FORCED') ? (
                    <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      FORCED
                    </span>
                  ) : image.font.includes('Custom') ? (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                      CUSTOM
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      SYSTEM
                    </span>
                  )}
                </div>
                
                {/* Text Analysis Tags */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {/[\u0E80-\u0EFF]/.test(image.text) && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">ລາວ</span>
                  )}
                  {/[a-zA-Z]/.test(image.text) && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">EN</span>
                  )}
                  {/[0-9]/.test(image.text) && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">123</span>
                  )}
                </div>
                
                {/* Font Name (Hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded truncate" title={image.font}>
                    {image.font.split(' ')[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length > 20 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Showing 20 of {images.length} generated images
          </p>
        </div>
      )}
    </div>
  );
};

export default PreviewGrid;