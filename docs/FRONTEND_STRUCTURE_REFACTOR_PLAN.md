# Frontend Structure Refactor Plan

Status: Approved for autonomous execution.

This plan is approved for one continuous execution session with independent commits per phase. The implementation must run Phase 0 and Phases A-J without stopping for additional architectural confirmation, unless a hard blocker is reached.

## Approved Architecture Decisions

- Keep `src/main.tsx` as the Vite entry shim; move real bootstrap into `src/app/main.tsx`.
- Move `src/App.tsx` to `src/app/App.tsx`.
- Move router files to `src/app/router`.
- Move `RequireRole` to `src/app/guards`.
- Keep `ProtectedRoute` until Phase J verification.
- Move Firebase/FCM to `src/integrations/firebase/client.ts` and `src/integrations/firebase/fcm.ts`.
- Keep service worker, manifest, generated FCM config, and public assets in `public`.
- Move `PullToRefresh` to `src/app/providers/pull-to-refresh`.
- Move layout shell components under their owning layouts.
- Organize shared components as `src/components/ui`, `src/components/common`, and `src/components/dev`.
- Move `AppErrorBoundary` and `AccessDeniedView` to `src/app/errors`.
- Move `LoginForm` to `src/features/auth/components/LoginForm`; auth feature must not import/export pages.
- Create `src/features/checkIn` for FaceScanner, scan validation/submission, sound, and TTS/voice feedback.
- Treat `AssignmentSubjectHero` and `StudentScheduleSection` as `studentEnrollment` feature-owned components.
- Move `CountdownBadge`, `DaySelector`, `StatusFilters`, and `scheduleUtils` to their owning features.
- Move attendance check-in queries and class schedule queries into feature `queries` folders while preserving query keys.
- Remove page-to-page imports by moving reusable attendance/report/ranking pieces to `features/studentAttendance` and `features/report`.
- Keep `features/report`; do not rename it to leaderboard in this refactor.
- Move examination CSV/JSON and calculation utilities under `pages/ExaminationManagement`.
- Split `src/data/mockData.ts` by actual consumers without changing values.
- Move navigation path/list-action/dropdown/hooks to `src/app/navigation`.
- Keep genuinely generic hooks in `src/hooks`.
- Break known type cycles, avoid importing from `src/types/index.ts` inside `src/types/**`, and avoid new unnecessary barrels.
- Normalize structural folder names to lowercase (`components`, `api`, `queries`, `utils`, etc.) and rename `apis` to `api`.
- Synchronize Vite and TypeScript aliases; remove aliases for non-existent folders.
- Move non-runtime docs out of `src`.
- Delete empty placeholders only in Phase J after verification.
- Do not prune `src/components/ui` Radix/shadcn primitives in this refactor.
- Delete Facebook source only in Phase J if verified unused; do not wire it into routes.
- Remove `src/services` only if it becomes empty after verified moves.

## Goals

- Make ownership clear without changing business behavior, UI/UX, route URLs, API contracts, Firebase behavior, auth behavior, PWA behavior, or state shape.
- Keep architecture practical for the current repository size.
- Prefer colocating feature-specific code with its feature.
- Keep shared code truly shared.
- Reduce page-to-page imports, circular dependencies, and misleading folders.
- Do not add framework/dependency changes.

## Proposed Target Architecture

Approved target:

```text
src/
  app/
    App.tsx
    main.tsx
    guards/
    providers/
      pull-to-refresh/
    router/
      AppRoutes.tsx
      routePreload.ts
      RouteLoadingFallback.module.scss
    navigation/
  components/
    ui/
    common/
    feedback/
  config/
    constants/
    env.ts
  features/
    auth/
      api/
      components/
      hooks/
    checkIn/
      api/
      components/
      utils/
      types/
    classSchedule/
      api/
      components/
      hooks/
      queries/
    classSession/
      api/
      components/
    coach/
      api/
      components/
      hooks/
    examination/
      data/
      utils/
    report/
      api/
      components/
    student/
      api/
      components/
      constants/
    studentAttendance/
      api/
      components/
      queries/
      utils/
    studentEnrollment/
      api/
      components/
    tuitionPayment/
      api/
    user/
      api/
  integrations/
    firebase/
      client.ts
      fcm.ts
  layouts/
    AuthLayout/
    BaseModalLayout/
    MainLayout/
      components/
    PwaStackScreenLayout/
  pages/
    ...
  store/
  styles/
  types/
  utils/
```

Notes:

- Root `src/main.tsx` remains as a thin shim importing `src/app/main.tsx`.
- `src/services` should disappear only if no valid runtime file remains after the Firebase/FCM move and Phase J cleanup.
- Do not create empty feature subfolders. Only create folders when moving real files.
- Do not create `index.ts` barrels automatically.

## Dependency Direction

Allowed direction:

```text
app -> pages -> features -> components/ui|components/common|lib|integrations|config|types|utils
layouts -> components/common|components/ui|app/navigation|app/providers
features -> components/common|components/ui|lib|integrations|config|types|utils
```

Avoid:

- `components` importing `pages`.
- `components/common` importing `features`.
- `features` importing `pages`.
- One page importing another page's internal component.
- `layouts` depending directly on a business feature unless the layout is explicitly feature-owned.
- Feature A deep-importing Feature B internals. Use Feature B public API only when cross-feature collaboration is intentional.
- Type files importing from broad `src/types/index.ts`.

## Organization Rules

### app

Use for bootstrap, router, providers, app-level guards, global initialization, and navigation shell logic.

Examples:

- `App.tsx`
- router declarations and route preload
- `RequireRole`
- pull-to-refresh provider/context
- app navigation item logic

### pages

Pages should be route-level orchestrators:

- Compose layout and features.
- Read route params.
- Hold screen-level state and queries when not reusable.
- Keep page-local components only when no other page/feature imports them.

If a page component is imported by another page, move it to a feature or shared component.

### layouts

Use for layout/shell components:

- `MainLayout`
- `AuthLayout`
- `BaseModalLayout`
- `PwaStackScreenLayout`
- MainLayout-only header/sidebar/bottom navigation components.

### features

Use for business capabilities:

- API/service for the capability.
- Components only used by that capability.
- Hooks, query helpers, types, constants, and utils owned by the capability.

Do not force every feature to have all folders.

### shared components

Keep in shared only when used across unrelated features/pages and not tied to one domain:

- UI primitives: `Button`, `Input`, `Dialog`, `Tabs`, etc.
- Common app components: `Avatar`, `ConfirmModal`, `Pagination`, `BeltBadge`.
- Generic feedback: loading/empty/error views.

Not shared:

- Components imported by two files inside the same feature.
- Components that import feature APIs/types directly.

### hooks

Global hooks can stay in `src/hooks` only if they are generic:

- `useDebounce`
- `useDocumentTitle`
- `useCrud` or a renamed query/mutation helper if it remains app-wide

Feature/app-specific hooks should move:

- `useNavItems` -> `src/app/navigation`
- class schedule hooks -> feature or page depending on reuse

### services, lib, integrations

- `lib`: wrappers around libraries used across the app, such as Axios and React Query.
- `integrations`: external platform integration with lifecycle/config, such as Firebase/FCM.
- `services`: keep only if there is a non-feature application service left. Otherwise remove after migration.
- Feature API clients stay in `features/<feature>/api`.

### types

- Keep global domain types only when shared by multiple features.
- Move feature-owned API request/response types to the feature when ownership is obvious.
- Break type cycles before adding new barrels.
- Use `import type` consistently.

### utils

- Keep small pure utilities in `src/utils`.
- Move business logic utilities to features.
- Do not put integration lifecycle, API calls, or feature workflows in `utils`.

### data

- Production static lookup data can live in feature `constants` or `data`.
- Mock/demo data should be explicitly named and colocated with the page/feature using it.
- Raw CSV/JSON for a screen belongs to that screen/feature, not `store`.

### docs

- Runtime source must not live in `src/docs`.
- Markdown or technical documentation goes under root `docs`.

## File Mapping

The table below uses concrete files or atomic folders. An atomic folder row means every file currently inside that folder moves together with its colocated SCSS/index files.

Actions:

- `KEEP`: stay in place.
- `MOVE`: move without changing name.
- `RENAME`: move and/or rename for clearer responsibility.
- `SPLIT`: split one file/folder into multiple targets.
- `MERGE`: consolidate duplicate implementations.
- `DELETE_CANDIDATE`: do not delete until usage is verified after moves.

| Current path | Proposed path | Action | Reason | Risk | Imports affected |
|---|---|---:|---|---|---|
| `src/main.tsx` | `src/app/main.tsx` plus optional root shim | MOVE | App bootstrap, QueryClientProvider, FCM init, app-mode attributes. | High: Vite entry and FCM init. | `index.html`, root entry import. |
| `src/App.tsx` | `src/app/App.tsx` | MOVE | App shell/provider composition. | Medium: all runtime routes. | `src/main.tsx`. |
| `src/routes/AppRoutes.tsx` | `src/app/router/AppRoutes.tsx` | MOVE | Application router. | High: all routes, lazy imports, PWA/desktop shell. | `App.tsx`, dynamic imports. |
| `src/routes/routePreload.ts` | `src/app/router/routePreload.ts` | MOVE | Router prefetch belongs with router. | High: bottom nav preload, Utilities preload, query keys. | `BottomNavigationBar`, `UtilitiesPage`, router. |
| `src/routes/RouteLoadingFallback.module.scss` | `src/app/router/RouteLoadingFallback.module.scss` | MOVE | Router fallback style. | Medium: route skeleton. | `AppRoutes.tsx`. |
| `src/routes/ProtectedRoute.tsx` | `src/app/guards/ProtectedRoute.tsx` | MOVE or DELETE_CANDIDATE | Guard belongs in app; currently no importers. | Low if unused; verify before delete. | None currently. |
| `src/config/RequireRole.tsx` | `src/app/guards/RequireRole.tsx` | MOVE | Runtime route guard, not config. | High: auth navigation/access. | `AppRoutes.tsx`. |
| `src/config/env.ts` | `src/config/env.ts` | KEEP | App env config is appropriate. | Low. | `App.tsx`, `main.tsx`. |
| `src/config/appMode.ts` | `src/config/appMode.ts` or `src/app/appMode.ts` | KEEP initially | Used across app, layouts, PWA pages. | Medium: PWA/desktop behavior. | Many PWA/layout/page imports. |
| `src/firebase.ts` | `src/integrations/firebase/client.ts` | MOVE/RENAME | Firebase integration initializer. | High: FCM foreground/background messaging. | `services/fcm.ts`. |
| `src/services/fcm.ts` | `src/integrations/firebase/fcm.ts` | MOVE | Firebase Messaging and service worker integration. | High: notification permission, token sync, SW registration. | `main.tsx`, auth hook. |
| `src/lib/axiosInstance.ts` | `src/lib/axiosInstance.ts` | KEEP | Shared HTTP infrastructure. | High if moved due refresh token behavior. | All feature APIs. |
| `src/lib/react-query.ts` | `src/lib/react-query.ts` | KEEP | QueryClient infrastructure. | Medium: global query behavior. | `main.tsx`, `axiosInstance`. |
| `src/lib/runtimeGuards.ts` | `src/lib/runtimeGuards.ts` | KEEP initially | Runtime API response guards used by multiple APIs. | Medium: API parsing. | feature APIs. |
| `src/components/PullToRefresh/*` | `src/app/providers/pull-to-refresh/*` | MOVE | App/PWA provider behavior, not generic component. | High: pull-to-refresh, safe-area scroll containers. | `App.tsx`, `MainLayout`, `PwaStackScreenLayout`, pages. |
| `src/components/AppErrorBoundary.tsx` | `src/app/providers/AppErrorBoundary.tsx` or `src/app/errors/AppErrorBoundary.tsx` | MOVE | App-level error boundary. | Medium: global error handling. | `App.tsx`. |
| `src/components/Header/*` | `src/layouts/MainLayout/components/Header/*` | MOVE | MainLayout-only shell component. | Medium: desktop/PWA nav. | `MainLayout`. |
| `src/components/Sidebar/*` | `src/layouts/MainLayout/components/Sidebar/*` | MOVE | MainLayout-only shell component. | Medium: auth state, logout/settings, overlay behavior. | `MainLayout`. |
| `src/components/BottomNavigationBar/*` | `src/layouts/MainLayout/components/BottomNavigationBar/*` or `src/app/navigation/BottomNavigationBar/*` | MOVE | App navigation shell, not generic shared component. | High: PWA/desktop bottom dock, route preload. | `MainLayout`, `AppRoutes`. |
| `src/components/LeftPanel/*` | `src/layouts/AuthLayout/components/LeftPanel/*` | MOVE | Only used by AuthLayout. | Low. | `AuthLayout`. |
| `src/components/LoginForm/*` | `src/features/auth/components/LoginForm/*` | MOVE | Auth-specific component imports auth feature. | High: login/auth/FCM sync flow. | `LoginPage`. |
| `src/pages/LoginPage/*` | `src/pages/LoginPage/*` | KEEP | Route-level login page. | Medium: auth route. | `AppRoutes`, auth cycle cleanup. |
| `src/features/auth/presentation/index.ts` | remove page export; feature public API only | DELETE_CANDIDATE or RENAME | Currently imports page, causing reversed dependency. | High: route lazy import currently uses `@/features/auth`. | `AppRoutes` lazy import must target page directly or auth component. |
| `src/features/auth/application/index.ts` | remove if empty | DELETE_CANDIDATE | Empty architecture placeholder. | Low. | None if unused. |
| `src/features/auth/infrastructure/index.ts` | remove if empty | DELETE_CANDIDATE | Empty architecture placeholder. | Low. | None if unused. |
| `src/features/auth/index.ts` | `src/features/auth/index.ts` | RENAME/REDUCE | Public API should not export pages. | High: auth cycle. | `LoginForm`, `AppRoutes`. |
| `src/components/FaceScanner/*` | `src/features/checkIn/components/FaceScanner/*` | MOVE | Face scanning belongs to check-in. | High: camera, MediaPipe, desktop check-in. | `AICheckIn`, scanner internals. |
| `src/pages/AICheckIn/components/*` | `src/features/checkIn/components/*` for reusable check-in UI; page-local otherwise stays | SPLIT | Check-in UI has feature behavior; page should orchestrate. | High: PWA scanner UI and audio flow. | `AICheckIn`. |
| `src/pages/AICheckIn/AICheckIn.tsx` | `src/pages/AICheckIn/AICheckIn.tsx` | KEEP then SPLIT later | Route component with too much logic. | High: `/check-in`, desktop/PWA. | `AppRoutes`, check-in feature. |
| `src/pages/AICheckIn/AICheckIn.module.scss` | colocate with page or split with moved feature components | SPLIT | 2208-line stylesheet likely covers multiple components. | High: visual regressions. | AICheckIn and child components. |
| `src/utils/submitScannedCheckInCode.ts` | `src/features/checkIn/utils/submitScannedCheckInCode.ts` | MOVE | Check-in workflow calls attendance/coach APIs. | High: QR/barcode/coach scan. | `AICheckIn`. |
| `src/utils/validateScannedCheckInCode.ts` | `src/features/checkIn/utils/validateScannedCheckInCode.ts` | MOVE | Check-in validation logic. | Medium: scanner validation. | `submitScannedCheckInCode`, `AICheckIn`. |
| `src/utils/playSound.ts` | `src/features/checkIn/utils/playSound.ts` | MOVE | Used by check-in/face scanner. | Medium: audio feedback. | `AICheckIn`, FaceScanner check-in. |
| `src/utils/speakText.ts` | `src/features/checkIn/utils/speakText.ts` | MOVE | Voice feedback for face scanner. | Medium: TTS/audio behavior. | `FaceScanner`. |
| `src/features/tts/api/ttsAPI.ts` | `src/features/checkIn/api/ttsAPI.ts` | MOVE | Appears check-in voice-specific and has no importers currently. | Low/Medium; verify before delete. | None currently. |
| `src/components/CountdownBadge.tsx` | `src/features/classSession/components/CountdownBadge.tsx` | MOVE | Only used by class session. | Low. | `SessionLayout`. |
| `src/components/DaySelector/*` | `src/features/classSchedule/components/DaySelector/*` | MOVE | Only used by class schedule. | Medium: schedule creation UI. | `ClassWeekView`. |
| `src/components/StatusFilters/*` | `src/features/coach/components/StatusFilters/*` | MOVE | Only used by coach filters. | Low/Medium. | `CoachFilters`. |
| `src/components/StudentScheduleSection/*` | `src/features/studentEnrollment/components/StudentScheduleSection/*` | MERGE | Global component imports student enrollment internals; duplicate exists. | High: class assignment modal and student assignment sections. | `CoachAssignmentSection`, `StudentAssignmentSection`. |
| `src/features/studentEnrollment/components/StudentScheduleSection/*` | same canonical target | MERGE | Duplicate/unused SCSS candidate. | High: avoid wrong duplicate deletion. | student enrollment internals. |
| `src/components/AssignmentSubjectHero/*` | `src/features/studentEnrollment/components/AssignmentSubjectHero/*` or `src/components/common/AssignmentSubjectHero/*` | MERGE | Duplicate exists; current global used by assignment flows. | High: coach update and student enrollment assignment. | `CoachUpdateModal`, `CoachAssignmentSection`, `StudentAssignmentSection`. |
| `src/features/studentEnrollment/components/AssignmentSubjectHero/*` | canonical target after verifying implementation | MERGE or DELETE_CANDIDATE | Duplicate currently appears unused. | Medium: must compare code before delete. | None currently. |
| `src/features/studentEnrollment/components/ClassAssignmentModal/*` | `src/features/studentEnrollment/components/ClassAssignmentModal/*` | KEEP initially | Feature component used by coach and student flows. | High: cross-feature assignment behavior. | `CoachCreateModal`, `CoachUpdateModal`, StudentManagement. |
| `src/features/studentEnrollment/components/StepProgress/*` | verify usage then keep/move/delete | DELETE_CANDIDATE | No importers found. | Low if truly unused. | None currently. |
| `src/features/studentEnrollment/components/StudentSearch/*` | `src/features/studentEnrollment/components/StudentSearch/*` | KEEP or DELETE_CANDIDATE | No importers currently but likely feature component. | Medium: may be planned. | None currently. |
| `src/features/classSchedule/api/classScheduleAPI.ts` | same | KEEP | Feature API. | Medium. | many. |
| `src/features/classSchedule/components/ClassCard/*` | same | KEEP, then remove page-query import | KEEP | Feature component, but imports AttendanceCheckin query helper. | High: schedule -> check-in navigation/preload. | Attendance query helpers. |
| `src/features/classSchedule/components/ClassWeekItem/*` | same | KEEP, then remove page-query import | KEEP | Feature component, but imports AttendanceCheckin query helper. | High. | Attendance query helpers. |
| `src/pages/AttendanceCheckin/attendanceCheckinQueries.ts` | `src/features/studentAttendance/queries/attendanceCheckinQueries.ts` | MOVE | Used by attendance page and class schedule feature. | High: query cache keys, prefetch. | AttendanceCheckin, ClassCard, ClassWeekItem. |
| `src/pages/ClassSchedules/classSchedulesQueries.ts` | `src/features/classSchedule/queries/classSchedulesQueries.ts` | MOVE | Query key/helper used by page and router preload. | Medium/High: prefetch/query cache. | ClassSchedules hooks, routePreload. |
| `src/pages/Dashboard/dashboardQueries.ts` | `src/pages/Dashboard/dashboardQueries.ts` initially | KEEP | Page-level dashboard aggregate query. | Medium: page barrel cycle can be fixed by imports. | Dashboard, routePreload. |
| `src/pages/AttendanceReports/components/AttendanceTable/*` | `src/features/studentAttendance/components/AttendanceTable/*` | MOVE | Imported by PersonalPage and StudentManagement; not page-local. | High: reports, profile attendance, student modal. | AttendanceReports, PersonalPage, StudentManagement. |
| `src/pages/AttendanceReports/components/AttendancePieChart/*` | `src/features/studentAttendance/components/AttendancePieChart/*` if reused; otherwise keep page-local | MOVE or KEEP | Currently page component; no external importers. | Medium: report visuals. | AttendanceReports. |
| `src/pages/AttendanceReports/components/AttendanceSummarySection/*` | `src/features/studentAttendance/components/AttendanceSummarySection/*` if reusable; otherwise keep page-local | MOVE or KEEP | Student attendance reporting component. | Medium. | AttendanceReports. |
| `src/pages/AttendanceReports/components/AttendanceFilterPanel/*` | `src/pages/AttendanceReports/components/AttendanceFilterPanel/*` initially | KEEP | Page-local filters unless reused. | Medium. | AttendanceReports. |
| `src/pages/AttendanceReports/components/AttendanceFilters/*` | `src/pages/AttendanceReports/components/AttendanceFilters/*` initially | KEEP | Page-local. | Medium. | AttendanceReports. |
| `src/pages/AttendanceReports/components/AttendancePageHeader/*` | `src/pages/AttendanceReports/components/AttendancePageHeader/*` initially | KEEP | Page-local header. | Low/Medium. | AttendanceReports. |
| `src/pages/AttendanceReports/components/SummaryStatCards/*` | `src/features/studentAttendance/components/SummaryStatCards/*` if reused; otherwise keep | MOVE or KEEP | Report summary; currently no external importers. | Medium. | AttendanceReports. |
| `src/pages/AttendanceReports/components/TrendCard/*` | `src/features/studentAttendance/components/TrendCard/*` if reused; otherwise keep | MOVE or KEEP | Report summary; currently no external importers. | Medium. | AttendanceReports. |
| `src/pages/AttendanceReports/components/CoachTimesheetTable.tsx` | `src/features/coach/components/CoachTimesheetTable.tsx` or keep page-local | MOVE or KEEP | Coach timesheet domain; only used by report page. | Medium: history/coach route. | AttendanceReports. |
| `src/pages/AttendanceReports/components/CoachTimesheetFilters.tsx` | `src/features/coach/components/CoachTimesheetFilters.tsx` or keep page-local | MOVE or KEEP | Coach timesheet domain; only used by report page. | Medium. | AttendanceReports. |
| `src/pages/AttendanceReports/components/SaveAttendanceConfirmContent/*` | `src/pages/AttendanceReports/components/SaveAttendanceConfirmContent/*` | KEEP | Page-local modal content. | Low. | AttendanceReports. |
| `src/components/CheckboxChip/*` | `src/components/common/CheckboxChip/*` or `src/pages/AttendanceReports/components/CheckboxChip/*` | MOVE | Currently only attendance report filters use it, but generic form control. | Low/Medium. | Attendance filters. |
| `src/components/Avatar/*` | `src/components/common/Avatar/*` | MOVE/RENAME | Shared app avatar; avoid confusion with `ui/avatar`. | Medium: many tables/cards. | Many feature/page imports. |
| `src/components/BeltBadge.tsx` | `src/components/common/BeltBadge/BeltBadge.tsx` | MOVE | Shared domain display component. | Medium. | Profile/ranking/student components. |
| `src/components/ConfirmModal/*` | `src/components/common/ConfirmModal/*` | MOVE | Shared confirmation modal. | Medium: modals across app. | many. |
| `src/components/Pagination/*` | `src/components/common/Pagination/*` | MOVE | Shared pagination component. | Medium: reports/student table. | pages. |
| `src/components/ComingSoonView/*` | `src/components/common/ComingSoonView/*` | MOVE | Shared placeholder. | Low. | AppRoutes, PersonalPage tabs. |
| `src/components/AccessDeniedView/*` | `src/app/errors/AccessDeniedView/*` or `src/components/common/AccessDeniedView/*` | MOVE | Route-level error view. | Low/Medium: `/403`. | AppRoutes. |
| `src/components/dev/RenderProfiler.tsx` | `src/components/dev/RenderProfiler.tsx` | KEEP | Dev utility; used by pages. | Low. | Attendance/ClassSchedules. |
| `src/components/ui/*` | `src/components/ui/*` | KEEP | UI primitives. | Medium if pruning unused. | many. |
| Unused `src/components/ui/*.tsx` primitives | same until verified | DELETE_CANDIDATE | Many generated primitives have no importers. | Low/Medium: future use, docs examples. | None currently. |
| `src/pages/Rankings/Components/*` | `src/pages/Rankings/components/*` | RENAME | Casing consistency. | Medium: route chunk/case-sensitive filesystems. | Rankings imports. |
| `src/pages/Rankings/Components/QuarterLeaderboard/*` | `src/features/report/components/QuarterLeaderboard/*` | MOVE | Leaderboard/report feature component. | High: ranking route. | Rankings. |
| `src/pages/Rankings/Components/ParticipantList/*` | `src/features/report/components/ParticipantList/*` | MOVE | Leaderboard component. | Medium. | Rankings. |
| `src/pages/Rankings/Components/PodiumSection/*` | `src/features/report/components/PodiumSection/*` | MOVE | Leaderboard component. | Medium. | Rankings. |
| `src/pages/Rankings/Components/PodiumStep/*` | `src/features/report/components/PodiumStep/*` | MOVE | Leaderboard component. | Medium. | PodiumSection. |
| `src/pages/Rankings/Components/CategoryTabs/*` | `src/pages/Rankings/components/CategoryTabs/*` or `features/report/components/CategoryTabs/*` | MOVE/RENAME | Ranking UI; casing fix. | Medium. | Rankings. |
| `src/pages/PersonalPage/components/ScoreTab/QuarterSummaryDetail/*` | `src/features/report/components/QuarterSummaryDetail/*` | MOVE | Imported by Rankings; not PersonalPage-local. | High: profile score and rankings. | ScoreTab, QuarterLeaderboard. |
| `src/pages/PersonalPage/components/AttendanceTab/*` | keep page tab route, but use feature AttendanceTable | KEEP | Personal tab route component. | Medium. | AppRoutes nested routes. |
| `src/pages/PersonalPage/components/ScoreTab/*` | keep route tab, move reusable detail child | SPLIT | Tab route plus reusable detail. | Medium. | AppRoutes, Rankings. |
| `src/pages/PersonalPage/components/TuitionTab/*` | KEEP | Profile tab route. | Low/Medium. | AppRoutes. |
| `src/pages/PersonalPage/components/TimesheetTab/*` | KEEP | Profile tab route. | Low/Medium. | AppRoutes. |
| `src/pages/PersonalPage/components/TabViews/*` | KEEP under page | KEEP | Profile route tab shell. | Medium: nested routes. | PersonalPage. |
| `src/pages/StudentManagement/components/*` | keep page-local except reused/importing report internals | KEEP/SPLIT | Mostly page-local. | Medium. | StudentManagement. |
| `src/pages/StudentManagement/components/AttendanceTableModal/*` | keep modal but import table from feature | KEEP | Modal is page-local; table dependency moves. | Medium. | StudentManagement. |
| `src/pages/ClassSchedules/hooks/useClassSchedulesLogic.ts` | `src/pages/ClassSchedules/hooks/useClassSchedulesLogic.ts` initially | KEEP | Page orchestration hook. | Medium: schedule page behavior. | ClassSchedules. |
| `src/pages/ClassSchedules/hooks/useClassSessionWebSocket.ts` | `src/features/classSession/hooks/useClassSessionWebSocket.ts` if reused; otherwise keep page | MOVE or KEEP | WebSocket likely class session infra. | Medium/High: realtime sessions. | ClassSchedules. |
| `src/pages/ExaminationManagement/components/*` | keep page-local | KEEP | Not shared outside page. | Medium: public exam route. | ExaminationManagement. |
| `src/store/history_exam.csv` | `src/pages/ExaminationManagement/data/history_exam.csv` | MOVE | Raw page data, not state store. | Medium: `?raw` import must be preserved. | EntranceExam. |
| `src/store/mau_kiem_tra.json` | `src/pages/ExaminationManagement/data/mau_kiem_tra.json` | MOVE | Raw page data, not state store. | Medium: `?raw` import must be preserved. | ModalDetailExam. |
| `src/utils/calculateUtils.ts` | `src/pages/ExaminationManagement/utils/calculateUtils.ts` or `src/features/examination/utils/calculateUtils.ts` | MOVE | Only used by examination page. | Medium: exam scoring. | EntranceExam, ModalDetailExam. |
| `src/pages/Facebook/*` | delete after confirmation or wire route | DELETE_CANDIDATE | No importers; current route uses placeholder. | Medium: hidden route expectations. | None currently. |
| `src/data/mockData.ts` | split into page/feature mock data | SPLIT | Huge mixed mock/static data file. | High: Dashboard and AttendanceCheckin current imports. | Dashboard, AttendanceCheckin. |
| `src/pages/PersonalPage/mockData.ts` | remove or move to docs/story/demo data after verification | DELETE_CANDIDATE | No importers. | Low/Medium. | None currently. |
| `src/docs/modal-scroll-lag-fix-guide.md` | `docs/modal-scroll-lag-fix-guide.md` | MOVE | Non-runtime documentation. | Low. | None runtime. |
| `src/features/README.md` | `docs/features.md` or keep if feature-local docs are allowed | MOVE or KEEP | Documentation, not runtime source. | Low. | None runtime. |
| `src/hooks/useCrud.ts` | `src/hooks/useCrud.ts` or `src/lib/react-query-hooks.ts` | KEEP initially | Global query/mutation abstraction used widely. | High: all data flows. | many. |
| `src/hooks/useDebounce.ts` | `src/hooks/useDebounce.ts` | KEEP | Generic hook. | Low. | StudentSearch, StudentManagement. |
| `src/hooks/useDocumentTitle.ts` | `src/hooks/useDocumentTitle.ts` | KEEP | Generic browser hook. | Low. | PersonalPage. |
| `src/hooks/useNavItems.ts` | `src/app/navigation/useNavItems.ts` | MOVE | Navigation/auth-specific. | Medium: header/sidebar nav. | Header, Sidebar. |
| `src/hooks/useNavigation.ts` | `src/app/navigation/useNavigation.ts` or feature-local | MOVE or KEEP | Route navigation helper used by schedule/check-in. | Medium. | ClassCard, ClassWeekItem, AttendanceHeader. |
| `src/hooks/useToggle.ts` | remove after verification | DELETE_CANDIDATE | 1-line unused. | Low. | None. |
| `src/utils/avatarColor.ts` | `src/utils/avatarColor.ts` | KEEP | Small pure shared utility. | Low. | Avatar, StudentCard. |
| `src/utils/getInitials.ts` | `src/utils/getInitials.ts` | KEEP | Small pure shared utility. | Low. | Avatar and feature components. |
| `src/utils/format.ts` | `src/utils/format.ts` | KEEP | Shared formatting. | Medium: many date/number displays. | many. |
| `src/utils/roleUtils.ts` | `src/app/auth/roleUtils.ts` or `src/features/auth/utils/roleUtils.ts` | MOVE later | Depends on auth store and role constants; not pure util. | High: authorization UI and route guards. | many. |
| `src/utils/getAppMode.ts` | `src/config/getAppMode.ts` or keep private to `appMode.ts` | MOVE or KEEP | Only used by appMode config. | Low/Medium: PWA mode. | appMode. |
| `src/utils/debugStorage.ts` | `src/utils/debugStorage.ts` | KEEP | Debug storage helper, used by infra/app. | Low/Medium. | axios, auth, check-in, guard. |
| `src/utils/mergeAttendanceData.ts` | `src/features/studentAttendance/utils/mergeAttendanceData.ts` | MOVE | Attendance domain merge logic. | High: attendance check-in. | AttendanceCheckin. |
| `src/utils/scheduleUtils.ts` | `src/features/classSchedule/utils/scheduleUtils.ts` | MOVE | Class schedule-specific. | Medium. | CreateClassScheduleModal. |
| `src/utils/windowOpenTab.ts` | `src/utils/windowOpenTab.ts` | KEEP | Generic browser helper. | Low. | CoachCard. |
| `src/utils/facebookUtils.ts` | delete or move with Facebook page if feature retained | DELETE_CANDIDATE | No importers. | Medium if Facebook page restored. | None. |
| `src/utils/storage.ts` | remove after verification | DELETE_CANDIDATE | 1-line unused. | Low. | None. |
| `src/services/masterDataApi.ts` | remove or feature API if implemented later | DELETE_CANDIDATE | 1-line unused. | Low. | None. |
| `src/services/uploadApi.ts` | remove or `src/lib/uploadApi.ts` if implemented later | DELETE_CANDIDATE | 1-line unused. | Low. | None. |
| `src/store/authStore.ts` | `src/store/authStore.ts` | KEEP | Global auth state. | High: auth/session. | many. |
| `src/store/themeStore.ts` | remove after verification | DELETE_CANDIDATE | 1-line unused. | Low. | None. |
| `src/types/index.ts` | reduce, then phase out broad imports | SPLIT | Heavy barrel and circular dependency. | High: many imports. | many. |
| `src/types/Core/*` | keep initially, then break cycles | KEEP/SPLIT | Shared domain types with cycles. | High: compile behavior. | feature APIs/pages. |
| `src/types/Operation/*` | keep initially, then move feature-owned types | KEEP/SPLIT | Some operation types are feature-specific. | High. | many. |
| `src/types/Report/*` | `src/features/report/types/*` if report-owned | MOVE later | Report/leaderboard-specific types. | Medium. | report API/rankings. |
| `src/types/Skill/*` | `src/features/fitness/types/*` or `src/features/report/types/*` | MOVE later | Fitness record domain. | Medium. | report/fitness. |
| `src/config/constants/path.ts` | `src/app/navigation/path.ts` | MOVE | Navigation route item config. | High: nav, profile tabs, bottom nav. | Header, Sidebar, BottomNav, TabViews, Utilities. |
| `src/config/constants/ListActionDropDown.ts` | `src/app/navigation/listActionDropdown.ts` | MOVE/RENAME | Not pure constant; imports auth store. | Medium: sidebar/rankings actions. | Sidebar, Rankings. |
| `src/config/constants/*Enums.ts` | `src/config/constants/*Enums.ts` | KEEP initially | Shared enums/constants. | Medium. | types/features/pages. |
| `src/config/constants/ReportEnums.ts` | remove after verification | DELETE_CANDIDATE | No importers. | Low. | None. |
| `src/styles/*` | `src/styles/*` | KEEP | Global tokens/fonts/theme/tailwind. | Medium: all SCSS. | global CSS and Vite SCSS injection. |
| `src/index.css` | `src/index.css` or `src/app/styles/index.css` | KEEP initially | Vite entry global CSS. | Medium: global styling. | `main.tsx`. |
| `public/firebase-messaging-sw.js` | keep public | KEEP | Service worker must remain public URL. | High: FCM background notifications. | SW registration. |
| `public/fcm-config.js` | keep generated public file | KEEP | Generated by Vite plugin. | High: FCM config. | service worker. |
| `public/manifest.json` | keep public | KEEP | PWA manifest. | High: install behavior. | browser. |
| `public/models/blaze_face_short_range.tflite` | keep public | KEEP | MediaPipe model path. | High: face scanner. | FaceScanner detector. |

## High-Risk Move Details

### Router Moves

Affected routes:

- `/welcome`
- `/login`
- `/403`
- `/public/exam`
- `/rankings/*`
- `/`
- `/coaches`
- `/students`
- `/schedules`
- `/schedules/:scheduleId`
- `/history`
- `/history/:historyMode`
- `/check-in`
- `/:userCode/*`

Validation:

- `npm run build`
- Manual desktop route navigation through all main routes.
- Manual PWA route navigation for stack layout and bottom nav.
- Verify lazy chunks load for moved page imports.
- Verify `routePreload.ts` still prefetches dashboard, students, schedules, history, rankings, and profile routes.

### PWA Moves

Affected:

- `PullToRefresh`
- `MainLayout`
- `PwaStackScreenLayout`
- `BottomNavigationBar`
- `/check-in` fullscreen route

Validation:

- PWA mode with `APP_MODE`.
- Pull-to-refresh on dashboard, schedules, and attendance pages.
- Safe-area and bottom nav spacing.
- `/check-in` should stay fullscreen and not show normal shell.

### Firebase/FCM Moves

Affected:

- `src/firebase.ts`
- `src/services/fcm.ts`
- `public/firebase-messaging-sw.js`
- `public/fcm-config.js`
- `vite.config.ts` plugin

Validation:

- `npm run build`
- Browser permission request.
- Foreground notification.
- Background notification.
- FCM token sync after login.
- Logout cleanup if currently wired by auth flow.

### Type Refactor

Affected:

- `src/types/index.ts`
- `src/types/Core/*`
- `src/types/Operation/*`
- feature API imports

Validation:

- `npm run build`
- No new circular dependency candidates.
- No runtime imports accidentally introduced by type-only modules.

## Execution Phases

Each phase is executed in the same continuous session, with a separate commit after validation passes. Use `git mv` when moving files.

### Phase 0 - Clean Lint Baseline

Files affected:

- `src/components/BottomNavigationBar/BottomNavigationBar.tsx`
- `src/features/classSession/components/CreateSessionModal/CreateSessionModal.tsx`

Purpose:

- Fix the existing lint baseline before structural moves.
- Do not move files in this phase.
- Do not use `eslint-disable`, `@ts-ignore`, or behavior deletion.

Risks:

- Bottom navigation pending-state behavior.
- Create session modal close/reset behavior.

Rollback:

- Revert the two touched files.

Validation:

- `npm run lint`
- `npm run build`

Suggested commit:

`fix(frontend): establish clean lint baseline before structure refactor`

### Phase A - App Router And Bootstrap Skeleton

Files affected:

- `src/App.tsx`
- `src/main.tsx`
- `src/routes/*`
- `src/config/RequireRole.tsx`
- optionally `src/app/*` new folders

Purpose:

- Introduce `src/app/router`, `src/app/guards`, and optionally `src/app/App.tsx`.
- Keep feature/page logic untouched.
- Avoid changing route URLs.

Risks:

- Lazy imports and route preload.
- Maintenance mode.
- Auth hydration fallback.

Rollback:

- Move files back with `git mv`.
- Restore import paths from previous commit.

Validation:

- `npm run build`
- `npm run lint` only as baseline check; current lint is known failing.
- Manual smoke: `/welcome`, `/login`, `/`, `/students`, `/schedules`, `/check-in`, profile route.

Suggested commit:

`refactor(app): colocate router and guards under app shell`

### Phase B - Layout-Owned Shell Components

Files affected:

- `src/components/Header/*`
- `src/components/Sidebar/*`
- `src/components/BottomNavigationBar/*`
- `src/components/LeftPanel/*`
- `src/layouts/MainLayout/*`
- `src/layouts/AuthLayout/*`

Purpose:

- Move layout-only components next to layouts.
- Keep UI unchanged.

Risks:

- Desktop sidebar/header.
- PWA bottom nav and route preload.
- AuthLayout login visual.

Rollback:

- `git mv` components back and restore imports.

Validation:

- `npm run build`
- Desktop navigation open/close sidebar.
- PWA bottom nav.
- Login page layout.

Suggested commit:

`refactor(layouts): colocate shell components with layouts`

### Phase C - Shared Components Cleanup

Files affected:

- `src/components/Avatar/*`
- `src/components/BeltBadge.tsx`
- `src/components/ConfirmModal/*`
- `src/components/Pagination/*`
- `src/components/ComingSoonView/*`
- `src/components/AccessDeniedView/*`
- `src/components/CheckboxChip/*`
- `src/components/AppErrorBoundary.tsx`
- `src/components/ui/*` only for import path normalization, not deletion

Purpose:

- Separate `components/ui` primitives from `components/common` and app errors.
- Do not delete unused UI primitives in this phase.

Risks:

- Many import paths.
- Modal behavior.
- Table pagination.

Rollback:

- Move common components back.
- Restore imports.

Validation:

- `npm run build`
- ConfirmModal flows: logout, attendance submit, class/session modals.
- Pagination in reports and student management.
- `/403`.

Suggested commit:

`refactor(components): separate common components from ui primitives`

### Phase D - Auth And Check-In Feature Ownership

Files affected:

- `src/components/LoginForm/*`
- `src/features/auth/*`
- `src/components/FaceScanner/*`
- `src/pages/AICheckIn/*`
- `src/utils/submitScannedCheckInCode.ts`
- `src/utils/validateScannedCheckInCode.ts`
- `src/utils/playSound.ts`
- `src/utils/speakText.ts`
- `src/features/tts/api/ttsAPI.ts`

Purpose:

- Move auth-specific form into auth feature.
- Create `features/checkIn` for scanner, QR/barcode validation, audio/voice check-in utilities.

Risks:

- Login/auth behavior.
- Camera permissions.
- MediaPipe model path.
- Desktop face scan vs PWA code scan.
- Audio/voice flow.

Rollback:

- Move files back with `git mv`.
- Restore imports in `LoginPage`, `AICheckIn`, and scanner internals.

Validation:

- `npm run build`
- Login success/failure.
- FCM token sync after auth if currently triggered.
- Desktop face scanner starts/stops and submits.
- PWA/mobile code scanner path.
- Audio playback and TTS.

Suggested commit:

`refactor(features): move auth form and check-in scanner ownership`

### Phase E - Feature-Specific Shared Component Moves

Files affected:

- `src/components/CountdownBadge.tsx`
- `src/components/DaySelector/*`
- `src/components/StatusFilters/*`
- `src/components/StudentScheduleSection/*`
- `src/features/studentEnrollment/components/StudentScheduleSection/*`
- `src/components/AssignmentSubjectHero/*`
- `src/features/studentEnrollment/components/AssignmentSubjectHero/*`

Purpose:

- Remove feature dependencies from global components.
- Merge duplicate assignment/student schedule components.

Risks:

- Class session layout countdown.
- Class schedule view/creation.
- Coach filters.
- Student/coach assignment flows.

Rollback:

- Restore previous global components and imports.

Validation:

- `npm run build`
- Class schedule view.
- Create class schedule modal.
- Coach create/update modal.
- Student assignment modal.

Suggested commit:

`refactor(features): colocate feature-owned components`

### Phase F - Remove Page-To-Page Imports

Files affected:

- `src/pages/AttendanceReports/components/AttendanceTable/*`
- `src/pages/PersonalPage/components/AttendanceTab/*`
- `src/pages/StudentManagement/components/AttendanceTableModal/*`
- `src/pages/PersonalPage/components/ScoreTab/QuarterSummaryDetail/*`
- `src/pages/Rankings/Components/*`
- `src/features/report/*`
- `src/features/studentAttendance/*`

Purpose:

- Move reusable report/attendance/ranking pieces to features.
- Rename `Rankings/Components` to `Rankings/components` if components remain page-local.

Risks:

- `/history`, `/history/student`, `/history/coach`.
- Profile attendance tab.
- Student attendance modal.
- `/rankings/score`, `/rankings/fitness`.
- SCSS module paths.

Rollback:

- Move components back to page folders and restore imports.

Validation:

- `npm run build`
- Attendance reports in both modes.
- Profile tabs: progress/score.
- Student management attendance modal.
- Rankings score/fitness.

Suggested commit:

`refactor(pages): remove cross-page component imports`

### Phase G - Queries, Data, And Examination Assets

Files affected:

- `src/pages/AttendanceCheckin/attendanceCheckinQueries.ts`
- `src/pages/ClassSchedules/classSchedulesQueries.ts`
- `src/data/mockData.ts`
- `src/store/history_exam.csv`
- `src/store/mau_kiem_tra.json`
- `src/utils/calculateUtils.ts`
- `src/pages/ExaminationManagement/*`

Purpose:

- Move query helpers to feature-owned query modules.
- Split mock data by consumer.
- Move raw exam data out of store.

Risks:

- Query cache key changes if not preserved.
- `?raw` imports for CSV/JSON.
- Exam calculations.
- Dashboard fallback/static charts.
- Attendance check-in `CLASS_SESSION` fallback.

Rollback:

- Move files back and restore imports.

Validation:

- `npm run build`
- Dashboard charts/cards.
- Attendance check-in.
- Public exam route `/public/exam`.
- Verify raw CSV/JSON still load.

Suggested commit:

`refactor(data): colocate query helpers and static data`

### Phase H - Firebase/FCM Integration Module

Files affected:

- `src/firebase.ts`
- `src/services/fcm.ts`
- imports in `src/main.tsx` and auth hook

Purpose:

- Move Firebase client and FCM workflow into `src/integrations/firebase`.

Risks:

- Notification permission.
- Foreground/background notifications.
- Service worker URL and config query string.
- Token sync and cleanup.

Rollback:

- Move files back and restore imports.

Validation:

- `npm run build`
- Browser notification permission.
- Foreground notification.
- Background notification.
- Login-triggered token sync.

Suggested commit:

`refactor(integrations): colocate firebase messaging client`

### Phase I - Types And Constants Boundaries

Files affected:

- `src/types/index.ts`
- `src/types/Core/*`
- `src/types/Operation/*`
- `src/types/Report/*`
- `src/types/Skill/*`
- `src/config/constants/path.ts`
- `src/config/constants/ListActionDropDown.ts`
- feature API imports

Purpose:

- Break type cycles.
- Move navigation constants to app navigation.
- Keep shared enums stable.
- Move feature-specific report/skill types only after imports are explicit.

Risks:

- Many compile errors if done too broadly.
- Hidden runtime imports from type files.
- Nav/profile tab behavior.

Rollback:

- Restore type imports from previous commit.
- Do not mix with source file moves.

Validation:

- `npm run build`
- Circular dependency scan.
- Navigation smoke.

Suggested commit:

`refactor(types): reduce global barrels and break type cycles`

### Phase J - Dead Code Verification And Pruning

Files affected:

- Empty/stub files.
- Unused UI primitives.
- Unused Facebook page files if approved.
- Unused mock data.
- Unused feature placeholders.

Purpose:

- Delete only after import graph, build, and manual route verification.

Risks:

- Future planned components.
- Dynamic imports missed by regex.
- Story/demo/docs references outside build.

Rollback:

- Restore deleted files from git.

Validation:

- `npm run build`
- `npm run lint` if baseline lint has been fixed.
- `rg` for deleted names.
- Manual route smoke.

Suggested commit:

`chore(frontend): remove verified unused source files`

## Validation Matrix

Scripts that currently exist:

- `npm run lint`
- `npm run build`

Scripts that do not currently exist:

- `npm run typecheck`
- `npm run test`

Per phase:

- Always run `npm run build`.
- Run `npm run lint`.
- Phase 0 establishes a clean lint baseline; from Phase A onward lint must pass before committing.
- Do not claim tests were run unless a test script is added.

Manual validation checklist:

- TypeScript compile via `npm run build`.
- Vite production build.
- Route lazy imports.
- Dynamic imports in `routePreload.ts`.
- SCSS Modules after file moves.
- Asset URLs, especially `/taekwondo.jpg`, icons, MediaPipe model, and `?raw` CSV/JSON.
- Firebase initialization.
- FCM service worker registration.
- Desktop navigation: sidebar/header.
- PWA navigation: bottom nav/stack layout.
- PWA safe-area and pull-to-refresh.
- Modal behavior: confirm modal, class/session modals, eval sheet.
- Authentication flow: welcome -> login -> protected routes -> logout.
- Desktop and PWA check-in.

## Commit Strategy

Use small commits by ownership boundary:

1. `refactor(app): colocate router and guards under app shell`
2. `refactor(layouts): colocate shell components with layouts`
3. `refactor(components): separate common components from ui primitives`
4. `refactor(features): move auth form and check-in scanner ownership`
5. `refactor(features): colocate feature-owned components`
6. `refactor(pages): remove cross-page component imports`
7. `refactor(data): colocate query helpers and static data`
8. `refactor(integrations): colocate firebase messaging client`
9. `refactor(types): reduce global barrels and break type cycles`
10. `chore(frontend): remove verified unused source files`

Avoid:

- Bulk formatting.
- Mixed behavior fixes inside move commits.
- Deleting files in the same commit as broad moves unless the file is proven unused and the commit is only cleanup.

## Rollback Strategy

- Use `git mv` for moves so history remains traceable.
- Keep each phase independently reversible.
- If a phase fails build, revert only that phase.
- If a manual route check fails, revert or patch within that phase before proceeding.
- Do not stack Phase B/C/D on top of a failing Phase A.

## Decisions Needed Before Implementation

1. Should `src/main.tsx` fully move to `src/app/main.tsx`, or should root `src/main.tsx` remain as a thin Vite entry shim?
2. Should Firebase live in `src/integrations/firebase` or `src/lib/firebase`?
3. Should `PullToRefresh` be treated as `app/providers/pull-to-refresh` or `components/pwa/PullToRefresh`?
4. Should `AssignmentSubjectHero` be feature-owned by `studentEnrollment`, or shared under `components/common` because coach assignment also uses it?
5. Should a new `features/checkIn` be created for face/QR/barcode/TTS, or should this remain page-local under `pages/AICheckIn`?
6. Should report/ranking components move into existing `features/report`, or should the feature be renamed/split later into `features/leaderboard`?
7. Should the unused Facebook page be deleted after verification, or wired into `/marketing/facebook`?
8. Should empty `application`, `presentation`, `infrastructure` index files be removed now, or kept as placeholders for a future layering plan?
9. Should unused shadcn/Radix UI primitives be pruned, or kept as generated design-system inventory?
10. Should baseline lint issues be fixed before structural refactor so lint can become a reliable regression gate?

## Definition Of Done

The refactor is done only when:

- All approved phases are completed.
- Each phase has its own commit.
- No route URL changed.
- No API contract changed.
- No auth state shape changed.
- Firebase/FCM behavior is verified.
- Desktop and PWA navigation are verified.
- Pull-to-refresh and safe-area behavior are verified.
- `npm run build` passes.
- `npm run lint` passes.
- Dead code deletions are backed by import graph plus build/manual verification.
- No new circular dependencies are introduced.
- The final folder structure matches the approved target or any approved deviations are documented.
- `docs/FRONTEND_STRUCTURE_REFACTOR_PROGRESS.md` and `docs/FRONTEND_STRUCTURE_REFACTOR_RESULT.md` are complete.
- Final `git status --short` is clean.
