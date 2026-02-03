## 1. Restructure ScreenshotPage Layout

- [x] 1.1 Create unified control bar section combining model selector and action buttons
- [x] 1.2 Refactor header section to separate title/subtitle from controls
- [x] 1.3 Make control bar always visible (show before image upload)
- [x] 1.4 Conditionally disable Analyze button when no image present
- [x] 1.5 Conditionally hide Clear button when no image present

## 2. Implement Responsive Breakpoints

- [x] 2.1 Add mobile layout (< 640px): stack controls vertically with full-width buttons
- [x] 2.2 Add tablet/desktop layout (>= 640px): horizontal control bar with inline model selector and buttons
- [x] 2.3 Ensure model selector has appropriate width constraints per breakpoint

## 3. Standardize Spacing

- [x] 3.1 Update section gaps to use consistent `gap-6` (24px) between major sections
- [x] 3.2 Update within-section gaps to use `gap-4` (16px) for related items
- [x] 3.3 Update button row to use `gap-3` (12px) for inline button spacing

## 4. Final Polish

- [x] 4.1 Test layout on mobile viewport (< 640px)
- [x] 4.2 Test layout on tablet viewport (640px - 1024px)
- [x] 4.3 Test layout on desktop viewport (> 1024px)
- [x] 4.4 Verify no layout shift when image is added/removed
