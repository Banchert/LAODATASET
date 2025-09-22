import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { isGPUAvailable } from '../utils/gpuImageGenerator';

interface AdvancedSettingsProps {
  useGPU: boolean;
  setUseGPU: (value: boolean) => void;
  maxConcurrentFonts: number;
  setMaxConcurrentFonts: (value: number) => void;
  singleDownload: boolean;
  setSingleDownload: (value: boolean) => void;
  totalFonts: number;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  useGPU,
  setUseGPU,
  maxConcurrentFonts,
  setMaxConcurrentFonts,
  singleDownload,
  setSingleDownload,
  totalFonts
}) => {
  const gpuAvailable = isGPUAvailable();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚙️ Advanced Settings
          <Badge variant="secondary">Performance</Badge>
        </CardTitle>
        <CardDescription>
          Configure GPU acceleration, multi-font processing, and download options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* GPU Acceleration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="gpu-acceleration" className="text-sm font-medium">
                🚀 GPU Acceleration
              </Label>
              <p className="text-xs text-muted-foreground">
                Use GPU for faster image generation (if available)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="gpu-acceleration"
                checked={useGPU && gpuAvailable}
                onCheckedChange={setUseGPU}
                disabled={!gpuAvailable}
              />
              <Badge variant={gpuAvailable ? "default" : "secondary"}>
                {gpuAvailable ? "Available" : "Not Available"}
              </Badge>
            </div>
          </div>
          
          {useGPU && gpuAvailable && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-xs text-green-700">
                ✅ GPU acceleration enabled - expect 2-3x faster generation
              </p>
            </div>
          )}
          
          {!gpuAvailable && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-xs text-yellow-700">
                ⚠️ GPU acceleration not supported in this browser
              </p>
            </div>
          )}
        </div>

        {/* Multi-Font Processing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="concurrent-fonts" className="text-sm font-medium">
                🎨 Concurrent Font Processing
              </Label>
              <p className="text-xs text-muted-foreground">
                Process multiple fonts simultaneously (1-3 fonts)
              </p>
            </div>
            <div className="w-32">
              <Select
                value={maxConcurrentFonts.toString()}
                onValueChange={(value) => setMaxConcurrentFonts(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Font</SelectItem>
                  <SelectItem value="2" disabled={totalFonts < 2}>
                    2 Fonts {totalFonts < 2 && "(Need 2+ fonts)"}
                  </SelectItem>
                  <SelectItem value="3" disabled={totalFonts < 3}>
                    3 Fonts {totalFonts < 3 && "(Need 3+ fonts)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
              <div className="font-semibold text-blue-600">1 Font</div>
              <div className="text-blue-500">Sequential</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded p-2 text-center">
              <div className="font-semibold text-orange-600">2 Fonts</div>
              <div className="text-orange-500">2x Faster</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center">
              <div className="font-semibold text-purple-600">3 Fonts</div>
              <div className="text-purple-500">3x Faster</div>
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="single-download" className="text-sm font-medium">
                📦 Download Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Choose between single download or batch downloads
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="single-download"
                checked={singleDownload}
                onCheckedChange={setSingleDownload}
              />
              <Badge variant={singleDownload ? "default" : "secondary"}>
                {singleDownload ? "Single" : "Batch"}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className={`border rounded p-3 ${
              singleDownload 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="font-semibold text-green-600 mb-1">
                📦 Single Download
              </div>
              <ul className="text-green-500 space-y-1">
                <li>• Download once when complete</li>
                <li>• All images in one ZIP file</li>
                <li>• Organized by font folders</li>
                <li>• Better for large datasets</li>
              </ul>
            </div>
            
            <div className={`border rounded p-3 ${
              !singleDownload 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="font-semibold text-blue-600 mb-1">
                🔄 Batch Download
              </div>
              <ul className="text-blue-500 space-y-1">
                <li>• Download every 500 images</li>
                <li>• Multiple ZIP files</li>
                <li>• Safer for interruptions</li>
                <li>• Can start using immediately</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Estimation */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <h4 className="text-sm font-medium mb-2">📊 Performance Estimation</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-gray-600">Expected Speed:</div>
              <div className="font-semibold">
                {useGPU && gpuAvailable ? '40-60' : '15-25'} images/sec
              </div>
            </div>
            <div>
              <div className="text-gray-600">15,000 images ETA:</div>
              <div className="font-semibold">
                {useGPU && gpuAvailable ? '4-6' : '10-17'} minutes
              </div>
            </div>
          </div>
          
          {maxConcurrentFonts > 1 && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="text-blue-700 text-xs">
                🚀 Multi-font processing: {maxConcurrentFonts}x faster with {maxConcurrentFonts} fonts
              </div>
            </div>
          )}
        </div>

        {/* System Requirements */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="text-sm font-medium text-yellow-800 mb-1">
            ⚠️ System Requirements
          </h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• RAM: 4GB+ recommended for 15K images</li>
            <li>• Storage: 2GB+ free space for output</li>
            <li>• Browser: Chrome/Edge for best GPU support</li>
            <li>• Multi-font: More RAM needed (8GB+ for 3 fonts)</li>
          </ul>
        </div>

      </CardContent>
    </Card>
  );
};

export default AdvancedSettings;