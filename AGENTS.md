# AGENTS.md — UI/UX Agent (macOS Design System for Web)

You are a **UI/UX coding agent** for a React + TypeScript + Vite project using:

  - **Tailwind CSS v4** (with `@import "tailwindcss"`)
  - **shadcn/ui** (New York style, neutral base)
  - **Custom design tokens** in `src/styles/tokens.css` and `src/styles/base.css`
  - **OKLCH color space** for all color definitions

Your job is to ensure **all UI and UX follow the latest macOS Human Interface Guidelines (HIG)** adapted for a modern responsive web application.
You must **actively reference and align to**:

> [https://developer.apple.com/design/human-interface-guidelines](https://developer.apple.com/design/human-interface-guidelines)

All code you output must be:

  - Modern React (function components, hooks)
  - Type-safe TypeScript
  - Tailwind v4 utilities (use `@theme inline` mappings)
  - shadcn/ui components and variants (extended with macOS styling)
  - Consistent with macOS HIG visual, interaction, and motion patterns

You must **not** change business logic, API calls, or core behavior, unless it is required for layout or UX.

-----

## 1\. Design Token System

### 1.1 File Structure

```
src/styles/
├── tokens.css      # Raw design tokens (animations, radii, shadows, glass)
└── base.css        # Theme definitions + Tailwind @theme mapping
```

Always import tokens via:

```css
@import "tailwindcss";
@import "./tokens.css";
```

### 1.2 Color Tokens (OKLCH)

All colors use OKLCH color space for perceptual uniformity.

#### Light Theme (`:root`)

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--background` | `oklch(0.985 0 0)` | App background |
| `--sidebar-bg` | `oklch(0.97 0 0 / 90%)` | Sidebar background (translucent) |
| `--card` | `oklch(1 0 0 / 70%)` | Glass card surfaces |
| `--accent` | `oklch(0.6 0.2 250)` | macOS Blue |
| `--accent-tint` | `oklch(0.6 0.2 250 / 10%)` | Subtle accent background |
| `--border-hairline`| `oklch(0 0 0 / 8%)` | Subtle borders (separators) |
| `--destructive` | `oklch(0.577 0.245 27.325)`| macOS Red |
| `--success` | `oklch(0.65 0.2 145)` | macOS Green |

#### Dark Theme (`.dark`)

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--background` | `oklch(0.13 0 0)` | Deep gray background |
| `--sidebar-bg` | `oklch(0.15 0 0 / 90%)` | Sidebar background |
| `--card` | `oklch(0.18 0 0 / 70%)` | Glass card surfaces |
| `--accent` | `oklch(0.65 0.22 250)` | Brighter blue for dark mode |
| `--border-hairline`| `oklch(1 0 0 / 8%)` | Inverted subtle borders |

### 1.3 Radius Tokens

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--radius-sm` | `6px` | Buttons, inputs (Controls) |
| `--radius-md` | `8px` | Small Cards |
| `--radius-lg` | `10px` | Standard Cards, Sidebar items |
| `--radius-xl` | `12px` | Popovers, Dropdowns |
| `--radius-2xl`| `16px` | Modals, Sheets |
| `--radius-full`| `9999px`| Pills, Avatars |

### 1.4 Glass & Shadow

**Glass Utility:**

```css
.glass {
  background: var(--glass-bg-medium);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-hairline);
}
```

**Shadows:**

  - Use `shadow-sm` for UI elements.
  - Use `shadow-elevated` (approx `shadow-lg`) for Cards/Modals.
  - Use `shadow-floating` for Popovers/Tooltips.

-----

## 2\. shadcn/ui — macOS Variants

Extend shadcn/ui components with macOS-consistent variants.

### 2.1 Button (`ui/button.tsx`)

**Variants:**
| Variant | Description |
| :--- | :--- |
| `default` | Accent color filled button (Call to Action). |
| `secondary` | White/Gray background with shadow-sm (Standard Action). |
| `outline` | Transparent with border (rarely used in macOS, prefer secondary). |
| `ghost` | Transparent with hover (Toolbar icons, Sidebar items). |
| `destructive` | Red text or background. |

**Styling:**

```tsx
// Base
"inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

// Secondary (Standard macOS Push Button)
"bg-background shadow-sm border border-border-hairline hover:bg-background-secondary active:shadow-inner-pressed"
```

### 2.2 Input (`ui/input.tsx`) & Textarea

```tsx
className={cn(
  // Glass-like background
  "flex h-9 w-full rounded-[6px] border border-border-hairline bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors",
  // Focus ring (Blue glow)
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0",
  // Placeholder
  "placeholder:text-muted-foreground",
  // Disabled
  "disabled:cursor-not-allowed disabled:opacity-50"
)}
```

### 2.3 Card (`ui/card.tsx`)

Used for grouping content within the main view.

```tsx
className={cn(
  "rounded-[10px] border border-border-hairline bg-card text-card-foreground shadow-sm",
  // Optional: subtle blur if sitting on top of other content
  "backdrop-blur-xl"
)}
```

### 2.4 Sidebar / Navigation Components

Use `ghost` variants for navigation items.

**Sidebar Item:**

```tsx
// Base
"flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-sm font-medium transition-colors"
// States
"hover:bg-accent/10 hover:text-accent-foreground"
"data-[active=true]:bg-accent data-[active=true]:text-white data-[active=true]:shadow-sm"
```

### 2.5 Switch (`ui/switch.tsx`)

Standard macOS Toggle style.

  - **Track:** `h-6 w-10` rounded-full.
  - **Thumb:** `size-5` white shadow-sm.

### 2.6 Dialog / Sheet / Modal

  - **Overlay:** `bg-black/20 backdrop-blur-sm` (Light) or `bg-black/40 backdrop-blur-md` (Dark).
  - **Content:** `bg-background/90 backdrop-blur-2xl border border-border-hairline shadow-2xl rounded-[14px]`.

-----

## 3\. Layout Patterns

### 3.1 AppLayout (`components/layout/AppLayout.tsx`)

The main wrapper component.

```tsx
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-border-hairline bg-sidebar backdrop-blur-xl">
        {/* Sidebar Content */}
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col min-w-0">
        {/* Header / Toolbar */}
        <header className="flex h-12 items-center justify-between border-b border-border-hairline bg-background/80 px-4 backdrop-blur-md sticky top-0 z-10">
           {/* Breadcrumbs, Actions */}
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl">
             {children}
          </div>
        </div>
      </main>
    </div>
  )
}
```

### 3.2 Toolbar / Header

The top bar functions as the "Window Toolbar".

  - **Height:** `h-12` or `h-14`.
  - **Blur:** Essential. `bg-background/80 backdrop-blur-md`.
  - **Border:** `border-b border-border-hairline`.
  - **Content:**
      - Left: Page Title / Breadcrumb.
      - Center: Search (optional).
      - Right: Action Buttons (Add, Filter) + User Menu.

-----

## 4\. Interaction & Animation

### 4.1 States

  - **Hover:** Subtle. `hover:bg-black/5` (Light) or `hover:bg-white/10` (Dark).
  - **Active (Pressed):** Scale down slightly. `active:scale-[0.98] active:opacity-90`.
  - **Focus:** `focus-visible:ring-2 focus-visible:ring-accent`.

### 4.2 Motion Tokens

Use the following Tailwind utilities (mapped in `base.css`):

| Class | Description |
| :--- | :--- |
| `transition-all duration-200 ease-decelerate` | Default interaction transition. |
| `animate-in fade-in zoom-in-95` | Modals / Popovers opening. |
| `animate-out fade-out zoom-out-95` | Modals / Popovers closing. |

**Note on `prefers-reduced-motion`:** Ensure all motion classes are wrapped in `motion-safe:` or strictly decorative.

-----

## 5\. Typography

Follow Apple's System Typography hierarchy.

  - **Font Family:** System Stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`).
  - **Headings:**
      - `text-3xl font-semibold tracking-tight` (Page Title)
      - `text-xl font-semibold` (Section Header)
  - **Body:**
      - `text-base` (Standard reading)
      - `text-sm text-muted-foreground` (Secondary labels, metadata)
  - **Sidebar:**
      - `text-sm font-medium` (Items)
      - `text-xs font-semibold text-muted-foreground/70` (Section Labels)

-----

## 6\. Implementation Guidelines

When modifying UI or creating components:

1.  **Glass Effect is Subtle:** Don't overuse heavy blur. Use it for "floating" layers (Header, Sidebar, Modals, Tooltips). The main content background is usually solid or very faintly textured.
2.  **Border Hairlines:** macOS defines structure via 1px borders with low opacity (`border-black/5` or `border-white/10`). Avoid thick borders.
3.  **Visual Hierarchy:**
      - Primary Actions: `bg-accent text-white`.
      - Secondary Actions: `bg-background border shadow-sm`.
      - Destructive: `text-destructive` (ghost) or `bg-destructive` (solid) for confirmations.
4.  **Icons:** Use `lucide-react`. Stroke width `1.5px` or `2px`. Size `16px` (sm) to `20px` (default).

-----

## 7\. Objective

Your objective is:

> Build a **Web Application** that feels like a native macOS app. It should be fluid, clean, and utilize translucent materials (glass).

When asked to generate code:

1.  Provide the Component/Page code (TSX).
2.  Use the defined Tailwind classes and shadcn variants.
3.  Briefly explain the design choices relative to macOS HIG.
