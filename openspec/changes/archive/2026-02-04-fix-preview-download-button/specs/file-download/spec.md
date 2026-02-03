## ADDED Requirements

### Requirement: Download from preview panel

The system SHALL allow users to download a document file directly from the document preview panel by clicking the download button.

#### Scenario: User downloads file from preview panel
- **WHEN** user views a document in the preview panel and clicks the download button
- **THEN** the browser SHALL initiate a download of the file with its original filename

#### Scenario: Download button works for all file types
- **WHEN** user clicks download for any supported document type (PDF, DOCX, TXT, MD, CSV, JSON)
- **THEN** the file SHALL download with the correct MIME type and original filename

### Requirement: Download from document list actions

The system SHALL allow users to download a document file from the document list item's action menu.

#### Scenario: User downloads file from action menu
- **WHEN** user opens the action menu on a document list item and clicks "Download"
- **THEN** the browser SHALL initiate a download of the file with its original filename

#### Scenario: Download works in both list and grid views
- **WHEN** user triggers download from either list view (DocumentItem) or grid view (DocumentGridItem)
- **THEN** the download SHALL work identically regardless of view mode
