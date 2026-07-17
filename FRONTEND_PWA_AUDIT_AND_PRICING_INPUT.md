# FRONTEND PWA AUDIT AND PRICING INPUT

> Phạm vi kiểm kê: `src/` và `public/` của dự án `D:\ai-receptionist-web\ai-receptionist-web-fe`.
>
> Ngày lập báo cáo: 2026-07-16.
>
> Nguyên tắc: chỉ kết luận dựa trên bằng chứng trong mã nguồn. Các thông tin không đủ căn cứ được ghi rõ là `Không đủ bằng chứng từ mã nguồn.`

## 1. Executive Summary

Dự án là một Frontend Web/PWA cho hệ thống quản lý trung tâm Taekwondo, có phạm vi nghiệp vụ khá rộng: đăng nhập, phân quyền theo vai trò, dashboard, quản lý huấn luyện viên, quản lý học viên, phân lớp, lịch học, buổi học, điểm danh, báo cáo điểm danh, chấm công huấn luyện viên, hồ sơ cá nhân, bảng xếp hạng, khảo thí, AI/camera/QR check-in, push notification và trải nghiệm PWA/mobile.

Về kỹ thuật, dự án không phải là giao diện tĩnh đơn giản. Có nhiều phần tích hợp thật với Backend qua Axios/React Query, cơ chế refresh token có queue, route guard, role guard, lazy loading, route preloading, PWA app-mode detection, Firebase Cloud Messaging, service worker nhận notification, camera/QR scanner, MediaPipe face detector, WebSocket cho class session và nhiều trạng thái loading/error/empty.

Tuy nhiên mức hoàn thiện chưa đạt chuẩn sản phẩm thương mại chuyên nghiệp đầy đủ. Các điểm cần trừ giá gồm: không có test tự động trong source, dashboard còn dùng nhiều mock data, nhiều màn hình/tab đang `ComingSoonView` hoặc placeholder, service worker chỉ phục vụ FCM chứ chưa có offline cache strategy, có log nhạy cảm ở luồng login, token lưu ở `localStorage`, chưa có bằng chứng user research/usability testing/accessibility audit/design system được tài liệu hóa.

Kết luận định giá nên tách thành:

| Nhóm giá trị | Kết luận |
| --- | --- |
| Giá trị chức năng | Khá cao đối với một sản phẩm SME vì có nhiều module nghiệp vụ thật và tích hợp thiết bị/PWA. |
| Giá trị kỹ thuật | Trung bình khá: kiến trúc có tổ chức, nhưng thiếu test, còn mock/placeholder và có technical debt bảo mật/logging. |
| UI implementation | Có đầu tư responsive, modal, skeleton, table, card, bottom navigation, PWA/mobile shell. |
| UX kỹ thuật | Có loading/error/empty, pull-to-refresh, disable state, confirm modal, toast, route preload, scanner feedback. |
| UI/UX chuyên nghiệp | Không đủ bằng chứng từ mã nguồn để tính như một đội UI/UX chuyên nghiệp. |

Đề xuất hệ số chất lượng Frontend: **0.78**.

Ước lượng công triển khai lại cùng phạm vi hiện có bởi một Frontend Developer có kinh nghiệm:

| Mức ước lượng | Ngày công |
| --- | ---: |
| Thấp | 120 |
| Trung bình | 184 |
| Cao | 282 |

Ước lượng này không bao gồm việc hoàn thiện UI/UX research chuyên nghiệp, bộ test đầy đủ, offline-first PWA, hardening bảo mật đầy đủ hoặc tài liệu hóa sản phẩm ở mức agency.

## 2. Thông tin dự án

| Hạng mục | Kết luận | Bằng chứng |
| --- | --- | --- |
| Framework | Vite + React 19 | `package.json`: `vite`, `react`, `@vitejs/plugin-react` |
| Ngôn ngữ | TypeScript | `package.json`, `tsconfig.app.json` |
| UI/CSS | Tailwind CSS 4, SCSS module, Radix UI primitives, lucide icons | `vite.config.ts`, `src/components/ui/*`, nhiều `*.module.scss` |
| State management | Zustand + TanStack Query | `src/store/authStore.ts`, `src/lib/react-query.ts`, `@tanstack/react-query` |
| Router | React Router 7 | `src/routes/AppRoutes.tsx`, `react-router-dom` |
| HTTP client | Axios + axios-retry | `src/lib/axiosInstance.ts` |
| PWA | Manifest, icons, app-mode detection, safe-area/mobile layout, FCM service worker | `public/manifest.json`, `public/firebase-messaging-sw.js`, `src/config/appMode.ts` |
| Push notification | Firebase Cloud Messaging foreground/background | `src/services/fcm.ts`, `public/firebase-messaging-sw.js` |
| Realtime | WebSocket cho class sessions | `src/pages/ClassSchedules/hooks/useClassSessionWebSocket.ts` |
| Camera/QR | Face scanner, MediaPipe, QR/barcode scanner | `src/components/FaceScanner/*`, `src/pages/AICheckIn/components/MobileCodeScanner.tsx` |
| Testing | Không thấy test tự động | Không có file `*.test.*`, `*.spec.*` hoặc `__tests__` trong `src/` |
| Hosting | Không đủ bằng chứng từ mã nguồn | Không thấy cấu hình hosting cụ thể trong phạm vi `src/`, `public/` |
| Role | 8 level role khai báo | `src/config/constants/roleLevels.ts`: `GUEST`, `STUDENT`, `PARENT`, `ASSISTANT`, `COACH`, `MANAGER_SENIOR`, `HEAD_COACH`, `DEVELOPER` |
| Số người dùng dự kiến | Không đủ bằng chứng từ mã nguồn | Không có tài liệu sizing/capacity |
| Số cơ sở | Có xử lý `branchId`/branch filter nhưng không xác định số lượng | `src/pages/AttendanceReports/components/StudentAttendanceReportsContent.tsx`, `src/pages/StudentManagement/StudentManagement.tsx` |

## 3. Kiến trúc Frontend

### 3.1 Tổng quan kiến trúc

| Hạng mục | Đánh giá | Bằng chứng |
| --- | --- | --- |
| Cấu trúc thư mục | Hybrid feature-based + page-based + shared components | `src/features/*`, `src/pages/*`, `src/components/*`, `src/layouts/*`, `src/services/*` |
| Routing | Tập trung tại một file, có lazy import và nested route | `src/routes/AppRoutes.tsx` |
| Lazy loading | Có lazy cho page/layout lớn và scanner | `src/routes/AppRoutes.tsx`, `src/pages/AICheckIn/AICheckIn.tsx` |
| Route preloading | Có prefetch theo route và bottom nav | `src/routes/routePreload.ts`, `src/components/BottomNavigationBar/BottomNavigationBar.tsx` |
| Authentication | Login/logout qua API, lưu token, hydrate Zustand | `src/features/auth/api/useAuthentication.ts`, `src/store/authStore.ts` |
| Refresh token | Có refresh queue khi 401 | `src/lib/axiosInstance.ts` |
| Authorization | Có `RequireRole`, role level, nav theo role | `src/config/RequireRole.tsx`, `src/config/constants/roleLevels.ts`, `src/config/constants/path.ts` |
| API abstraction | Có service theo feature, axios instance chung | `src/features/*/api/*.ts`, `src/lib/axiosInstance.ts` |
| Error handling | React Query global error toast, ErrorBoundary, retry axios | `src/lib/react-query.ts`, `src/components/AppErrorBoundary.tsx`, `src/lib/axiosInstance.ts` |
| Notification/toast | `sonner` toast + FCM notification | `src/App.tsx`, `src/services/fcm.ts` |
| Form handling | Nhiều form tự quản state/validation; có dependency `react-hook-form` nhưng chưa thấy dùng rộng | `src/components/LoginForm/LoginForm.tsx`, `src/features/coach/components/CoachCreateModal/CoachCreateModal.tsx` |
| Validation | Có validation thủ công ở login, QR code, form coach/student/class | `src/components/LoginForm/LoginForm.tsx`, `src/utils/validateScannedCheckInCode.ts` |
| Cache client | React Query cache + localStorage cho auth/quick utilities/FCM token | `src/lib/react-query.ts`, `src/store/authStore.ts`, `src/pages/UtilitiesPage/UtilitiesPage.tsx`, `src/services/fcm.ts` |
| Realtime | WebSocket invalidate/refetch class session | `src/pages/ClassSchedules/hooks/useClassSessionWebSocket.ts` |
| PWA | Khá nhiều phần mobile/PWA, nhưng chưa offline-first | `public/manifest.json`, `src/config/appMode.ts`, `public/firebase-messaging-sw.js` |
| Testing | Thiếu test tự động | Không có file test trong source |
| Build/deployment | Có Vite build, chunk splitting và plugin tạo FCM config | `package.json`, `vite.config.ts` |

Điểm kiến trúc: **3.5/5**.

Lý do: dự án có nền tảng phù hợp SME và một số phần tiến gần sản phẩm thương mại như refresh queue, React Query, PWA/push, route preloading, scanner. Điểm chưa đạt mức 4-5 là thiếu test, thiếu tài liệu hóa design system, còn mock/placeholder, còn log nhạy cảm và chưa có offline strategy.

### 3.2 Build và cấu hình

| Hạng mục | Bằng chứng | Nhận xét |
| --- | --- | --- |
| Build script | `package.json`: `build: tsc -b && vite build` | Có type-check trước build. |
| Lint script | `package.json`: `lint: eslint .` | Có lint nhưng không có bằng chứng CI. |
| TypeScript strict | `tsconfig.app.json`: `strict`, `noUnusedLocals`, `noUnusedParameters` | Điểm mạnh về type safety. |
| Manual chunks | `vite.config.ts`: `manualChunks` | Có ý thức tối ưu bundle. |
| Firebase config plugin | `vite.config.ts`: `fcmConfigPlugin()` | Tự sinh `public/fcm-config.js` từ env. |
| Env | `.env` có `VITE_API_URL_*`, Firebase keys | Cần kiểm soát commit/secret; Vite env là public với client. |

## 4. Danh sách route và màn hình

| STT | Route | Tên màn hình | Role được truy cập | Desktop | PWA/mobile | Độ phức tạp | Trạng thái hoàn thiện | File chính |
| --: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `/welcome` | Welcome | Public | Có | Có responsive | Thấp | Hoàn thiện cơ bản | `src/routes/AppRoutes.tsx`, `src/pages/Welcome/Welcome.tsx` |
| 2 | `/login` | Login | Public | Có | Có responsive | Trung bình | Hoàn thiện cơ bản | `src/pages/LoginPage/LoginPage.tsx`, `src/components/LoginForm/LoginForm.tsx` |
| 3 | `/marketing/facebook` | Facebook Marketing | Public trong `MainLayout` | Có | Không đủ bằng chứng | Thấp | Chỉ có giao diện giả lập | `src/routes/AppRoutes.tsx` |
| 4 | `/403` | Access denied | Public/fallback | Có | Có responsive | Thấp | Hoàn thiện cơ bản | `src/routes/AppRoutes.tsx`, `src/components/AccessDeniedView` |
| 5 | `/public/exam` | Examination Management | Public | Có | Một phần | Trung bình | Hoàn thiện một phần | `src/pages/ExaminationManagement/ExaminationManagement.tsx` |
| 6 | `/rankings` | Redirect rankings | Public | Không áp dụng | Không áp dụng | Thấp | Redirect | `src/routes/AppRoutes.tsx` |
| 7 | `/rankings/score` | Bảng xếp hạng điểm | Public | Có | Có responsive | Trung bình | Hoàn thiện cơ bản | `src/pages/Rankings/Rankings.tsx` |
| 8 | `/rankings/fitness` | Bảng xếp hạng thể lực | Public | Có | Có responsive | Trung bình | Hoàn thiện cơ bản | `src/pages/Rankings/Rankings.tsx` |
| 9 | `/:userCode` | Hồ sơ cá nhân | Authenticated; kiểm tra coach/student trong page | Có | Có PWA stack | Trung bình | Hoàn thiện cơ bản | `src/pages/PersonalPage/PersonalPage.tsx` |
| 10 | `/:userCode/classes` | Lớp đang tham gia/phụ trách | Student/Parent/Coach theo profile | Có | Có PWA stack | Trung bình | Hoàn thiện cơ bản | `src/pages/PersonalPage/components/ScheduleAssignments/ScheduleAssignments.tsx` |
| 11 | `/:userCode/progress` | Tiến độ/điểm danh cá nhân | Student/Parent | Có | Có PWA stack | Trung bình | Hoàn thiện cơ bản | `src/pages/PersonalPage/components/AttendanceTab/AttendanceTab.tsx` |
| 12 | `/:userCode/tuition` | Học phí cá nhân | Student/Parent | Có | Có PWA stack | Thấp | Có code nhưng chưa đủ để vận hành | `src/pages/PersonalPage/components/TuitionTab/TuitionTab.tsx` |
| 13 | `/:userCode/score` | Điểm/năng lực cá nhân | Student/Parent | Có | Có PWA stack | Trung bình | Hoàn thiện một phần | `src/pages/PersonalPage/components/ScoreTab/ScoreTab.tsx` |
| 14 | `/:userCode/timesheet` | Chấm công cá nhân HLV | Coach | Có | Có PWA stack | Thấp | Có code nhưng chưa đủ để vận hành | `src/pages/PersonalPage/components/TimesheetTab/TimesheetTab.tsx` |
| 15 | `/` | Dashboard | `canViewManagerSenior` | Có | Có bottom nav | Trung bình | Hoàn thiện một phần | `src/pages/Dashboard/Dashboard.tsx` |
| 16 | `/utilities` | Trung tâm tiện ích | Authenticated | Có | Có PWA hub | Trung bình | Hoàn thiện cơ bản | `src/pages/UtilitiesPage/UtilitiesPage.tsx` |
| 17 | `/notifications` | Thông báo | Authenticated | Có | Có PWA stack | Thấp | Có code nhưng chưa đủ để vận hành | `src/routes/AppRoutes.tsx`, `ComingSoonView` |
| 18 | `/coaches` | Quản lý HLV | `canViewManagerSenior` | Có | Có responsive | Cao | Hoàn thiện cơ bản | `src/pages/CoachManagement/CoachManagement.tsx` |
| 19 | `/students` | Quản lý học viên | `canViewCoach` trở lên | Có | Có responsive | Cao | Hoàn thiện cơ bản đến tốt | `src/pages/StudentManagement/StudentManagement.tsx` |
| 20 | `/schedules` | Quản lý lịch/lớp | `canViewCoach` trở lên | Có | Có PWA stack | Cao | Hoàn thiện cơ bản đến tốt | `src/pages/ClassSchedules/ClassSchedules.tsx` |
| 21 | `/schedules/:scheduleId` | Điểm danh buổi học | `canViewCoach` trở lên | Có | Có layout riêng | Rất cao | Hoàn thiện một phần | `src/pages/AttendanceCheckin/AttendanceCheckin.tsx` |
| 22 | `/history` | Báo cáo điểm danh mặc định | `canViewCoach` trở lên | Có | Có PWA stack | Cao | Hoàn thiện cơ bản | `src/pages/AttendanceReports/AttendanceReports.tsx` |
| 23 | `/history/:historyMode` | Báo cáo học viên/HLV | `canViewCoach` trở lên | Có | Có PWA stack | Cao | Hoàn thiện cơ bản | `src/pages/AttendanceReports/AttendanceReports.tsx` |
| 24 | `/check-in` | AI/QR Check-in | `canUseCheckIn` | Có | Có fullscreen scanner | Rất cao | Hoàn thiện cơ bản, cần kiểm thử thiết bị | `src/pages/AICheckIn/AICheckIn.tsx` |
| 25 | `*` | Fallback redirect | Public/Auth | Không áp dụng | Không áp dụng | Thấp | Hoàn thiện cơ bản | `src/routes/AppRoutes.tsx` |

Thống kê route và màn hình:

| Chỉ số | Số lượng | Ghi chú |
| --- | ---: | --- |
| Tổng route | 25 | Bao gồm redirect và fallback. |
| Tổng màn hình độc lập | 20 | Không tính redirect/fallback như màn hình nghiệp vụ riêng. |
| Tổng modal lớn | 14 | Suy ra từ các file modal trong `src/components`, `src/features`, `src/pages`. |
| Tổng màn hình CRUD | 5 | Coach, Student, Class Schedule, Attendance Reports editable, Enrollment assignment. |
| Tổng dashboard | 1 | `Dashboard`. |
| Tổng màn hình báo cáo | 4 | Attendance report, coach timesheet report, rankings, examination summary. |
| Tổng màn hình có layout riêng cho PWA | 9 | Profile tabs, utilities/history/check-in/schedules dùng stack/bottom/fullscreen patterns. |
| Tổng màn hình chỉ responsive cơ bản | 6 | Welcome, Login, Rankings, Exam, Dashboard, Coach/Student ở mức responsive không đủ bằng chứng PWA riêng. |

## 5. Danh sách module nghiệp vụ

### 5.1 Bảng kiểm kê module

| Module | Mục đích nghiệp vụ | Route/màn hình | Component chính | Hook/API liên quan | Role sử dụng | Luồng/trạng thái chính | Form/List/Filter/Paging/Upload/Realtime | Loading/Error/Empty | PWA riêng | Độ phức tạp | Hoàn thiện | Hạn chế |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| Xác thực | Đăng nhập, logout, lấy profile | `/login` | `LoginForm`, `LoginPage` | `useLogin`, `useLogout`, `authApi` | Public/Auth | login, fetch user, chọn profile, FCM permission | Form có validation | Một phần | Một phần | Trung bình | 75% | Chưa thấy forgot/reset; log payload login nhạy cảm |
| Phân quyền giao diện | Chặn route/nav theo role | Nhiều route protected | `RequireRole`, `MainLayout`, `BottomNavigationBar` | `useRoleStudent`, `useUserLevel` | 8 role level | route guard, fallback, nav filtering | Không | Có fallback 403 | Có | Trung bình | 80% | Chỉ là frontend guard, không thay thế backend authz |
| Dashboard | Tổng quan hệ thống | `/` | `Dashboard`, `StatCard` | `getDashboardTuitionPayments` | Manager senior+ | stats, charts, recent payments | List/table chart, không CRUD | Có skeleton học phí | Một phần | Trung bình | 45% | Nhiều dữ liệu từ `src/data/mockData.ts`; ngày hard-code |
| Quản lý HLV | CRUD HLV và gán lớp | `/coaches` | `CoachManagement`, `CoachCreateModal`, `CoachUpdateModal`, `CoachCard` | `coachAPI`, `coachAssignmentAPI` | Manager senior+ | list, create, update, delete, assign class | Form, list, search/status filter, assignment | Có skeleton/empty | Một phần | Cao | 75% | Assignment history toast chưa hoàn thiện; có log debug |
| Quản lý học viên | CRUD học viên, lọc, phân trang | `/students` | `StudentManagement`, `StudentTable`, `StudentCreateModal` | `studentAPI`, `studentEnrollmentAPI` | Coach+ | list, create, update, delete, view, assign class | Form, list, filter belt/status, pagination | Có skeleton/empty | Một phần | Cao | 82% | Chưa đủ bằng chứng bulk import/export |
| Phân lớp/ghi danh | Gán học viên vào lịch/lớp | `/students`, profile classes | `ClassAssignmentModal`, `CoachAssignmentSection` | `studentEnrollmentAPI`, `coachAssignmentAPI` | Coach+/Manager | create/update/delete enrollment/assignment | Form, list | Một phần | Một phần | Cao | 75% | Chưa thấy conflict validation đầy đủ ngoài frontend |
| Lịch học/lớp | Quản lý class schedule/session | `/schedules` | `ClassSchedules`, `CreateClassScheduleModal`, `CreateSessionModal`, `UpcomingSessionsModal` | `classScheduleAPI`, `classSessionAPI`, `useClassSessionWebSocket` | Coach+ | list/grid/week, create, update status, upcoming sessions, realtime refetch | Form, list, filter/view mode, realtime | Có skeleton/error/retry | Có | Cao | 80% | Cần kiểm thử race condition realtime/device |
| Điểm danh buổi học | Cập nhật trạng thái và đánh giá từng học viên | `/schedules/:scheduleId` | `AttendanceCheckin`, `StudentCard`, `EvalSheet`, `BottomBar` | `studentAttendanceAPI`, `studentEnrollmentAPI` | Coach+ | fetch enrollments, merge attendance, update status/evaluation, rollback | List, filter, optimistic-like cache update | Có skeleton/error/empty | Có layout riêng | Rất cao | 68% | Có state submit modal nhưng không thấy luồng mở/finalize session rõ ràng |
| Báo cáo điểm danh học viên | Xem/sửa/xóa lịch sử điểm danh | `/history`, `/history/student` | `StudentAttendanceReportsContent`, `AttendanceTable` | `studentAttendanceAPI.filter/update/delete` | Coach+ | filter, edit rows, save, delete, summary | List, nhiều filter, pagination, bulk edit/delete | Có | Có | Cao | 78% | Không thấy export/download |
| Báo cáo chấm công HLV | Xem timesheet HLV | `/history/coach` | `CoachTimesheetReportsContent`, `CoachTimesheetTable` | `coachTimesheetAPI.getTimesheetsByFilter` | Coach+/Manager | filter date/month/year/status/branch | List, filter, pagination | Có | Có | Cao | 72% | Chủ yếu xem báo cáo; chưa thấy edit/approve flow đầy đủ |
| Hồ sơ cá nhân | Hồ sơ student/coach theo `userCode` | `/:userCode` | `PersonalPage`, `ProfileHeader`, `PersonalInfoTab` | `studentAPI.getStudentByStudentCode`, `coachAPI.getCoachByStaffCode` | Auth/Profile owner/Coach+ | resolve user type, load profile, tab navigation | Detail view | Có skeleton/error/403 | Có stack layout | Trung bình | 76% | Có log debug; quyền chi tiết cần backend bảo vệ |
| Tiến độ/điểm cá nhân | Điểm danh, yearly summary, score tab | `/:userCode/progress`, `/:userCode/score` | `AttendanceTab`, `ScoreTab`, `QuarterSummaryDetail` | `studentAttendanceAPI.filter`, `studentAPI.getYearlySummary` | Student/Parent | filter by student, show quarterly score | List/detail | Có | Có | Trung bình | 68% | Bonus score ghi chưa triển khai |
| Học phí cá nhân | Tab học phí | `/:userCode/tuition` | `TuitionTab` | Không đủ bằng chứng | Student/Parent | Coming soon | Không | Không | Có stack | Thấp | 10% | Toàn bộ UI cũ comment, hiện `ComingSoonView` |
| Timesheet cá nhân | Tab chấm công cá nhân HLV | `/:userCode/timesheet` | `TimesheetTab` | Không đủ bằng chứng | Coach | Coming soon | Không | Không | Có stack | Thấp | 10% | `ComingSoonView` |
| AI/Camera/QR check-in | Điểm danh bằng mặt/QR/barcode, chấm công HLV | `/check-in` | `AICheckIn`, `FaceScanner`, `MobileCodeScanner`, `CheckInCard` | `studentAPI.face_check_in`, `studentAttendanceAPI.checkInByScan`, `coachTimesheetAPI.checkIn` | `canUseCheckIn` | scan, validate, submit, audio, result, cooldown | Upload ảnh, QR/barcode, camera, lazy load | Có status/error/cancel | Có fullscreen | Rất cao | 78% | Cần kiểm thử thiết bị thật, quyền camera, môi trường iOS/Android |
| Push notification | Đăng ký token, nhận foreground/background notification | App-wide | `fcm.ts`, service worker | `/notifications/update-fcm`, `/notifications/fcm-token/${token}` | Auth | request permission, sync token, show notification, deep link | Không | Có fallback support check | Có | Cao | 72% | Không có UI quản lý notification; `/notifications` coming soon |
| Rankings | Bảng xếp hạng điểm/thể lực theo quý | `/rankings/score`, `/rankings/fitness` | `Rankings`, `QuarterLeaderboard` | `leaderboardAPI` | Public | filter year/quarter/skill, podium/list/detail modal | List, filter, modal | Có skeleton/error/empty | Một phần | Trung bình | 78% | Không đủ bằng chứng export/share |
| Khảo thí | Tổng hợp kết quả thi đầu vào từ CSV | `/public/exam` | `ExaminationManagement`, `EntranceExam`, `ModalDetailExam` | `getCalculatedEntranceExamResults`, CSV raw | Public | filter year/quarter/search, rank, detail modal | List, filter, modal | Empty state trong table | Một phần | Trung bình | 55% | Dữ liệu từ CSV local; tab khác placeholder |
| Tiện ích | Hub điều hướng, ghim nhanh | `/utilities` | `UtilitiesPage`, `UtilityCard` | `preloadRoute`, localStorage | Auth | search utilities, pin/unpin, role-disabled item | Search/list/localStorage | Empty quick list | Có PWA hub | Trung bình | 75% | Không phải module nghiệp vụ cốt lõi, phụ thuộc cấu hình nav |

### 5.2 Phân loại module theo độ phức tạp

| Module | Phân loại | Lý do | Độ phức tạp 1-5 | Ngày công thấp | Trung bình | Cao |
| --- | --- | --- | --: | --: | --: | --: |
| Xác thực | Workflow nghiệp vụ | Login, profile, FCM permission, token storage | 3 | 4 | 6 | 9 |
| Phân quyền giao diện | Workflow nghiệp vụ | Route guard, role level, nav filtering | 3 | 3 | 5 | 8 |
| Dashboard | Dashboard | Chart + recent payments nhưng còn mock | 2 | 3 | 5 | 8 |
| Quản lý HLV | CRUD nâng cao | CRUD, assignment, filter, modal | 4 | 10 | 15 | 24 |
| Quản lý học viên | CRUD nâng cao | CRUD, filter, pagination, assign class | 4 | 14 | 22 | 34 |
| Phân lớp/ghi danh | Workflow nghiệp vụ | Quan hệ học viên-lớp-HLV, create/update/delete assignment | 4 | 8 | 12 | 20 |
| Lịch học/lớp | CRUD nâng cao + realtime | Schedule/session, modal, WebSocket invalidation | 4 | 12 | 18 | 28 |
| Điểm danh buổi học | Workflow phức tạp | Trạng thái attendance/evaluation, rollback, filter, role/schedule check | 5 | 12 | 18 | 30 |
| Báo cáo điểm danh | CRUD nâng cao/báo cáo | Filter nhiều chiều, edit/delete bulk, pagination | 4 | 10 | 16 | 26 |
| Báo cáo timesheet HLV | Báo cáo nâng cao | Date/month/year/status/branch filter, pagination | 3 | 6 | 10 | 16 |
| Hồ sơ cá nhân | Detail workflow | Dynamic userCode, student/coach branch, nested tabs | 3 | 8 | 12 | 20 |
| Score/progress | Báo cáo cá nhân | Yearly summary, quarter detail, attendance history | 3 | 6 | 9 | 15 |
| AI/Camera/QR check-in | Tính năng chuyên biệt | Camera, MediaPipe, QR/barcode, upload, audio | 5 | 12 | 18 | 28 |
| Push notification/PWA notification | Tính năng chuyên biệt | FCM token sync, foreground/background, deep link | 4 | 6 | 10 | 16 |
| Rankings | Báo cáo | API leaderboard, podium, detail modal, filters | 3 | 5 | 8 | 12 |
| Khảo thí | Báo cáo một phần | CSV local, filter, ranking, modal; chưa API | 3 | 4 | 7 | 12 |
| Tiện ích | UI/technical UX | Hub, search, pin localStorage, preload | 2 | 3 | 5 | 8 |
| Notifications page | Placeholder | Route có nhưng coming soon | 1 | 1 | 2 | 4 |

Tổng phân loại:

| Nhóm | Số module | Ghi chú |
| --- | --: | --- |
| CRUD đơn giản | 2 | Khảo thí local, tiện ích/hub không có CRUD dữ liệu thật. |
| CRUD nâng cao | 5 | Coach, Student, Class schedule/session, Attendance reports, Enrollment/assignment. |
| Workflow nghiệp vụ phức tạp | 4 | Auth/profile, phân quyền, điểm danh buổi học, phân lớp/chấm công liên quan nhiều trạng thái. |
| Tính năng chuyên biệt | 4 | AI/Camera/QR, Push notification, PWA shell, WebSocket realtime. |

## 6. Component dùng lại

| Component/hook dùng lại | Loại | Số nơi sử dụng | Giá trị tái sử dụng | Độ phức tạp | File |
| --- | --- | --: | --- | --- | --- |
| `MainLayout` | Layout | Nhiều private/public route | Khung desktop/PWA chung | Cao | `src/layouts/MainLayout/MainLayout.tsx` |
| `PwaStackScreenLayout` | Layout PWA | Profile/utilities/history/schedule | Mobile stack header/back/pull refresh | Cao | `src/layouts/PwaStackScreenLayout/PwaStackScreenLayout.tsx` |
| `BottomNavigationBar` | Navigation | App PWA | Bottom nav + preload route | Cao | `src/components/BottomNavigationBar/BottomNavigationBar.tsx` |
| `Sidebar` | Navigation | Desktop layout | Điều hướng theo role | Trung bình | `src/components/Sidebar` |
| `Header` | Layout | Desktop layout | Header app | Trung bình | `src/components/Header` |
| `ModalLayout` | Modal | Nhiều modal | Portal, overlay, Escape, mobile drag | Cao | `src/components/ui/modal-layout.tsx` |
| `BaseModalLayout` | Modal wrapper | Feature modals | Chuẩn hóa header/footer/loading | Trung bình | `src/layouts/BaseModalLayout/BaseModalLayout.tsx` |
| `ConfirmModal` | Modal | Delete/save confirmations | Confirm/cancel/loading/toast | Trung bình | `src/components/ConfirmModal/ConfirmModal.tsx` |
| `Pagination` | Table utility | List/report pages | Phân trang reusable | Trung bình | `src/components/Pagination/Pagination.tsx` |
| `StatusFilters` | Filter | List pages | Search/filter reusable | Trung bình | `src/components/StatusFilters/StatusFilters.tsx` |
| `PullToRefresh` | Mobile UX | Layout/pages PWA | Pull-to-refresh trạng thái đủ | Cao | `src/components/PullToRefresh/PullToRefresh.tsx` |
| `PullToRefreshProvider` | Context | App-wide | Đăng ký handler refresh | Cao | `src/components/PullToRefresh/PullToRefreshProvider.tsx` |
| `useRegisterPullToRefresh` | Hook | Pages PWA | Tái sử dụng refresh handler | Trung bình | `src/components/PullToRefresh/useRegisterPullToRefresh.ts` |
| `AppErrorBoundary` | Error boundary | App-wide | Fallback crash/reload | Trung bình | `src/components/AppErrorBoundary.tsx` |
| `useGetQuery`/`useCrud` | API hook | Reports/rankings/dashboard | Chuẩn hóa query | Trung bình | `src/hooks/useCrud.ts` |
| `useAuthStore` | Store | App-wide | Auth/profile persistence | Cao | `src/store/authStore.ts` |
| `useRoleStudent`/`useUserLevel` | Permission hook | Routes/nav/pages | Role capability | Trung bình | `src/utils/roleUtils.ts` |
| `getAppMode`/`isPWA` | Device/PWA detection | Layout/pages | Phân biệt desktop/mobile/PWA | Trung bình | `src/utils/getAppMode.ts`, `src/config/appMode.ts` |
| `FaceScanner` | Device component | AI check-in | Camera + MediaPipe | Rất cao | `src/components/FaceScanner/*` |
| `MobileCodeScanner` | Device component | AI check-in | QR/barcode scanner | Cao | `src/pages/AICheckIn/components/MobileCodeScanner.tsx` |
| `AttendanceTable` | Table nghiệp vụ | Report/profile/modal | Table attendance reusable | Cao | `src/pages/StudentManagement/components/AttendanceTableModal/AttendanceTableModal.tsx`, `src/pages/AttendanceReports/*` |
| `Avatar` | UI | Dashboard/lists | Avatar theo tên | Thấp | `src/components/Avatar` |
| `ComingSoonView` | Placeholder | Notifications/tuition/timesheet | Trạng thái chưa triển khai | Thấp | `src/components/ComingSoonView` |
| Radix UI primitives | UI kit primitives | Nhiều nơi | Button, select, card, skeleton, tabs | Trung bình | `src/components/ui/*` |

Đánh giá component library:

| Nội dung | Kết luận |
| --- | --- |
| Design system | Chưa đủ bằng chứng có design system hoàn chỉnh/tài liệu hóa. |
| UI kit nội bộ | Có một lớp UI primitives và modal/layout dùng lại. |
| Component library nội bộ | Có nhưng rời rạc, pha giữa shared components và feature components. |
| Duplication | Có dấu hiệu duplication/inline style ở dashboard và nhiều SCSS module riêng. |

## 7. PWA audit

| Hạng mục PWA | Có/Không/Một phần | Mức hoàn thiện | File bằng chứng | Độ phức tạp | Nhận xét |
| --- | --- | --: | --- | --- | --- |
| Manifest | Có | 80% | `public/manifest.json` | Thấp | Có name, short_name, start_url, display, theme/background. |
| Icon | Có | 85% | `public/manifest.json`, `public/logo/*` | Thấp | Có 192/512 và nhiều logo. |
| Maskable icon | Có | 80% | `public/manifest.json` | Thấp | `purpose: any maskable`. |
| Theme color | Có | 70% | `public/manifest.json` | Thấp | `theme_color` có khai báo. |
| Background color | Có | 70% | `public/manifest.json` | Thấp | `background_color` có khai báo. |
| Display standalone | Có | 80% | `public/manifest.json` | Thấp | `display: standalone`. |
| Service worker | Một phần | 55% | `public/firebase-messaging-sw.js` | Trung bình | Có SW cho Firebase messaging, chưa thấy app-shell/offline cache. |
| Cache strategy | Không | 0% | Không đủ bằng chứng từ mã nguồn | Cao | Không thấy Workbox/runtime caching. |
| Update service worker | Không | 0% | Không đủ bằng chứng từ mã nguồn | Trung bình | Không thấy update prompt/SW lifecycle handling. |
| Install prompt | Một phần | 35% | `public/manifest.json`, `src/config/appMode.ts` | Trung bình | Có manifest và detection, chưa thấy beforeinstallprompt UI rõ ràng. |
| Offline page | Không | 0% | Không đủ bằng chứng từ mã nguồn | Trung bình | Không thấy fallback offline. |
| Offline read | Không | 0% | Không đủ bằng chứng từ mã nguồn | Cao | React Query cache không đồng nghĩa offline read có chiến lược. |
| Offline write | Không | 0% | Không đủ bằng chứng từ mã nguồn | Rất cao | Không có queue/sync offline. |
| Retry request | Một phần | 55% | `src/lib/axiosInstance.ts` | Trung bình | `axios-retry` cho network/429/5xx, không phải offline queue. |
| Background sync | Không | 0% | Không đủ bằng chứng từ mã nguồn | Cao | Không thấy Background Sync API. |
| Push notification | Có | 75% | `src/services/fcm.ts`, `public/firebase-messaging-sw.js` | Cao | Token sync, foreground/background notification. |
| Foreground notification | Có | 75% | `src/services/fcm.ts` | Trung bình | `onFcmMessage`, `showNotification`. |
| Background notification | Có | 80% | `public/firebase-messaging-sw.js` | Trung bình | `messaging.onBackgroundMessage`. |
| Deep link notification | Có | 75% | `public/firebase-messaging-sw.js` | Trung bình | `notificationclick` focus/open `clickUrl`. |
| Camera permission | Có | 70% | `src/components/FaceScanner/useFaceScanner.ts`, `src/pages/AICheckIn/AICheckIn.tsx` | Cao | Dùng `getUserMedia` và scanner error feedback. |
| QR scan | Có | 80% | `src/pages/AICheckIn/components/MobileCodeScanner.tsx`, `src/utils/submitScannedCheckInCode.ts` | Cao | Hỗ trợ QR/barcode, validate code. |
| Safe-area | Có | 75% | `src/index.css`, `src/layouts/PwaStackScreenLayout/*.scss`, `src/components/BottomNavigationBar/*.scss` | Trung bình | Có `safe-area-inset-*`. |
| Status bar | Một phần | 45% | `public/manifest.json`, CSS display-mode | Trung bình | Không đủ bằng chứng xử lý đầy đủ iOS status bar. |
| Bottom navigation | Có | 85% | `src/components/BottomNavigationBar/BottomNavigationBar.tsx` | Cao | Bottom nav theo role + preload. |
| Keyboard mobile | Một phần | 40% | CSS mobile và modal | Trung bình | Không đủ bằng chứng test keyboard/viewport trên form dài. |
| Orientation | Một phần | 40% | SCSS có `orientation: landscape` ở một số module | Trung bình | Chưa thấy policy toàn app. |
| Pull-to-refresh | Có | 80% | `src/components/PullToRefresh/*` | Cao | Có trạng thái pulling/ready/refresh/success/error. |
| 100vh/100dvh | Có | 75% | `src/index.css`, layout/module SCSS | Trung bình | Có `100dvh`, `overscroll-behavior`. |
| iOS standalone | Một phần | 50% | `src/utils/getAppMode.ts` | Trung bình | Có `navigator.standalone`; chưa thấy full iOS install polish. |
| Android standalone | Có | 70% | `src/utils/getAppMode.ts`, `public/manifest.json` | Trung bình | Detect display-mode standalone. |
| Responsive landscape | Một phần | 45% | Một số SCSS module | Trung bình | Không đủ bằng chứng coverage toàn app. |
| Scroll owner | Một phần | 60% | `MainLayout`, modal layout, PWA layout SCSS | Trung bình | Có overflow lock/modal; cần kiểm thử toàn app. |
| Modal màn hình nhỏ | Có | 75% | `src/components/ui/modal-layout.tsx` | Cao | Có mobile drag handle/drag down close. |

Kết luận PWA: **PWA khá hoàn thiện ở lớp install/mobile shell/push/device**, nhưng **không phải PWA nâng cao/offline-first** vì thiếu cache strategy, offline page, offline write, background sync và update service worker flow.

## 8. UI implementation và UX kỹ thuật

| Nội dung | Mức độ | Bằng chứng | Có thể tính vào giá bán? | Ghi chú |
| --- | --- | --- | --- | --- |
| CSS/SCSS implementation | Khá | Nhiều `*.module.scss`, `src/index.css` | Có | Tính như UI implementation, không phải UI research. |
| Responsive layout | Khá | `MainLayout`, `PwaStackScreenLayout`, nhiều media query/module SCSS | Có | Có giá trị triển khai kỹ thuật. |
| Modal | Khá | `ModalLayout`, `BaseModalLayout`, các feature modal | Có | Có mobile behavior. |
| Table/list/card | Khá | Student table, attendance table, dashboard cards, rankings list | Có | Nhiều màn hình nghiệp vụ. |
| Animation | Một phần | `motion/react` trong `AICheckIn`, một số UI state | Có một phần | Không phải animation system lớn. |
| Typography/màu sắc | Trung bình | SCSS module và inline styles | Có một phần | Chưa có design token/documented system đầy đủ. |
| Loading state | Khá | Skeleton ở dashboard/rankings/schedules/reports | Có | Technical UX rõ. |
| Error state | Khá | React Query global toast, per-page error, ErrorBoundary | Có | Cần hardening thêm. |
| Empty state | Khá | Rankings empty, utilities empty, attendance/report empty | Có | Technical UX. |
| Feedback/toast | Khá | `sonner`, confirm modal, scanner status | Có | Có nhiều phản hồi kỹ thuật. |
| Disable action | Một phần | Login submit disabled, utility disabled by role | Có | Không đủ bằng chứng nhất quán toàn app. |
| Confirmation | Có | `ConfirmModal`, save/delete report confirmations | Có | Có giá trị. |
| Retry | Một phần | axios-retry, page retry ở schedules | Có | Không phải offline retry queue. |
| Optimistic update | Một phần | Attendance check-in cập nhật cache/rollback | Có | `AttendanceCheckin` có rollback khi patch lỗi. |
| Lazy loading | Có | Routes lazy, scanner lazy | Có | Tối ưu kỹ thuật. |
| Pull-to-refresh | Có | `PullToRefresh` | Có | PWA experience engineering. |
| User research | Không đủ bằng chứng | Không có artifact trong source | Không tính đủ | Không định giá như đội UX chuyên nghiệp. |
| Usability testing | Không đủ bằng chứng | Không có test report | Không tính đủ | Chỉ có thể giả định kiểm thử thủ công nếu có thông tin ngoài code. |
| Heatmap/A-B testing | Không đủ bằng chứng | Không có tích hợp analytics/experiment | Không tính | Không có căn cứ. |
| Accessibility audit | Không đủ bằng chứng | Có một số ARIA, nhưng không có audit/test | Không tính đủ | Cần audit riêng. |
| Design system tài liệu hóa | Không đủ bằng chứng | Không có docs/tokens đầy đủ | Không tính đủ | Chỉ có UI primitives rời rạc. |

## 9. Tích hợp API

### 9.1 Thống kê API

| Chỉ số | Số lượng | Bằng chứng |
| --- | --: | --- |
| Tổng service/API files | 18 | `src/features/*/api/*.ts`, `src/services/fcm.ts` |
| Endpoint pattern duy nhất | 42 | Scan trực tiếp `javaApi`/`pythonApi`/FCM |
| Direct HTTP calls | 57 | GET/POST/PUT/PATCH/DELETE trong service files |
| GET | 23 | API service files |
| POST | 16 | API service files |
| PUT | 6 | API service files |
| PATCH | 4 | API service files |
| DELETE | 8 | API service files |
| Upload | 1 | `studentAPI.face_check_in` POST FormData tới Python |
| Download | 0 | Không đủ bằng chứng từ mã nguồn |
| WebSocket | 1 | `useClassSessionWebSocket.ts` |
| Push token sync | 2 endpoint | `/notifications/update-fcm`, `/notifications/fcm-token/${token}` |
| Refresh token | 1 endpoint | `/auth/refresh` |
| Pagination/filter | Có | Student, attendance, timesheet, leaderboard, tuition |
| Role-specific behavior | Có | `scheduleIds`, role-level route/filter, activeProfile |

### 9.2 Bảng endpoint tích hợp

| Module | Endpoint | Method | Hook/service | Màn hình sử dụng | Độ phức tạp tích hợp |
| --- | --- | --- | --- | --- | --- |
| Auth | `/auth/login` | POST | `authApi.login`, `useLogin` | Login | Trung bình |
| Auth | `/auth/logout` | POST | `authApi.logout`, `useLogout` | App/logout | Thấp |
| Auth | `/auth/account` | GET | `authApi.getAccount` | Auth/profile | Thấp |
| Auth | `/auth/refresh` | POST | `axiosInstance`, `authApi.refreshToken` | App-wide | Cao |
| User | `/users/me` | GET | `userAPI.getUserInfo` | Login/Profile | Trung bình |
| User | `/users/change-password` | POST | `userAPI.changePassword` | Không đủ bằng chứng màn hình | Trung bình |
| Coach | `/coaches` | GET/POST | `coachAPI` | Coach management | Cao |
| Coach | `/coaches/${staffCode}` | GET | `coachAPI.getCoachByStaffCode` | PersonalPage | Trung bình |
| Coach | `/coaches/${id}` | PUT/DELETE | `coachAPI` | Coach management | Cao |
| Coach assignment | `/coach-assignments/coach/${coachId}` | GET | `coachAssignmentAPI` | Coach update/profile | Trung bình |
| Coach assignment | `/coach-assignments` | POST | `coachAssignmentAPI` | Coach create/update | Trung bình |
| Coach assignment | `/coach-assignments/${assignmentId}` | DELETE | `coachAssignmentAPI` | Coach update | Trung bình |
| Coach timesheet | `/coach-timesheets/check-in` | POST | `coachTimesheetAPI.checkIn` | AI QR check-in | Cao |
| Coach timesheet | `/coach-timesheets/${timesheetId}` | GET/PATCH | `coachTimesheetAPI` | Không đủ bằng chứng màn hình edit | Trung bình |
| Coach timesheet | `/coach-timesheets` | GET | `coachTimesheetAPI.getTimesheetsByFilter` | AttendanceReports coach | Cao |
| Coach timesheet | `/coach-timesheets/me` | GET | `coachTimesheetAPI` | Không đủ bằng chứng màn hình hoàn chỉnh | Trung bình |
| Student | `/students` | GET/POST | `studentAPI` | Student management | Cao |
| Student | `/students/${studentCode}` | GET | `studentAPI.getStudentByStudentCode` | PersonalPage | Trung bình |
| Student | `/students/${id}` | PUT/DELETE | `studentAPI` | Student management | Cao |
| Student | `/students/${studentCode}/yearly-summary?year=${year}` | GET | `studentAPI.getYearlySummary` | ScoreTab | Trung bình |
| Student face check-in | Python `/students/check-in` | POST upload | `studentAPI.face_check_in` | AICheckIn FaceScanner | Rất cao |
| Student enrollment | `/student-enrollments` | POST | `studentEnrollmentAPI` | Student create/assign | Cao |
| Student enrollment | `/student-enrollments/${enrollmentId}` | PUT/DELETE | `studentEnrollmentAPI` | Assignment | Cao |
| Student enrollment | `/student-enrollments/student/${studentCode}` | GET | `studentEnrollmentAPI` | Profile/assignment | Trung bình |
| Student enrollment | `/student-enrollments/student/${studentCode}/detailed` | GET | `studentEnrollmentAPI` | Profile/assignment | Trung bình |
| Student enrollment | `/student-enrollments/class-schedule/${classScheduleId}` | GET | `studentEnrollmentAPI` | AttendanceCheckin | Cao |
| Attendance | `/student-attendances` | GET/POST/PUT/DELETE | `studentAttendanceAPI` | Reports/attendance | Cao |
| Attendance | `/student-attendances/${attendanceId}/status` | PATCH | `studentAttendanceAPI.updateStatus` | AttendanceCheckin | Cao |
| Attendance | `/student-attendances/${attendanceId}/evaluation` | PATCH | `studentAttendanceAPI.updateEvaluation` | AttendanceCheckin | Cao |
| Attendance | `/student-attendances/check-in` | POST | `studentAttendanceAPI.checkInByScan` | AICheckIn QR/barcode | Cao |
| Attendance | `/student-attendances/batch-init` | POST | `studentAttendanceAPI.batchInit` | Không đủ bằng chứng sử dụng | Cao |
| Class schedule | `/class-schedules` | GET/POST | `classScheduleAPI` | ClassSchedules | Cao |
| Class schedule | `/class-schedules/${id}` | GET/PUT/DELETE | `classScheduleAPI` | ClassSchedules | Cao |
| Class schedule | `/class-schedules/${id}/status` | PATCH | `classScheduleAPI.changeClassScheduleStatus` | ClassSchedules | Trung bình |
| Class session | `/class-sessions` | GET/POST | `classSessionAPI` | ClassSchedules | Cao |
| Class session | `/class-sessions/${sessionId}` | GET/PUT/DELETE | `classSessionAPI` | ClassSchedules/session modal | Cao |
| Fitness | `/fitness` | GET | `FitnessAPI` | Fitness standards/leaderboard support | Trung bình |
| Leaderboard | `/leaderboards/quarter` | GET | `leaderboardAPI.getQuarterScoreLeaderboard` | Rankings score | Trung bình |
| Leaderboard | `/leaderboards/quarter/fitness` | GET | `leaderboardAPI.getQuarterFitnessLeaderboard` | Rankings fitness | Trung bình |
| Tuition | `/tuition-payments` | GET | `tuitionPaymentAPI` | Dashboard | Trung bình |
| FCM | `/notifications/update-fcm` | POST | `fcm.ts` | App init/login | Cao |
| FCM | `/notifications/fcm-token/${token}` | DELETE | `fcm.ts` | Logout/cleanup | Trung bình |

## 10. Authentication và authorization

| Hạng mục | Có/Không | Chất lượng | File bằng chứng | Rủi ro |
| --- | --- | --- | --- | --- |
| Route guard | Có | Khá | `src/routes/AppRoutes.tsx`, `src/routes/ProtectedRoute.tsx` | `ProtectedRoute` tồn tại nhưng route chính dùng guard inline khác; cần tránh lệch logic. |
| Role guard | Có | Khá | `src/config/RequireRole.tsx` | Frontend guard không thay thế backend. |
| Permission helper | Có | Trung bình | `src/utils/roleUtils.ts` | Có console log debug. |
| Role levels | Có | Khá | `src/config/constants/roleLevels.ts` | Cần đảm bảo mapping backend đồng bộ. |
| Token storage | Có | Trung bình thấp | `src/store/authStore.ts`, `useAuthentication.ts` | `access_token`, `refresh_token` lưu `localStorage`, rủi ro XSS. |
| Refresh token | Có | Khá | `src/lib/axiosInstance.ts` | Refresh qua `withCredentials`, queue xử lý tốt hơn mức cơ bản. |
| Queue request khi refresh | Có | Khá | `src/lib/axiosInstance.ts`: `isRefreshing`, `failedQueue` | Cần test cạnh tranh request. |
| Logout khi token hết hạn | Có | Khá | `src/lib/axiosInstance.ts`, `authStore.clearAuth` | Có clear auth/query khi refresh fail. |
| 401 | Có | Khá | `src/lib/axiosInstance.ts` | Có retry refresh. |
| 403 | Có | Trung bình | `RequireRole`, `axiosInstance` | 403 API chủ yếu log; UI tùy màn hình. |
| 404 | Có | Trung bình | `axiosInstance`, page-specific fallback | Chủ yếu console log global. |
| 500 | Có | Trung bình | `axiosInstance`, React Query toast | Cần observability thực tế. |
| Che dữ liệu theo role | Có | Trung bình | `NAV_ITEMS`, `BOTTOM_NAV_ITEMS`, `PersonalInfoTab` | Phụ thuộc dữ liệu trả về và backend. |
| Validate upload | Một phần | Trung bình | `FaceScanner/useFaceScanner.ts`, `studentAPI.face_check_in` | Không thấy kiểm size/type rõ ngoài JPEG canvas. |
| XSS risk | Có rủi ro | Trung bình thấp | Token localStorage, không thấy sanitizer policy | Cần CSP/sanitization/security review. |
| Secret trong source | Có rủi ro | Trung bình thấp | `.env`, `vite.config.ts`, `public/fcm-config.js` | Firebase/Vite env là public, nhưng `.env` trong repo cần kiểm soát. |
| Firebase config | Có | Trung bình | `src/services/fcm.ts`, `vite.config.ts` | Config public nhưng cần domain restriction. |
| Log nhạy cảm | Có | Thấp | `src/features/auth/api/authApi.ts` log login payload | Có thể lộ số điện thoại/mật khẩu trong console. |

## 11. Testing và chất lượng code

### 11.1 Kiểm thử

| Hạng mục | Trạng thái | Mức độ bao phủ | Bằng chứng | Phần còn thiếu |
| --- | --- | --- | --- | --- |
| Unit test | Chưa có | 0% | Không có `*.test.*`/`*.spec.*` | Test utils, validation, role, scanner code parsing |
| Component test | Chưa có | 0% | Không đủ bằng chứng từ mã nguồn | Test modal, forms, tables |
| Hook test | Chưa có | 0% | Không đủ bằng chứng từ mã nguồn | Test auth, query hooks, pull-to-refresh |
| Integration test | Chưa có | 0% | Không đủ bằng chứng từ mã nguồn | Test login, CRUD, attendance flow |
| E2E test | Chưa có | 0% | Không đủ bằng chứng từ mã nguồn | Playwright/Cypress |
| Test PWA | Chưa có | 0% | Không đủ bằng chứng từ mã nguồn | Lighthouse/device install/push |
| Test browser/device | Không đủ bằng chứng | Không xác định | Không có test report | iOS/Android camera/PWA |
| Lint | Có | Không rõ CI | `eslint.config.js`, `package.json` | CI/lint gate |
| TypeScript strict | Có | Khá | `tsconfig.app.json` | Cần đảm bảo build sạch thực tế |
| Format | Không đủ bằng chứng | Không xác định | Không thấy Prettier config | Quy chuẩn format |
| Error boundary | Có | Một phần | `src/components/AppErrorBoundary.tsx` | Monitoring/reporting |
| Logging | Có nhiều console | Không kiểm soát | `authApi.ts`, `fcm.ts`, `axiosInstance.ts`, `AICheckIn.tsx` | Cần tắt/log level theo env |
| Performance monitoring | Chưa có | 0% | Không đủ bằng chứng từ mã nguồn | Web vitals/Sentry/analytics |

### 11.2 Điểm chất lượng code

| Tiêu chí | Điểm 1-5 | Nhận xét |
| --- | --: | --- |
| Type safety | 4 | TS strict, type files nhiều; vẫn có một số cast/unknown/manual handling. |
| Duplication | 3 | Có shared components nhưng nhiều SCSS/inline style riêng, dashboard hard-code. |
| Component size | 3 | Một số page lớn như `AICheckIn`, `Dashboard`, report content. |
| Separation of concerns | 3 | Có feature APIs/hooks; một số UI vẫn chứa logic nghiệp vụ dày. |
| Dependency coupling | 3 | Pages phụ thuộc trực tiếp API/store/config; chấp nhận được SME. |
| Naming | 3 | Tương đối rõ; pha tiếng Anh/Vietnamese, một số encoding hiển thị lỗi. |
| Reusability | 4 | Modal, layout, PullToRefresh, Query hooks, scanner components có reuse. |
| Maintainability | 3 | Có nền tốt nhưng thiếu test/docs và còn placeholder/mock/log. |
| Technical debt | 2 | Các rủi ro logging/token/mock/test ảnh hưởng sản phẩm. |

## 12. Technical debt

| Nhóm nợ kỹ thuật | Mức ảnh hưởng | Bằng chứng | Ghi chú xử lý |
| --- | --- | --- | --- |
| Không có test tự động | Cao | Không có file test trong `src/` | Là điểm trừ lớn khi định giá chất lượng. |
| Log nhạy cảm login | Cao | `src/features/auth/api/authApi.ts` log `loginReq` | Cần xóa trước production. |
| Token trong localStorage | Cao | `useAuthentication.ts`, `authStore.ts` | Rủi ro XSS; nên cân nhắc httpOnly cookie/access token memory. |
| Dashboard mock/hard-code | Cao | `src/pages/Dashboard/Dashboard.tsx`, `src/data/mockData.ts` | Không tính đủ như dashboard vận hành thật. |
| Coming soon modules | Trung bình cao | `TuitionTab`, `TimesheetTab`, `/notifications`, exam tabs | Không tính đủ giá. |
| Service worker chưa offline | Trung bình | `firebase-messaging-sw.js` chỉ messaging | Không gọi là PWA nâng cao. |
| Console/debug rải rác | Trung bình | `fcm.ts`, `axiosInstance.ts`, `roleUtils.ts`, `AICheckIn.tsx` | Cần log level/env guard. |
| Dữ liệu CSV local cho khảo thí | Trung bình | `EntranceExam.tsx` import `history_exam.csv?raw` | Chưa là module API vận hành. |
| Encoding/mojibake trong output shell | Trung bình | Nhiều text Vietnamese hiển thị mojibake | Có thể do terminal encoding, cần kiểm file encoding. |
| Chưa có design system docs | Trung bình | Không đủ bằng chứng tài liệu | Không tính là UI/UX chuyên nghiệp. |

## 13. Ước lượng ngày công

### 13.1 Ngày công triển khai lại phạm vi hiện có

| Nhóm công việc | Số lượng | Độ phức tạp | Ngày công thấp | Ngày công trung bình | Ngày công cao | Ghi chú |
| --- | --: | --- | --: | --: | --: | --- |
| Kiến trúc Frontend | 1 | Trung bình | 6 | 9 | 14 | Vite, TS, router, query, store, axios. |
| Authentication | 1 | Trung bình | 4 | 6 | 9 | Login/logout/profile/token. |
| Authorization | 1 | Trung bình | 3 | 5 | 8 | Role levels, route/nav guard. |
| Layout desktop | 1 | Trung bình | 5 | 8 | 12 | MainLayout, sidebar/header. |
| Layout PWA | 1 | Cao | 6 | 9 | 14 | Stack layout, bottom nav, app mode. |
| Component dùng chung | 24 | Trung bình cao | 8 | 12 | 18 | Modal, pagination, filters, pull refresh. |
| Module CRUD đơn giản | 2 | Thấp | 4 | 6 | 10 | Khảo thí local, utilities. |
| Module CRUD nâng cao | 5 | Cao | 18 | 28 | 42 | Coach, student, schedule, reports, assignment. |
| Workflow phức tạp | 4 | Cao/Rất cao | 15 | 24 | 36 | Attendance, enrollment, auth/profile, realtime interactions. |
| Dashboard | 1 | Trung bình | 3 | 5 | 8 | Giảm vì còn mock. |
| Báo cáo | 4 | Cao | 7 | 11 | 18 | Attendance, timesheet, rankings, exam summary. |
| Form | Nhiều | Trung bình | 6 | 9 | 14 | Login/create/update/filter forms. |
| Camera/QR | 1 | Rất cao | 8 | 14 | 22 | Face scanner, QR/barcode, upload, audio. |
| Push notification | 1 | Cao | 4 | 6 | 10 | FCM foreground/background/token sync. |
| PWA | 1 | Trung bình cao | 5 | 8 | 12 | Manifest, detection, safe-area, mobile shell; không offline. |
| Realtime | 1 | Cao | 3 | 5 | 8 | WebSocket refetch/invalidation. |
| Responsive | Nhiều | Trung bình cao | 7 | 11 | 18 | Desktop/mobile/PWA responsive. |
| Performance | 1 | Trung bình | 3 | 5 | 8 | Lazy load, chunking, preload. |
| Testing hiện có | 0 | Không có | 0 | 0 | 0 | Không tính như đã hoàn thành. |
| Bug fixing/hardening hiện có | 1 | Trung bình | 5 | 8 | 12 | Dựa trên edge cases đã xử lý trong code. |
| Deployment frontend | 1 | Thấp | 2 | 3 | 5 | Chỉ có build config, chưa đủ bằng chứng hosting. |
| Documentation hiện có | 1 | Thấp | 1 | 2 | 4 | Không đủ bằng chứng tài liệu nghiệp vụ đầy đủ. |
| **Tổng** |  |  | **120** | **184** | **282** | Đã giảm đếm trùng component/responsive/PWA. |

### 13.2 Bóc tách theo nhóm định giá

| Mức ước lượng | Ngày công |
| --- | --: |
| Thấp | 120 |
| Trung bình | 184 |
| Cao | 282 |

Trong đó:

| Nhóm | Thấp | Trung bình | Cao | Ghi chú |
| --- | --: | --: | --: | --- |
| Ngày công triển khai chức năng | 78 | 121 | 188 | CRUD, workflows, reports, dashboard, profile. |
| Ngày công PWA | 11 | 17 | 26 | Layout PWA + manifest/mobile shell; không gồm offline-first. |
| Ngày công responsive | 7 | 11 | 18 | Đã giảm trùng với UI layout. |
| Ngày công technical UX | 12 | 19 | 31 | Loading/error/empty, skeleton, pull refresh, modal. |
| Ngày công testing đã có | 0 | 0 | 0 | Không có test tự động. |
| Ngày công sửa lỗi/hardening hiện có | 5 | 8 | 12 | Edge cases, retry, rollback, error handling. |
| Ngày công tài liệu hiện có | 1 | 2 | 4 | Không đủ bằng chứng tài liệu đầy đủ. |
| Ngày công còn thiếu để đạt sản phẩm chuyên nghiệp | 49 | 83 | 140 | Test, security hardening, docs, UX/accessibility/offline nếu cần. |

Ngày công còn thiếu để nâng cấp lên mức chuyên nghiệp:

| Phần còn thiếu | Thấp | Trung bình | Cao |
| --- | --: | --: | --: |
| Test tự động unit/component/integration/E2E | 18 | 30 | 50 |
| Security hardening và loại bỏ log nhạy cảm | 5 | 8 | 14 |
| Hoàn thiện dashboard/API thật/coming soon | 14 | 25 | 42 |
| Tài liệu kỹ thuật/nghiệp vụ | 6 | 10 | 16 |
| Accessibility audit và UI/UX chuyên nghiệp | 20 | 35 | 60 |
| Offline-first PWA nếu yêu cầu | 15 | 28 | 45 |

## 14. Hệ số chất lượng

| Mức | Hệ số | Mô tả | Áp dụng cho dự án |
| --- | --: | --- | --- |
| Rất thấp | 0.55-0.65 | Chạy được nhưng khó bảo trì, nhiều lỗi và thiếu cấu trúc | Không phù hợp vì dự án có kiến trúc rõ, TS, Query, PWA/device. |
| Thấp | 0.65-0.75 | Đủ nghiệp vụ cơ bản nhưng thiếu test và nhiều technical debt | Có một phần đúng nhưng hơi thấp so với phạm vi đã làm. |
| Trung bình | 0.75-0.85 | Phù hợp sản phẩm SME, còn thiếu tiêu chuẩn chuyên nghiệp | Phù hợp nhất. |
| Khá | 0.85-0.95 | Kiến trúc tốt, ổn định, dễ bảo trì | Chưa đủ vì thiếu test, còn mock/log/placeholder. |
| Tốt | 0.95-1.00 | Gần tiêu chuẩn agency/sản phẩm thương mại | Chưa đạt. |

Đề xuất hệ số cụ thể: **0.78**.

Giải thích:

- Không hạ thấp chỉ vì người phát triển là Junior; mã nguồn có nhiều phần vượt mức CRUD cơ bản như `AICheckIn`, `FaceScanner`, FCM, WebSocket, refresh queue, React Query cache, PWA layout.
- Giảm hệ số vì thiếu test tự động hoàn toàn, dashboard còn mock, một số route chỉ `ComingSoonView`, log login payload trong `authApi.ts`, token lưu `localStorage`, PWA chưa offline-first và chưa có bằng chứng UI/UX chuyên nghiệp.

## 15. Bảng tổng kết đầu vào định giá

### 15.1 Tổng số lượng

| Chỉ số | Số lượng |
| --- | --: |
| Tổng route | 25 |
| Tổng màn hình | 20 |
| Tổng modal lớn | 14 |
| Tổng module nghiệp vụ | 18 |
| Tổng CRUD đơn giản | 2 |
| Tổng CRUD nâng cao | 5 |
| Tổng workflow phức tạp | 4 |
| Tổng dashboard | 1 |
| Tổng báo cáo | 4 |
| Tổng API được tích hợp | 42 |
| Tổng component dùng lại | 24 |
| Tổng tính năng PWA | 15 |
| Tổng role | 8 |
| Tổng test hiện có | 0 |

### 15.2 Tổng ngày công Frontend

| Mức ước lượng | Ngày công |
| --- | --: |
| Thấp | 120 |
| Trung bình | 184 |
| Cao | 282 |

### 15.3 Mức độ hoàn thiện

| Nhóm | Hoàn thiện |
| --- | --: |
| Chức năng nghiệp vụ | 68% |
| Desktop | 76% |
| PWA/mobile | 72% |
| Tích hợp API | 78% |
| Error handling | 65% |
| Testing | 0% |
| Performance | 65% |
| Security phía client | 60% |
| Documentation | 35% |
| UI implementation | 70% |
| UX kỹ thuật | 72% |
| UI/UX chuyên nghiệp | 10% |

### 15.4 Những phần không nên tính đủ giá

| Phần | Lý do | Bằng chứng |
| --- | --- | --- |
| Dashboard stats/charts/classes | Dùng mock/hard-code | `src/pages/Dashboard/Dashboard.tsx`, `src/data/mockData.ts` |
| `/marketing/facebook` | Chỉ là placeholder text | `src/routes/AppRoutes.tsx` |
| `/notifications` | Coming soon | `src/routes/AppRoutes.tsx`, `ComingSoonView` |
| `TuitionTab` cá nhân | UI cũ bị comment, hiện coming soon | `src/pages/PersonalPage/components/TuitionTab/TuitionTab.tsx` |
| `TimesheetTab` cá nhân | Coming soon | `src/pages/PersonalPage/components/TimesheetTab/TimesheetTab.tsx` |
| Exam tabs ngoài entrance | Placeholder đang phát triển | `src/pages/ExaminationManagement/ExaminationManagement.tsx` |
| Khảo thí như module vận hành backend | Dữ liệu CSV local, chưa API | `src/pages/ExaminationManagement/components/EntranceExam/EntranceExam.tsx` |
| PWA offline | Không có cache/offline strategy | Không đủ bằng chứng từ mã nguồn |
| Testing | Không có test tự động | Không có `*.test.*`, `*.spec.*` |
| UI/UX chuyên nghiệp | Không có research/prototype/audit | Không đủ bằng chứng từ mã nguồn |
| Security production hardening | Token localStorage, log login payload | `authStore.ts`, `useAuthentication.ts`, `authApi.ts` |

### 15.5 Những phần tạo giá trị cao

| Phần | Giá trị | Bằng chứng |
| --- | --- | --- |
| Phân quyền nhiều cấp | Route/nav guard theo role level | `src/config/constants/roleLevels.ts`, `src/config/RequireRole.tsx`, `src/config/constants/path.ts` |
| Refresh token queue | Xử lý 401 nhiều request | `src/lib/axiosInstance.ts` |
| PWA/mobile shell | App mode, bottom nav, safe-area, stack layout | `src/config/appMode.ts`, `BottomNavigationBar.tsx`, `PwaStackScreenLayout.tsx` |
| Push notification | FCM token sync, foreground/background notification, deep link | `src/services/fcm.ts`, `public/firebase-messaging-sw.js` |
| Camera/QR/AI check-in | Face scanner, MediaPipe, QR/barcode, upload ảnh, audio | `src/pages/AICheckIn/AICheckIn.tsx`, `src/components/FaceScanner/*`, `submitScannedCheckInCode.ts` |
| Điểm danh workflow | Update status/evaluation, rollback, filter, schedule permission | `src/pages/AttendanceCheckin/AttendanceCheckin.tsx` |
| Báo cáo điểm danh nâng cao | Filter nhiều chiều, edit/delete, pagination | `src/pages/AttendanceReports/*` |
| Realtime class sessions | WebSocket reconnect/invalidate/refetch | `src/pages/ClassSchedules/hooks/useClassSessionWebSocket.ts` |
| Component tái sử dụng | Modal, PullToRefresh, Pagination, layout | `src/components/*`, `src/layouts/*` |
| Technical UX | Loading/error/empty/skeleton/pull refresh/preload | `src/lib/react-query.ts`, `PullToRefresh`, `routePreload.ts` |

## 16. Phần còn thiếu

| Nhóm | Phần còn thiếu | Mức ưu tiên |
| --- | --- | --- |
| Testing | Unit/component/integration/E2E/PWA tests | Rất cao |
| Security | Xóa log nhạy cảm, giảm token localStorage, CSP, env review | Rất cao |
| Dashboard | Thay mock bằng API thật, loại ngày hard-code | Cao |
| PWA | Offline page/cache/update prompt/background sync nếu muốn PWA nâng cao | Cao |
| Notification | Hoàn thiện `/notifications` inbox/UI | Trung bình cao |
| Tuition cá nhân | Hoàn thiện tab học phí | Trung bình cao |
| Timesheet cá nhân | Hoàn thiện tab chấm công HLV | Trung bình |
| Khảo thí | Kết nối API, hoàn thiện tab khác, quản trị dữ liệu | Trung bình |
| UI/UX | Design system docs, accessibility audit, usability testing | Trung bình cao |
| Documentation | Tài liệu nghiệp vụ, API mapping, setup/deploy, test plan | Trung bình |
| Observability | Error monitoring, performance monitoring, web vitals | Trung bình |

## 17. Phụ lục đường dẫn bằng chứng

| Nhóm | Đường dẫn |
| --- | --- |
| Routing | `src/App.tsx`, `src/routes/AppRoutes.tsx`, `src/routes/routePreload.ts`, `src/routes/ProtectedRoute.tsx` |
| Auth | `src/features/auth/api/authApi.ts`, `src/features/auth/api/useAuthentication.ts`, `src/store/authStore.ts` |
| Axios/Query | `src/lib/axiosInstance.ts`, `src/lib/react-query.ts`, `src/lib/runtimeGuards.ts` |
| Role | `src/config/RequireRole.tsx`, `src/config/constants/roleLevels.ts`, `src/config/constants/path.ts`, `src/utils/roleUtils.ts` |
| Layout | `src/layouts/MainLayout/MainLayout.tsx`, `src/layouts/PwaStackScreenLayout/PwaStackScreenLayout.tsx`, `src/components/BottomNavigationBar/BottomNavigationBar.tsx` |
| Modal | `src/components/ui/modal-layout.tsx`, `src/layouts/BaseModalLayout/BaseModalLayout.tsx`, `src/components/ConfirmModal/ConfirmModal.tsx` |
| PWA | `public/manifest.json`, `public/firebase-messaging-sw.js`, `src/services/fcm.ts`, `src/config/appMode.ts`, `src/utils/getAppMode.ts`, `src/index.css` |
| Pull-to-refresh | `src/components/PullToRefresh/PullToRefresh.tsx`, `src/components/PullToRefresh/PullToRefreshProvider.tsx`, `src/components/PullToRefresh/useRegisterPullToRefresh.ts` |
| Dashboard | `src/pages/Dashboard/Dashboard.tsx`, `src/pages/Dashboard/dashboardQueries.ts`, `src/data/mockData.ts` |
| Coach | `src/pages/CoachManagement/CoachManagement.tsx`, `src/features/coach/api/coachAPI.ts`, `src/features/coach/api/coachAssignmentAPI.ts`, `src/features/coach/api/coachTimesheetAPI.ts` |
| Student | `src/pages/StudentManagement/StudentManagement.tsx`, `src/features/student/api/studentAPI.ts`, `src/features/studentEnrollment/api/studentEnrollmentAPI.ts` |
| Schedule/session | `src/pages/ClassSchedules/ClassSchedules.tsx`, `src/features/classSchedule/api/classScheduleAPI.ts`, `src/features/classSession/api/classSessionAPI.ts`, `src/pages/ClassSchedules/hooks/useClassSessionWebSocket.ts` |
| Attendance check-in | `src/pages/AttendanceCheckin/AttendanceCheckin.tsx`, `src/features/studentAttendance/api/studentAttendanceAPI.ts` |
| Attendance reports | `src/pages/AttendanceReports/AttendanceReports.tsx`, `src/pages/AttendanceReports/components/StudentAttendanceReportsContent.tsx`, `src/pages/AttendanceReports/components/CoachTimesheetReportsContent.tsx` |
| Personal page | `src/pages/PersonalPage/PersonalPage.tsx`, `src/pages/PersonalPage/components/PersonalInfoTab/PersonalInfoTab.tsx`, `src/pages/PersonalPage/components/AttendanceTab/AttendanceTab.tsx`, `src/pages/PersonalPage/components/ScoreTab/ScoreTab.tsx`, `src/pages/PersonalPage/components/TuitionTab/TuitionTab.tsx`, `src/pages/PersonalPage/components/TimesheetTab/TimesheetTab.tsx` |
| AI check-in | `src/pages/AICheckIn/AICheckIn.tsx`, `src/pages/AICheckIn/components/MobileCodeScanner.tsx`, `src/components/FaceScanner/useFaceScanner.ts`, `src/components/FaceScanner/faceScannerCheckIn.ts`, `src/components/FaceScanner/faceScannerDetector.ts`, `src/utils/submitScannedCheckInCode.ts`, `src/utils/validateScannedCheckInCode.ts` |
| Rankings | `src/pages/Rankings/Rankings.tsx`, `src/pages/Rankings/Components/QuarterLeaderboard/QuarterLeaderboard.tsx`, `src/features/report/apis/LeaderboardAPI.ts` |
| Examination | `src/pages/ExaminationManagement/ExaminationManagement.tsx`, `src/pages/ExaminationManagement/components/EntranceExam/EntranceExam.tsx`, `src/store/history_exam.csv` |
| Utilities | `src/pages/UtilitiesPage/UtilitiesPage.tsx` |
| Build/config | `package.json`, `vite.config.ts`, `tsconfig.app.json`, `eslint.config.js` |

```yaml
frontend_summary:
  total_routes: 25
  total_screens: 20
  total_large_modals: 14
  total_business_modules: 18
  simple_crud_modules: 2
  advanced_crud_modules: 5
  complex_workflow_modules: 4
  dashboards: 1
  reports: 4
  reusable_components: 24
  integrated_api_endpoints: 42
  roles: 8
  pwa_features: 15
  completion_percent:
    business_features: 68
    desktop: 76
    pwa_mobile: 72
    api_integration: 78
    technical_ux: 72
    professional_ui_ux: 10
    testing: 0
    performance: 65
    security: 60
    documentation: 35
  estimated_market_person_days:
    low: 120
    average: 184
    high: 282
  quality_factor: 0.78
  recommended_pricing_scope: "Tinh theo pham vi frontend/PWA da tich hop API that, bao gom UI implementation, responsive implementation, PWA experience engineering va technical UX optimization."
  excluded_scope:
    - "Dashboard con dung mock data va ngay hard-code."
    - "Cac route/tab ComingSoonView hoac placeholder: notifications, tuition tab, timesheet tab, marketing/facebook, mot phan examination."
    - "PWA offline-first, offline write, background sync, service worker update flow."
    - "Testing tu dong vi khong co bang chung trong ma nguon."
    - "UI/UX research, usability testing, heatmap, A/B testing, accessibility audit chuyen nghiep."
    - "Security hardening day du cho production."
  major_strengths:
    - "Pham vi nghiep vu rong voi coach, student, schedule, attendance, reports, profile va rankings."
    - "Co React Query, Zustand, Axios refresh queue, route guard va role guard."
    - "Co PWA/mobile shell, bottom navigation, safe-area, pull-to-refresh va route preloading."
    - "Co FCM foreground/background notification va deep link notification."
    - "Co camera, MediaPipe face scanner, QR/barcode check-in va upload anh."
    - "Co WebSocket cho class session realtime invalidation/refetch."
  major_technical_debts:
    - "Khong co automated tests."
    - "authApi.login log payload dang nhap, co rui ro lo thong tin nhay cam."
    - "Token dang luu localStorage, co rui ro XSS."
    - "Dashboard va mot so module con mock/placeholder/coming soon."
    - "Service worker chi phuc vu FCM, chua co offline cache strategy."
    - "Chua co bang chung design system, accessibility audit hoac UX research chuyen nghiep."
```
