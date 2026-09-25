# DESIGN.md — Welfare Leakage Detection System
## UX4G 3.0 Compliant Design System for Government Portal

---

## 1. Design Direction Summary

**Aesthetic Name:** *Government Utilitarian* — Clean, accessible, trustworthy, purpose-driven. No decorative flourishes. Every element serves citizen or officer workflow.

**DFII Score:** 11/15 (Strong — High context fit, feasibility, performance; moderate consistency risk across two portals)

**Key Inspiration:** UX4G Design System 3.0, DBT Bharat dashboard density, myScheme step-wise clarity, PM-KISAN beneficiary-centric flows.

**Differentiation Anchor:** "If this were screenshotted with the logo removed, the **asymmetric KPI card grid + anchored header with ministry emblem + saffron accent on primary actions** would identify it as a GoI portal instantly."

---

## 2. Design System Snapshot

### 2.1 Color Palette (UX4G 3.0 Official Tokens)

```css
:root {
  /* Brand — Primary Identity */
  --color-brand-purple: #4A2BC2;      /* Ministry header, primary buttons */
  --color-brand-purple-hover: #3D23A0;
  --color-brand-purple-light: #EDE9FA; /* Badge backgrounds */

  /* Semantic — Government Standard */
  --color-saffron: #C47D00;           /* Primary CTAs, active states, highlights */
  --color-saffron-hover: #A06600;
  --color-saffron-light: #FFF8E7;     /* Alert banners, focus rings */

  --color-india-green: #128937;       /* Success, confirmed, resolved states */
  --color-india-green-hover: #0E6B2C;
  --color-india-green-light: #E8F5ED;

  --color-danger-red: #DB372D;        /* Errors, critical flags, rejected */
  --color-danger-red-hover: #B82D25;
  --color-danger-red-light: #FDEEEE;

  --color-info-cyan: #13C2C2;         /* Info badges, secondary actions */
  --color-info-cyan-hover: #0FA8A8;
  --color-info-cyan-light: #E6FCFC;

  /* Neutral — Backgrounds, Text, Borders */
  --color-neutral-50:  #F8F9FA;       /* Page background */
  --color-neutral-100: #F1F3F5;       /* Card backgrounds */
  --color-neutral-200: #E9ECEF;       /* Borders, dividers */
  --color-neutral-300: #DEE2E6;       /* Disabled borders */
  --color-neutral-400: #CED4DA;       /* Placeholder text */
  --color-neutral-500: #ADB5BD;       /* Secondary labels */
  --color-neutral-600: #868E96;       /* Muted text */
  --color-neutral-700: #495057;       /* Body text */
  --color-neutral-800: #343A40;       /* Headings */
  --color-neutral-900: #212529;       /* High emphasis */

  /* Status-specific (derived from semantic) */
  --color-flag-high:    var(--color-danger-red);
  --color-flag-medium:  var(--color-saffron);
  --color-flag-low:     var(--color-info-cyan);
  --color-flag-resolved: var(--color-india-green);
}
```

**Usage Rules:**
- Never use Tailwind defaults (no indigo, blue, gray scales)
- Saffron = primary action color (not purple)
- Purple = ministry/brand identity only (header, logo)
- Status colors ONLY for status — never for decoration

### 2.2 Typography

```css
:root {
  --font-sans: 'Noto Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Scale — 4px base rhythm */
  --text-xs:   0.75rem;   /* 12px — labels, badges */
  --text-sm:   0.875rem;  /* 14px — body small, table cells */
  --text-base: 1rem;      /* 16px — body default */
  --text-lg:   1.125rem;  /* 18px — emphasized body */
  --text-xl:   1.25rem;   /* 20px — card titles */
  --text-2xl:  1.5rem;    /* 24px — section headings */
  --text-3xl:  1.875rem;  /* 30px — page titles */
  --text-4xl:  2.25rem;   /* 36px — dashboard KPI numbers */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

**Hierarchy:**
- Page title: `text-3xl font-bold text-neutral-900`
- Section heading: `text-2xl font-semibold text-neutral-800`
- Card title: `text-xl font-medium text-neutral-800`
- Body: `text-base font-normal text-neutral-700 leading-relaxed`
- Label/badge: `text-xs font-medium uppercase tracking-wide`
- Mono: KPI numbers, Aadhaar last-4, IDs

### 2.3 Spacing & Layout

```css
:root {
  --space-1:  0.25rem;  /* 4px  */
  --space-2:  0.5rem;   /* 8px  */
  --space-3:  0.75rem;  /* 12px */
  --space-4:  1rem;     /* 16px */
  --space-5:  1.25rem;  /* 20px */
  --space-6:  1.5rem;   /* 24px — GUTTER STANDARD */
  --space-8:  2rem;     /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Layout constants */
  --header-height: 64px;
  --sidebar-width: 280px;
  --container-max: 1440px;  /* Desktop breakpoint */
  --container-padding: var(--space-6); /* 24px standard margin */
}
```

**Grid System:** 12-column, 24px gutter, 24px margin (UX4G standard)
- Desktop (≥1024px): 12 columns
- Tablet (768–1023px): 8 columns
- Mobile (≤390px): 4 columns, stacked

### 2.4 Component Primitives

| Component | Variants | Key Spec |
|-----------|----------|----------|
| **Button** | Primary (saffron), Secondary (purple outline), Ghost, Danger (red), Disabled | 40px height, `text-sm font-medium`, rounded `6px`, focus ring `saffron` |
| **Input** | Text, Select, Date, File | 40px height, border `neutral-300`, focus `saffron` ring, error `danger-red` |
| **Badge** | Status (4 colors), Count, Info | `text-xs font-medium uppercase`, px-3 py-1, rounded-full |
| **Card** | Default, Elevated, KPI, Table-wrapper | `bg-neutral-50 border border-neutral-200 rounded-xl p-6` |
| **Table** | Striped, Hover, Sortable | `text-sm`, header `font-medium text-neutral-600`, row hover `neutral-50` |
| **KPI Card** | 4-icon layout, sparkline area | Asymmetric: icon left, value center, trend right |
| **Tabs** | Underline (saffron), Pill | `text-sm font-medium`, active `text-brand-purple` |
| **Modal** | Default, Confirmation, Form | Centered, max-w-2xl, backdrop `neutral-900/50` |
| **Tooltip** | Top, Bottom, Left, Right | `text-xs bg-neutral-900 text-white px-2 py-1 rounded` |
| **Avatar** | With emblem fallback | 40px/48px/56px, `bg-brand-purple-light text-brand-purple` |

### 2.5 Motion Philosophy

- **One entrance:** Page fade-in (150ms) + stagger children (50ms each)
- **Meaningful hover:** Button lift (2px, 100ms), row highlight (instant)
- **Loading:** Skeleton screens (pulse `neutral-200` → `neutral-100`)
- **No decorative micro-motion** — only feedback for action/state change
- **Respect `prefers-reduced-motion`** — disable all non-essential animation

### 2.6 Accessibility Baseline (WCAG 2.1 AA)

- Contrast: All text ≥ 4.5:1 (large text ≥ 3:1), UI components ≥ 3:1
- Focus: Visible ring `2px solid var(--color-saffron)` offset `2px`
- Keyboard: All interactive elements reachable, logical tab order
- ARIA: Live regions for toasts/status, labels on all inputs, roles on composites
- Language: `lang="en"` root, `lang="hi"` toggle ready
- Skip link: "Skip to main content" as first focusable element

---

## 3. Portal-Specific Adaptations

### 3.1 Officer/Admin Portal (Internal)
- **Density:** High — data-dense tables, multi-panel dashboard
- **Navigation:** Persistent left sidebar (collapsible), top header with user/menu
- **Color use:** Restrained — saffron only on primary actions, status badges carry weight
- **Emblem:** Ministry logo top-left, "Welfare Leakage Detection" wordmark

### 3.2 Citizen Portal (Public)
- **Density:** Low — single-column, guided flows, generous whitespace
- **Navigation:** Minimal — back button, progress stepper, header with Digital India lockup
- **Color use:** Warmer — saffron primary buttons, green success states prominent
- **Emblem:** "Digital India" + ministry badge top-left, language selector top-right

---

## 4. Component Inventory (Build List)

### Shared
- [ ] Header (ministry emblem, role badge, user menu, language toggle)
- [ ] Footer (Digital India lockup, links, version)
- [ ] Button, Input, Select, Badge, Card, Table, Modal, Tooltip, Avatar, Tabs
- [ ] KPICard, Sparkline, StatusChip, FlagBadge, SLAChip
- [ ] LoadingSkeleton, EmptyState, ErrorBoundary

### Officer Portal
- [ ] SidebarNav (collapsible, icon+label, active state)
- [ ] DashboardGrid (asymmetric 4-card KPI row)
- [ ] BeneficiaryTable (sortable, filterable, paginated, virtualized)
- [ ] BeneficiaryDetail (tabs: Profile, DBT History, Flags, Audit Trail)
- [ ] AnomalyGauge (radial, 0–100, color zones)
- [ ] FlagKanban (4 columns, drag-drop, bulk actions)
- [ ] HeatmapChart (state choropleth or horizontal bar-map)
- [ ] FeatureImportanceChart (horizontal bar)
- [ ] PrecisionRecallTiles (4 metric cards)
- [ ] ReportExport (date picker, format select, trigger)

### Citizen Portal
- [ ] GrievanceForm (multi-step: Details → Documents → OTP → Confirm)
- [ ] DocumentUpload (drag-drop, preview, validation)
- [ ] OTPInput (4-field, auto-advance, resend timer)
- [ ] GrievanceTracker (vertical timeline, status chips)
- [ ] ProgressStepper (4 steps, current highlighted)

---

## 5. Implementation Notes

**Tech Mapping:**
- Tailwind CSS v4 with custom theme extending above tokens
- CSS variables for theming (light/dark ready)
- React 18 + Vite + TypeScript
- Recharts for charts (custom colors via theme)
- Framer Motion only for: page transition, modal enter, kanban drag

**File Structure:**
```
/apps/web/src/
  design/
    tokens.css          # CSS custom properties
    tailwind.config.ts  # Tailwind theme extension
    globals.css         # Base styles, reset, utilities
  components/
    ui/                 # Primitives (Button, Input, Badge, Card...)
    officer/            # Officer-specific composites
    citizen/            # Citizen-specific composites
    shared/             # Cross-portal (Header, Footer, KPICard...)
  layouts/
    OfficerLayout.tsx
    CitizenLayout.tsx
```

---

## 6. Anti-Patterns (Enforced)

❌ No `bg-blue-500`, `text-gray-600`, `rounded-lg` Tailwind defaults
❌ No centered card on white page — use full-width sections with container
❌ No generic hero sections — officer portal starts with KPI grid, citizen with form
❌ No stock gradients — solid colors only, saffron/purple for brand moments
❌ No Inter/Roboto — Noto Sans only
❌ No symmetrical 3-column feature grids — asymmetric, data-driven layouts
❌ No decorative icons — only functional (search, filter, download, chevron)
❌ No toast spam — one toast at a time, auto-dismiss 4s, persistent for errors

---

## 7. Verification Checklist

- [ ] All colors resolve to CSS variables (no hardcoded hex in components)
- [ ] Noto Sans loads via `@fontsource/noto-sans` (self-hosted)
- [ ] 12-column grid works at 1440px, 1024px, 390px
- [ ] Focus visible on every interactive element (Tab test)
- [ ] Contrast passes axe-core automated scan
- [ ] `prefers-reduced-motion` disables Framer Motion animations
- [ ] Hindi language toggle swaps `lang` attribute and content
- [ ] Header height constant 64px, sidebar 280px/0px
- [ ] KPI cards asymmetric layout renders correctly
- [ ] Status badges use only 4 semantic colors