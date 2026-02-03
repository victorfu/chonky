## 1. Routing and Guard Updates

- [x] 1.1 Update `src/App.tsx` routing so `/` renders the analysis homepage publicly and `/analyze` aliases to `/` while keeping `/settings` behind `AuthGuard`
- [x] 1.2 Update navigation links (sidebar + command palette) to point to the homepage route and adjust labels if needed
- [x] 1.3 Fix login success redirect to return to `location.state.from` (default `/`)

## 2. Analysis Auth Gate and State Preservation

- [x] 2.1 Add an auth gate wrapper for Analyze/Reanalyze actions (likely in `ScreenshotPage`) to redirect unauthenticated users to `/login` with `pendingAnalyze`
- [x] 2.2 Implement lightweight sessionStorage snapshot for analysis context (image + mode + model + pendingAnalyze) and restore on return
- [x] 2.3 Resume pending analysis after login using restored state and a pending flag

## 3. Homepage UI/UX Redesign

- [x] 3.1 Redesign `ScreenshotPage` layout with hero + step guidance around the dropzone and analysis controls
- [x] 3.2 Add clear “login required to analyze” messaging near the action button and a visible sign-in CTA for unauthenticated users
- [x] 3.3 Update i18n strings for new homepage copy and labels

## 4. Verification

- [x] 4.1 Manually verify unauthenticated flow: homepage access, configure options, analyze triggers login, return resumes analysis
- [x] 4.2 Manually verify authenticated flow: analyze runs directly, settings remain protected
