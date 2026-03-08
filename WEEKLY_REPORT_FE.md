# Báo Cáo Tiến Độ Frontend - Tuần 10/2026

**Dự án:** AI Receptionist — Taekwondo Văn Quán Management System
**Công nghệ:** React 19 · TypeScript · Vite · TanStack Query v5 · Zustand v5 · React Router DOM v7 · Axios · Tailwind CSS · SCSS Modules · Recharts · shadcn/ui
**Ngày báo cáo:** 08/03/2026
**Người thực hiện:** Frontend Developer

---

## 1. Giao Diện & Components (UI/UX)

### Pages mới hoàn thiện

| Trang                 | Route                    | Mô tả                                                                                                                                                                               |
| --------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HomePage**          | `/`                      | Trang landing công khai, giới thiệu 3 tính năng chính của hệ thống (Quản lý học viên, Lớp học, Thi đấu)                                                                             |
| **Dashboard**         | `/dashboard`             | Trang tổng quan với KPI cards (doanh thu, học viên, lớp học, tỉ lệ điểm danh), `AreaChart` xu hướng đăng ký theo tháng, `BarChart` tỉ lệ điểm danh theo tuần, bảng đăng ký gần nhất |
| **CoachManagement**   | `/coaches`               | Trang quản lý huấn luyện viên, hiển thị dạng card grid, hỗ trợ tìm kiếm và lọc theo trạng thái                                                                                      |
| **StudentManagement** | `/students`              | Trang quản lý học viên với bảng dữ liệu đầy đủ, multi-select, tìm kiếm debounce, lọc trạng thái, phân trang server-side                                                             |
| **ClassSchedules**    | `/schedules`             | Trang lịch lớp học với 2 chế độ hiển thị: Card Grid và Week View (chọn ngày xem lớp)                                                                                                |
| **AttendanceReports** | `/attendance`            | Trang báo cáo điểm danh với bộ lọc đa chiều (ngày, trạng thái, đai, chi nhánh, cấp độ lớp), biểu đồ pie, bảng dữ liệu phân trang                                                    |
| **AttendanceCheckin** | `/schedules/:scheduleId` | Console điểm danh thời gian thực cho một buổi học: xem danh sách học viên, đánh dấu có mặt/vắng/phép, chấm điểm từng học viên                                                       |

### Shared Components

| Component         | Mô tả                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `<Avatar>`        | Avatar tạo từ chữ cái đầu tên, màu sắc xác định theo hash — hỗ trợ nhiều kích thước              |
| `<BeltBadge>`     | Badge hiển thị đai võ thuật với màu sắc phân biệt, 3 kích thước (xs/sm/md)                       |
| `<CheckboxChip>`  | Toggle button dạng chip có dấu check — dùng cho bộ lọc đa chọn                                   |
| `<DaySelector>`   | Row chọn ngày trong tuần dạng pill button, hỗ trợ badge số lượng lớp                             |
| `<Header>`        | Thanh tiêu đề: hamburger menu, tiêu đề trang động theo URL, ô tìm kiếm, chuông thông báo         |
| `<Sidebar>`       | Menu điều hướng trái, thu gọn trên mobile, hiển thị logo, badge "AI RECEPTIONIST", danh sách nav |
| `<LoginForm>`     | Form đăng nhập số điện thoại + mật khẩu, có toggle hiện/ẩn mật khẩu                              |
| `<LeftPanel>`     | Panel trang trí SVG cho màn hình đăng nhập (brand art + logo)                                    |
| `<StatusFilters>` | Component tìm kiếm + nhóm nút lọc trạng thái dùng chung cho nhiều trang (generic over `T`)       |
| `<Pagination>`    | Phân trang với số trang, hiển thị "Showing N results"                                            |

### Feature Components

| Feature               | Components                                                                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Coach**             | `CoachCard`, `CoachFilters`, `StatusBadge` (coach)                                                                                                                                            |
| **Student**           | `StudentHeader`, `StudentStats`, `StudentTable`, `StatusBadge` (student)                                                                                                                      |
| **ClassSchedule**     | `ClassHeader`, `ClassGrid`, `ClassCard`, `ClassWeekView`, `ClassWeekItem`, `LevelBadge`, `StatusBadge` (schedule)                                                                             |
| **AttendanceCheckin** | `AttendanceHeader`, `StudentCard` (animated với Motion), `AttendancePill`, `EvalSheet`, `BottomBar`, `SuccessOverlay`                                                                         |
| **AttendanceReports** | `AttendancePageHeader`, `AttendanceSummarySection`, `AttendanceFilters`, `AttendanceFilterPanel`, `AttendanceTable`, `AttendancePieChart`, `SummaryStatCards`, `TrendCard`, `AttendanceBadge` |

### Layout & Auth

- **`MainLayout`**: Sidebar + Header + Outlet với xử lý overlay mobile sidebar
- **`AuthLayout`**: Chia đôi màn hình (LeftPanel trang trí | Form đăng nhập)
- **`ProtectedRoute`**: Bảo vệ route, redirect về `/login` nếu chưa xác thực

---

## 2. Tích Hợp API & Dữ Liệu

### Cấu hình HTTP Client

- **`axiosInstance`**: Base URL từ `VITE_API_URL`, timeout từ `VITE_API_TIMEOUT`, tự động đính kèm `Authorization: Bearer <token>` từ localStorage qua request interceptor; xử lý lỗi 401/403/404/500 qua response interceptor.

### Các API đã kết nối

#### Auth API (`/auth`)

| Hook              | Endpoint            | Mô tả                                           |
| ----------------- | ------------------- | ----------------------------------------------- |
| `useLogin()`      | `POST /auth/login`  | Đăng nhập, lưu token vào Zustand + localStorage |
| `useLogout()`     | `POST /auth/logout` | Đăng xuất, xóa auth state                       |
| `useGetAccount()` | `GET /auth/account` | Lấy thông tin tài khoản hiện tại                |

#### Coach API (`/coaches`)

| Hook                  | Endpoint               |
| --------------------- | ---------------------- |
| `useGetAllCoaches()`  | `GET /coaches`         |
| `useGetCoachById(id)` | `GET /coaches/{id}`    |
| `useCreateCoach()`    | `POST /coaches`        |
| `useUpdateCoach()`    | `PUT /coaches/{id}`    |
| `useDeleteCoach()`    | `DELETE /coaches/{id}` |

#### Student API (`/students`)

| Hook                     | Endpoint                | Ghi chú                                            |
| ------------------------ | ----------------------- | -------------------------------------------------- |
| `useGetStudents(params)` | `GET /students`         | Hỗ trợ search, status, page, size, sortBy, sortDir |
| `useGetStudentById(id)`  | `GET /students/{id}`    |                                                    |
| `useCreateStudent()`     | `POST /students`        |                                                    |
| `useUpdateStudent()`     | `PUT /students/{id}`    |                                                    |
| `useDeleteStudent()`     | `DELETE /students/{id}` |                                                    |

#### Class Schedule API (`/class-schedules`)

| Hook                          | Endpoint                       |
| ----------------------------- | ------------------------------ |
| `useGetAllClassSchedules()`   | `GET /class-schedules`         |
| `useGetClassScheduleById(id)` | `GET /class-schedules/{id}`    |
| `useCreateClassSchedule()`    | `POST /class-schedules`        |
| `useUpdateClassSchedule()`    | `PUT /class-schedules/{id}`    |
| `useDeleteClassSchedule()`    | `DELETE /class-schedules/{id}` |

#### Student Attendance API (`/student-attendances`)

| Hook                              | Endpoint                                     | Ghi chú                                                                                  |
| --------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `useFilterAttendance(...)`        | `GET /student-attendances`                   | Filter đa chiều: search, date, statuses, belts, branches, levels, scheduleId — paginated |
| `useBatchInitAttendance()`        | `POST /student-attendances/batch-init`       | Khởi tạo danh sách điểm danh cả buổi                                                     |
| `useUpdateAttendanceStatus()`     | `PATCH /student-attendances/{id}/status`     | Cập nhật trạng thái có mặt/vắng/phép                                                     |
| `useUpdateAttendanceEvaluation()` | `PATCH /student-attendances/{id}/evaluation` | Cập nhật đánh giá + ghi chú                                                              |
| `useCreateAttendanceRecord()`     | `POST /student-attendances`                  | Thêm thủ công 1 học viên                                                                 |

#### Student Enrollment API (`/student-enrollments`)

| Hook                                                  | Endpoint                                           |
| ----------------------------------------------------- | -------------------------------------------------- |
| `useGetStudentEnrollmentsByClassScheduleId(id)`       | `GET /student-enrollments/class-schedule/{id}`     |
| `useGetStudentEnrollmentsByStudentCode(code)`         | `GET /student-enrollments/student/{code}`          |
| `useGetDetailedStudentEnrollmentsByStudentCode(code)` | `GET /student-enrollments/student/{code}/detailed` |
| `useCreateStudentEnrollment()`                        | `POST /student-enrollments`                        |
| `useUpdateStudentEnrollment()`                        | `PUT /student-enrollments/{id}`                    |
| `useDeleteStudentEnrollment()`                        | `DELETE /student-enrollments/{id}`                 |

### Hệ thống Type

- Đã định nghĩa đầy đủ TypeScript interfaces/types cho toàn bộ domain:
  - **Core**: `StudentOverview`, `StudentDetail`, `StudentCreateRequest`, `StudentListResponse`, `CoachDetail`, `CoachSummary`, `ClassScheduleDetail`, `ClassScheduleSummary`, `PageResponse<T>` (Spring Boot pagination standard)
  - **Operation**: `StudentAttendanceResponse`, `AttendanceBatchCreateRequest`, `AttendanceUpdateStatusRequest`, `AttendanceUpdateEvaluationRequest`, `StudentEnrollmentResponse`, `EnrollmentsByScheduleResponse`, `CoachAssignmentResponse`
  - **Security**: `LoginResponse`, `UserLogin`, `UserBase`, `UserProfile`

---

## 3. Logic & State Management

### Global State — Zustand

| Store        | Trạng thái                               | Ghi chú                                                                                 |
| ------------ | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `authStore`  | `accessToken`, `user`, `isAuthenticated` | Persist vào `localStorage` (key: `"auth-storage"`); actions: `setAuth()`, `clearAuth()` |
| `themeStore` | _(dự phòng)_                             | Đã tạo cấu trúc, chưa implement                                                         |

### Server State — TanStack React Query

- Tất cả API calls được quản lý qua React Query với `queryKey` phản chiếu đúng params (filter/page) → tự động refetch khi state thay đổi.
- Sau mỗi mutation (create/update/delete), `invalidateQueries` được gọi để sync lại cache.

### Logic điểm danh (AttendanceCheckin)

- **Optimistic local mutations**: Thay đổi trạng thái điểm danh của học viên được lưu vào local `Record<studentId, Partial<AttendanceResponse>>` — UI cập nhật tức thì mà không gọi API.
- **Batch submit**: Khi nhấn "Nộp", toàn bộ thay đổi được gửi lên server cùng lúc: `batchInit` → từng `updateStatus` → từng `updateEvaluation`.
- **Merge data**: Hàm `mergeAttendanceData(enrollments, attendances, sessionDate)` gộp danh sách học viên đăng ký với bản ghi điểm danh hiện có — học viên chưa có bản ghi nhận stub `attendanceId: null`, đảm bảo hiển thị đầy đủ ngay cả trước khi batch-init.
- **Derived stats**: Tự tính `presentCount`, `absentCount`, `excusedCount`, `unmarkedCount`, `progress (%)` từ merged data hiển thị lên header realtime.

### Logic lọc & tìm kiếm

- **StudentManagement**: Search debounce 500ms (`useDebounce`) trước khi kích hoạt API call → giảm số request gọi lên server.
- **CoachManagement**: Filter client-side qua `useFilteredCoaches` (`useMemo`) — phù hợp với dataset nhỏ.
- **AttendanceReports**: Filter đa chiều server-side — `queryKey` chứa toàn bộ params để React Query cache đúng per combination.
- **ClassSchedules (Week View)**: Filter client-side theo `weekday` đã chọn từ `DaySelector`.

### Routing & Navigation

- `AppRoutes` định nghĩa 8 routes, protected routes nested trong `<ProtectedRoute><MainLayout />`.
- `ProtectedRoute` đọc `isAuthenticated` từ Zustand, redirect về `/login` nếu chưa xác thực.
- `Header` tự infer tiêu đề trang từ `useLocation()` (pathname → label động).

### Enums & Constants

Hệ thống enum đầy đủ cho toàn bộ domain:

- **Belt**: C1–C10, D1–D10 (cấp đai Taekwondo)
- **ScheduleLevel**: 12 cấp độ (BASIC, KID, DAN, SPARRING_TEAM, v.v.)
- **AttendanceStatus**: PRESENT / ABSENT / LATE / EXCUSED / MAKEUP
- **EvaluationStatus**: PENDING / GOOD / AVERAGE / WEAK (serialize: P/T/TB/Y)
- **Weekday** với `WeekdayLabel`, `WeekdayCode`, `WeekdayFromCode` lookup maps

---

## 4. Bug Fixes & Tối Ưu

### Tối ưu Performance

- **Debounce search input** (500ms) tại `StudentManagement` — tránh gọi API liên tục khi người dùng đang gõ, giảm tải server.
- **useMemo cho client-side filter** tại `CoachManagement` (`useFilteredCoaches`) — tránh recompute mảng khi state không thay đổi.
- **QueryKey param-driven** cho `useFilterAttendance` và `useGetStudents` — React Query tự cache per filter combination, tránh re-fetch thừa.
- **Optimistic UI** tại `AttendanceCheckin` — cập nhật UI tức thì khi đổi trạng thái điểm danh mà không chờ API response.

### Kiến trúc & Maintainability

- Tổ chức theo **feature-sliced structure** (`features/auth`, `features/coach`, `features/student`, v.v.) — mỗi domain tự quản lý API, hooks, types và UI riêng biệt.
- **Generic components** (`StatusFilters<T>`, `Pagination`, `Avatar`, `BeltBadge`) tái sử dụng xuyên suốt các trang.
- **TypeScript interfaces** đầy đủ cho toàn bộ request/response, tránh `any` type.
- **Axios interceptors** xử lý auth header và error centrally — không lặp lại code ở từng API function.

### UX Improvements

- `SuccessOverlay` full-screen animation khi submit điểm danh thành công — tăng visual feedback.
- `StudentCard` sử dụng **Framer Motion** (`motion`) để animate khi trạng thái thay đổi tại màn hình check-in.
- `BottomBar` sticky với cảnh báo "X học viên chưa điểm danh" — nhắc nhở coach trước khi submit.
- **Responsive Sidebar**: overlay mobile với auto-close khi click ngoài.
- `LoginForm` toggle hiện/ẩn mật khẩu.
- `EvalSheet` dạng slide-up sheet (vaul Drawer) — UX thân thiện trên mobile.

### Bảo mật

- Token được lưu qua Zustand `persist` (localStorage), đính kèm tự động vào mọi request qua Axios interceptor.
- 401 response xử lý tự động: xóa token khỏi localStorage.
- `ProtectedRoute` chặn toàn bộ route yêu cầu xác thực — không thể truy cập trực tiếp URL.

---

## 5. Tóm Tắt

Trong tuần vừa qua, phần Frontend đã hoàn thiện toàn bộ khung kiến trúc ứng dụng bao gồm 7 màn hình chức năng chính, hệ thống shared components tái sử dụng, và tích hợp đầy đủ 6 nhóm API (Auth, Coach, Student, ClassSchedule, StudentAttendance, StudentEnrollment) với state management theo chuẩn React Query + Zustand.

Điểm nhấn kỹ thuật nổi bật nhất là màn hình **AttendanceCheckin** — tích hợp logic merge dữ liệu phức tạp, optimistic UI, batch submit, và real-time progress tracking — cùng với **AttendanceReports** hỗ trợ lọc đa chiều server-side và trực quan hóa dữ liệu bằng biểu đồ Recharts.

---

_Báo cáo được tổng hợp tự động từ codebase — `ai-receptionist-fe` — ngày 08/03/2026._
