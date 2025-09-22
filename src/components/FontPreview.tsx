import React from 'react';

interface FontPreviewProps {
  fontFile: File | null;
  sampleText?: string;
  fontSize?: number;
  width?: number;
  height?: number;
}

const FontPreview: React.FC<FontPreviewProps> = ({
  fontFile,
  sampleText = 'ສະບາຍດີ ຂ້ອຍຊື່ວິໄລ ມາຈາກລາວ Hello World 123',
  fontSize = 24,
  width = 400,
  height = 150
}) => {

  if (!fontFile) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">อัปโหลด font เพื่อดู preview</p>
        <p className="text-sm text-gray-400 mt-2">Font preview will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Font Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">
          📝 Font Preview
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Font:</span> {fontFile.name}
          </div>
          <div>
            <span className="font-medium">Size:</span> {fontSize}px
          </div>
          <div>
            <span className="font-medium">Status:</span> 
            <span className="text-green-600 ml-1">✅ Ready</span>
          </div>
          <div>
            <span className="font-medium">Sample:</span> {sampleText.substring(0, 20)}...
          </div>
        </div>
      </div>

      {/* Simple Preview */}
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <p className="text-gray-600 text-sm mb-2">Font will be used in professional rendering during generation</p>
        <div className="bg-gray-100 p-4 rounded text-center">
          <p className="text-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
            {sampleText}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Preview with system font (actual rendering will use uploaded font)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FontPreview;