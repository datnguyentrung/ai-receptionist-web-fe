# Frontend Structure Refactor Progress

## Phase 0 - Clean Lint Baseline

Status: Completed

Moved files/folders:

- None.

Edited files:

- `src/components/BottomNavigationBar/BottomNavigationBar.tsx`
- `src/features/classSession/components/CreateSessionModal/CreateSessionModal.tsx`

Circular dependencies addressed:

- None in this phase.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- `7a49110`

Risks/manual checks remaining:

- Verify PWA bottom navigation pending state still clears naturally after route transition.
- Verify create-session confirmation closes when the modal closes.
- Vite still reports the known Firebase dynamic/static import chunking warning.

## Phase A - App Router And Bootstrap

Status: Completed

Moved files/folders:

- `src/App.tsx` -> `src/app/App.tsx`
- `src/main.tsx` -> `src/app/main.tsx`
- `src/routes/AppRoutes.tsx` -> `src/app/router/AppRoutes.tsx`
- `src/routes/routePreload.ts` -> `src/app/router/routePreload.ts`
- `src/routes/RouteLoadingFallback.module.scss` -> `src/app/router/RouteLoadingFallback.module.scss`
- `src/routes/ProtectedRoute.tsx` -> `src/app/guards/ProtectedRoute.tsx`
- `src/config/RequireRole.tsx` -> `src/app/guards/RequireRole.tsx`

Edited files:

- `src/main.tsx`
- `src/app/main.tsx`
- `src/app/App.tsx`
- `src/app/router/AppRoutes.tsx`
- `src/components/BottomNavigationBar/BottomNavigationBar.tsx`
- `src/pages/UtilitiesPage/UtilitiesPage.tsx`

Circular dependencies addressed:

- Router no longer lazy imports `LoginPage` through `features/auth`; it imports the page directly.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- `dc6c24d`

Risks/manual checks remaining:

- Manual route smoke for desktop/PWA routes.
- `src/routes` is empty after move and should be removed in Phase J cleanup.

## Phase B - Layout Shell Components

Status: Completed

Moved files/folders:

- `src/components/Header/` -> `src/layouts/MainLayout/components/Header/`
- `src/components/Sidebar/` -> `src/layouts/MainLayout/components/Sidebar/`
- `src/components/BottomNavigationBar/` -> `src/layouts/MainLayout/components/BottomNavigationBar/`
- `src/components/LeftPanel/` -> `src/layouts/AuthLayout/components/LeftPanel/`

Edited files:

- `src/layouts/MainLayout/MainLayout.tsx`
- `src/layouts/AuthLayout/AuthLayout.tsx`
- `src/app/router/AppRoutes.tsx`
- moved shell component imports after path depth changed.

Circular dependencies addressed:

- None in this phase.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- `3530024`

Risks/manual checks remaining:

- Desktop sidebar/header visual behavior.
- PWA bottom navigation and fallback dock behavior.
- Login page left panel layout.

## Phase C - App Providers And Common Components

Status: Completed

Moved files/folders:

- `src/components/PullToRefresh/` -> `src/app/providers/pull-to-refresh/`
- `src/components/AppErrorBoundary.tsx` -> `src/app/errors/AppErrorBoundary.tsx`
- `src/components/AccessDeniedView/` -> `src/app/errors/AccessDeniedView/`
- `src/components/Avatar/` -> `src/components/common/Avatar/`
- `src/components/BeltBadge.*` -> `src/components/common/BeltBadge/`
- `src/components/ConfirmModal/` -> `src/components/common/ConfirmModal/`
- `src/components/Pagination/` -> `src/components/common/Pagination/`
- `src/components/ComingSoonView/` -> `src/components/common/ComingSoonView/`

Edited files:

- Imports across app, layouts, pages, and features for moved providers/errors/common components.
- Internal imports in `ConfirmModal` and `BeltBadge` after folder depth changed.

Circular dependencies addressed:

- None in this phase.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- `e76e853`

Risks/manual checks remaining:

- Confirm modal focus/keyboard behavior.
- Pull-to-refresh provider and page registration behavior.
- `/403` route rendering.
- Avatar/BeltBadge visuals in tables/profile/rankings.

## Phase D - Auth And Check-In Ownership

Status: Completed

Moved files/folders:

- `src/components/LoginForm/` -> `src/features/auth/components/LoginForm/`
- `src/components/FaceScanner/` -> `src/features/checkIn/components/FaceScanner/`
- `src/utils/submitScannedCheckInCode.ts` -> `src/features/checkIn/utils/submitScannedCheckInCode.ts`
- `src/utils/validateScannedCheckInCode.ts` -> `src/features/checkIn/utils/validateScannedCheckInCode.ts`
- `src/utils/playSound.ts` -> `src/features/checkIn/utils/playSound.ts`
- `src/utils/speakText.ts` -> `src/features/checkIn/utils/speakText.ts`
- `src/features/tts/api/ttsAPI.ts` -> `src/features/checkIn/api/ttsApi.ts`

Edited files:

- `src/pages/LoginPage/LoginPage.tsx`
- `src/pages/AICheckIn/AICheckIn.tsx`
- `src/features/auth/components/LoginForm/LoginForm.tsx`
- `src/features/auth/presentation/index.ts`
- FaceScanner internal type imports.

Circular dependencies addressed:

- Removed `features/auth/presentation -> pages/LoginPage`.
- `LoginForm` no longer imports `useLogin` through the auth feature barrel.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- Pending.

Risks/manual checks remaining:

- Login success/failure and support modal.
- Desktop face scanner camera lifecycle.
- PWA QR/barcode check-in.
- Audio/TTS behavior.
