# Frontend CV & Interview Review

Audit date: 2026-07-19  
Repository: `D:\ai-receptionist-web\ai-receptionist-web-fe`

## A. Tóm tắt dự án Frontend

Frontend này là một SPA/PWA quản lý trung tâm võ thuật, phục vụ quản lý, huấn luyện viên, học viên/phụ huynh trong các luồng học viên, lịch lớp, điểm danh, báo cáo, check-in và thông báo. Người dùng quản lý có thể xem dashboard, quản lý HLV/học viên/lịch học, xử lý điểm danh buổi học và theo dõi báo cáo. HLV có luồng thao tác mobile/PWA rõ hơn: mở lịch, vào buổi học, điểm danh học viên, check-in bằng camera/QR/barcode, xem thông báo và lịch sử. Học viên/phụ huynh có trang hồ sơ theo `/:userCode` với các tab thông tin, lớp, tiến độ, học phí và điểm.

Độ phức tạp của frontend nằm ở việc phối hợp nhiều lớp kỹ thuật: auth bootstrap/refresh token/profile context, route guard theo role, TanStack Query cache, PWA shell, bottom navigation, safe-area iOS, WebSocket cập nhật buổi học, FCM push notification, camera/MediaPipe và QR/barcode scanner. Kiến trúc đã được refactor theo hướng `src/app`, `src/features`, `src/layouts`, `src/components/common`, `src/integrations`, nhưng vẫn còn một số page-owned component, debug log và module chưa hoàn thiện. Có thể mô tả dự án là một frontend nghiệp vụ mobile-first có nhiều bài toán ứng dụng thật, không chỉ là giao diện CRUD.

## B. Bài toán sản phẩm và UX đã giải quyết

| Bài toán người dùng | Giải pháp trong giao diện | Thành phần liên quan | Bằng chứng | Giá trị |
| --- | --- | --- | --- | --- |
| HLV cần thao tác nhanh trên điện thoại khi đang đứng lớp | PWA stack layout, bottom navigation, nút scan nhanh ở lịch học, pull-to-refresh | `PwaStackScreenLayout`, `BottomNavigationBar`, `PullToRefresh` | `src/layouts/PwaStackScreenLayout/PwaStackScreenLayout.tsx:18`, `src/layouts/MainLayout/components/BottomNavigationBar/BottomNavigationBar.tsx:29`, `src/app/providers/pull-to-refresh/PullToRefresh.tsx:32` | Giảm số bước điều hướng, phù hợp thao tác tại sàn tập |
| Tránh mất ngữ cảnh khi đổi màn hình trong app | Lưu/restores scroll theo route, preload route bottom nav, pending status aria-live | `MainLayout`, `BottomNavigationBar`, `routePreload` | `src/layouts/MainLayout/MainLayout.tsx:15`, `src/layouts/MainLayout/MainLayout.tsx:75`, `src/layouts/MainLayout/components/BottomNavigationBar/BottomNavigationBar.tsx:71`, `src/layouts/MainLayout/components/BottomNavigationBar/BottomNavigationBar.tsx:153` | Trải nghiệm app mượt hơn, nhất là PWA |
| Quản lý học viên theo nhiều tiêu chí | Search debounce, status/belt filter, pagination, modal tạo/sửa, validation | `StudentManagement`, `StudentFilters`, `StudentCreateModal` | `src/pages/StudentManagement/StudentManagement.tsx:87`, `src/pages/StudentManagement/components/StudentFilters.tsx:165`, `src/pages/StudentManagement/components/StudentCreateModal.tsx:262` | Cho phép HLV/quản lý tìm và cập nhật hồ sơ nhanh |
| Gán học viên vào lớp ngay khi tạo hồ sơ | Modal tạo học viên tải lịch active, nhóm theo chi nhánh, chọn nhiều lịch học | `StudentCreateModal`, `classScheduleAPI` | `src/pages/StudentManagement/components/StudentCreateModal.tsx:177`, `src/pages/StudentManagement/components/StudentCreateModal.tsx:216`, `src/pages/StudentManagement/components/StudentCreateModal.tsx:300` | Biến tạo hồ sơ thành workflow nhập học, không chỉ CRUD |
| HLV cần điểm danh và đánh giá từng buổi | Tải danh sách ghi danh + attendance, cập nhật status/evaluation, retry/error state, cache update | `AttendanceCheckin`, `StudentCard`, `BottomBar` | `src/pages/AttendanceCheckin/AttendanceCheckin.tsx:217`, `src/pages/AttendanceCheckin/AttendanceCheckin.tsx:268`, `src/pages/AttendanceCheckin/AttendanceCheckin.tsx:480`, `src/pages/AttendanceCheckin/AttendanceCheckin.tsx:643` | Hỗ trợ luồng vận hành buổi học thực tế |
| Lịch học cần phản ánh thay đổi buổi học gần real-time | WebSocket lắng nghe session events, invalidate/refetch React Query với backoff reconnect | `useClassSessionWebSocket`, `ClassSchedules` | `src/pages/ClassSchedules/hooks/useClassSessionWebSocket.ts:4`, `src/pages/ClassSchedules/hooks/useClassSessionWebSocket.ts:22`, `src/pages/ClassSchedules/hooks/useClassSessionWebSocket.ts:45`, `src/pages/ClassSchedules/hooks/useClassSessionWebSocket.ts:102` | Giảm dữ liệu cũ khi lịch/session thay đổi |
| Check-in phải linh hoạt theo thiết bị | Desktop ưu tiên face scan, mobile ưu tiên code scan; QR/barcode scanner lazy load | `AICheckIn`, `MobileCodeScanner`, `FaceScanner` | `src/pages/AICheckIn/AICheckIn.tsx:47`, `src/pages/AICheckIn/AICheckIn.tsx:78`, `src/pages/AICheckIn/components/MobileCodeScanner.tsx:22` | Phù hợp camera desktop/kiosk và điện thoại |
| Người dùng cần nhận thông báo ngoài app | FCM token sync, foreground notification, background service worker, click deep link | `fcm.ts`, `firebase-messaging-sw.js`, Notification pages | `src/integrations/firebase/fcm.ts:50`, `src/integrations/firebase/fcm.ts:88`, `src/integrations/firebase/fcm.ts:153`, `public/firebase-messaging-sw.js:28`, `public/firebase-messaging-sw.js:63` | Có nền tảng push notification thật |

## C. Bài toán kỹ thuật đã giải quyết

| Vấn đề kỹ thuật | Nguyên nhân | Giải pháp | File liên quan | Độ khó | Trade-off |
| --- | --- | --- | --- | ---: | --- |
| Auth bootstrap sau reload | SPA cần phục hồi auth từ token/cookie/context | `AuthBootstrap` gọi `/auth/account` hoặc `/auth/refresh`, hydrate profile, sync FCM | `src/app/providers/AuthBootstrap.tsx:10`, `src/app/providers/AuthBootstrap.tsx:37`, `src/app/providers/AuthBootstrap.tsx:66` | 4 | Profile hydration là best-effort, cần backend bảo vệ thật |
| Refresh token tránh race khi nhiều request 401 | Nhiều request có thể cùng hết access token | `isRefreshing` + `failedQueue`, replay request sau refresh | `src/lib/axiosInstance.ts:23`, `src/lib/axiosInstance.ts:99`, `src/lib/axiosInstance.ts:127`, `src/lib/axiosInstance.ts:149` | 5 | Logic phức tạp, hiện còn console log production |
| Chuyển context/profile | Một account có thể có nhiều ngữ cảnh người dùng | Store có `activeContext`, `availableContexts`, `switchContext`, clear query cache khi đổi | `src/store/authStore.ts:20`, `src/store/authStore.ts:162`, `src/features/auth/api/useAuthentication.ts:117`, `src/features/auth/api/useAuthentication.ts:127` | 4 | Có bridge legacy `activeProfile`, còn lưu access token trong Zustand persist |
| Guard route và nav theo role | UI phải tránh mở màn hình/action sai quyền | `RequireAuth`, `RequireContext`, `RequireRole`, role utilities, nav filtering | `src/app/guards/RequireAuth.tsx:4`, `src/app/guards/RequireContext.tsx:5`, `src/app/guards/RequireRole.tsx:6`, `src/utils/roleUtils.ts:70` | 3 | Frontend guard không thay thế backend authorization |
| Cache consistency sau mutation | CRUD và session events cần làm mới đúng dữ liệu | Query keys, invalidation, setQueryData, optimistic notification mark-read | `src/hooks/useCrud.ts:73`, `src/pages/ClassSchedules/hooks/useClassSchedulesLogic.ts:41`, `src/pages/AttendanceCheckin/AttendanceCheckin.tsx:480`, `src/features/notification/queries/notificationQueries.ts:155` | 4 | Query key chưa chuẩn hóa toàn bộ app |
| PWA shell khác desktop | Mobile/PWA cần layout, navigation, viewport khác | App mode detection, PWA stack layout, bottom nav, fullscreen check-in | `src/utils/getAppMode.ts:22`, `src/layouts/PwaStackScreenLayout/PwaStackScreenLayout.tsx:18`, `src/layouts/MainLayout/MainLayout.tsx:10` | 4 | PWA offline caching/update chưa đầy đủ |
| iOS safe-area và bottom navigation | Home indicator/notch dễ tạo khoảng trắng/che nội dung | CSS dùng `env(safe-area-inset-*)`, `100dvh`, docs phân tích fallback issue | `src/index.css:44`, `src/styles/_mixins.scss:68`, `src/layouts/PwaStackScreenLayout/PwaStackScreenLayout.module.scss:2`, `docs/pwa-bottom-safe-area-fallback-issue.md:1` | 4 | Cần test thiết bị thật, desktop không phản ánh đúng |
| Camera/AI check-in | Browser camera + MediaPipe + upload ảnh dễ leak/race | Lazy FaceScanner, RAF loop, inactivity timeout, AbortController, canvas snapshot | `src/features/checkIn/components/FaceScanner/useFaceScanner.ts:28`, `src/features/checkIn/components/FaceScanner/useFaceScanner.ts:92`, `src/features/checkIn/components/FaceScanner/useFaceScanner.ts:198`, `src/features/checkIn/components/FaceScanner/faceScannerDetector.ts:3` | 5 | Chưa thấy stop MediaStream tracks khi unmount/stop |
| FCM token và foreground/background messages | Push cần permission, SW, token sync, cleanup | Dynamic SW registration, token sync, cleanup, background notification click | `src/integrations/firebase/fcm.ts:69`, `src/integrations/firebase/fcm.ts:182`, `src/integrations/firebase/fcm.ts:291`, `public/firebase-messaging-sw.js:63` | 4 | Token refresh/device-profile ownership chưa hoàn thiện rõ |
| Route-level code splitting | SPA lớn có nhiều màn hình nghiệp vụ | Lazy routes, Suspense fallback, manual chunks vendor | `src/app/router/AppRoutes.tsx:33`, `src/pages/ClassSchedules/ClassSchedulesRoute.tsx:5`, `vite.config.ts:31` | 3 | Main/vendor chunks vẫn lớn, chưa có bundle budget |

## D. Năng lực chuyên môn đã thể hiện

| Nhóm | Mức | Bằng chứng |
| --- | --- | --- |
| React | Tốt | Lazy routes, custom hooks, Suspense, refs/effects cho scroll/camera: `AppRoutes.tsx:33`, `MainLayout.tsx:75`, `useFaceScanner.ts:12` |
| TypeScript | Khá | Domain DTOs, union types, generics trong query/mutation hooks: `authTypes.ts:17`, `useCrud.ts:34`, `notificationQueries.ts:39`; vẫn còn nhiều `unknown`, type assertion và debug |
| Component design | Khá | Shared `ModalLayout`, `BaseModalLayout`, `BottomNavigationBar`, page-feature components; một số component còn lớn |
| Custom hooks | Tốt | `useClassSchedulesLogic`, `usePullToRefresh`, `useFaceScanner`, `useDebounce`, `useRegisterPullToRefresh` |
| State management | Tốt | Zustand auth store có hydration, profile/context, persist; cần cải thiện token storage/security |
| Server-state management | Tốt | TanStack Query defaults, invalidation, optimistic notification mark-read, prefetch; query key design chưa đồng đều |
| React Router | Tốt | Nested routes, guards, PWA-vs-desktop shell, profile route: `AppRoutes.tsx:488`, `AppRoutes.tsx:504`, `AppRoutes.tsx:526` |
| Authentication UX | Tốt | Login, bootstrap, refresh, logout, logout-all, context selection, FCM sync |
| Authorization UI | Khá | Route guard/nav filtering/action gating; chỉ frontend-side, chưa chứng minh backend authz |
| PWA | Khá | Manifest, standalone mode, PWA shell, safe-area, pull-to-refresh, FCM SW; chưa có full offline/update caching |
| Responsive/mobile/iOS | Tốt | SCSS mixins, safe-area, bottom nav, modal/pull-to-refresh, iOS issue docs |
| Camera/Web APIs | Khá đến tốt | MediaPipe detector, getUserMedia, canvas capture, AbortController, QR scanner; thiếu track cleanup |
| Firebase/FCM | Tốt | Token sync, support checks, foreground/background notification, cleanup, tests |
| Form handling | Khá | Manual controlled forms and validation; không thấy React Hook Form/Zod áp dụng mạnh dù có dependency |
| Performance | Khá | Code splitting, route prefetch, vendor chunks, scroll restoration, debounce; chưa có profiling/budget |
| Accessibility | Cơ bản đến khá | Có semantic buttons, aria-label/status/live ở nhiều chỗ; còn thiếu systematic focus management, labels/autocomplete đầy đủ |
| Frontend architecture | Khá | Feature-oriented refactor documented and mostly implemented; còn boundary drift nhẹ và barrel/cycle history |
| Testing | Cơ bản | Vitest có 1 test file FCM, 10 tests pass; thiếu coverage cho auth/router/camera/critical workflows |
| Deployment | Cơ bản | Vite build và Vercel rewrite có sẵn; chưa thấy CI/deployment pipeline đầy đủ |

## E. Tối đa 8 thành tựu nên đưa vào CV

1. **Auth/session context phức tạp**
   - Vấn đề: SPA cần duy trì đăng nhập, refresh token và nhiều profile/context.
   - Giải pháp: Auth bootstrap, refresh token queue, context switching, cache clear sau switch/logout.
   - Kỹ thuật: Zustand persist, Axios interceptors, TanStack Query.
   - Giá trị: Người dùng quay lại app không bị mất phiên và không thấy dữ liệu sai context.
   - Bằng chứng: `AuthBootstrap.tsx:37`, `axiosInstance.ts:99`, `useAuthentication.ts:117`.
   - CV an toàn: "Implemented authentication bootstrap, refresh-token recovery, and multi-context profile switching with cache isolation."

2. **PWA/mobile shell cho thao tác tại lớp**
   - Giải pháp: PWA stack layout, bottom navigation, safe-area, pull-to-refresh, fullscreen check-in.
   - Kỹ thuật: React Router, CSS env safe-area, app-mode detection.
   - Bằng chứng: `getAppMode.ts:22`, `PwaStackScreenLayout.tsx:18`, `BottomNavigationBar.tsx:29`.
   - CV an toàn: "Built a mobile/PWA app shell with bottom navigation, safe-area handling, pull-to-refresh, and fullscreen check-in workflows."

3. **AI/QR/barcode check-in**
   - Giải pháp: Face scanner bằng MediaPipe + canvas upload, QR/barcode fallback, cooldown, audio feedback.
   - Kỹ thuật: `getUserMedia`, MediaPipe, `@yudiel/react-qr-scanner`, AbortController.
   - Bằng chứng: `useFaceScanner.ts:198`, `faceScannerDetector.ts:3`, `MobileCodeScanner.tsx:22`, `submitScannedCheckInCode.ts:36`.
   - CV an toàn: "Integrated browser camera, MediaPipe face detection, and QR/barcode scanning for attendance check-in."

4. **Real-time-like session sync**
   - Giải pháp: WebSocket session events invalidate/refetch schedule/session queries with reconnect.
   - Kỹ thuật: WebSocket, React Query invalidation, backoff.
   - Bằng chứng: `useClassSessionWebSocket.ts:4`, `useClassSessionWebSocket.ts:22`, `useClassSessionWebSocket.ts:107`.
   - CV an toàn: "Connected class-session updates through WebSocket events and React Query cache invalidation."

5. **Attendance workflow**
   - Giải pháp: Merge enrollment/attendance, status/evaluation mutation, setQueryData update, retry/error/empty states.
   - Kỹ thuật: TanStack Query, typed DTOs, UI state.
   - Bằng chứng: `AttendanceCheckin.tsx:217`, `AttendanceCheckin.tsx:268`, `AttendanceCheckin.tsx:480`.
   - CV an toàn: "Developed attendance workflows combining enrollment data, attendance records, status updates, and evaluation UI."

6. **Notification system**
   - Giải pháp: FCM token sync, foreground/background display, notification detail, optimistic mark-read.
   - Kỹ thuật: Firebase Messaging, Service Worker, optimistic update.
   - Bằng chứng: `fcm.ts:153`, `fcm.ts:206`, `firebase-messaging-sw.js:28`, `notificationQueries.ts:155`.
   - CV an toàn: "Implemented push-notification integration with FCM token synchronization, foreground/background delivery, and optimistic read-state updates."

7. **Feature-oriented frontend refactor**
   - Giải pháp: App shell, router, guards, integrations, feature-owned modules separated.
   - Kỹ thuật: module boundaries, aliases, route lazy loading.
   - Bằng chứng: `docs/FRONTEND_STRUCTURE_REFACTOR_RESULT.md`, `src/app`, `src/features`, `src/integrations`.
   - CV an toàn: "Refactored a growing SPA into app shell, feature modules, shared components, and integration layers."

8. **Performance-oriented route experience**
   - Giải pháp: lazy routes, route preloading on hover/touch/focus, vendor chunks, scroll restoration.
   - Kỹ thuật: React lazy/Suspense, Query prefetch, Rollup manual chunks.
   - Bằng chứng: `AppRoutes.tsx:33`, `routePreload.ts:24`, `BottomNavigationBar.tsx:105`, `vite.config.ts:31`.
   - CV an toàn: "Improved perceived navigation performance with lazy route loading, route/data prefetching, and manual vendor chunking."

## F. Nội dung CV

### Mô tả dự án tiếng Việt

AI Receptionist FE là ứng dụng React/TypeScript cho hệ thống quản lý võ đường, hỗ trợ quản lý học viên, HLV, lịch học, điểm danh, báo cáo, check-in và thông báo. Frontend được xây dựng theo hướng mobile/PWA để HLV có thể thao tác nhanh trên điện thoại khi đang đứng lớp. Dự án xử lý nhiều luồng kỹ thuật khó như refresh token, multi-context profile switching, route authorization, TanStack Query cache consistency, Firebase Cloud Messaging, WebSocket session updates và camera/QR check-in. Một số module như học phí cá nhân/timesheet cá nhân còn ở mức coming soon nên không nên mô tả là đã hoàn thiện toàn bộ.

### English project description

AI Receptionist FE is a React/TypeScript web and PWA frontend for martial-arts academy operations, covering students, coaches, class schedules, attendance, reporting, check-in, and notifications. The app is designed around mobile workflows so instructors can manage sessions directly from the training floor. It includes advanced frontend work such as auth bootstrap, refresh-token recovery, multi-context profile switching, role-based routing, TanStack Query cache management, Firebase Cloud Messaging, WebSocket session updates, and camera/QR check-in. Some secondary modules remain partial, so the safest positioning is a feature-rich operational frontend with several production-grade workflows and clear areas for hardening.

### Bullet CV tiếng Việt

- Thiết kế luồng xác thực SPA gồm auth bootstrap, refresh token tự động, chọn context/profile và xóa cache khi đổi/ngắt phiên bằng Zustand, Axios interceptor và TanStack Query.
- Xây dựng app shell mobile/PWA với bottom navigation, stack layout, safe-area iOS, pull-to-refresh, scroll restoration và fullscreen check-in để tối ưu thao tác trên điện thoại.
- Tích hợp luồng check-in bằng camera/AI và QR/barcode bằng MediaPipe, browser camera APIs, canvas upload, AbortController, scan cooldown và audio feedback.
- Phát triển workflow điểm danh buổi học bằng cách hợp nhất dữ liệu ghi danh và attendance, cập nhật trạng thái/đánh giá, xử lý loading/error/retry và đồng bộ cache sau mutation.
- Kết nối cập nhật buổi học qua WebSocket và React Query invalidation/refetch để giảm dữ liệu lịch/session bị cũ sau sự kiện từ backend.
- Tích hợp Firebase Cloud Messaging với token sync, service worker notification, foreground/background message handling và optimistic read-state update.
- Refactor cấu trúc frontend theo hướng app shell, feature modules, shared components và integration layer nhằm giảm page-to-page dependency và dễ mở rộng module nghiệp vụ.
- Tối ưu perceived performance bằng route lazy loading, prefetch khi hover/focus/touch và manual vendor chunking trong Vite.

### English CV bullets

- Designed SPA authentication flows including auth bootstrap, automatic token refresh, profile/context switching, and cache isolation using Zustand, Axios interceptors, and TanStack Query.
- Built a mobile/PWA app shell with bottom navigation, stack-based screens, iOS safe-area handling, pull-to-refresh, scroll restoration, and fullscreen check-in flows.
- Integrated camera-based AI check-in and QR/barcode scanning with MediaPipe, browser camera APIs, canvas uploads, AbortController, scan cooldown, and audio feedback.
- Developed attendance workflows that merge enrollment and attendance data, update status/evaluation records, handle loading/error/retry states, and synchronize query cache after mutations.
- Connected class-session updates through WebSocket events and React Query invalidation/refetch to reduce stale schedule/session data.
- Implemented Firebase Cloud Messaging with token synchronization, service-worker notifications, foreground/background handling, and optimistic read-state updates.
- Refactored the frontend toward app-shell, feature-module, shared-component, and integration-layer boundaries to improve maintainability as the product grew.
- Improved perceived navigation performance through route lazy loading, hover/focus/touch prefetching, and Vite manual vendor chunking.

## G. Bộ từ khóa kỹ năng

**Có thể ghi chắc chắn**

React, TypeScript, Vite, React Router, TanStack Query, Zustand, Axios interceptors, SCSS Modules, Responsive UI, PWA app shell, iOS safe-area handling, Firebase Cloud Messaging, Service Worker for notification, WebSocket, MediaPipe face detection, QR/barcode scanning, Route guards, Lazy loading, Query invalidation, Optimistic update, Vercel SPA rewrite.

**Có thể ghi nhưng cần chuẩn bị giải thích**

Frontend architecture, Clean architecture/refactor, Server-state management, Authentication/session management, Mobile-first UX, Performance optimization, Accessibility, Real-time updates, Camera lifecycle, PWA. Với các từ này cần nói rõ phạm vi: một số phần tốt nhưng chưa có benchmark, full offline PWA, hay test coverage rộng.

**Chưa nên ghi vì code chưa đủ chứng minh**

Full offline-first PWA, complete service-worker caching/update strategy, WCAG AA compliance, full automated test coverage, end-to-end testing, production monitoring/logging, complete secure auth implementation, complete camera lifecycle cleanup, robust bundle budget/Core Web Vitals, full real-time collaboration, complete tuition/timesheet personal modules.

## H. Câu hỏi phỏng vấn dựa trên dự án

1. **Auth bootstrap hoạt động thế nào sau khi refresh trang?** Kiểm tra: session recovery, token/cookie, profile hydration. Xem: `AuthBootstrap.tsx`, `authApi.ts`, `authStore.ts`. Trả lời: thử `/auth/account`, fallback `/auth/refresh`, hydrate profile, finish/clear auth. Trade-off: profile hydration best-effort.
2. **Bạn xử lý nhiều request 401 đồng thời ra sao?** Kiểm tra: concurrency/race. Xem: `axiosInstance.ts`. Trả lời: `isRefreshing`, `failedQueue`, replay original request. Trade-off: interceptor phức tạp, cần test kỹ.
3. **Frontend guard khác backend authorization thế nào?** Kiểm tra: security awareness. Xem: `RequireRole.tsx`, `roleUtils.ts`. Trả lời: frontend chỉ ẩn/chặn UX; backend vẫn phải enforce.
4. **Query key trong app được thiết kế thế nào?** Kiểm tra: server state. Xem: `useCrud.ts`, `notificationQueries.ts`, `classSchedulesQueries.ts`. Trả lời: key theo resource/filter/profile; invalidation sau mutation. Hạn chế: chưa chuẩn hóa toàn bộ.
5. **Vì sao phải clear cache khi switch context?** Kiểm tra: data isolation. Xem: `useAuthentication.ts:117`. Trả lời: tránh dữ liệu context cũ lộ sang context mới. Trade-off: mất cache, refetch nhiều hơn.
6. **PWA trong dự án có gì ngoài manifest?** Kiểm tra: PWA thật hay chỉ metadata. Xem: `getAppMode.ts`, `PwaStackScreenLayout`, `BottomNavigationBar`, `PullToRefresh`. Trả lời: app mode, stack layout, safe-area, pull refresh, FCM. Hạn chế: chưa offline caching.
7. **Bạn xử lý safe-area iOS thế nào?** Kiểm tra: mobile debugging. Xem: `_mixins.scss`, `PwaStackScreenLayout.module.scss`, `docs/pwa-bottom-safe-area-fallback-issue.md`. Trả lời: `env(safe-area-inset-*)`, 100dvh, bottom-nav padding. Hạn chế: cần thiết bị thật.
8. **Face scanner lifecycle có những rủi ro gì?** Kiểm tra: Web APIs. Xem: `useFaceScanner.ts`. Trả lời: RAF loop, timeout, abort request, canvas blob upload. Thành thật: chưa thấy stop track cleanup.
9. **Vì sao mobile mặc định QR/barcode còn desktop mặc định face scan?** Kiểm tra: product thinking. Xem: `AICheckIn.tsx:78`. Trả lời: mobile camera/scanner ergonomics, desktop/kiosk phù hợp face scan.
10. **FCM token sync khi nào chạy?** Kiểm tra: notification flow. Xem: `fcm.ts`, `AuthBootstrap.tsx`, `useAuthentication.ts`. Trả lời: init listener, request/sync after login/bootstrap, cleanup logout. Hạn chế: token refresh/device ownership cần harden.
11. **Bạn dùng optimistic update ở đâu?** Kiểm tra: cache mutation. Xem: `notificationQueries.ts:155`. Trả lời: mark notification read, snapshot, update detail/list, rollback on error.
12. **WebSocket session update xử lý race với DB transaction thế nào?** Kiểm tra: real-time nuance. Xem: `useClassSessionWebSocket.ts:28`. Trả lời: invalidate ngay rồi delayed refetch cho scheduler events. Hạn chế: không thay thế server event ordering.
13. **Route prefetch mang lại gì?** Kiểm tra: performance. Xem: `BottomNavigationBar.tsx:105`, `routePreload.ts`. Trả lời: warm route/data khi hover/focus/touch. Hạn chế: có thể tải dữ liệu dư nếu quá aggressive.
14. **Form validation hiện dùng thư viện hay manual?** Kiểm tra: form maturity. Xem: `StudentCreateModal.tsx:262`. Trả lời: manual validation với controlled state/toast. Hạn chế: chưa dùng React Hook Form/Zod rộng.
15. **Bạn đánh giá testing hiện tại thế nào?** Kiểm tra: senior honesty. Xem: `fcm.test.ts`, `package.json`. Trả lời: có Vitest cho FCM token flow, 10 tests pass. Hạn chế: thiếu test router/auth/camera/attendance.
16. **Build/lint hiện trạng ra sao?** Kiểm tra: quality gates. Xem: `package.json`, `eslint.config.js`. Trả lời: build pass, tests pass, lint đang fail 1 rule setState-in-effect ở `UpdateClassScheduleModal.tsx:91`.
17. **Kiến trúc feature-oriented đã giải quyết gì?** Kiểm tra: architecture. Xem: `docs/FRONTEND_STRUCTURE_REFACTOR_RESULT.md`. Trả lời: app/router/guards/integrations/features colocated, giảm dependency lộn xộn. Hạn chế: vẫn còn debug log và một số module partial.

## I. Điểm còn thiếu và lộ trình cải thiện

**Technical debt chính**

- Lint fail hiện tại: `src/features/classSchedule/components/UpdateClassScheduleModal/UpdateClassScheduleModal.tsx:91`.
- Test coverage rất mỏng: chỉ thấy FCM test, chưa có critical workflow tests.
- Camera lifecycle thiếu bằng chứng dừng `MediaStreamTrack`.
- PWA chưa có offline cache/update strategy đầy đủ; service worker chủ yếu phục vụ FCM.
- Auth lưu access token trong Zustand persist/localStorage-like storage; cần đánh giá lại threat model.
- Nhiều debug `console.log` trong runtime code.
- Một số màn hình/module còn placeholder hoặc partial: tuition tab, timesheet tab, một số dữ liệu dashboard/exam/mock.
- Accessibility chưa có audit tự động, chưa chứng minh focus trap/first-error focus/form autocomplete đầy đủ.
- Bundle lớn ở một số vendor chunks: build cho thấy `react-vendor` ~108.72 KB gzip, `chart-vendor` ~106.34 KB gzip, `ai-vendor` ~97.52 KB gzip.
- Chưa thấy monitoring/logging frontend production.

**Nên làm trước khi phỏng vấn**

- Sửa lỗi lint `set-state-in-effect` và chạy lại `npm.cmd run lint`.
- Chuẩn bị demo/ảnh/video cho PWA bottom nav, camera check-in, notification, auth context switch.
- Viết README ngắn cho 3 luồng mạnh nhất: auth/context, PWA/check-in, notification/WebSocket.
- Dọn console log nhạy cảm trong `axiosInstance`, FCM, profile/attendance/check-in.
- Ghi rõ trong CV: PWA shell và FCM notification, không ghi full offline-first.

**Nên làm để nâng dự án lên mức Junior tốt**

- Thêm tests cho auth bootstrap/refresh queue, route guard, notification optimistic update, attendance mutation.
- Thêm cleanup camera tracks khi stop/unmount.
- Chuẩn hóa query key factory theo feature, giảm key literal lặp.
- Cải thiện form bằng React Hook Form/Zod hoặc một validation layer thống nhất.
- Thêm a11y checks cơ bản: modal focus trap, form labels/autocomplete, keyboard nav, aria-live errors.
- Thêm CI chạy build/lint/test.

**Có thể làm sau**

- Full PWA offline caching/update prompt.
- Bundle analyzer + route budgets.
- E2E Playwright cho login, check-in, attendance, PWA navigation.
- Monitoring frontend, error reporting, user timing metrics.
- Chuẩn hóa copy/i18n và hardcoded date/number formats.

## J. Kết luận tuyển dụng

Nếu đóng vai nhà tuyển dụng, dự án này chứng minh ứng viên ở mức **Junior Frontend tiềm năng**, vượt qua mức Intern/Fresher chỉ biết dựng UI. Điểm mạnh không nằm ở việc có nhiều màn CRUD, mà ở việc xử lý các workflow có tính sản phẩm: auth/context/session, PWA/mobile shell, attendance/check-in, notification và cache consistency. Ba năng lực mạnh nhất là: React application architecture, browser/mobile UX engineering, và server-state/auth integration.

Điểm có thể bị nghi ngờ khi phỏng vấn là test coverage còn mỏng, lint chưa sạch ở thời điểm audit, PWA chưa offline đầy đủ, camera lifecycle chưa hoàn chỉnh, nhiều log/debug còn trong runtime và một số module còn placeholder/mock. Ba nội dung nên đặt đầu tiên trong CV là: auth/session context switching, PWA/mobile check-in UX, và AI/QR/FCM/WebSocket integration cho workflow điểm danh.

## Validation

- `npm.cmd run build`: passed, Vite built successfully.
- `npm.cmd run test`: passed, 1 test file and 10 tests.
- `npm.cmd run lint`: failed with 1 existing error: `react-hooks/set-state-in-effect` at `src/features/classSchedule/components/UpdateClassScheduleModal/UpdateClassScheduleModal.tsx:91`.

## Review Criteria Source

UX/accessibility checks were informed by the current Vercel Web Interface Guidelines: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
