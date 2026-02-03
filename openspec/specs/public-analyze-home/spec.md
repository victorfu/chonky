## Purpose

Define the public analysis homepage behavior, navigation aliasing, and unauthenticated messaging.

## ADDED Requirements

### Requirement: Public homepage renders analysis UI
The application SHALL render the analysis interface at the root path (`/`) and allow unauthenticated users to view and interact with the UI without being redirected to login.

#### Scenario: Unauthenticated visit to root
- **WHEN** an unauthenticated user navigates to `/`
- **THEN** the analysis homepage is displayed and no login redirect occurs

### Requirement: Analyze route aliases to homepage
The application SHALL serve the same analysis homepage experience at `/analyze` as at `/`.

#### Scenario: Direct navigation to /analyze
- **WHEN** a user navigates to `/analyze`
- **THEN** the analysis homepage is displayed

### Requirement: Homepage communicates login requirement
The homepage SHALL display messaging near the analysis action that indicates login is required to run analysis, and SHALL provide a visible sign-in entry point for users who want to authenticate early.

#### Scenario: Unauthenticated user views homepage
- **WHEN** an unauthenticated user views the analysis homepage
- **THEN** the UI shows a sign-in entry point and a clear note that analysis requires login

### Requirement: Pre-analysis interactions are available without login
The homepage SHALL allow unauthenticated users to upload an image and configure analysis options (mode/model) prior to authenticating.

#### Scenario: Configure analysis before login
- **WHEN** an unauthenticated user uploads an image and changes analysis options
- **THEN** the UI reflects those selections without requiring login
