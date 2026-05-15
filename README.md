# AI Receptionist — Taekwondo Academy Management System

> **Frontend application** built with React 19, TypeScript, Vite 7, TailwindCSS 4, and a fully mobile-first SCSS design system. Powers multi-branch martial arts academy operations including AI-powered face recognition check-in, attendance tracking, class scheduling, belt progression management, and tuition processing.

---

## Table of Contents

1. [Project Overview & Business Value](#1-project-overview--business-value)
2. [Core Architectural Principles](#2-core-architectural-principles)
3. [Feature & Module Walkthrough](#3-feature--module-walkthrough)
4. [Advanced Engineering Patterns](#4-advanced-engineering-patterns)
5. [Flow Diagrams & Lifecycle Algorithms](#5-flow-diagrams--lifecycle-algorithms)
6. [Development, Build & Tooling](#6-development-build--tooling)

---

## 1. Project Overview & Business Value

### The Problem

Martial arts academies — particularly Taekwondo dojangs — manage hundreds of students across multiple branches with complex scheduling matrices, multi-tier belt progressions, and real-time attendance requirements. Instructors spend training sessions on the floor, not behind a desk. Paper-based systems and legacy desktop tools fail the fundamental constraint: **the management interface must be usable one-handed on a phone from the training mat.**

### The Solution

AI Receptionist is a comprehensive, mobile-first web application that puts the entire academy management workflow into instructors' pockets:

- **AI Check-In**: Face recognition (MediaPipe) and QR code scanning to register attendance in under 2 seconds — no clipboard required.
- **Real-Time Attendance Dashboard**: Live session monitoring with status transitions (Scheduled → Active → Completed), countdown badges, and per-session note editing.
- **Class & Schedule Management**: Weekly timetable views with branch-level filtering, dynamic class creation, and session lifecycle dispatching.
- **Student Lifecycle**: Enrollment, transfer, dropout, and re-enrollment tracking with full attendance history per student.
- **Belt Progression & Fitness Standards**: Visual belt badge system (20+ tiers from White to Black Dan), fitness testing scorecards, and trend analytics.
- **Tuition Processing**: Fee tracking, payment status monitoring, and overdue alerts.

### User Personas

| Persona | Permissions | Primary Screens |
|---------|------------|-----------------|
| **Admin / Senior Manager** | Full system access: dashboard, coach management, all branches | Dashboard, coach roster, cross-branch analytics |
| **Head Coach / Coach** | Student management, schedules, attendance, AI check-in, session creation | Class schedules, attendance tracker, AI check-in scanner |
| **Student / Parent** | Personal profile page with attendance history, scores, enrolled classes | Personal page (`/:userCode`) — read-only tabs |

Role-based access is enforced at the route level via `RequireRole` wrapper components, with permission tiers checked through the `useRoleStudent` hook. Auth state (including multi-profile role switching) is persisted via Zustand.

### Architecture at a Glance

```
src/
├── components/          # Shared UI (Avatar, Header, Sidebar, Modal, etc.)
│   └── ui/              # Radix UI primitives + custom composites
├── features/            # Domain modules (layered architecture)
│   ├── auth/
│   ├── classSchedule/
│   ├── classSession/
│   ├── coach/
│   ├── student/
│   ├── studentAttendance/
│   ├── studentEnrollment/
│   └── tuitionPayment/
├── hooks/               # Shared React hooks (navigation, CRUD mutations)
├── layouts/             # Page-level layout shells (BaseModalLayout, etc.)
├── pages/               # Route-level page components
├── store/               # Zustand auth store (persist middleware)
├── styles/              # Global SCSS tokens, mixins, variables
│   ├── _variables.scss  # Design token system (colors, spacing, typography, shadows)
│   └── _mixins.scss     # Mobile-first responsive mixins
└── types/               # TypeScript type definitions
```

---

## 2. Core Architectural Principles

This project recently completed a comprehensive mobile-first SCSS refactoring (7 batches, 30+ component files, 1,500+ SCSS lines). The following engineering rules are enforced across the entire codebase.

### 2.1 Strict Touch Target Ergonomics

Every interactive element — buttons, action triggers, navigation anchors, list items — must meet minimum physical tap dimensions to be usable on touchscreens without accidental mis-taps.

**Implementation via three complementary mixins:**

```scss
// Minimum 48px interactive boundary (Android guideline / WCAG 2.5.8)
@include touch-target(48px);  // → min-width: 48px; min-height: 48px

// Physical press feedback — scale-down on touch to simulate haptic response
@include press-effect(0.98);  // → &:active { transform: scale(0.98) }

// Desktop-only hover — prevents sticky hover states on touch devices
@include hover-only {         // → @media (hover: hover) and (pointer: fine) { &:hover { ... } }
  background: $gray-50;
  box-shadow: $shadow-md;
}
```

**Why all three together:** On a mobile device, `touch-target` ensures the element is physically large enough to tap. `press-effect` provides immediate visual confirmation of the tap. `hover-only` prevents the critical UX bug where a tap causes a `:hover` state to "stick" until another element is touched — a problem especially severe with `box-shadow` and `background-color` changes that make elements appear permanently focused.

**Pattern applied to:** All `.btn`, `.addBtn`, `.deleteBtn`, `.paginationBtn`, `.menuBtn`, `.saveBtn`, `.todayBtn`, `.viewToggleBtn` elements across the codebase (13+ instances of touch-target alone in the class management module).

### 2.2 Fluid Typography & Spatial Scaling

The UI must render correctly on viewports ranging from 320px (iPhone SE) to 2560px (ultra-wide desktop) without breakpoint-driven font-size jumps. All text and spacing scales continuously via `clamp()`.

**Typography scale** (`src/styles/_variables.scss`):

| Token | Range | Use Case |
|-------|-------|----------|
| `$text-xs` | `clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem)` | 11–12px — badges, meta labels, table cells |
| `$text-sm` | `clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem)` | 12.8–14px — body text, list items |
| `$text-base` | `clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)` | 15–16px — form inputs, primary labels |
| `$text-lg` | `clamp(1.05rem, 1rem + 0.3vw, 1.125rem)` | 16.8–18px — page headings |
| `$text-xl` | `clamp(1.15rem, 1.05rem + 0.5vw, 1.25rem)` | 18.4–20px — section headings |
| `$text-2xl` | `clamp(1.3rem, 1.15rem + 0.75vw, 1.5rem)` | 20.8–24px — hero titles |
| `$text-3xl` | `clamp(1.5rem, 1.3rem + 1vw, 1.875rem)` | 24–30px — display headings |

**Spatial scale** (4px base unit): `$space-1` (4px) through `$space-20` (80px), providing a consistent rhythm grid.

**Color tokens** are organized semantically: `$brand-red-*` (primary), `$brand-dark-*` (dark surfaces), `$success-*`, `$warning-*`, `$error-*`, `$info-*`, `$text-*` (text hierarchy), `$bg-*` (surfaces), `$border-*` (borders), `$shadow-*` (elevations).

### 2.3 The iOS Safari Anti-Zoom Mechanism

iOS Safari automatically zooms the page when a user focuses on an `<input>` or `<select>` with a computed `font-size` below 16px. This destroys layout context on mobile and requires a pinch-zoom-out after every field interaction.

**Rule:** All form controls (`input`, `select`, `textarea`) must use `$text-base` (minimum 15px, scaling to 16px at most viewports) as their font-size.

```scss
.createClassModal__field {
  input, select {
    font-size: $text-base;  // clamp(0.9375rem, 0.9rem + 0.2vw, 1rem) — blocks iOS zoom
    height: 40px;          // Comfortable height for 16px text
  }
}
```

**Applied to:** `CreateClassScheduleModal` (9 form fields), `CreateSessionModal` (5 form fields), and all future form components.

### 2.4 Responsive Stacking & Grid Inversion

All grids use mobile-first single-column layout by default, expanding to multi-column at breakpoint thresholds.

```scss
.cardsGrid {
  display: grid;
  grid-template-columns: 1fr;  // Mobile: single column, scroll-safe

  @include respond-to(sm) { grid-template-columns: repeat(2, 1fr); }  // Tablet
  @include respond-to(xl) { grid-template-columns: repeat(3, 1fr); }  // Desktop
}
```

**Breakpoint tokens** (mobile-first, `min-width`):

| Token | Width | Target |
|-------|-------|--------|
| `$xs` | 375px | Small phones |
| `$sm` | 640px | Large phones / landscape |
| `$md` | 768px | Tablets / small laptops |
| `$lg` | 1024px | Laptops / desktops |
| `$xl` | 1280px | Wide desktops |
| `$xxl` | 1536px | Ultra-wide |

**Mixin usage:** `@include respond-to(md) { ... }` compiles to `@media (min-width: 768px) { ... }`. A companion `@include below(sm) { ... }` is available for max-width overrides during migration.

### 2.5 Modal Bottom Sheet Pattern

All modals use a shared `ModalLayout` component (`src/components/ui/modal-layout.tsx`) that renders as a **slide-up bottom sheet on mobile** and a **centered dialog card on desktop**:

```
Mobile (default):
┌─────────────────────────┐
│         overlay          │  ← backdrop blur + dim
│                         │
│ ════════════════════════ │  ← drag handle (mobile only)
│ ┌─────────────────────┐ │
│ │     Modal Content   │ │  ← scrollable body
│ │                     │ │
│ │   [Safe Area Pad]   │ │  ← @include safe-bottom
│ └─────────────────────┘ │
└─────────────────────────┘

Desktop (md+):
┌─────────────────────────┐
│         overlay          │
│     ┌───────────┐       │
│     │  Modal    │       │  ← centered with max-width
│     │  Content  │       │
│     └───────────┘       │
└─────────────────────────┘
```

Key behaviors:
- **Body scroll lock**: `document.body.style.overflow = "hidden"` applied when open, restored on unmount.
- **Safe area insets**: `@include safe-bottom()` adds padding for home indicator / notch devices.
- **Escape key**: Closes modal on `Escape` press.
- **Backdrop click**: Closes when clicking the overlay background (configurable).
- **Animation**: `sheetIn` keyframe (translateY 100% → 0) on mobile, `modalIn` (fade + scale) on desktop.

### 2.6 Data Density & Scroll Safety

Wide data structures (attendance tables, weekly schedule grids, enrollment lists) must be horizontally scrollable on narrow viewports without breaking the parent layout:

```scss
.scrollable-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;  // Momentum scrolling on iOS
}
```

Combined with `min-width` constraints on child elements, this ensures tables retain their readable column structure while allowing users to swipe horizontally to view all data.

---

## 3. Feature & Module Walkthrough

### 3.1 Authentication & Shell Layout

**Files:** `src/features/auth/`, `src/components/Sidebar/`, `src/components/Header/`

- Multi-role login supporting Admin, Coach, and Student profiles with session persistence via Zustand + httpOnly cookie refresh tokens.
- Global sidebar navigation collapses to icon-only mode on mobile (`@include respond-to(lg)`).
- Header includes notification bell (Firebase Cloud Messaging push), user avatar, and role switcher.
- `RequireRole` route guards redirect unauthorized users before component mount.

### 3.2 AI Check-In & Core Attendance Tracker

**Files:** `src/pages/AICheckIn/`, `src/features/classSession/`

- **Face Recognition Pipeline**: MediaPipe `@mediapipe/tasks-vision` processes camera frames for face matching against registered student profiles via the Python AI backend.
- **QR Code Scanner**: `@yudiel/react-qr-scanner` provides an alternative check-in method for students with generated QR codes.
- **Session Layout**: A scrollable list of upcoming sessions with status transition workflows:
  - `SCHEDULED → ACTIVE → COMPLETED` (normal flow)
  - `SCHEDULED → CANCELLED / POSTPONED` (exception flow)
  - Each transition requires optional note input (mandatory for cancellation/postponement).
- **Real-Time Updates**: WebSocket connection (`useClassSessionWebSocket`) pushes session status changes live to all connected clients.
- **Inline Note Editing**: Double-click the note section in any session card to toggle an inline textarea editor — no modal required.

### 3.3 Attendance Reports Ecosystem

**Files:** `src/features/studentAttendance/`, `src/pages/AttendancePage/`

- **AttendanceTable**: Horizontally scrollable data grid displaying per-student attendance records with status badges (Present, Absent, Late, Excused, Pending).
- **Evaluation Sheet** (`EvalSheet`): Quick-evaluation interface for per-session performance scoring.
- **Stat Cards**: `TrendCard`, `AttendancePieChart` components powered by Recharts for visual analytics.
- **Filters**: Date range selectors, class-level filters, and status-based attendance filtering.

### 3.4 Student Management & Enrollment Subsystem

**Files:** `src/features/student/`, `src/features/studentEnrollment/`

- **Student Search**: Full-text search across student names, codes, and phone numbers.
- **Student Detail Modal**: Comprehensive student profile editor rendered as a mobile bottom sheet with tabbed content (personal info, class history, attendance stats).
- **Enrollment Queue**: Drag-and-drop (or modal-based) assignment of students to active classes with status tracking (Active, Reserved, Transferred, Dropped).
- **Stat Grid Aggregators**: Dashboard cards showing total enrolled, active, reserved, and dropout counts per class.

### 3.5 Personal Profile Page

**Files:** `src/pages/PersonalPage/`, `src/pages/PersonalPage/components/`

A multi-tab hub accessible to all authenticated users at `/:userCode`:

- **Profile Header**: Responsive avatar + cover photo scaled via `$text-*` fluid tokens. Name and role badge truncate gracefully on narrow viewports.
- **Tab Navigation**: Horizontally scrollable tab bar (`ScheduleAssignments`, `Attendance`, `Scores`, etc.).
- **Schedule Assignments Tab** (`ScheduleAssignments.scss`): Displays all classes a student is enrolled in or assigned to, with meta-item grids showing branch, level, location, shift, and time for each class.
- **Session Layout Tab**: Reuses the same `SessionLayout` component as the admin view, providing session status tracking from the student's perspective.

### 3.6 Class & Schedule Management

**Files:** `src/features/classSchedule/`, `src/features/classSession/`, `src/pages/ClassSchedules/`

- **Grid View** (`ClassCard` + `ClassGrid`): Cards display class details (weekday, time, location, coach, capacity bar, level/status badges) in a responsive grid (1-col → 2-col → 3-col). Each card has a context menu for status changes and session creation.
- **Week View** (`ClassWeekView` + `ClassWeekItem`): Day-selector-based weekly timetable with time blocks, class info, and meta rows. Items wrap gracefully on narrow screens.
- **Create Class Modal** (`CreateClassScheduleModal`): Form with 9+ fields, auto-generated schedule ID, duplicate detection, and responsive grid layout (single column on mobile → 3-col compact on desktop).
- **Session Management** (`UpcomingSessionsModal`): Split-panel layout — session list on the left, create-session form on the right — stacks vertically on mobile.
- **Branch Filtering**: Dynamic branch-grouped class display with per-branch card grids.

---

## 4. Advanced Engineering Patterns

### 4.1 CSS Custom Properties via React State Mapping

Highly dynamic, data-driven components use a **configuration-in-JS, rendering-in-SCSS** pattern to maintain perfect style encapsulation while supporting runtime data variability.

**Example: BeltBadge Component** (20+ belt tiers)

The belt color map is maintained as a pure TypeScript configuration. Colors are injected via inline `style` props using CSS custom properties:

```tsx
const BELT_COLORS: Record<BeltTier, { bg: string; color: string }> = {
  WHITE:       { bg: "#FFFFFF", color: "#374151" },
  YELLOW:      { bg: "#FEF9C3", color: "#854D0E" },
  GREEN:       { bg: "#DCFCE7", color: "#166534" },
  BLUE:        { bg: "#DBEAFE", color: "#1E40AF" },
  RED:         { bg: "#FEE2E2", color: "#991B1B" },
  BLACK:       { bg: "#1F2937", color: "#F9FAFB" },
  BLACK_DAN_1: { bg: "#1F2937", color: "#F9FAFB" },
  // ... 14 more tiers
};

export function BeltBadge({ tier }: { tier: BeltTier }) {
  const { bg, color } = BELT_COLORS[tier] ?? DEFAULT_BELT_STYLE;
  return (
    <span
      className={styles.badge}
      style={{ "--belt-bg": bg, "--belt-color": color } as React.CSSProperties}
    >
      {BeltTierLabel[tier]}
    </span>
  );
}
```

The SCSS module consumes these custom properties:

```scss
.badge {
  background: var(--belt-bg);
  color: var(--belt-color);
  border-radius: $radius-full;
  font-size: $text-xs;
  font-weight: $font-bold;
}
```

**Why this pattern:**
- The color map lives in TypeScript (type-safe, lintable, refactorable with IDE tooling).
- The SCSS module stays clean — no 20+ class name permutations.
- Custom properties provide zero specificity issues (they cascade naturally).
- Adding a new belt tier requires only a config entry — zero SCSS changes.

The same pattern is used for `LevelBadge` (14 schedule levels), `StatusBadge` (6 session statuses), and dynamic status-dependent UI elements throughout the codebase.

### 4.2 BEM to SCSS Module Migration

The codebase migrated from legacy global BEM classes (`.schedule-assignments__item-card`) to localized SCSS Modules with compile-time class name hashing.

**Before (global BEM):**
```scss
// ScheduleAssignments.scss — globally scoped, name collision risk
.schedule-assignments__item-card {
  border-left: 4px solid #e02020;
}
```

**After (SCSS Module):**
```scss
// ClassCard.module.scss — locally scoped, zero leakage
.classCard {
  border: 1px solid $border-subtle;
}
```

**TypeScript consumption:**
```tsx
import styles from "./ClassCard.module.scss";
<div className={styles.classCard}>...</div>
// Compiles to: <div class="ClassCard_module_classCard__abc123">
```

**Benefits:**
- **Zero style leakage**: Each component's styles are scoped by a hash suffix, preventing accidental cross-component interference.
- **Dead code elimination**: Unused CSS is automatically tree-shaken during production builds because unused class names are never referenced.
- **Co-location**: Component styles live alongside their JSX, making the relationship explicit and enabling safe parallel development.

Components that maintain global BEM naming (like `ScheduleAssignments.scss` using `.schedule-assignments__*`) are legacy patterns that are incrementally migrated to the module pattern.

### 4.3 Dual Backend Architecture

Two Axios instances in `src/lib/axiosInstance.ts` serve different backend concerns:

| Instance | Backend | Timeout | Purpose |
|---------|---------|---------|---------|
| `javaApi` | Java Spring Boot | 15s | CRUD operations: students, classes, schedules, attendance, tuition |
| `pythonApi` | Python FastAPI | 30s | AI/ML services: face recognition, text-to-speech |

Both share interceptor middleware:
1. **Auto-attach Bearer token** from Zustand auth store on every request.
2. **401 refresh**: On unauthorized response, queue the failed request, refresh the token via httpOnly cookie, then replay the queue.
3. **Exponential retry**: On 5xx, 429, or network errors, retry with backoff (3 attempts max).

### 4.4 Vendor Chunk Splitting

The Vite production build splits third-party dependencies into optimized chunks:

| Chunk | Contents | Benefit |
|-------|----------|--------|
| `react-vendor` | React, ReactDOM, React Router | Rarely changes — maximizes cache hit rate |
| `radix-vendor` | All @radix-ui packages | UI primitives bundled separately from business logic |
| `data-vendor` | TanStack Query, Axios, date-fns | Data layer isolated for independent cache invalidation |
| `chart-vendor` | Recharts | Heavy chart library loaded only when analytics pages render |
| `ai-vendor` | MediaPipe tasks-vision | Loaded on-demand for AI check-in pages only |
| `ui-vendor` | Lucide React icons | Icon bundle split for optimal icon sprite caching |

---

## 5. Flow Diagrams & Lifecycle Algorithms

### 5.1 The Real-Time Check-In Flow

```
┌──────────┐    ┌──────────────┐    ┌───────────────┐    ┌────────────────┐    ┌──────────────┐
│  Camera  │───▶│  Frame       │───▶│  MediaPipe   │───▶│  Python AI    │───▶│  Status      │
│  Stream  │    │  Capture     │    │  Face Detect  │    │  Verification │    │  Badge Paint │
│          │    │  (30fps)      │    │  (embedding)  │    │  (match DB)   │    │  (green ✓)   │
└──────────┘    └──────────────┘    └───────────────┘    └────────────────┘    └──────────────┘
                                        │                      │
                                        │  No Match            │  Match
                                        ▼                      ▼
                                 ┌──────────────┐    ┌────────────────┐
                                 │  "Unknown"   │    │  Session      │
                                 │  Badge (gray) │    │  Queue Update │
                                 └──────────────┘    │  (WebSocket)   │
                                                     └────────────────┘
```

**Step-by-step:**

1. **Input capture** — Camera stream initialized via `navigator.mediaDevices.getUserMedia()`. Frames captured at ~30fps.
2. **Processing state toggle** — `isProcessing` state set to `true`, rendering a "scanning" overlay animation on the UI.
3. **Face embedding extraction** — MediaPipe `FaceDetector` processes each frame, producing a face embedding vector.
4. **Verification lookup** — Embedding sent to Python backend (`POST /api/face/verify`), compared against registered student embeddings using cosine similarity.
5. **Status badge injection** — On match: student found → session status painted to `PRESENT` (green badge). On no match: "Unknown face" indicator displayed.
6. **Queue update** — WebSocket pushes the attendance event to all connected clients. Session list and stat cards re-render via TanStack Query cache invalidation.

**Alternative path — QR Code:** `@yudiel/react-qr-scanner` scans a student's QR code → decodes schedule ID → directly calls attendance API (skips face matching entirely).

### 5.2 The Bottom Sheet Lifecycle

```
Trigger Event
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  1. RENDER PHASE                                             │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  createPortal(                                          │     │
│  │    <div className="overlay">   ← position: fixed     │     │
│  │      <section className="dialog">                      │     │
│  │        <div className="handle">  ← drag bar (md: none) │     │
│  │        <div className="surface">                       │     │
│  │          <header>Title + Close</header>                │     │
│  │          <div className="body">{children}</div>        │     │
│  │          <footer>{actions}</footer>                     │     │
│  │        </div>                                          │     │
│  │      </section>                                         │     │
│  │    </div>                                               │     │
│  │  )                                                      │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                             │
│  2. LAYOUT PHASE (CSS)                                     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  .overlay:                                               │     │
│  │    position: fixed; inset: 0; z-index: $z-modal;      │     │
│  │    background: $bg-overlay;                             │     │
│  │    backdrop-filter: blur(2px);                          │     │
│  │    display: flex;                                       │     │
│  │    align-items: flex-end;     ← MOBILE: bottom sheet  │     │
│  │                                                         │     │
│  │    @include respond-to(md) {                           │     │
│  │      align-items: center;     ← DESKTOP: centered     │     │
│  │      justify-content: center;                          │     │
│  │      padding: $space-6;                                │     │
│  │    }                                                    │     │
│  │                                                         │     │
│  │  .dialog:                                               │     │
│  │    border-radius: $radius-2xl $radius-2xl 0 0;          │     │
│  │    @include safe-bottom($space-1);                      │     │
│  │    animation: sheetIn 220ms;                             │     │
│  │                                                         │     │
│  │    @include respond-to(md) {                           │     │
│  │      border-radius: $radius-lg;                          │     │
│  │      animation: modalIn 220ms;                           │     │
│  │    }                                                    │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                             │
│  3. SIDE EFFECT PHASE (React useEffect)                     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  useEffect(() => {                                     │     │
│  │    const prev = document.body.style.overflow;          │     │
│  │    document.body.style.overflow = "hidden";  ← LOCK    │     │
│  │    return () => { body.style.overflow = prev; } ← RESTORE│     │
│  │  }, [open]);                                            │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

**Keyframes:**

```scss
@keyframes sheetIn {
  from { opacity: 0; transform: translateY(100%); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

**Body scroll lock** is the critical UX safeguard — without it, the background page scrolls when the user touches inside the modal's scrollable body, creating a disorienting dual-scroll experience on iOS Safari.

---

## 6. Development, Build & Tooling

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Scripts

```bash
npm run dev       # Start Vite dev server with HMR (default: http://localhost:5173)
npm run build     # TypeScript type-check (tsc -b) → Vite production build
npm run lint      # ESLint (flat config: TypeScript + React Hooks + React Refresh)
npm run preview   # Serve the production build locally for final review
```

### Quality Gate

```bash
npx tsc -b --noEmit   # Static type analysis across 2,000+ modules
```

This is the authoritative compilation check. All 2,000+ TypeScript and SCSS modules must pass with zero errors before any commit. The `npm run build` command runs this as its first step.

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 |
| **Language** | TypeScript 5 (strict mode) |
| **Build** | Vite 7 with Rolldown |
| **Styling** | TailwindCSS 4 + SCSS (global tokens + CSS Modules) |
| **State (Client)** | Zustand with `persist` middleware |
| **State (Server)** | TanStack Query v5 (caching, mutations, optimistic updates) |
| **Routing** | React Router v7 (lazy loading, nested routes) |
| **UI Primitives** | Radix UI (Dialog, Dropdown, Popover, Accordion, etc.) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **AI/ML** | MediaPipe Tasks Vision (face detection) |
| **QR** | @yudiel/react-qr-scanner |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **Forms** | React Hook Form |
| **HTTP** | Axios (dual instance: Java + Python backends) |
| **Toasts** | Sonner |

### Path Aliases

Configured in both `vite.config.ts` and `tsconfig.app.json`:

```
@/*            → src/*
@components/*  → src/components/*
@services/*    → src/services/*
@utils/*       → src/utils/*
@assets/*      → src/assets/*
@store/*       → src/store/*
@styles/*      → src/styles/*
@types/*       → src/types/
```

### Environment Variables

All prefixed with `VITE_` and injected at build time via Vite's `define`:

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL_JAVA` | Java CRUD backend URL |
| `VITE_API_URL_PYTHON` | Python AI/ML backend URL |
| `VITE_FIREBASE_API_KEY` | Firebase API key for FCM |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |

### Project Language

Code comments and UI strings are in **Vietnamese** (Tiếng Việt). This is intentional — the application serves Vietnamese taekwondo academies and all user-facing text is in the target language.
