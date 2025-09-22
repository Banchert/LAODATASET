import React, { useState, useEffect } from 'react';
import { ExportProgress } from '../utils/realTimeExporter';

interface RealTimeExportProgressProps {
  progress: ExportProgress;
  isVisible: boolean;
}

const RealTimeExportProgress: React.FC<RealTimeExportProgressProps> = ({
  progress,
  isVisible
}) => {
  const [lastExportedFiles, setLastExportedFiles] = useState<string[]>([]);

  // เก็บประวัติไฟล์ที่ export ล่าสุด
  useEffect(() => {
    if (progress.lastExportedFile) {
      setLastExportedFiles(prev => {
        const newFiles = [progress.lastExportedFile, ...prev.slice(0, 4)]; // เก็บ 5 ไฟล์ล่าสุด
        return newFiles;
      });
    }
  }, [progress.lastExportedFile]);

  if (!isVisible) {
    return null;
  }

  const exportPercentage = progress.totalImages > 0 
    ? Math.round((progress.exportedImages / progress.totalImages) * 100) 
    : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📤 Real-time Export Progress
        </h3>
        <div className="flex items-center gap-2">
          {progress.isExporting && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          )}
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            progress.isExporting 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {progress.isExporting ? '🚀 Exporting...' : '✅ Ready'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Export Progress</span>
          <span>{progress.exportedImages} / {progress.totalImages} images</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${exportPercentage}%` }}
          ></div>
        </div>
        <div className="text-center text-sm text-gray-600 mt-1">
          {exportPercentage}% Complete
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
          <div className="text-lg font-bold text-blue-600">{progress.exportedImages}</div>
          <div className="text-xs text-blue-700">Exported</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded p-3 text-center">
          <div className="text-lg font-bold text-orange-600">{progress.totalImages - progress.exportedImages}</div>
          <div className="text-xs text-orange-700">Remaining</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded p-3 text-center">
          <div className="text-lg font-bold text-purple-600">{progress.currentBatch}</div>
          <div className="text-xs text-purple-700">Current Batch</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
          <div className="text-lg font-bold text-gray-600">{progress.totalBatches}</div>
          <div className="text-xs text-gray-700">Total Batches</div>
        </div>
      </div>

      {/* Current Font */}
      {progress.currentFont && (
        <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-green-700 font-medium">🎨 Current Font:</span>
            <span className="text-green-600 font-mono">{progress.currentFont}</span>
          </div>
        </div>
      )}

      {/* Recently Exported Files */}
      {lastExportedFiles.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            📁 Recently Exported Files:
          </h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {lastExportedFiles.map((file, index) => (
              <div 
                key={index} 
                className={`text-xs font-mono p-2 rounded ${
                  index === 0 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-white text-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  {index === 0 && <span className="text-green-500">✨</span>}
                  <span className="truncate">{file.split('/').pop()}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {file.split('/').slice(0, -1).join('/')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Speed Info */}
      {progress.isExporting && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center gap-2 text-blue-700">
            <span className="animate-pulse">⚡</span>
            <span className="text-sm">
              Exporting files in real-time as they are generated...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeExportProgress;