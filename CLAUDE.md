# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint (flat config, ts + react-hooks + react-refresh)
npm run preview  # Preview production build locally
```

No test runner is configured.

## Architecture Overview

AI Receptionist frontend for a taekwondo academy management system. React 19 + TypeScript + Vite 7 + TailwindCSS 4.

### Dual Backend Architecture

Two separate API backends, each with its own Axios instance (`src/lib/axiosInstance.ts`):

- **Java API** (`javaApi`): Main CRUD backend, 15s timeout
- **Python API** (`pythonApi`): AI/ML services (face recognition, TTS), 30s timeout

Both instances share interceptors: auto-attach Bearer token, automatic token refresh on 401 (with request queuing), exponential retry on 5xx/429/network errors. Refresh token is sent as an httpOnly cookie (`withCredentials: true`).

### Environment Variables

All prefixed with `VITE_`. Key ones:
- `VITE_API_URL_JAVA` / `VITE_API_URL_PYTHON` — backend URLs
- `VITE_FIREBASE_*` — Firebase/FCM config (injected at build time via `fcmConfigPlugin` in vite.config.ts)

### State Management

- **Zustand** (`src/store/authStore.ts`): Auth state with `persist` middleware. Supports multi-profile login — a user can have multiple roles and switch between them. Active profile determines routing and permissions.
- **TanStack Query**: Server state, caching, mutations. Configured in `src/lib/react-query.ts`.

### Routing & Role-Based Access

React Router v7 with lazy loading. Defined in `src/routes/AppRoutes.tsx`.

Three permission tiers (checked via `useRoleStudent` hook from `src/utils/roleUtils.ts`):
1. **Manager_Senior / Head_Coach**: Dashboard, coach management
2. **Coach and above**: Student management, schedules, attendance, AI check-in
3. **All authenticated users**: Personal page (`/:userCode`) with tabs

`RequireRole` component (`src/config/RequireRole.tsx`) wraps route groups — redirects to `fallbackPath` if unauthorized.

### Feature Module Pattern

Features live in `src/features/` following a layered architecture. Each feature exposes a **single public API** via `index.ts`:

```
src/features/<feature>/
├── application/       # TanStack Query hooks & use cases
├── infrastructure/    # API clients, external data access
├── presentation/      # Feature-specific UI components
└── index.ts           # Re-exports from all layers
```

**Import rule**: Always import from `@/features/<feature>`, never from internal subdirectories.

Existing features: `auth`, `classSchedule`, `coach`, `student`, `studentAttendance`, `studentEnrollment`, `tuitionPayment`, `user`. Some features (`fitness`, `report`, `tts`, `classSession`) are newer and may not yet follow this pattern fully.

### Pages vs Features

`src/pages/` contains page-level components that compose features and shared components. Pages are routed directly. Features provide the domain logic and reusable pieces.

### Path Aliases

Configured in both `vite.config.ts` and `tsconfig.app.json`:
`@/*`, `@components/*`, `@services/*`, `@utils/*`, `@assets/*`, `@store/*`, `@styles/*`, `@types/*`

### Styling

TailwindCSS 4 with Vite plugin. SCSS variables auto-injected into all SCSS files via `additionalData` in `vite.config.ts` (from `src/styles/_variables.scss`).

### Key Integrations

- **Firebase Cloud Messaging** (`src/firebase.ts`, `src/services/fcm.ts`): Push notifications, initialized in `main.tsx`
- **MediaPipe** (`@mediapipe/tasks-vision`): Face recognition for AI check-in
- **QR Scanner** (`@yudiel/react-qr-scanner`): QR-based attendance
- **Recharts**: Data visualization/charts
- **Radix UI**: Accessible component primitives (`src/components/ui/`)
- **Sonner**: Toast notifications
- **React Hook Form**: Form handling

### Vendor Chunk Splitting

Production build splits vendor bundles (see `vite.config.ts`): `react-vendor`, `radix-vendor`, `data-vendor`, `chart-vendor`, `ai-vendor`, `ui-vendor`.

### Project Language

Code comments and some UI strings are in Vietnamese. This is intentional for the target users.
