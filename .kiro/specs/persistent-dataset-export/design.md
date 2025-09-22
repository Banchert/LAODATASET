# Design Document

## Overview

The Persistent Dataset Export System is designed to provide a robust, resumable dataset generation and export process. The system maintains state across sessions, exports files in real-time to user-specified paths, and provides comprehensive progress tracking and recovery capabilities.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  Export Manager  │    │  File System    │
│                 │    │                  │    │                 │
│ - Progress UI   │◄──►│ - Session State  │◄──►│ - Direct Export │
│ - Control Panel │    │ - Font Tracking  │    │ - Folder Struct │
│ - Resume Dialog │    │ - Error Recovery │    │ - Metadata      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ State Manager   │    │ Progress Tracker │    │ Recovery System │
│                 │    │                  │    │                 │
│ - LocalStorage  │    │ - Per-font Stats │    │ - Session Files │
│ - Session Data  │    │ - Real-time UI   │    │ - Error Handling│
│ - Font Registry │    │ - ETA Calculation│    │ - Retry Logic   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

1. **PersistentExportManager**: Main orchestrator for export operations
2. **SessionStateManager**: Handles session persistence and recovery
3. **FontProgressTracker**: Tracks individual font completion status
4. **FileSystemExporter**: Direct file system operations
5. **RecoveryManager**: Handles interruption recovery and error handling

## Components and Interfaces

### 1. PersistentExportManager

```typescript
interface PersistentExportManager {
  // Session Management
  createSession(config: ExportSessionConfig): Promise<ExportSession>
  resumeSession(sessionId: string): Promise<ExportSession>
  pauseSession(sessionId: string): Promise<void>
  completeSession(sessionId: string): Promise<SessionSummary>
  
  // Export Operations
  exportImage(image: GeneratedImage, session: ExportSession): Promise<ExportResult>
  exportBatch(images: GeneratedImage[], session: ExportSession): Promise<BatchExportResult>
  
  // Progress Tracking
  getSessionProgress(sessionId: string): SessionProgress
  getFontProgress(sessionId: string, fontName: string): FontProgress
  
  // Recovery
  detectIncompleteSession(outputPath: string): Promise<ExportSession[]>
  validateSessionIntegrity(sessionId: string): Promise<ValidationResult>
}
```

### 2. SessionStateManager

```typescript
interface SessionStateManager {
  // State Persistence
  saveSessionState(session: ExportSession): Promise<void>
  loadSessionState(sessionId: string): Promise<ExportSession>
  deleteSessionState(sessionId: string): Promise<void>
  
  // Font Registry
  registerFont(sessionId: string, fontInfo: FontInfo): Promise<void>
  getFontStatus(sessionId: string, fontName: string): Promise<FontStatus>
  updateFontProgress(sessionId: string, fontName: string, progress: FontProgress): Promise<void>
  
  // Session Discovery
  findSessionsByPath(outputPath: string): Promise<ExportSession[]>
  findSessionsByFonts(fontNames: string[]): Promise<ExportSession[]>
}
```

### 3. FontProgressTracker

```typescript
interface FontProgressTracker {
  // Progress Tracking
  startFontProcessing(sessionId: string, fontName: string): Promise<void>
  updateImageProgress(sessionId: string, fontName: string, imageIndex: number): Promise<void>
  completeFontProcessing(sessionId: string, fontName: string): Promise<void>
  
  // Progress Queries
  getFontProgress(sessionId: string, fontName: string): Promise<FontProgress>
  getOverallProgress(sessionId: string): Promise<OverallProgress>
  getEstimatedTimeRemaining(sessionId: string): Promise<number>
  
  // Statistics
  getProcessingStats(sessionId: string): Promise<ProcessingStats>
  getPerformanceMetrics(sessionId: string): Promise<PerformanceMetrics>
}
```

### 4. FileSystemExporter

```typescript
interface FileSystemExporter {
  // Directory Management
  createProjectStructure(outputPath: string, projectName: string): Promise<ProjectStructure>
  ensureFontDirectory(projectPath: string, fontName: string): Promise<string>
  
  // File Operations
  exportImage(image: GeneratedImage, filePath: string): Promise<ExportResult>
  exportMetadata(metadata: ImageMetadata, filePath: string): Promise<void>
  exportSessionSummary(summary: SessionSummary, filePath: string): Promise<void>
  
  // Validation
  validateOutputPath(path: string): Promise<PathValidation>
  checkDiskSpace(path: string, requiredSpace: number): Promise<SpaceCheck>
  
  // Recovery
  scanExistingFiles(projectPath: string): Promise<ExistingFileMap>
  verifyFileIntegrity(filePath: string): Promise<boolean>
}
```

## Data Models

### ExportSession

```typescript
interface ExportSession {
  sessionId: string
  projectName: string
  outputPath: string
  createdAt: Date
  lastUpdated: Date
  status: 'active' | 'paused' | 'completed' | 'failed'
  
  // Configuration
  config: {
    numSamples: number
    imageWidth: number
    imageHeight: number
    styleVariations: boolean
    enableSpecialEffects: boolean
  }
  
  // Font Information
  fonts: FontInfo[]
  fontProgress: Map<string, FontProgress>
  
  // Statistics
  totalImages: number
  exportedImages: number
  failedImages: number
  startTime: Date
  estimatedCompletion?: Date
}
```

### FontProgress

```typescript
interface FontProgress {
  fontName: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped'
  totalImages: number
  completedImages: number
  failedImages: number
  lastImageIndex: number
  startTime?: Date
  completionTime?: Date
  processingRate: number // images per second
  estimatedTimeRemaining: number // seconds
  errorCount: number
  lastError?: string
}
```

### ExportResult

```typescript
interface ExportResult {
  success: boolean
  filePath?: string
  fileSize?: number
  exportTime: number
  error?: {
    code: string
    message: string
    retryable: boolean
  }
}
```

## File Organization Structure

```
{outputPath}/
├── {projectName}/
│   ├── session.json                 # Session metadata
│   ├── progress.json               # Progress tracking
│   ├── summary.json                # Final summary (when complete)
│   ├── fonts/
│   │   ├── {fontName1}/
│   │   │   ├── images/
│   │   │   │   ├── {fontName1}_001_clear.png
│   │   │   │   ├── {fontName1}_001_blurred.png
│   │   │   │   └── ...
│   │   │   ├── metadata.json       # Font-specific metadata
│   │   │   └── progress.json       # Font-specific progress
│   │   ├── {fontName2}/
│   │   │   └── ...
│   │   └── ...
│   └── logs/
│       ├── export.log              # Export operations log
│       ├── errors.log              # Error log
│       └── performance.log         # Performance metrics
```

## Error Handling Strategy

### Error Categories

1. **Recoverable Errors**
   - Temporary file system issues
   - Network interruptions (if using network storage)
   - Memory pressure
   - Individual image generation failures

2. **Non-Recoverable Errors**
   - Insufficient disk space
   - Permission denied on output path
   - Corrupted font files
   - Invalid configuration

### Recovery Mechanisms

1. **Automatic Retry**: Up to 3 attempts for recoverable errors
2. **Graceful Degradation**: Skip failed images and continue
3. **State Preservation**: Save progress before critical operations
4. **User Notification**: Clear error messages with suggested actions
5. **Fallback Options**: Alternative output paths when primary fails

## Testing Strategy

### Unit Tests
- Individual component functionality
- Error handling scenarios
- State management operations
- File system operations

### Integration Tests
- End-to-end export workflows
- Session persistence and recovery
- Multi-font processing
- Error recovery scenarios

### Performance Tests
- Large dataset generation (100K+ images)
- Memory usage monitoring
- Disk I/O performance
- Concurrent export operations

### User Acceptance Tests
- Resume interrupted sessions
- Handle various error conditions
- Validate exported file structure
- Verify metadata accuracy

## Security Considerations

1. **Path Validation**: Prevent directory traversal attacks
2. **File Permissions**: Respect system file permissions
3. **Resource Limits**: Prevent excessive disk/memory usage
4. **Input Sanitization**: Validate all user inputs
5. **Error Information**: Avoid exposing sensitive system information

## Performance Optimizations

1. **Batch Operations**: Group file writes for efficiency
2. **Async Processing**: Non-blocking I/O operations
3. **Memory Management**: Stream large files, cleanup resources
4. **Progress Throttling**: Limit UI update frequency
5. **Lazy Loading**: Load session data on demand
6. **Compression**: Optional compression for metadata files

## Monitoring and Logging

1. **Export Metrics**: Track success rates, performance
2. **Error Logging**: Detailed error information for debugging
3. **Performance Monitoring**: I/O rates, memory usage
4. **User Analytics**: Feature usage patterns (privacy-compliant)
5. **Health Checks**: System resource monitoring