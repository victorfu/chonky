## Context

- The app currently treats `/analyze` as the primary route and redirects `/` to `/analyze`.
- All routes inside `MainLayout` are protected by `AuthGuard`, so unauthenticated users are forced to `/login` before seeing the analysis UI.
- The analysis flow lives in `ScreenshotPage` and triggers analysis via the `FloatingCommandBar`'s **Analyze** button and `AnalysisResult`'s **Reanalyze** action.
- Login currently redirects to a hard-coded route (`/query`), not the route the user intended to visit.

## Goals / Non-Goals

**Goals:**
- Make the analysis experience available at `/` without requiring authentication.
- Require authentication only when a user triggers analysis (Analyze/Reanalyze).
- Preserve analysis context (image + selected mode/model) through the login flow so the user can continue seamlessly.
- Redesign the homepage UI/UX to clearly explain the flow and reduce friction for first-time users.

**Non-Goals:**
- Changing the analysis pipeline, model offerings, or backend services.
- Introducing new authentication providers or changing Firebase auth architecture.
- Building a full marketing site; the homepage remains the analysis interface.

## Decisions

1. **Route-level protection becomes selective, not global.**
   - Move `MainLayout` outside the global `AuthGuard` so `/` (and `/analyze` as an alias) are public.
   - Wrap only protected routes (e.g., `/settings`) with `AuthGuard` via a nested route element.
   - Keep `/analyze` as an alias to `/` (redirect or shared element) to preserve existing links.

2. **Action-level auth gate in the analysis UI.**
   - Intercept `onAnalyze` and `onReanalyze` in `ScreenshotPage` (or the store) to check auth state.
   - If unauthenticated, navigate to `/login` with `state.from` and a `pendingAnalyze` flag.
   - After login, return to the previous route and continue analysis using preserved state.

3. **State preservation strategy.**
   - Rely on the in-memory Zustand store for the primary flow (single-page navigation keeps state).
   - Add a lightweight sessionStorage snapshot (image + mode + model + pendingAnalyze) to cover edge cases like reloads during login.
   - On returning from login, restore state if needed and optionally auto-trigger analysis when `pendingAnalyze` is true.

4. **Homepage UX redesign to match the new flow.**
   - Introduce a hero + guided steps around the dropzone: “1) Drop image 2) Choose mode 3) Analyze”.
   - Add clear messaging near the Analyze button: “Sign in required to run analysis.”
   - Provide a visible sign-in CTA (top bar or inline) for users who want to authenticate early.
   - Keep the core analysis controls unchanged to avoid disrupting existing users.

5. **Login redirect behavior becomes intent-aware.**
   - Update `LoginPage` to navigate back to `location.state.from` (default `/`) after success.
   - If `pendingAnalyze` is present, resume the analysis flow on return.

## Risks / Trade-offs

- **Unexpected auto-analysis after login** → Mitigate by showing a “Continue analysis” confirmation when returning, or auto-run only when `pendingAnalyze` is explicitly set by the button click.
- **State loss on refresh** → Mitigate with sessionStorage snapshot and restore.
- **Settings visibility for unauth users** → Either hide settings in nav when logged out or allow it to redirect to login; clarify in UI.
- **More conditional UI states** → Keep logic centralized in `ScreenshotPage` and a small auth-gate helper to reduce complexity.

## Migration Plan

- Update routing and auth guard structure.
- Implement analysis auth gate and redirect handling.
- Add state preservation and login return logic.
- Redesign homepage layout and copy.
- Verify `/analyze` still works as alias and `/settings` remains protected.

## Open Questions

- Should analysis auto-run after login, or should we show an explicit “Continue analysis” button?
- Should unauth users see a “Sign in” CTA in the sidebar/top bar, or only on the Analyze action?
- Do we want to hide Settings in the navigation when logged out?
