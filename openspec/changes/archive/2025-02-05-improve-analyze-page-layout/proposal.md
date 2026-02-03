## Why

The analyze page (/analyze) currently has layout issues: inconsistent spacing, suboptimal button placement with the model selector separated from action buttons, and poor responsive behavior on different screen sizes. This creates a disjointed user experience and wastes vertical space.

## What Changes

- Consolidate the header section: combine the page title, model selector, and action buttons into a unified control bar
- Improve overall spacing: standardize padding and margins between sections
- Enhance responsive design: better layout adaptation for mobile, tablet, and desktop viewports
- Optimize button placement: group related actions together (model selection + analyze/clear buttons)
- Improve the dropzone-to-controls flow: ensure natural visual flow from image upload to analysis actions

## Capabilities

### New Capabilities

None - this is a UI layout enhancement that doesn't introduce new behavioral capabilities.

### Modified Capabilities

None - no spec-level behavior changes, only visual/layout improvements.

## Impact

- `src/components/screenshots/ScreenshotPage.tsx` - main page layout restructuring
- `src/components/screenshots/ScreenshotDropzone.tsx` - potential spacing adjustments
- `src/components/screenshots/AnalysisModeSelector.tsx` - layout integration
- `src/components/screenshots/AnalysisResult.tsx` - spacing consistency
- No API changes
- No breaking changes
