---
name: AI Receptionist — VoDuong
description: Bold, efficient taekwondo academy management system with mobile-first design and committed red identity.
colors:
  primary: "#e02020"
  primary-light: "#ff6464"
  primary-dark: "#7b0000"
  secondary: "#1a1a2e"
  secondary-light: "#2d2d7a"
  secondary-dark: "#0e0e1e"
  neutral-bg: "#f4f6fa"
  surface: "#ffffff"
  ink: "#111827"
  ink-secondary: "#4b5563"
  muted: "#6b7280"
  border: "#f0f0f5"
  success: "#10b981"
  warning: "#f59e0b"
  error: "#ef4444"
  info: "#3b82f6"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.3rem, 1.15rem + 0.75vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 1.05rem + 0.5vw, 1.25rem)"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem)"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  mono:
    fontFamily: "Fira Code, Cascadia Code, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-light}"
  button-secondary:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  card-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
---

# Design System: AI Receptionist — VoDuong

## 1. Overview

**Creative North Star: "The Dojang Control Room"**

A mobile-first management system built for the physical intensity of taekwondo training. The interface is where coaches, managers, students, and parents converge on operational reality — attendance records, class schedules, tuition status, training scores — all delivered with the decisiveness and clarity the sport demands. Dense information screens are a feature, not a flaw: every pixel earns its place because the user is between classes, on the gym floor, or checking data between tasks.

The red brand color carries committed presence across the surface — not decoration, but a functional identity signal. Active navigation, critical actions, belt badges, and status indicators all wear the brand red. The deep navy anchors chrome, headers, and the sidebar, creating a professional weight that keeps the interface grounded. Light backgrounds provide the reading canvas. High contrast between ink and surface is non-negotiable: this is a tool, not a mood board.

Motion is responsive — press effects, state transitions, smooth sheet-to-modal adaptation between mobile and desktop — never choreographed spectacle. Animations serve feedback, not decoration. Reduced motion alternatives are mandatory.

**Key Characteristics:**
- Mobile-native with confident desktop adaptation
- Committed red identity (30–60% surface presence via nav, accents, status)
- Dense, scannable data screens for operational efficiency
- Tactile component interactions (press feedback, clear state changes)
- Vietnamese-first: all UI language and accessibility labels in Vietnamese

## 2. Colors: The Academy Palette

A committed red-and-navy identity system. Red is the voice of the brand — present in navigation, actions, and status signals throughout. Navy provides structural weight. Neutral grays keep the reading canvas clean and high-contrast. Status colors follow traffic-light logic with a blue/violet extension for attendance states.

### Primary

- **Fighting Red** (`#e02020`): The brand's heartbeat. Used on primary buttons, active navigation items, selected states, belt badges, critical status indicators, and any moment requiring decisive user attention. This color carries 30–60% of visual identity across any given screen — its presence is deliberate and functional, not decorative.
- **Signal Red** (`#ff6464`): Hover and active states of primary elements. Provides clear interactive feedback that the user has engaged.
- **Deep Crimson** (`#7b0000`): Pressed states, disabled-primary tints, gradient endpoints. The weight that confirms an action is committed.

### Secondary

- **Midnight Navy** (`#1a1a2e`): Structural chrome — sidebar background, header surfaces, dark containers, and brand gradients. Provides professional gravity that keeps the interface anchored and serious.
- **Indigo Steel** (`#2d2d7a`): Navy hover states, gradient midpoints, secondary surface accents.
- **Void Black** (`#0e0e1e`): Deepest surfaces, sidebar collapsed background, gradient endpoints.

### Neutral

- **Academy White** (`#f4f6fa`): Page background. Cool-tinted to sit cleanly against the navy sidebar without feeling sterile.
- **Canvas White** (`#ffffff`): Card surfaces, input fields, modal panels. Pure white for maximum reading contrast.
- **Ink Black** (`#111827`): Primary text. WCAG AAA against white — no contrast guessing.
- **Slate** (`#4b5563`): Secondary text, descriptions, supporting labels.
- **Muted Gray** (`#6b7280`): Placeholder text, disabled labels, timestamp metadata. Still maintains 4.5:1+ contrast against white.
- **Hairline** (`#f0f0f5`): Borders, dividers, card edges. Visible without competing with content.

### Status

- **Present Green** (`#10b981`): Attendance confirmed, payment success, positive states.
- **Absent Red** (`#ef4444`): Missed sessions, payment overdue, error states.
- **Late Amber** (`#f59e0b`): Tardiness, pending attention, caution signals.
- **Excused Blue** (`#3b82f6`): Pre-approved absence, informational states.
- **Pending Violet** (`#8b5cf6`): Awaiting confirmation, processing states.

### Named Rules

**The Committed Red Rule.** The primary red appears on 30–60% of any given screen through navigation, active states, badges, and status indicators. Its breadth is intentional — this is a brand identity system, not a restrained accent. But it never appears on reading surfaces or body text.

**The No-Faint-Gray Rule.** Any gray text on a tinted or colored surface must use a darker shade of that surface's own hue, or a white transparency. Gray on colored backgrounds is prohibited — it reads as washed-out and unreadable.

## 3. Typography

**Display Font:** Inter (with system-ui, sans-serif fallback)
**Body Font:** Inter (same stack — single-family system)
**Mono Font:** Fira Code (with Cascadia Code fallback)

A single-family system using Inter across all weights. The weight and scale differences provide the hierarchy — there's no contrast-axis pairing because the interface doesn't need editorial warmth. Inter's clean geometric structure matches the athletic, efficient personality: sharp, legible at small sizes, and confident at large sizes. Poppins is available as a secondary weight but Inter leads.

### Hierarchy

- **Display** (700 weight, `clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem)`, 1.2 line-height): Page titles, hero sections, major data headings. Maximum display size — nothing larger. Appears primarily on dashboard headers and key summary screens.
- **Headline** (600 weight, `clamp(1.3rem, 1.15rem + 0.75vw, 1.5rem)`, 1.3 line-height): Section titles, card headings, tab labels. The workhorse heading size for most content areas.
- **Title** (600 weight, `clamp(1.15rem, 1.05rem + 0.5vw, 1.25rem)`, 1.4 line-height): Subsection titles, modal headers, list group headings.
- **Body** (400 weight, `clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)`, 1.6 line-height): All readable content, descriptions, table data, form labels. Minimum 15px on mobile to prevent iOS Safari auto-zoom. Line length capped at 75ch.
- **Label** (500 weight, `clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem)`, 1.5 line-height): Badges, tags, status chips, metadata, timestamps, captions. The smallest text size — never used for body content.

### Named Rules

**The 15px Floor Rule.** All form inputs use `$text-base` (minimum 15px) to prevent iOS Safari auto-zoom on focus. No input field may use `$text-sm` or smaller.

**The Fluid Scale Rule.** All text uses `clamp()` for fluid scaling — no breakpoint jumps. Typography scales smoothly from 375px to 1536px. Never use fixed px values for text sizes.

## 4. Elevation

Ambient layered depth with seven shadow levels. Cards and containers carry a persistent subtle shadow at rest, gaining clarity on hover. Elevation increases with interaction significance — dropdowns, modals, and toasts stack progressively higher. Brand-colored glows (red, green, blue) add semantic weight to interactive elements.

### Shadow Vocabulary

- **Whisper** (`0 1px 2px rgba(0, 0, 0, 0.05)`): Disabled states, static labels, inert surfaces.
- **Rest** (`0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)`): Cards at rest, input fields, list items. The default ambient state.
- **Lift** (`0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)`): Hovered cards, focused inputs, elevated containers.
- **Float** (`0 10px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)`): Dropdowns, popovers, expanded panels.
- **Raise** (`0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.08)`): Modals, bottom sheets, overlay panels.
- **Peak** (`0 32px 64px rgba(0, 0, 0, 0.2)`): Critical modals, confirmation dialogs.
- **Inner** (`inset 0 2px 4px rgba(0, 0, 0, 0.06)`): Pressed states, inset fields.

### Brand Glows

- **Brand Glow** (`0 4px 16px rgba(224, 32, 32, 0.3)`): Primary buttons, active navigation items.
- **Success Glow** (`0 4px 16px rgba(16, 185, 129, 0.25)`): Success confirmations, positive actions.
- **Error Glow** (`0 4px 16px rgba(239, 68, 68, 0.25)`): Destructive actions, error highlights.
- **Info Glow** (`0 4px 16px rgba(59, 130, 246, 0.25)`): Informational tooltips, help elements.

### Named Rules

**The No Ghost-Card Rule.** Never combine a 1px solid border with a shadow that has 16px+ blur on the same element. Pick one: a defined border, OR a clean shadow at 12px blur or less. The 1px border + wide soft shadow is the hallmark of generic UI kits.

**The No 999 Rule.** Z-index values follow a semantic scale (10 → 100 → 200 → 300 → 400 → 500 → 600). Arbitrary high values (999, 9999) are prohibited.

## 5. Components

### Buttons

Tactile and confident. Clear press feedback, defined edges, satisfying state transitions.

- **Shape:** Gently curved (12px radius).
- **Primary:** Brand red background (`#e02020`), white text, 12px 24px padding. Brand glow on hover, lift shadow on focus. Scale 0.98 on active (press effect).
- **Secondary:** Neutral background (`#f4f6fa`), ink text, subtle border. Lift shadow on hover.
- **Ghost:** Transparent background, ink text. Neutral background appears on hover (`$gray-50`).
- **Minimum touch target:** 48px height on all button sizes. Non-negotiable for mobile.

### Chips / Badges

- **Style:** Pill shape (`9999px` radius), compact padding (4px 12px). Background color varies by context — uses CSS custom properties for runtime belt color injection.
- **Belt Badges:** Dynamic color system — 20+ belt tiers with unique bg/text/border colors injected via `style` prop with CSS custom properties. The badge component is a rendering shell.
- **Status Badges:** Fixed semantic colors (success green, error red, warning amber, info blue, pending violet). Light tinted backgrounds with matching text.

### Cards / Containers

- **Corner Style:** Gently curved (16px radius).
- **Background:** Canvas white (`#ffffff`).
- **Shadow Strategy:** Rest shadow at default, lift shadow on hover. No border + shadow combination (No Ghost-Card Rule).
- **Border:** Hairline (`#f0f0f5`) when shadow is absent (rare).
- **Internal Padding:** 24px default.
- **Press Effect:** Scale 0.98 on active state with 150ms transition. Cards feel physical, not flat.

### Inputs / Fields

- **Style:** Canvas white background, hairline border (`$border-subtle`), 12px radius. 16px vertical padding.
- **Focus:** Brand glow shadow + border color shift to brand red. Clear visual signal that the field is active.
- **Error:** Error border color + error-colored glow. Error message below field in muted red.
- **Placeholder text:** Muted gray (`$gray-500`) at 15px minimum — contrast must hit 4.5:1 against white.

### Navigation (Sidebar)

- **Desktop:** Static flex child (260px), midnight navy background. Collapsible to icon-only (80px). Active item highlighted with brand red + brand glow.
- **Mobile:** Fixed drawer (280px) with slide-in animation, semi-transparent backdrop. Full nav with icon + label visible.
- **Typography:** White text, medium weight. Active items use brand red background. Hover: subtle background shift.
- **Profile Switcher:** Multi-profile support — dropdown allows switching between roles (manager, coach, parent) within the sidebar.

### Bottom Sheet / Modal (Signature Component)

The signature responsive component. Automatically adapts between mobile and desktop:

- **Mobile:** Bottom sheet with drag handle, slides up from bottom, 24px top radius, full-width, backdrop overlay.
- **Desktop:** Centered dialog, 16px uniform radius, fixed width, fade-in backdrop.
- **Adaptation point:** 768px breakpoint.
- **Body scroll lock:** Active when sheet/modal is open.

### Attendance Status System (Signature Component)

A domain-specific component unique to this product. Maps five attendance states to a complete visual system:

- **Present** (green `#10b981`): Confirmed check-in. Green badge, green tint background.
- **Absent** (red `#ef4444`): Missed session. Red badge, red tint background.
- **Late** (amber `#f59e0b`): Tardiness. Amber badge, amber tint background.
- **Excused** (blue `#3b82f6`): Pre-approved absence. Blue badge, blue tint background.
- **Pending** (violet `#8b5cf6`): Awaiting confirmation. Violet badge, violet tint background.

Each state has badge, background tint, icon, and descriptive label — a complete visual language for attendance management.

## 6. Do's and Don'ts

### Do:

- **Do** maintain 4.5:1 contrast minimum for all body text against its background. Ink black (`#111827`) on canvas white is the safe default. Verify muted gray (`#6b7280`) hits 4.5:1 on every background it appears on.
- **Do** use fluid typography via `clamp()` for all text sizes. No breakpoint-based font-size jumps.
- **Do** enforce 48px minimum touch targets on all interactive elements. Use the `touch-target` mixin.
- **Do** use the brand red (`#e02020`) with committed presence — active nav, selected states, primary actions, status indicators. Its breadth is intentional.
- **Do** provide `@media (prefers-reduced-motion: reduce)` alternatives for all animations. Crossfade or instant transition, never no-animation-that-leaves-content-invisible.
- **Do** use Vietnamese for all UI strings, labels, error messages, and screen reader text. This is a Vietnamese-first product.
- **Do** use the semantic z-index scale (10 → 100 → 200 → 300 → 400 → 500 → 600). Every elevation level has a defined purpose.

### Don't:

- **Don't** use extreme bubbly shapes (`border-radius: 32px+`) on cards, sections, or inputs. 16px is the card ceiling; 24px is the absolute max for containers. Pill radius is reserved for badges and buttons only.
- **Don't** combine 1px borders with wide soft shadows (16px+ blur) on the same element. Pick one visual separation method (No Ghost-Card Rule).
- **Don't** use soft pastel palettes, kindergarten aesthetics, or overly playful illustrations. This is a martial arts academy management system — the personality is bold and athletic, not cute and friendly.
- **Don't** pad data tables, student lists, or schedules excessively. Information density is a feature. Users need to scan data at a glance, not scroll through whitespace.
- **Don't** use dark-mode-with-neon or fitness app aesthetics (glowing accents on dark backgrounds). The navy (`#1a1a2e`) is structural chrome, not a neon canvas.
- **Don't** use form inputs smaller than 15px (`$text-base`). iOS Safari will auto-zoom on focus, breaking the mobile workflow.
- **Don't** use arbitrary z-index values (999, 9999). Follow the semantic scale.
- **Don't** use gray text on colored/tinted backgrounds. Use a darker shade of the background's hue, or white with transparency.
- **Don't** add gradient text (`background-clip: text` with gradients). Use solid colors with weight/size for emphasis.
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards or list items. This is prohibited without exception.
