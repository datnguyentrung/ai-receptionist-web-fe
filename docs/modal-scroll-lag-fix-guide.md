# Fix Modal Scroll Lag — Nguyên nhân & Giải pháp

> Tham khảo khi gặp modal bị giật, lag, scroll nặng nề.

---

## 🔍 3 Nguyên nhân chính gây lag

### 1. Re-render dây chuyền (Gõ text → toàn bộ component re-render)

**Cơ chế:**
```
Gõ 1 ký tự → setField() → Parent re-render
  → inline function tạo reference mới MỖI render (onAssignmentChange, onToggle...)
  → Child component (ClassList 50-100 items) bị re-render KHÔNG CẦN THIẾT
  → 1000+ DOM nodes reconcile lại → lag gõ text
```

**Dấu hiệu:** Gõ vào input bất kỳ → modal giật, delay phản hồi.

**Giải pháp:**
- `useCallback` cho tất cả callback truyền xuống child component (deps rỗng nếu chỉ dùng state setter)
- `React.memo` wrap child component nặng (ClassList, ClassAssignmentModal, CoachAssignmentSection)
- React state setter (`setState`) luôn stable → truyền trực tiếp, không cần useCallback

### 2. GPU Compositing overhead (backdrop-filter trên fullscreen overlay)

**Cơ chế:**
```
ModalLayout overlay có `backdrop-filter: blur(2px)` trên TOÀN BỘ màn hình
  → GPU phải composite blur layer MỖI FRAME khi scroll
  → Main thread bị chờ GPU → scroll giật cục
```

**Dấu hiệu:** Scroll modal bị giật, cảm giác nặng, delay, đặc biệt rõ trên máy yếu.

**Giải pháp:**
```tsx
// Truyền overlayClassName vào ModalLayout
<ModalLayout overlayClassName="no-blur-overlay" ...>
```
```scss
.no-blur-overlay {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
```

### 3. Quá nhiều DOM nodes + Paint không tối ưu

**Cơ chế:**
```
50-100 class items × ~23 DOM nodes/item (checkbox, icons SVG, text) = 1000-2300 nodes
  + @include press-effect (transition: transform) trên MỖI item → 100 compositing layers
  + transition: $transition-colors → repaint mỗi item khi scroll
  → Browser paint/composite quá tải mỗi frame
```

**Dấu hiệu:** Scroll danh sách dài bị khựng, đặc biệt ở các modal có ClassList.

**Giải pháp:**
```scss
.classItem {
  // XOÁ: transition: $transition-colors;
  // XOÁ: @include press-effect;
  
  // THÊM: content-visibility: auto — skip render off-screen items
  content-visibility: auto;
  contain-intrinsic-size: auto 70px;
}

.branchScheduleBox {
  contain: content; // CSS containment cho scroll container
}
```

---

## 🛠️ Checklist sửa nhanh

Khi gặp modal bị lag, kiểm tra theo thứ tự:

- [ ] **Bước 1:** Tìm callback inline truyền xuống child → wrap bằng `useCallback`
- [ ] **Bước 2:** Wrap child component nặng bằng `React.memo`
- [ ] **Bước 3:** Thêm `overlayClassName` override `backdrop-filter: none`
- [ ] **Bước 4:** Xóa `transition` / `@include press-effect` trên list items
- [ ] **Bước 5:** Thêm `content-visibility: auto` + `contain-intrinsic-size` trên list items
- [ ] **Bước 6:** Thêm `contain: content` trên scroll container
- [ ] **Bước 7:** Xóa `console.log` trong render function (serialize data mỗi frame)
- [ ] **Bước 8:** Di chuyển `.sort()` từ render vào `useMemo` (sort mỗi render rất tốn)

Nếu vẫn lag sau bước 1-6 → **Cân nhắc virtualization** (react-virtuoso / react-window).

---

## 📁 File đã tối ưu (tham khảo)

| File | Tối ưu |
|------|--------|
| `src/features/coach/components/CoachCreateModal/CoachCreateModal.tsx` | `useCallback` + `overlayClassName` |
| `src/features/coach/components/CoachCreateModal/CoachCreateModal.scss` | Override `backdrop-filter` |
| `src/features/studentEnrollment/components/ClassAssignmentModal/ClassAssignmentModal.tsx` | `React.memo` + `.sort()` vào `useMemo` |
| `src/features/studentEnrollment/components/ClassAssignmentModal/CoachAssignmentSection.tsx` | `React.memo` |
| `src/features/studentEnrollment/components/ClassList/ClassList.tsx` | `React.memo` + xoá `console.log` + xoá `.sort()` |
| `src/features/studentEnrollment/components/ClassList/ClassList.module.scss` | Xoá `press-effect` + `transition` + thêm `content-visibility: auto` |
| `src/features/studentEnrollment/components/ClassAssignmentModal/ClassAssignmentModal.module.scss` | `contain: content` trên `.branchScheduleBox` |
| `src/pages/CoachManagement/CoachManagement.tsx` | `overlayClassName` cho CoachUpdateModal |
| `src/pages/StudentManagement/components/StudentCreateModal.tsx` | `useCallback` + `overlayClassName` |
| `src/pages/StudentManagement/components/StudentCreateModal.module.scss` | Override `backdrop-filter` |

---

## ⚠️ Lưu ý

- **`React.memo` vô hiệu nếu truyền inline function** (props reference mới mỗi render) → bắt buộc dùng `useCallback` cùng lúc.
- **`useCallback([], [])` OK khi:** callback chỉ gọi state setter (stable) hoặc không phụ thuộc external state.
- **`content-visibility: auto` + `contain-intrinsic-size`** cần estimate đúng height item (~70px cho class item compact). Sai quá nhiều → layout shift.
- **`contain: strict` TRÊN scroll container → NGUY HIỂM** (block scroll). Dùng `contain: content` (layout + style + paint, KHÔNG có size).
- **Xoá `backdrop-filter` chỉ cho modal nặng** — modal nhẹ vẫn giữ blur cho đẹp. Truyền `overlayClassName` cụ thể, không sửa ModalLayout chung.
