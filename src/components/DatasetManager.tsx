import React, { useState, useEffect } from 'react';
import { DatasetManager, DatasetConfig, FontAnalysis } from '../utils/datasetManager';
import { GeneratedImage } from './PreviewGrid';

interface DatasetManagerProps {
  fonts: File[];
  images: GeneratedImage[];
  onFontsFiltered: (laoFonts: File[], skippedFonts: File[]) => void;
  onDatasetSaved: () => void;
}

const DatasetManagerComponent: React.FC<DatasetManagerProps> = ({
  fonts,
  images,
  onFontsFiltered,
  onDatasetSaved
}) => {
  const [config, setConfig] = useState<DatasetConfig>({
    outputPath: 'C:/OCR_Dataset',
    projectName: 'Lao_OCR_Dataset',
    imageFormat: 'png',
    includeMetadata: true,
    organizationMode: 'by_font',
    autoSkipNonLao: true,
    batchSize: 100
  });

  const [datasetManager, setDatasetManager] = useState<DatasetManager | null>(null);
  const [fontAnalyses, setFontAnalyses] = useState<FontAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [filteredFonts, setFilteredFonts] = useState<{
    laoFonts: File[];
    skippedFonts: File[];
  }>({ laoFonts: [], skippedFonts: [] });

  // สร้าง DatasetManager เมื่อ config เปลี่ยน
  useEffect(() => {
    const manager = new DatasetManager(config);
    setDatasetManager(manager);
  }, [config]);

  // วิเคราะห์ fonts เมื่อมีการอัปโหลด
  const analyzeFonts = async () => {
    if (!datasetManager || fonts.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    try {
      console.log(`🔍 Starting font analysis for ${fonts.length} fonts...`);
      
      const result = await datasetManager.filterLaoFonts(fonts);
      
      setFontAnalyses(result.analyses);
      setFilteredFonts({
        laoFonts: result.laoFonts,
        skippedFonts: result.skippedFonts
      });
      
      onFontsFiltered(result.laoFonts, result.skippedFonts);
      setAnalysisComplete(true);
      
      console.log(`✅ Font analysis complete: ${result.laoFonts.length} accepted, ${result.skippedFonts.length} skipped`);
      
    } catch (error) {
      console.error('❌ Font analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // บันทึก Dataset
  const saveDataset = async () => {
    if (!datasetManager || images.length === 0) return;

    setSaving(true);

    try {
      console.log(`💾 Starting dataset save with ${images.length} images...`);
      
      await datasetManager.saveDataset(images);
      
      onDatasetSaved();
      
      console.log('✅ Dataset saved successfully!');
      
    } catch (error) {
      console.error('❌ Dataset save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  // อัปเดต config
  const updateConfig = (key: keyof DatasetConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setAnalysisComplete(false); // Reset analysis when config changes
  };

  return (
    <div className="space-y-6">
      {/* Dataset Configuration */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          🗂️ Dataset Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Output Path */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📁 Output Path
            </label>
            <input
              type="text"
              value={config.outputPath}
              onChange={(e) => updateConfig('outputPath', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="C:/OCR_Dataset"
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Project Name
            </label>
            <input
              type="text"
              value={config.projectName}
              onChange={(e) => updateConfig('projectName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Lao_OCR_Dataset"
            />
          </div>

          {/* Image Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🖼️ Image Format
            </label>
            <select
              value={config.imageFormat}
              onChange={(e) => updateConfig('imageFormat', e.target.value as 'png' | 'jpg')}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="png">PNG (Lossless)</option>
              <option value="jpg">JPG (Smaller size)</option>
            </select>
          </div>

          {/* Organization Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📂 Organization Mode
            </label>
            <select
              value={config.organizationMode}
              onChange={(e) => updateConfig('organizationMode', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="by_font">By Font (fonts/font_name/images)</option>
              <option value="by_text_type">By Text Type (text_types/type/images)</option>
              <option value="flat">Flat (all images in one folder)</option>
            </select>
          </div>

          {/* Batch Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📦 Batch Size
            </label>
            <input
              type="number"
              value={config.batchSize}
              onChange={(e) => updateConfig('batchSize', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              min="10"
              max="1000"
            />
          </div>

          {/* Auto Skip Non-Lao */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSkipNonLao"
              checked={config.autoSkipNonLao}
              onChange={(e) => updateConfig('autoSkipNonLao', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="autoSkipNonLao" className="text-sm text-gray-700">
              ⏭️ Auto-skip non-Lao fonts
            </label>
          </div>
        </div>
      </div>

      {/* Font Analysis */}
      {fonts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              🔍 Font Analysis ({fonts.length} fonts)
            </h3>
            <button
              onClick={analyzeFonts}
              disabled={isAnalyzing}
              className={`px-4 py-2 rounded text-white font-medium ${
                isAnalyzing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isAnalyzing ? '🔍 Analyzing...' : '🔍 Analyze Fonts'}
            </button>
          </div>

          {isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700">Analyzing font compatibility with Lao characters...</span>
              </div>
            </div>
          )}

          {analysisComplete && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{filteredFonts.laoFonts.length}</div>
                  <div className="text-sm text-green-700">✅ Lao Compatible</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">{filteredFonts.skippedFonts.length}</div>
                  <div className="text-sm text-red-700">⏭️ Skipped</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{fonts.length}</div>
                  <div className="text-sm text-blue-700">📁 Total</div>
                </div>
              </div>

              {/* Font List */}
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {fontAnalyses.map((analysis, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        analysis.recommendation === 'use'
                          ? 'bg-green-50 border-green-200'
                          : analysis.recommendation === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{analysis.fontName}</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            analysis.recommendation === 'use'
                              ? 'bg-green-100 text-green-700'
                              : analysis.recommendation === 'warning'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {analysis.recommendation === 'use' ? '✅ Use' : 
                             analysis.recommendation === 'warning' ? '⚠️ Warning' : '⏭️ Skip'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {analysis.compatibilityScore.toFixed(1)}% compatible
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Supported: {analysis.supportedCharacters.length} chars, 
                        Unsupported: {analysis.unsupportedCharacters.length} chars
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dataset Save */}
      {images.length > 0 && analysisComplete && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            💾 Save Dataset ({images.length} images)
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h4 className="font-medium text-blue-800 mb-2">Dataset Structure Preview:</h4>
            <div className="text-sm text-blue-700 font-mono">
              {config.outputPath}/{config.projectName}/
              <br />
              ├── {new Date().toISOString().split('T')[0]}/
              <br />
              {config.organizationMode === 'by_font' && '├── fonts/font_name/images/'}
              {config.organizationMode === 'by_text_type' && '├── text_types/type/images/'}
              {config.organizationMode === 'flat' && '├── images/'}
              <br />
              ├── {config.projectName}_metadata.json
              <br />
              └── {config.projectName}_annotations.json
            </div>
          </div>

          <button
            onClick={saveDataset}
            disabled={isSaving}
            className={`w-full py-3 rounded text-white font-medium ${
              isSaving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSaving ? '💾 Saving Dataset...' : '💾 Save Dataset to Path'}
          </button>

          {isSaving && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-green-700">Saving dataset to {config.outputPath}...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatasetManagerComponent;