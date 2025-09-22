import React, { useState, useEffect } from 'react';
import { FolderOpen, Save, Play, Pause, RotateCcw, Settings2, CheckCircle, HardDrive, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import DirectFileExporter, { ExportSettings, ExportProgress } from '../utils/directFileExporter';

interface DirectExportPanelProps {
  onExporterChange: (exporter: DirectFileExporter) => void;
  isGenerating: boolean;
}

const DirectExportPanel: React.FC<DirectExportPanelProps> = ({
  onExporterChange,
  isGenerating
}) => {
  const [exporter] = useState(() => new DirectFileExporter());
  const [settings, setSettings] = useState<ExportSettings>(exporter.getSettings());
  const [progress, setProgress] = useState<ExportProgress>(exporter.getProgress());
  const [folderSelected, setFolderSelected] = useState(false);
  const [diskSpace, setDiskSpace] = useState<{available: number, total: number} | null>(null);

  useEffect(() => {
    // ตั้งค่า callback สำหรับ progress updates
    exporter.setProgressCallback(setProgress);
    onExporterChange(exporter);

    // ตรวจสอบว่ามี folder ที่เลือกไว้แล้วหรือไม่
    if (settings.selectedFolder) {
      setFolderSelected(true);
    }
  }, [exporter, onExporterChange]);

  const handleSelectFolder = async () => {
    const selectedFolder = await exporter.selectExportFolder();
    if (selectedFolder) {
      setFolderSelected(true);
      setSettings(exporter.getSettings());
    }
  };

  const handleSettingChange = (key: keyof ExportSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    exporter.updateSettings(newSettings);
  };

  const handleResume = () => {
    if (exporter.resumeSession()) {
      setProgress(exporter.getProgress());
    }
  };

  const handleClearProgress = () => {
    exporter.clearProgress();
    setProgress(exporter.getProgress());
  };

  // ตรวจสอบพื้นที่ดิสก์
  const checkDiskSpace = async (path: string) => {
    try {
      // ใน browser ไม่สามารถตรวจสอบพื้นที่ดิสก์ได้โดยตรง
      // แต่สามารถประมาณได้จากขนาดของ dataset ที่จะสร้าง
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setDiskSpace({
          available: estimate.quota || 0,
          total: estimate.quota || 0
        });
      }
    } catch (error) {
      console.warn('Cannot check disk space:', error);
    }
  };

  // ฟังก์ชันคำนวณขนาด dataset ที่จะสร้าง
  const estimateDatasetSize = () => {
    const imageSize = 50; // KB per image (ประมาณ)
    const totalImages = progress.totalImages || 15000;
    const estimatedSizeKB = totalImages * imageSize;
    const estimatedSizeMB = estimatedSizeKB / 1024;
    const estimatedSizeGB = estimatedSizeMB / 1024;

    if (estimatedSizeGB > 1) {
      return `${estimatedSizeGB.toFixed(1)} GB`;
    } else {
      return `${estimatedSizeMB.toFixed(0)} MB`;
    }
  };

  const stats = exporter.getStats();
  const canResume = exporter.canResume();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Save className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-800">Direct Export System</h3>
            <p className="text-sm text-green-600 lao-text">ລະບົບບັນທຶກໄຟລ໌ໂດຍກົງ</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Folder Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Export Destination</Label>
          <div className="flex gap-3">
            <Button
              onClick={handleSelectFolder}
              variant="outline"
              size="lg"
              className={`flex-1 ${folderSelected
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-blue-300 bg-blue-50 text-blue-700'
              }`}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              {folderSelected ? 'Change Folder' : 'Select Export Folder'}
            </Button>
            {folderSelected && (
              <div className="flex items-center px-3 py-2 bg-green-100 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm text-green-700 font-medium">Folder Selected</span>
              </div>
            )}
          </div>

          {settings.selectedFolder && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-xs text-gray-600 mb-1">Selected Folder:</p>
                <p className="text-sm font-mono text-gray-800 break-all">
                  {settings.selectedFolder}
                </p>
              </div>

              {/* Manual Path Input */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-blue-700">
                  🛠️ Manual Path (Optional):
                </Label>
                <Input
                  type="text"
                  value={settings.selectedFolder}
                  onChange={(e) => {
                    exporter.updateSettings({ selectedFolder: e.target.value });
                    setSettings(exporter.getSettings());
                  }}
                  placeholder="C:\Users\YourName\Desktop\MyDataset"
                  className="text-sm font-mono"
                />
                <p className="text-xs text-blue-600">
                  💡 Type your custom path or use folder picker above
                </p>
              </div>
            </div>
          )}

          {/* Storage Information */}
          {settings.selectedFolder && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Storage Information
                </h4>

                <div className="space-y-3">
                  {/* Full Export Path */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-blue-600">Full Export Path:</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Copy path to clipboard
                          const fullPath = `${settings.selectedFolder}/${settings.projectName}`;
                          navigator.clipboard.writeText(fullPath);
                          alert('Path copied to clipboard!');
                        }}
                        className="text-xs px-2 py-1 h-6"
                      >
                        Copy
                      </Button>
                    </div>
                    <div className="bg-white p-2 rounded border font-mono text-sm text-gray-800 break-all">
                      {settings.selectedFolder}/{settings.projectName}
                    </div>
                  </div>

                  {/* Dataset Size Estimation */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded border text-center">
                      <div className="text-lg font-bold text-blue-700">{estimateDatasetSize()}</div>
                      <div className="text-xs text-blue-600">Estimated Size</div>
                    </div>
                    <div className="bg-white p-3 rounded border text-center">
                      <div className="text-lg font-bold text-green-700">
                        {progress.totalImages || 15000}
                      </div>
                      <div className="text-xs text-green-600">Total Images</div>
                    </div>
                  </div>

                  {/* Disk Space Warning */}
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-yellow-600" />
                      <p className="text-xs text-yellow-800 font-medium">
                        Make sure you have enough disk space!
                      </p>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1 lao-text">
                      ໃຫ້ແນ່ໃຈວ່າມີພື້ນທີ່ດິສກ໌ພຽງພໍ!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-sm font-medium">Project Name</Label>
            <Input
              id="projectName"
              value={settings.projectName}
              onChange={(e) => handleSettingChange('projectName', e.target.value)}
              placeholder="lao-dataset-2025"
              className="text-sm"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoExport"
                checked={settings.autoExport}
                onCheckedChange={(checked) => handleSettingChange('autoExport', checked)}
              />
              <Label htmlFor="autoExport" className="text-sm">Auto Export</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="organizeByFont"
                checked={settings.organizeByFont}
                onCheckedChange={(checked) => handleSettingChange('organizeByFont', checked)}
              />
              <Label htmlFor="organizeByFont" className="text-sm">Organize by Font</Label>
            </div>
          </div>
        </div>

        {/* Progress Display */}
        {(progress.totalImages > 0 || isGenerating) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">Export Progress</h4>
              {canResume && !isGenerating && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleResume}
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-300"
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </Button>
                  <Button
                    onClick={handleClearProgress}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {stats.exportedFiles} / {stats.totalFiles} files
                </span>
                <span className="font-medium text-gray-800">
                  {stats.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                  style={{ width: `${stats.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-lg font-bold text-blue-700">{stats.rate}</div>
                <div className="text-xs text-blue-600">files/sec</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-lg font-bold text-green-700">{stats.elapsed}s</div>
                <div className="text-xs text-green-600">elapsed</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="text-lg font-bold text-orange-700">{stats.remaining}s</div>
                <div className="text-xs text-orange-600">remaining</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="text-lg font-bold text-purple-700">
                  {progress.currentFont || 'Ready'}
                </div>
                <div className="text-xs text-purple-600">current font</div>
              </div>
            </div>

            {/* Current File */}
            {progress.currentFile && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-xs text-gray-600 mb-1">Latest Export:</p>
                <p className="text-sm font-mono text-gray-800 break-all">
                  {progress.currentFile}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Status Messages */}
        {!folderSelected && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800 font-medium lao-text">
                ກະລຸນາເລືອກ folder ສຳລັບບັນທຶກໄຟລ໌
              </p>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Please select a folder to save exported images
            </p>
          </div>
        )}

        {folderSelected && settings.autoExport && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-800 font-medium lao-text">
                ພ້ອມບັນທຶກໄຟລ໌ອັດຕະໂນມັດ
              </p>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Images will be automatically saved to the selected folder
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DirectExportPanel;