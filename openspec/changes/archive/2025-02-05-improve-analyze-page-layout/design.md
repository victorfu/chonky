## Context

The analyze page (`/analyze`) is the main screen for image analysis. Currently:
- Header section contains title and subtitle, with model selector below
- Action buttons (Analyze, Clear) appear only after an image is uploaded
- Components are stacked vertically with `space-y-6` gaps
- Mobile responsiveness uses basic breakpoints but button placement is suboptimal

The layout feels disconnected: model selection is separated from the actions it affects, and the vertical stacking creates excessive scrolling on smaller screens.

## Goals / Non-Goals

**Goals:**
- Create a unified control bar combining model selection and action buttons
- Reduce vertical space usage by consolidating related controls
- Improve responsive breakpoints for mobile, tablet, and desktop
- Maintain consistency with the existing design system (Tailwind + DaisyUI patterns)
- Preserve all existing functionality

**Non-Goals:**
- Redesigning the dropzone component itself
- Changing the analysis mode selector behavior
- Modifying the result card layout
- Adding new features or capabilities

## Decisions

### 1. Unified Control Bar Layout

**Decision**: Combine model selector and action buttons into a single horizontal control bar below the header text.

**Rationale**:
- Groups related controls (choose model → analyze) into a natural left-to-right flow
- Reduces vertical space by eliminating the separate row for model selector
- Matches common patterns in analysis/processing tools

**Alternatives considered**:
- Keep separate rows but reduce spacing → Still feels disconnected
- Put buttons inside dropzone → Clutters the upload area
- Floating action bar → Over-engineered for this use case

### 2. Responsive Breakpoint Strategy

**Decision**: Use three-tier responsive layout:
- **Mobile (<640px)**: Stack controls vertically, full-width buttons
- **Tablet (640px-1024px)**: Horizontal control bar, buttons on right
- **Desktop (>1024px)**: Same as tablet with max-width constraint

**Rationale**:
- Tailwind's `sm:` breakpoint (640px) is the natural transition point
- Most tablets in portrait mode fall in the 640-1024px range
- Desktop already has max-width constraint via `max-w-4xl`

### 3. Always-Visible Controls

**Decision**: Show the control bar (model selector + buttons) even before an image is uploaded, but disable the Analyze button.

**Rationale**:
- Reduces layout shift when image is added
- Users can pre-select their preferred model
- Clearer affordance of what actions are available

**Alternatives considered**:
- Keep current behavior (hide until image) → Causes jarring layout shift
- Show placeholder buttons → Confusing UX

### 4. Spacing Standardization

**Decision**: Use consistent spacing tokens:
- Section gaps: `gap-6` (24px) between major sections
- Within sections: `gap-4` (16px) for related items
- Inline elements: `gap-3` (12px) for buttons in a row

**Rationale**: Aligns with existing Tailwind spacing scale used elsewhere in the app.

## Risks / Trade-offs

**[Layout shift on page load]** → Minimal risk since controls are always visible now

**[Model selector width on mobile]** → Use full-width on mobile, constrained width on larger screens

**[Button order confusion]** → Place primary action (Analyze) first, destructive action (Clear) last

**[Internationalization]** → Ensure button labels don't break layout in longer languages; use `truncate` or flexible widths
