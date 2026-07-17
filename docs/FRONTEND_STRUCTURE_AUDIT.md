# Frontend Structure Audit

Audit date: 2026-07-17  
Repository: `D:\ai-receptionist-web\ai-receptionist-web-fe`  
Stack observed: React 19, TypeScript, Vite 7, SCSS Modules, Zustand, TanStack Query, Firebase Messaging, PWA assets/service worker.

## Scope And Method

This is an audit-only phase. No source file was moved, renamed, deleted, or refactored.

What was checked:

- Repository structure: root, `src`, `public`, `docs`.
- Vite config, TypeScript configs, ESLint config, `package.json`, alias setup.
- Runtime entrypoints: `src/main.tsx`, `src/App.tsx`.
- Router and lazy routes: `src/routes/AppRoutes.tsx`, `src/routes/routePreload.ts`.
- State and data infrastructure: Zustand stores, React Query client, Axios clients.
- Firebase and PWA: `src/firebase.ts`, `src/services/fcm.ts`, `public/firebase-messaging-sw.js`, manifest, generated `public/fcm-config.js`.
- SCSS and global styles: `src/index.css`, `src/styles`, SCSS module placement.
- Import graph: static imports, dynamic `import()`, SCSS `@use`/`@import`, aliases, relative imports.
- CodeGraph was used because `.codegraph/` exists in the repository.

Baseline validation:

- `npm run build`: passed. Vite reported one chunking warning: `firebase/messaging` is dynamically imported in `src/services/fcm.ts` but also statically imported by `src/firebase.ts` and `src/services/fcm.ts`.
- `npm run lint`: failed with 3 existing errors:
  - `src/components/BottomNavigationBar/BottomNavigationBar.tsx`: `react-hooks/set-state-in-effect` and conditional hook order.
  - `src/features/classSession/components/CreateSessionModal/CreateSessionModal.tsx`: `react-hooks/set-state-in-effect`.
- `package.json` has no `typecheck` or `test` script. `build` already runs `tsc -b`.

## Current Structure Overview

The current architecture is a pragmatic SPA with route-level pages and partially organized features. There are good foundations: `features/*/api`, route lazy loading, React Query, Zustand, layout modules, SCSS Modules, and a separate `public` PWA/service-worker layer.

The main structural issue is not the existence of many folders, but boundary drift:

- Some application shell/navigation modules live in `components`.
- Some page-specific or feature-specific components live in global `components`.
- Some reusable components live inside a page and are imported by other pages.
- Some feature folders use `api`, some use `apis`, and several contain empty `application`, `presentation`, `infrastructure` index files.
- Global `types/index.ts` is heavily used and also participates in circular type dependencies.
- Some mock/static data and raw CSV/JSON live in places that imply runtime state (`src/data`, `src/store`).

## Current Folder Roles

| Folder | Actual role observed | Assessment |
|---|---|---|
| `src/App.tsx` | App shell: error boundary, router, pull-to-refresh provider, toaster, maintenance gate | App-level code; should be under `app` later. |
| `src/main.tsx` | Vite entry, React root, QueryClientProvider, FCM init, app-mode DOM attributes | App bootstrap; should be under `app` or remain as a thin root entry shim. |
| `src/routes` | Main router, route preload, route fallback, unused `ProtectedRoute` | App router, not generic routes. Good candidate for `src/app/router`. |
| `src/layouts` | Real layouts: `MainLayout`, `AuthLayout`, `BaseModalLayout`, `PwaStackScreenLayout` | Correct top-level folder. |
| `src/components/ui` | Mostly shadcn/Radix-style primitives plus app-specific modal/popover helpers | Mostly shared UI. Several generated primitives are unused. |
| `src/components` | Mixed shared components, app shell components, feature-specific components, PWA infrastructure | Needs split into `ui`, `common`, layout-local, app providers, and feature-owned components. |
| `src/pages` | Route components plus many route-local components and some reusable cross-page components | Pages are too broad in some areas. Components imported by other pages should move to features/shared. |
| `src/features` | Domain APIs and components for auth, class schedule/session, coach, student, attendance, enrollment, tuition, report, etc. | Direction is good, but folder naming and feature public APIs are inconsistent. |
| `src/hooks` | Mix of generic hooks and app/navigation/data hooks | `useCrud`, `useDebounce`, `useDocumentTitle` are global-ish; `useNavItems` is app navigation/auth. |
| `src/services` | FCM infrastructure plus two empty API placeholders | `fcm.ts` is integration infrastructure. Empty files are delete candidates after verification. |
| `src/lib` | Axios, React Query, runtime guards | Correct as infrastructure wrappers, but `axiosInstance` imports store/query client and must stay carefully bounded. |
| `src/store` | Zustand auth store, theme placeholder, raw exam CSV/JSON data | Auth store belongs global store. CSV/JSON should not be in store. Empty theme store is a candidate. |
| `src/types` | Global domain/API types and a large barrel export | Too global. Circular type dependencies exist. |
| `src/utils` | Mix of pure helpers, app-mode helpers, scan/check-in business helpers, debug storage | Some should stay global; scan/check-in utilities belong to a check-in feature. |
| `src/config` | Env/app-mode, route guard, constants/enums/navigation | Mixed app config, guard, constants, and navigation definitions. |
| `src/data` | Huge mock/static data file imported by dashboard and attendance check-in | Needs split or relocation near consuming pages/features. |
| `src/styles` | Global CSS imports, Sass variables/mixins, theme/font/tailwind CSS | Correct for global styles/tokens. |
| `src/docs` | Markdown documentation | Not runtime source; should move to root `docs`. |
| `public` | PWA manifest, FCM worker/config, images/icons, MediaPipe model | Correct for public assets and service worker. |

## Runtime And Routing

Entrypoint flow:

`src/main.tsx` -> `QueryClientProvider` -> `src/App.tsx` -> `BrowserRouter` -> `PullToRefreshProvider` -> `src/routes/AppRoutes.tsx`.

Key routes in `AppRoutes`:

- Public: `/welcome`, `/login`, `/403`, `/public/exam`, `/rankings/*`.
- Authenticated desktop shell: `MainLayout`.
- PWA stack shell: `PwaStackScreenLayout` via `StackRouteLayout`.
- Protected role areas: dashboard, coaches, students, schedules, attendance history, check-in.
- Dynamic profile route: `/:userCode`, with nested personal tabs.

Risks:

- `AppRoutes.tsx` is large and mixes route declarations, skeleton UI, profile path detection, PWA-vs-desktop shell decisions, and lazy imports.
- `routePreload.ts` imports pages and feature APIs. It belongs with the router, but it is a high-risk move target because bottom nav and utilities trigger preloading.
- `features/auth/index.ts` currently routes back to `pages/LoginPage`, creating a feature-to-page dependency.

## PWA And Firebase

Observed files:

- `public/manifest.json`
- `public/firebase-messaging-sw.js`
- `public/fcm-config.js`, generated by a Vite plugin.
- `src/firebase.ts`
- `src/services/fcm.ts`
- `src/config/appMode.ts`
- `src/layouts/PwaStackScreenLayout`
- `src/components/PullToRefresh`

Assessment:

- `src/firebase.ts` is an external integration initializer, not ordinary config. It should move to `src/integrations/firebase/firebase.ts` or `src/lib/firebase.ts`. Recommended: `src/integrations/firebase/client.ts`.
- `src/services/fcm.ts` is notification infrastructure and depends on Firebase, service worker registration, local storage, and Java API. It should move with Firebase integration, for example `src/integrations/firebase/fcm.ts` or `src/integrations/notifications/fcm.ts`.
- `PullToRefresh` is PWA/app-shell behavior, not a generic component. It should move to `src/app/providers/pull-to-refresh` or `src/components/pwa` if the team prefers component terminology.
- PWA-specific route/layout behavior is spread across `AppRoutes`, `MainLayout`, `PwaStackScreenLayout`, and page components. Moving paths must preserve safe-area, bottom nav, fullscreen check-in, and pull-to-refresh behavior.

## Alias And Config Issues

`vite.config.ts` aliases:

- `@`, `@components`, `@services`, `@utils`, `@assets`, `@screens`, `@styles`, `@navigation`, `@store`, `@providers`, `@types`.

`tsconfig.app.json` paths:

- `@/*`, `@components/*`, `@services/*`, `@utils/*`, `@assets/*`, `@store/*`, `@styles/*`, `@types/*`.

Issues:

- Vite defines aliases that TypeScript does not: `@screens`, `@navigation`, `@providers`.
- Those aliases point to folders that do not exist in `src`.
- Alias usage is mostly `@/` already; `@components` was seen only once.
- `tsconfig.app.json` has commented-out `baseUrl`, but paths are still accepted by current build. This should be handled carefully if aliases are changed.

## Dependency Issues

High-signal dependency problems:

| Dependency | Problem |
|---|---|
| `features/auth/presentation/index.ts` -> `pages/LoginPage` | Feature imports page. This reverses the intended direction. |
| `components/LoginForm` -> `features/auth` | A global component depends on an auth feature. It should be auth-owned. |
| `components/FaceScanner/*` -> `features/student` and check-in logic | Face scanner is not generic shared UI; it belongs to check-in. |
| `components/StudentScheduleSection` -> `features/studentEnrollment/components/ClassList` | Global component imports feature internals. |
| `features/classSchedule/components/*` -> `pages/AttendanceCheckin/attendanceCheckinQueries.ts` | Feature imports page-local query helpers. |
| `pages/PersonalPage/components/AttendanceTab` -> `pages/AttendanceReports/components/AttendanceTable` | Page imports another page's internal component. |
| `pages/StudentManagement/components/AttendanceTableModal` -> `pages/AttendanceReports/components/AttendanceTable` | Page imports another page's internal component. |
| `pages/Rankings/Components/QuarterLeaderboard` -> `pages/PersonalPage/components/ScoreTab/QuarterSummaryDetail` | Page imports another page's internal component. |
| `components/BottomNavigationBar`, `Sidebar`, `SidebarSettings` -> `store/authStore` | App shell components live in global shared components and read global auth state directly. |
| `config/constants/ListActionDropDown.ts` -> `store/authStore` | Constants file is not pure; it depends on runtime auth state. |

## Circular Dependency Candidates

Detected cycles:

| Cycle | Why it matters |
|---|---|
| `types/Core/ClassScheduleTypes.ts` -> `types/Core/CoachTypes.ts` -> `types/Operation/CoachAssignmentTypes.ts` -> `types/Core/ClassScheduleTypes.ts` | Domain types reference each other directly; can cause fragile compile order and hidden runtime imports if non-type exports are added later. |
| `types/Core/CoachTypes.ts` -> `types/Security/authTypes.ts` -> `types/Operation/CoachAssignmentTypes.ts` -> `types/Core/CoachTypes.ts` | Security/auth types are coupled to operation and core domain types. |
| `types/Core/StudentTypes.ts` -> `types/Operation/StudentEnrollmentTypes.ts` -> `types/Core/StudentTypes.ts` | Student and enrollment types are mutually coupled. |
| `types/index.ts` -> `types/Operation/StudentAttendanceTypes.ts` -> `types/index.ts` | Barrel export participates in a cycle. |
| `pages/AttendanceCheckin/attendanceCheckinQueries.ts` -> `pages/AttendanceCheckin/index.ts` -> `AttendanceCheckin.tsx` -> `attendanceCheckinQueries.ts` | Page barrel cycle; route/lazy imports can keep this fragile. |
| `pages/ClassSchedules/classSchedulesQueries.ts` -> `pages/ClassSchedules/index.ts` -> `ClassSchedules.tsx` -> `hooks/useClassSchedulesLogic.ts` -> `classSchedulesQueries.ts` | Page barrel cycle. |
| `pages/Dashboard/dashboardQueries.ts` -> `pages/Dashboard/index.ts` -> `Dashboard.tsx` -> `dashboardQueries.ts` | Page barrel cycle. |
| `routes/routePreload.ts` -> `pages/UtilitiesPage/index.ts` -> `UtilitiesPage.tsx` -> `routes/routePreload.ts` | Router preload cycle through page barrel. |
| `features/auth/index.ts` -> `features/auth/presentation/index.ts` -> `pages/LoginPage/index.ts` -> `LoginPage.tsx` -> `components/LoginForm` -> `features/auth/index.ts` | Feature/page/shared component cycle around auth. |

Recommendation: avoid adding broad `index.ts` barrels until these cycles are removed. Prefer explicit imports for internal modules.

## Dead Code And Delete Candidates

These are candidates only. They must not be deleted until usage is verified after refactor and build/lint pass.

Likely empty/stub candidates:

- `src/hooks/useToggle.ts` - 1 line, no importers.
- `src/services/masterDataApi.ts` - 1 line, no importers.
- `src/services/uploadApi.ts` - 1 line, no importers.
- `src/store/themeStore.ts` - 1 line, no importers.
- `src/utils/storage.ts` - 1 line, no importers.

Docs/non-runtime:

- `src/docs/modal-scroll-lag-fix-guide.md` - no runtime import; should move to root `docs`.
- `src/features/README.md` - no runtime import; can stay as feature documentation or move to root docs depending on team preference.

Unused generated UI primitive candidates:

- `src/components/ui/accordion.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/alert.tsx`
- `src/components/ui/aspect-ratio.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/carousel.tsx`
- `src/components/ui/chart.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/collapsible.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/context-menu.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/form.tsx`
- `src/components/ui/input-otp.tsx`
- `src/components/ui/menubar.tsx`
- `src/components/ui/navigation-menu.tsx`
- `src/components/ui/pagination.tsx`
- `src/components/ui/progress.tsx`
- `src/components/ui/radio-group.tsx`
- `src/components/ui/resizable.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/sidebar.tsx`
- `src/components/ui/slider.tsx`
- `src/components/ui/sonner.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/toggle-group.tsx`

Unused page/feature barrel candidates:

- Several `index.ts` files have no importers because imports target concrete files or directories differently. These are not automatically dead because route/lazy imports and future public APIs may depend on them after refactor.

Potentially unused pages:

- `src/pages/Facebook/*` has no importers. `AppRoutes` currently uses a placeholder `<div>Facebook Marketing</div>` for `/marketing/facebook`, not the Facebook page files.

## Misplaced Components

App shell/navigation currently in global components:

- `src/components/Header/*`
- `src/components/Sidebar/*`
- `src/components/BottomNavigationBar/*`

Layout-local/auth-layout component:

- `src/components/LeftPanel/*` is only used by `AuthLayout`.

Auth feature component:

- `src/components/LoginForm/*` imports auth feature code and is only used by `LoginPage`.

PWA/application provider:

- `src/components/PullToRefresh/*` is app/PWA infrastructure, not generic UI.

Check-in feature components:

- `src/components/FaceScanner/*`
- `src/utils/submitScannedCheckInCode.ts`
- `src/utils/validateScannedCheckInCode.ts`
- `src/utils/playSound.ts`
- `src/utils/speakText.ts`
- `src/features/tts/api/ttsAPI.ts` is likely part of the same check-in/voice feature if no other consumers appear.

Class/session/schedule feature-specific components:

- `src/components/CountdownBadge.tsx` is only used by class session.
- `src/components/DaySelector/*` is only used by class schedule.
- `src/components/StatusFilters/*` is only used by coach filters.
- `src/components/StudentScheduleSection/*` imports student enrollment feature internals.
- `src/components/AssignmentSubjectHero/*` is assignment/enrollment related and duplicated under `features/studentEnrollment`.

Shared components that should probably stay shared:

- `src/components/Avatar/*`
- `src/components/BeltBadge.tsx`
- `src/components/ConfirmModal/*`
- `src/components/Pagination/*`
- `src/components/ComingSoonView/*`
- `src/components/AccessDeniedView/*` may move to `app/errors`, but it is route-level shared shell rather than feature-specific.
- `src/components/AppErrorBoundary.tsx` may move to `app/providers` or `app/errors`.

## Page Issues

Pages with high component/logic density:

| Page | Files | Issue |
|---|---:|---|
| `AICheckIn` | 10 | Page owns mode state, scanner orchestration, audio behavior, code scan behavior, and several local components. Face scanner and scan utilities should become a feature. |
| `AttendanceCheckin` | 16 | Main page is ~730 lines and contains data fetching, filtering, optimistic mutations, submission modal state, PWA refresh registration, and rendering. |
| `AttendanceReports` | 33 | Contains reusable table/report components imported by other pages. |
| `ExaminationManagement` | 16 | Page-local is acceptable, but raw CSV/JSON lives in `src/store`; should move to page/feature data. |
| `PersonalPage` | 33 | Nested tabs are route components; some components are imported by other pages. |
| `Rankings` | 18 | Folder `Components` uses inconsistent casing; `QuarterLeaderboard` imports `PersonalPage` internals. |
| `StudentManagement` | 12 | Page-local components are mostly OK, but `AttendanceTableModal` imports AttendanceReports internals. |

Large files:

- `src/pages/AICheckIn/AICheckIn.module.scss` - 2208 lines.
- `src/data/mockData.ts` - 1634 lines.
- `src/pages/AttendanceReports/components/AttendanceTable/AttendanceTable.module.scss` - 1293 lines.
- `src/pages/StudentManagement/StudentManagement.module.scss` - 1227 lines.
- `src/pages/AICheckIn/AICheckIn.tsx` - 859 lines.
- `src/pages/AttendanceReports/AttendanceReports.tsx` - 782 lines.
- `src/pages/AttendanceCheckin/AttendanceCheckin.tsx` - 730 lines.
- `src/pages/Dashboard/Dashboard.tsx` - 654 lines.
- `src/features/classSession/components/SessionLayout/SessionLayout.tsx` - 630 lines.
- `src/features/studentEnrollment/components/ClassAssignmentModal/ClassAssignmentModal.tsx` - 621 lines.

## Feature Structure Issues

Inconsistent folder names:

- `features/fitness/apis/FitnessAPI.ts`
- `features/report/apis/LeaderboardAPI.ts`
- Most other features use `api`.

Empty layer folders:

- Many features contain `application/index.ts`, `infrastructure/index.ts`, `presentation/index.ts` but little or no implementation. This looks like architecture placeholders rather than useful boundaries.

Feature public APIs:

- Some feature `index.ts` files export useful APIs.
- Some create cycles or are unused.
- Recommendation: keep `index.ts` only where it is a deliberate public API. Avoid exporting page modules from features.

Feature coupling:

- `coach` imports `studentEnrollment` components for assignment flows. That may be legitimate cross-feature collaboration, but imports should go through a stable public API.
- `student` imports `studentAttendance` components/types. This should be explicit and bounded.
- `classSchedule` components import page query helpers from `AttendanceCheckin`; those helpers should move to a feature or shared query module.

## Type Issues

The global `src/types/index.ts` is imported by many files and re-exports core, operation, auth, API, and pagination types. This makes imports convenient but hides ownership and contributed to circular dependencies.

Recommended direction:

- Keep truly shared domain types in `src/types` only when multiple features need them.
- Move feature-specific request/response types next to feature API when ownership is clear.
- Avoid importing from `src/types/index.ts` inside `src/types/*` files.
- Prefer `import type` consistently for type-only dependencies.
- Break cycles by extracting lightweight summary types or using IDs instead of full nested domain objects where possible.

## Data And Store Issues

`src/data/mockData.ts`:

- Very large.
- Imported by `Dashboard` and `AttendanceCheckin`.
- Contains mock/static data and DTO-like interfaces.
- Should be split by consumer or clearly marked as demo/mock data. If still used in production screens, keep it out of generic `src/data` and colocate with page/feature fallback data.

`src/store/history_exam.csv` and `src/store/mau_kiem_tra.json`:

- Imported as raw/static data by Examination Management.
- These are not state stores. Move under `src/pages/ExaminationManagement/data` or `src/features/examination/data`.

`src/store/authStore.ts`:

- Correct as global state.
- Imported by app shell, role utilities, Axios, pages, and auth feature.
- Refactor should avoid changing state shape or persistence behavior.

## Style Issues

Global styles:

- `src/index.css` imports `styles/fonts.css`, `styles/tailwind.css`, `styles/theme.css`.
- `vite.config.ts` injects `@use "@/styles/_variables.scss"` and `@use "@/styles/_mixins"` into every SCSS file.

SCSS placement:

- Most component/page/layout SCSS Modules are colocated correctly.
- Do not move SCSS Modules away from their component unless the component moves with them.
- `src/pages/PersonalPage/components/TabViews/TabViews.scss` has `@use "../../../../styles/variables"`; Sass may resolve `_variables.scss`, but this deep relative import should become `@use "@/styles/_variables.scss"` or rely on Vite injection.

Dead style candidates:

- Any SCSS module with no importer should be verified after fixing resolver behavior and after removing/commenting unused barrels. Current candidates include some unused feature components and duplicate components, not global variables/mixins.

## Naming Issues

Observed inconsistencies:

- `features/fitness/apis` and `features/report/apis` vs `api`.
- `src/pages/Rankings/Components` uses uppercase `Components`; other pages use lowercase `components`.
- API file casing differs: `FitnessAPI.ts`, `LeaderboardAPI.ts`, `userAPI.ts`, `studentAPI.ts`.
- Some components are flat files (`BeltBadge.tsx`, `CountdownBadge.tsx`) while similar components use folder modules.
- Mixed `.scss` and `.module.scss` in component/page folders.
- Empty architecture folder names (`application`, `presentation`, `infrastructure`) suggest responsibilities not yet implemented.

## Duplicate Component Candidates

Potential duplicates or naming collisions:

- `src/components/AssignmentSubjectHero/*`
- `src/features/studentEnrollment/components/AssignmentSubjectHero/*`
- `src/components/StudentScheduleSection/*`
- `src/features/studentEnrollment/components/StudentScheduleSection/*`
- `src/components/Avatar/Avatar.tsx` and `src/components/ui/avatar.tsx` serve different roles but names may confuse.
- `src/components/Pagination/Pagination.tsx` and `src/components/ui/pagination.tsx`.
- `src/components/Sidebar/Sidebar.tsx` and `src/components/ui/sidebar.tsx`.
- `src/features/coach/components/StatusBadge/*` and `src/features/student/components/StatusBadge/*` may be legitimate feature-specific variants.
- `src/data/mockData.ts` and `src/pages/PersonalPage/mockData.ts`.

## Refactor Risks

High-risk areas:

- Routing and lazy imports in `AppRoutes.tsx`.
- `routePreload.ts` dynamic imports and query prefetches.
- PWA stack layout, pull-to-refresh, bottom nav, safe-area behavior.
- FCM service worker registration and query-param Firebase config.
- Auth refresh flow in `lib/axiosInstance.ts`.
- Auth store hydration and route gating.
- CSS Modules colocated with moved components.
- Raw imports with `?raw` for CSV/JSON exam data.
- Page-to-page reused components currently imported through relative paths.
- Type barrel cycles.
- Existing lint failures unrelated to this audit.

## Priority Findings

1. App shell code is split between root files, `routes`, `config`, and global `components`.
2. `components` is overloaded with shell, PWA infrastructure, feature-specific, page-specific, and shared UI.
3. Page-to-page imports exist and should be removed before larger moves.
4. Type cycles should be addressed before adding more barrels.
5. Mock/static data placement is misleading.
6. `src/docs` should move to root `docs`.
7. Firebase/FCM should become an integration module, not a loose root `firebase.ts` plus service file.
8. Alias config is inconsistent between Vite and TypeScript.
9. Empty/stub files and unused UI primitives should be verified after structural moves.
10. Current lint is failing; do not use lint failure as a refactor regression signal until baseline issues are fixed or tracked.
