## Why

The current flow requires sign-in before users can even see the analysis experience, adding friction to first-time use. Making the analysis page the public homepage improves discovery and allows users to explore the UI before committing, while still protecting the actual analysis action behind authentication.

## What Changes

- Make the current `/analyze` experience the homepage (`/`) and allow unauthenticated access to view and interact with the UI.
- Move authentication gating from route-level to action-level: clicking **Analyze** (or **Reanalyze**) requires login.
- Preserve user state (selected mode/model, uploaded image) when redirecting to login, so users can continue after signing in.
- Update navigation, copy, and UI/UX to clearly communicate the free-to-explore homepage and the login requirement at analysis time.

## Capabilities

### New Capabilities
- `public-analyze-home`: Public homepage that renders the analysis UI at `/` with updated navigation and messaging.
- `analysis-auth-gate`: Action-level authentication gate for analysis triggers, including post-login return to the analysis context.

### Modified Capabilities
- (none)

## Impact

- Routing and guards in `src/App.tsx`, plus navigation entries and command palette.
- Screenshot analysis UI (dropzone, analyze/reanalyze actions) to add gated login flow.
- Auth flow and login redirect handling to return users to the analysis context.
- i18n strings and UX copy updates for the new homepage flow.
