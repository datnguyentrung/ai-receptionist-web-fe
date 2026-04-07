# Báo Cáo Tiến Độ Frontend - Tuần 11/2026

**Dự án:** AI Receptionist — Taekwondo Văn Quán Management System
**Công nghệ:** React 19 · TypeScript · Vite · Zustand · TanStack Query · Axios · SCSS Modules · Tailwind CSS · MediaPipe Tasks Vision
**Kỳ báo cáo:** 09/03/2026 - 15/03/2026
**Người thực hiện:** Frontend Developer

---

## Phạm vi commit đã scan (09/03 - 15/03)

Đã rà soát toàn bộ **9 commit** trong tuần:

1. `c9b220b` - integrate Tailwind CSS, thêm `EvalQuick`, cải tiến Attendance Check-in
2. `3186982` - refactor navigation, thêm hook `useNavigateStudentListByClassScheduleId`
3. `9835637` - cải thiện UI AttendancePill, thêm back navigation hook
4. `405f96c` - nâng cấp attendance API/hook, logging, tối ưu state management
5. `a545461` - cập nhật path điều hướng, auth flow, user profile
6. `fcda12f` - thêm script MediaPipe vision bundle vào `index.html`
7. `307d34e` - tích hợp MediaPipe + tạo màn hình AI Check-in và UI liên quan
8. `65e535b` - refactor `FaceScanner`, tách `javaApi/pythonApi`, check-in user qua Python API
9. `ce14e11` - thêm TTS API, phát âm thanh chào mừng khi check-in

---

## 1. Giao diện & UX/UI mới

### Màn hình và luồng mới đã hoàn thành

- **Màn hình AI Check-in** tại route `/ai/check-in`:
  - Tạo mới trang `AICheckIn` với bố cục kiosk (panel camera + panel thông tin).
  - Tích hợp các component hiển thị mới: `FaceScanner`, `CheckInCard`, `IdlePromoCard`, `VoiceWave`.
  - Hiển thị kết quả check-in người dùng trực tiếp trên màn hình sau khi nhận diện.

- **Bổ sung điều hướng cho AI Check-in**:
  - Thêm item menu sidebar: "Trợ lý AI Check-in".
  - Cập nhật routing/login flow: tách `welcome`, `login`, protected routes rõ ràng hơn.

- **Cải tiến UI điểm danh hiện có (Attendance Check-in)**:
  - Thêm component `EvalQuick` để đánh giá nhanh ngay trên card học viên.
  - Cập nhật `AttendancePill` (trạng thái Có mặt/Vắng/Muộn) theo hướng thao tác nhanh hơn.
  - Cập nhật `StudentCard`, `AttendanceHeader`, `AttendanceReports` để đồng bộ trải nghiệm.

### Điểm UX nổi bật trong tuần

- Camera scan có trạng thái rõ ràng: start/stop, loading model, scan line.
- Có timeout tự dừng scan khi không có khuôn mặt trong 10 giây để tiết kiệm tài nguyên.
- Có âm thanh phản hồi thành công/thất bại khi check-in.

---

## 2. Tích hợp API & Realtime Data

### Tích hợp API mới/điều chỉnh trong tuần

- **Tách 2 HTTP client riêng**:
  - `javaApi`: phục vụ nghiệp vụ chính (auth, students, attendance...).
  - `pythonApi`: phục vụ AI check-in (upload ảnh, xử lý nhận diện).

- **Tích hợp check-in khuôn mặt với Python API**:
  - `userAPI.face_check_in(formData)` gọi endpoint `/users/check-in` qua `pythonApi`.
  - `FaceScanner` chụp frame từ webcam, gửi ảnh lên API khi điều kiện khuôn mặt đạt ngưỡng.

- **Tích hợp TTS**:
  - Thêm `ttsAPI.getGreetingAudioUrl(name, belt)` để tạo URL phát giọng chào mừng.
  - `AICheckIn` phát audio tự động sau khi check-in thành công.

- **Auth/User API được chuẩn hóa lại**:
  - Refactor module user API từ `features/auth/api` sang `features/user/api`.
  - Bổ sung/điều chỉnh các API user profile: `/users/me`, `/users/change-password`.

### Dữ liệu realtime đã làm thực tế

- Đã xử lý **realtime theo frame camera ở client** (loop detect liên tục bằng MediaPipe).
- Chưa có triển khai WebSocket/stream log từ backend trong commit tuần này.

---

## 3. Refactoring & Tối ưu

### Refactor chính đã hoàn thành

- **Refactor `FaceScanner`**:
  - Tách rõ vòng đời start/stop scanning và xử lý timeout.
  - Dùng `useRef` + callback để tránh phụ thuộc vòng lặp/circular dependency trong detection loop.
  - Chuẩn hóa logic resume scan sau khi có kết quả hoặc khi API lỗi.

- **Refactor attendance hooks và mutation flow**:
  - Tối ưu hook `useStudentAttendance` (query key, invalidate, mutation tách rõ update status/evaluation).
  - Cập nhật typing cho `StudentAttendanceTypes`.

- **Refactor auth/navigation**:
  - Cập nhật auth store để xử lý user profile tốt hơn.
  - Tách hook điều hướng (`useNavigation`) cho luồng back và điều hướng theo lớp.

### Tối ưu hiệu năng và sửa lỗi UI

- Bổ sung skeleton/loading ở trang điểm danh để giảm cảm giác giật khi tải dữ liệu.
- Tối ưu render `StudentCard` bằng `memo` và comparator để giảm re-render không cần thiết.
- Cải thiện tính ổn định thao tác trạng thái điểm danh (có rollback local state khi mutation lỗi).
- Cập nhật style SCSS/Tailwind cho một số màn hình (`Dashboard`, `CoachManagement`, `ClassSchedules`, `StudentManagement`, `AttendanceReports`, `AttendanceCheckin`).

---

## 4. Tóm tắt tiến độ

Trong tuần 09/03-15/03, Frontend đã hoàn thành trọng tâm là **AI Check-in chạy camera + nhận diện khuôn mặt + gọi Python API + phát âm thanh chào mừng**, đồng thời refactor lại attendance/auth/navigation để ổn định hơn cho luồng vận hành thực tế.
Các hạng mục như **WebSocket realtime log từ backend, Notification Center, Bot Settings** chưa xuất hiện trong commit tuần này nên đã được loại khỏi báo cáo.

---

_Báo cáo được viết lại theo commit thực tế trong repo, không bao gồm hạng mục chưa có code trong tuần 09/03-15/03._
