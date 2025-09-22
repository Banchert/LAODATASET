# Requirements Document

## Introduction

This feature implements a persistent, resumable dataset export system that allows users to export generated images directly to their chosen output path in real-time, with the ability to track progress per font and resume interrupted operations. The system will maintain state across sessions and handle interruptions gracefully.

## Requirements

### Requirement 1: Real-time File Export

**User Story:** As a user generating a large dataset, I want images to be exported directly to my chosen folder path immediately as they are generated, so that I don't have to wait for the entire process to complete and download a large ZIP file.

#### Acceptance Criteria

1. WHEN a user specifies an output path THEN the system SHALL create the necessary folder structure at that location
2. WHEN an image is generated THEN the system SHALL immediately save it to the output path with proper naming convention
3. WHEN the output path is not accessible THEN the system SHALL show an error message and fallback to Downloads folder
4. WHEN images are being exported THEN the system SHALL organize them by font name in separate subfolders
5. WHEN exporting to the file system THEN the system SHALL handle file naming conflicts by appending incremental numbers

### Requirement 2: Font Progress Tracking

**User Story:** As a user working with multiple fonts, I want the system to track which fonts have been processed and their completion status, so that I can see the progress of each font individually.

#### Acceptance Criteria

1. WHEN starting dataset generation THEN the system SHALL create a progress tracking file for the current session
2. WHEN processing each font THEN the system SHALL record the font name, start time, and current progress
3. WHEN a font is completed THEN the system SHALL mark it as 100% complete with completion timestamp
4. WHEN a font processing is interrupted THEN the system SHALL record the last successful image index
5. WHEN displaying progress THEN the system SHALL show per-font completion percentages and overall progress

### Requirement 3: Session Persistence

**User Story:** As a user whose dataset generation gets interrupted (power outage, browser crash, manual cancellation), I want the system to remember what has been completed, so that I can resume from where it left off without losing progress.

#### Acceptance Criteria

1. WHEN dataset generation starts THEN the system SHALL create a session file with project settings and font list
2. WHEN each image is successfully exported THEN the system SHALL update the progress tracking file
3. WHEN the application is restarted THEN the system SHALL detect incomplete sessions and offer to resume
4. WHEN resuming a session THEN the system SHALL skip fonts that are already 100% complete
5. WHEN resuming a session THEN the system SHALL continue from the last successful image for incomplete fonts
6. WHEN a session is completed THEN the system SHALL mark the session as finished and archive the tracking files

### Requirement 4: Smart Font Detection and Resume

**User Story:** As a user who accidentally selects the same fonts again or wants to continue an interrupted session, I want the system to automatically detect what has already been done and either skip completed fonts or continue from where it stopped.

#### Acceptance Criteria

1. WHEN selecting fonts for generation THEN the system SHALL check if these fonts have been processed before in the same output path
2. WHEN a font is already 100% complete THEN the system SHALL show it as "Already Complete" and skip it by default
3. WHEN a font is partially complete THEN the system SHALL show the completion percentage and offer to continue or restart
4. WHEN user chooses to continue THEN the system SHALL resume from the last successful image index
5. WHEN user chooses to restart THEN the system SHALL clear previous progress and start fresh for that font
6. WHEN all selected fonts are already complete THEN the system SHALL notify the user and ask if they want to regenerate

### Requirement 5: Progress Visualization and Control

**User Story:** As a user monitoring a long-running dataset generation, I want to see detailed progress information and have control over the process, so that I can make informed decisions about pausing, resuming, or modifying the generation.

#### Acceptance Criteria

1. WHEN generation is running THEN the system SHALL display real-time progress for each font with estimated time remaining
2. WHEN displaying progress THEN the system SHALL show current image being processed, images per second, and total exported files
3. WHEN generation is running THEN the system SHALL provide pause/resume functionality
4. WHEN generation is paused THEN the system SHALL save current state and allow safe exit
5. WHEN resuming from pause THEN the system SHALL continue exactly where it left off
6. WHEN user wants to cancel THEN the system SHALL ask for confirmation and preserve completed work

### Requirement 6: File Organization and Metadata

**User Story:** As a user who needs organized dataset files, I want the exported files to be properly structured with metadata, so that I can easily use them for training and understand the dataset composition.

#### Acceptance Criteria

1. WHEN exporting files THEN the system SHALL create a folder structure: `{outputPath}/{projectName}/{fontName}/images/`
2. WHEN exporting files THEN the system SHALL generate a metadata file for each font containing image list and properties
3. WHEN exporting files THEN the system SHALL create a project summary file with overall statistics
4. WHEN a session is completed THEN the system SHALL generate a completion report with timing and statistics
5. WHEN files are exported THEN the system SHALL use consistent naming: `{fontName}_{textHash}_{styleVariation}.png`
6. WHEN metadata is generated THEN it SHALL include text content, font name, style variation, and generation timestamp

### Requirement 7: Error Handling and Recovery

**User Story:** As a user experiencing issues during dataset generation, I want the system to handle errors gracefully and provide recovery options, so that temporary problems don't cause me to lose significant progress.

#### Acceptance Criteria

1. WHEN a file write error occurs THEN the system SHALL retry up to 3 times before marking as failed
2. WHEN multiple consecutive errors occur THEN the system SHALL pause generation and ask user for action
3. WHEN disk space is low THEN the system SHALL warn the user and pause generation
4. WHEN output path becomes inaccessible THEN the system SHALL attempt to use fallback location
5. WHEN font rendering fails THEN the system SHALL skip that specific image and continue with the next
6. WHEN critical errors occur THEN the system SHALL save current progress before stopping
7. WHEN recovering from errors THEN the system SHALL provide options to retry failed images or skip them