## ADDED Requirements

### Requirement: Upload file to Firebase Storage

The system SHALL upload files to Firebase Storage using `uploadBytesResumable` API and return a download URL upon completion.

#### Scenario: Successful file upload
- **WHEN** user selects a valid file (.pdf, .docx, .doc, .txt, .md, .csv, .json) under 50MB
- **THEN** system uploads the file to `documents/{userId}/{documentId}/{filename}` path
- **AND** returns the download URL

#### Scenario: Upload with progress tracking
- **WHEN** file upload is in progress
- **THEN** system SHALL report progress as percentage (0-100) based on `bytesTransferred / totalBytes`

#### Scenario: Upload for unauthenticated user
- **WHEN** user is not authenticated and attempts to upload
- **THEN** system SHALL reject the upload with an authentication error

### Requirement: Track upload progress in real-time

The system SHALL provide real-time upload progress through a callback mechanism, replacing the simulated progress.

#### Scenario: Progress callback invocation
- **WHEN** upload progress changes
- **THEN** system SHALL invoke the `onProgress` callback with the current percentage

#### Scenario: Progress reaches 100%
- **WHEN** upload completes successfully
- **THEN** system SHALL invoke `onProgress` with 100 before resolving the promise

### Requirement: Handle upload errors

The system SHALL handle upload errors gracefully and provide meaningful error messages.

#### Scenario: Network error during upload
- **WHEN** network connection is lost during upload
- **THEN** system SHALL reject with a descriptive error message
- **AND** set the upload item status to 'error'

#### Scenario: Permission denied error
- **WHEN** Firebase Storage returns permission denied
- **THEN** system SHALL reject with "Permission denied. Please sign in again."

#### Scenario: Storage quota exceeded
- **WHEN** Firebase Storage quota is exceeded
- **THEN** system SHALL reject with "Storage quota exceeded. Please contact support."

### Requirement: Store document metadata with Storage URL

The system SHALL store the Firebase Storage download URL in the Document's `content` field and the storage path in `storageRef` field.

#### Scenario: Document created after upload
- **WHEN** file upload completes successfully
- **THEN** Document.content SHALL contain the download URL
- **AND** Document.storageRef SHALL contain the storage path

### Requirement: Delete file from Storage when document is deleted

The system SHALL delete the corresponding file from Firebase Storage when a document is deleted.

#### Scenario: Document deletion triggers Storage deletion
- **WHEN** user deletes a document that has a storageRef
- **THEN** system SHALL delete the file from Firebase Storage
- **AND** remove the document from local state

#### Scenario: Storage deletion failure does not block document deletion
- **WHEN** Firebase Storage deletion fails (e.g., file already deleted)
- **THEN** system SHALL log the error but proceed with document deletion
