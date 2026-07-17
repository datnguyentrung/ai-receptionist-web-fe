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

- `b7802ff`

Risks/manual checks remaining:

- Login success/failure and support modal.
- Desktop face scanner camera lifecycle.
- PWA QR/barcode check-in.
- Audio/TTS behavior.

## Phase E - Feature-Owned Components

Status: Completed

Moved files/folders:

- `src/components/CountdownBadge/` -> `src/features/classSession/components/CountdownBadge/`
- `src/components/DaySelector/` -> `src/features/classSchedule/components/DaySelector/`
- `src/components/StatusFilters/` -> `src/features/coach/components/StatusFilters/`
- `src/utils/scheduleUtils.ts` -> `src/features/classSchedule/utils/scheduleUtils.ts`
- `src/components/AssignmentSubjectHero/` -> `src/features/studentEnrollment/components/AssignmentSubjectHero/`
- `src/components/StudentScheduleSection/` -> `src/features/studentEnrollment/components/StudentScheduleSection/`

Edited files:

- `src/features/classSession/components/SessionLayout/SessionLayout.tsx`
- `src/features/classSchedule/components/ClassWeekView/ClassWeekView.tsx`
- `src/features/classSchedule/components/CreateClassScheduleModal/CreateClassScheduleModal.tsx`
- `src/features/coach/components/CoachFilters/CoachFilters.tsx`
- `src/features/coach/components/CoachUpdateModal/CoachUpdateModal.tsx`
- `src/features/coach/components/StatusFilters/StatusFilters.tsx`
- `src/features/studentEnrollment/components/ClassAssignmentModal/CoachAssignmentSection.tsx`
- `src/features/studentEnrollment/components/StudentAssignmentSection/StudentAssignmentSection.tsx`

Circular dependencies addressed:

- Removed global shared-component placement for components that are only used by one business area or by assignment flows.
- Replaced duplicate `StudentScheduleSection` feature wrapper with the runtime implementation.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- `1b5e325`

Risks/manual checks remaining:

- Class session countdown badge timing text.
- Class schedule day selector and create schedule ID generation.
- Coach filter hover disabled state.
- Student/coach assignment modal hero and schedule section visuals.

## Phase F - Cross-Page Component Dependencies

Status: Completed

Moved files/folders:

- `src/pages/AttendanceReports/components/AttendanceTable/` -> `src/features/studentAttendance/components/AttendanceTable/`
- `src/pages/PersonalPage/components/ScoreTab/QuarterSummaryDetail/` -> `src/features/report/components/QuarterSummaryDetail/`
- `src/pages/Rankings/Components/ParticipantList/` -> `src/features/report/components/ParticipantList/`
- `src/pages/Rankings/Components/PodiumSection/` -> `src/features/report/components/PodiumSection/`
- `src/pages/Rankings/Components/PodiumStep/` -> `src/features/report/components/PodiumStep/`
- `src/pages/Rankings/Components/QuarterLeaderboard/` -> `src/features/report/components/QuarterLeaderboard/`
- `src/pages/Rankings/Components/CategoryTabs/` -> `src/pages/Rankings/components/CategoryTabs/`

Edited files:

- `src/pages/AttendanceReports/AttendanceReports.tsx`
- `src/pages/AttendanceReports/components/CoachTimesheetTable/CoachTimesheetTable.tsx`
- `src/pages/PersonalPage/components/AttendanceTab/AttendanceTab.tsx`
- `src/pages/PersonalPage/components/ScoreTab/ScoreTab.tsx`
- `src/pages/Rankings/Rankings.tsx`
- `src/pages/StudentManagement/components/AttendanceTableModal/AttendanceTableModal.tsx`
- moved report and attendance components after path depth changed.

Circular dependencies addressed:

- `AttendanceTable` no longer belongs to `AttendanceReports` while being consumed by PersonalPage and StudentManagement.
- `QuarterSummaryDetail` no longer belongs to PersonalPage while being consumed by Rankings.
- Ranking podium/list/leaderboard components now live under the report feature instead of a route folder.
- `AttendanceTable` no longer imports `AttendanceBadge` and `ClipboardList` through the `studentAttendance` feature barrel.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- `85cc551`

Risks/manual checks remaining:

- Attendance reports table and coach timesheet table visual parity.
- Student attendance history modal.
- Personal profile attendance and score tabs.
- Rankings score/fitness tabs, podium, expanded details, and category URL changes.

## Phase G - Queries And Static Data Ownership

Status: Completed

Moved files/folders:

- `src/pages/AttendanceCheckin/attendanceCheckinQueries.ts` -> `src/features/studentAttendance/queries/attendanceCheckinQueries.ts`
- `src/pages/ClassSchedules/classSchedulesQueries.ts` -> `src/features/classSchedule/queries/classSchedulesQueries.ts`
- `src/store/history_exam.csv` -> `src/pages/ExaminationManagement/data/history_exam.csv`
- `src/store/mau_kiem_tra.json` -> `src/pages/ExaminationManagement/data/mau_kiem_tra.json`
- `src/utils/calculateUtils.ts` -> `src/pages/ExaminationManagement/utils/calculateUtils.ts`

Created files/folders:

- `src/pages/Dashboard/data/dashboardMockData.ts`
- `src/pages/AttendanceCheckin/data/attendanceCheckinMockData.ts`

Deleted files:

- `src/data/mockData.ts` after splitting the only runtime-used exports into page-local data files.

Edited files:

- `src/app/router/routePreload.ts`
- `src/features/classSchedule/components/ClassCard/ClassCard.tsx`
- `src/features/classSchedule/components/ClassWeekItem/ClassWeekItem.tsx`
- `src/pages/AttendanceCheckin/AttendanceCheckin.tsx`
- `src/pages/ClassSchedules/hooks/useClassSchedulesLogic.ts`
- `src/pages/Dashboard/Dashboard.tsx`
- `src/pages/ExaminationManagement/components/EntranceExam/EntranceExam.tsx`
- `src/pages/ExaminationManagement/components/ModalDetailExam/ModalDetailExam.tsx`

Circular dependencies addressed:

- Class schedule query keys are now owned by the classSchedule feature rather than a route page.
- Attendance check-in prefetch/query keys are now owned by studentAttendance rather than a route page.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- `16ed232`

Risks/manual checks remaining:

- Class schedule route preload cache key behavior.
- Attendance check-in prefetch and pull-to-refresh data behavior.
- Dashboard charts and metric cards using split mock data.
- ExaminationManagement raw CSV/JSON parsing and detail modal.

## Phase H - Firebase Integration Ownership

Status: Completed

Moved files/folders:

- `src/firebase.ts` -> `src/integrations/firebase/client.ts`
- `src/services/fcm.ts` -> `src/integrations/firebase/fcm.ts`

Edited files:

- `src/app/main.tsx`
- `src/features/auth/api/useAuthentication.ts`
- `src/integrations/firebase/fcm.ts`

Circular dependencies addressed:

- Firebase client initialization and FCM browser integration are now grouped under `integrations/firebase` instead of root `firebase.ts` plus global `services`.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- `3280498`

Risks/manual checks remaining:

- Firebase initialization with environment variables.
- Notification permission request after login.
- FCM foreground notification listener.
- FCM token sync and cleanup on logout.
- Existing public Firebase service worker registration path.

## Phase I - Navigation, Naming, Aliases, And Docs

Status: Completed

Moved/renamed files/folders:

- `src/config/constants/path.ts` -> `src/app/navigation/path.ts`
- `src/config/constants/ListActionDropDown.ts` -> `src/app/navigation/listActionDropdown.ts`
- `src/hooks/useNavItems.ts` -> `src/app/navigation/useNavItems.ts`
- `src/hooks/useNavigation.ts` -> `src/app/navigation/useNavigation.ts`
- `src/features/fitness/apis/` -> `src/features/fitness/api/`
- `src/features/report/apis/` -> `src/features/report/api/`
- `src/docs/modal-scroll-lag-fix-guide.md` -> `docs/modal-scroll-lag-fix-guide.md`
- `src/features/README.md` -> `docs/features.md`

Edited files:

- App router, layout navigation, rankings, utilities, profile tabs, schedule cards/items, attendance header.
- `vite.config.ts`
- `tsconfig.app.json`
- `src/types/Operation/StudentAttendanceTypes.ts`

Circular dependencies addressed:

- `StudentAttendanceTypes` no longer imports `PageResponse` and `UserResponse` through `types/index.ts`.
- Navigation config/hook files no longer live under generic constants/hooks.
- API folder naming is now consistent for fitness/report features.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- `f447a88`

Risks/manual checks remaining:

- Desktop sidebar/header active navigation.
- PWA bottom navigation.
- Utilities route cards.
- Personal profile tabs.
- Rankings category tabs and report preload.
- Fitness standards modal data.

## Phase J - Verified Cleanup And Final Report

Status: Completed

Deleted files/folders:

- `src/pages/Facebook/`
- `src/utils/facebookUtils.ts`
- `src/hooks/useToggle.ts`
- `src/services/masterDataApi.ts`
- `src/services/uploadApi.ts`
- `src/store/themeStore.ts`
- `src/utils/storage.ts`

Created files:

- `docs/FRONTEND_STRUCTURE_REFACTOR_RESULT.md`

Verification before delete:

- `rg` found no source imports/usages for the deleted files.
- `/marketing/facebook` was already routed to a placeholder, not `src/pages/Facebook`.
- Empty directories such as `src/docs`, `src/routes`, `src/services`, `src/data`, and `src/features/tts` are no longer represented by tracked files.

Validation:

- `npm run lint`: passed.
- `npm run build`: passed.

Commit:

- This commit.

Risks/manual checks remaining:

- Hidden/manual expectations around the old Facebook placeholder files, if any external process referenced them directly.
