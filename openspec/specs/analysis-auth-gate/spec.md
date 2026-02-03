## Purpose

Define authentication requirements for analysis actions and post-login resume behavior.

## ADDED Requirements

### Requirement: Analyze action requires authentication
The system MUST require authentication before starting an analysis when a user triggers **Analyze** or **Reanalyze**.

#### Scenario: Unauthenticated user clicks Analyze
- **WHEN** an unauthenticated user clicks **Analyze**
- **THEN** the user is routed to the login flow and analysis does not start

#### Scenario: Unauthenticated user clicks Reanalyze
- **WHEN** an unauthenticated user clicks **Reanalyze**
- **THEN** the user is routed to the login flow and analysis does not start

### Requirement: Authenticated users can analyze normally
The system SHALL start analysis immediately when an authenticated user triggers **Analyze** or **Reanalyze**.

#### Scenario: Authenticated user clicks Analyze
- **WHEN** an authenticated user clicks **Analyze**
- **THEN** analysis begins without additional login prompts

### Requirement: Return to analysis context after login
After a login triggered by the analysis action, the system SHALL return the user to the analysis homepage and restore the pending analysis context (image + selected mode/model).

#### Scenario: Login returns to analysis context
- **WHEN** a user completes login after being redirected from an analysis action
- **THEN** the user returns to the analysis homepage with the previously selected image and options restored

### Requirement: Pending analysis resumes after login
If the login was triggered by an analysis action, the system MUST resume the pending analysis automatically after the user returns.

#### Scenario: Auto-resume analysis after login
- **WHEN** the user returns from login with a pending analysis
- **THEN** the analysis starts using the restored image and options
