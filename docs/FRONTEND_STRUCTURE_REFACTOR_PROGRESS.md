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

- Pending.

Risks/manual checks remaining:

- Manual route smoke for desktop/PWA routes.
- `src/routes` is empty after move and should be removed in Phase J cleanup.
