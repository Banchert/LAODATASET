import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface GenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  isComplete: boolean;
  error?: string;
  totalGenerated?: number;
  currentFontIndex?: number;
  skippedFonts?: string[];
  processedFonts?: string[];
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({
  isGenerating,
  progress,
  currentStep,
  isComplete,
  error,
  totalGenerated,
  currentFontIndex = 0,
  skippedFonts = [],
  processedFonts = []
}) => {
  if (!isGenerating && !isComplete && !error) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-2xl p-8 text-center border-2 border-indigo-100">
        <div className="space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl animate-float">
              <span className="text-3xl">🚀</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-sm">✨</span>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-indigo-800 lao-text">
              ພ້ອມສ້າງ Dataset ພາສາລ���ວ
            </h3>
            <p className="text-indigo-600 lao-text">
              ກະລຸນາເລືອກ Font Files ແລ້ວກົດ "ເລີ່ມສ້າງ Dataset"
            </p>
            <p className="text-sm text-indigo-500">
              Ready to generate professional Lao OCR dataset
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
              <div className="bg-white/70 p-3 rounded-xl border border-indigo-200">
                <div className="font-bold text-indigo-700">15,000</div>
                <div className="text-indigo-500 lao-text">ຮູບພາບ</div>
              </div>
              <div className="bg-white/70 p-3 rounded-xl border border-purple-200">
                <div className="font-bold text-purple-700">100%</div>
                <div className="text-purple-500 lao-text">ຄວາມຄົບຖ້ວນ</div>
              </div>
              <div className="bg-white/70 p-3 rounded-xl border border-blue-200">
                <div className="font-bold text-blue-700">Pro</div>
                <div className="text-blue-500 lao-text">ຄຸນນະພາບ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Status Message */}
      <div className={`relative overflow-hidden rounded-2xl p-6 border-2 ${
        error 
          ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200 text-red-700'
          : isComplete
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-green-700'
          : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 text-blue-700'
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${error ? 'ef4444' : isComplete ? '10b981' : '3b82f6'}' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
            error 
              ? 'bg-red-100 text-red-600'
              : isComplete
              ? 'bg-green-100 text-green-600'
              : 'bg-blue-100 text-blue-600'
          }`}>
            {error ? (
              <AlertCircle className="h-6 w-6" />
            ) : isComplete ? (
              <CheckCircle className="h-6 w-6" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin" />
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            {error ? (
              <div>
                <h3 className="text-lg font-bold lao-text">ເກີດຂໍ້ຜິດພາດ</h3>
                <p className="text-sm text-red-600">{error}</p>
                <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
                  <p className="text-xs text-red-700 lao-text">
                    ກະລຸນາລອງໃໝ່ ຫຼື ກວດສອບ Font Files
                  </p>
                </div>
              </div>
            ) : isComplete ? (
              <div>
                <h3 className="text-xl font-bold lao-text mb-2">
                  🎉 ສຳເລັດ! ສ້າງ Dataset ໄດ້ {totalGenerated} ຮູບພາບ
                </h3>
                <p className="text-green-600 font-medium">
                  Success! Generated {totalGenerated} images with professional quality
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white/70 p-3 rounded-xl border border-green-200">
                    <div className="text-sm font-bold text-green-700">✅ Complete</div>
                    <div className="text-xs text-green-600 lao-text">ສຳເລັດທັງໝົດ</div>
                  </div>
                  <div className="bg-white/70 p-3 rounded-xl border border-green-200">
                    <div className="text-sm font-bold text-green-700">📦 Ready</div>
                    <div className="text-xs text-green-600 lao-text">ພ້ອມດາວໂຫລດ</div>
                  </div>
                </div>
                {processedFonts && processedFonts.length > 0 && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 lao-text">
                      💾 ໄຟລ໌ Auto-save ມີຢູ່ໃນໂຟລເດີ Downloads
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold lao-text">ກຳລັງສ້າງ Dataset...</h3>
                <p className="text-blue-600 font-medium">{currentStep}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-white/70 p-3 rounded-xl border border-blue-200">
                    <div className="text-sm font-bold text-blue-700">{progress}%</div>
                    <div className="text-xs text-blue-600 lao-text">ຄວາມຄືບໜ້າ</div>
                  </div>
                  <div className="bg-white/70 p-3 rounded-xl border border-blue-200">
                    <div className="text-sm font-bold text-blue-700">{totalGenerated || 0}</div>
                    <div className="text-xs text-blue-600 lao-text">ຮູບພາບ</div>
                  </div>
                </div>
                {totalGenerated && totalGenerated > 0 && (
                  <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 lao-text">
                      💾 ກຳລັງ Auto-save ທຸກໆ 500 ຮູບພາບ
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      {(isGenerating || isComplete) && !error && (
        <div className="space-y-6">
          {/* Main Progress */}
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border-2 border-indigo-100 shadow-lg">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-indigo-800 lao-text">ຄວາມຄືບໜ້າການສ້າງ</h4>
                <span className="text-2xl font-bold text-indigo-600">{progress}%</span>
              </div>
              
              {/* Animated Progress Bar */}
              <div className="relative">
                <Progress value={progress} className="h-4 bg-indigo-100" />
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 progress-bar transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                  <div className="text-lg font-bold text-indigo-700">{totalGenerated || 0}</div>
                  <div className="text-xs text-indigo-600 lao-text">ຮູບພາບສ້າງແລ້ວ</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                  <div className="text-lg font-bold text-purple-700">{15000 - (totalGenerated || 0)}</div>
                  <div className="text-xs text-purple-600 lao-text">ຍັງເຫຼືອ</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <div className="text-lg font-bold text-blue-700">{processedFonts.length}</div>
                  <div className="text-xs text-blue-600 lao-text">ຟອນສຳເລັດ</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Font Processing Status */}
          {(isGenerating || isComplete) && (processedFonts.length > 0 || skippedFonts.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {processedFonts.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 lao-text">
                        ຟອນສຳເລັດ ({processedFonts.length})
                      </h4>
                      <p className="text-xs text-green-600">Successfully processed fonts</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {processedFonts.map((font, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700 font-medium truncate">{font}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {skippedFonts.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-2xl border-2 border-yellow-200 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-yellow-800 lao-text">
                        ຟອນທີ່ຂ້າມ ({skippedFonts.length})
                      </h4>
                      <p className="text-xs text-yellow-600">Fonts skipped (no Lao support)</p>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {skippedFonts.map((font, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white/70 rounded-lg border border-yellow-200">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-yellow-700 font-medium truncate">{font}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerationProgress;