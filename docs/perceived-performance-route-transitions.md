# Perceived Performance cho Route Transition trong PWA

## Bối cảnh

Tài liệu này tổng kết nguyên nhân và hướng xử lý cho vấn đề chuyển trang từ `UtilitiesPage` sang `ClassSchedules` bị chậm trong PWA. Pattern này có thể áp dụng cho các flow tương tự trong app khi người dùng nhấn một nút/card để chuyển sang một màn có lazy route, API fetch, hoặc layout phức tạp.

## Nguyên nhân

### 1. Route transition bị block trước khi screen mới mount

Route `/schedules` trước đó lazy-load toàn bộ màn `ClassSchedules`. Khi người dùng tap, React phải tải và evaluate chunk của màn mới trước khi có thể mount UI mới. Kết quả là người dùng vẫn nhìn thấy `UtilitiesPage` trong 2-3 giây và có cảm giác app không nhận thao tác.

### 2. Prefetch chạy sai thời điểm trên PWA

Prefetch đặt ở `touchstart` có thể phản tác dụng trên mobile/PWA. Vì `touchstart` xảy ra ngay trước `click`, nếu prefetch route chunk hoặc API bắt đầu đúng lúc này, main thread và network có thể bị cạnh tranh với thao tác điều hướng.

### 3. Màn đích chưa render app shell đủ sớm

Nếu màn đích dùng pattern:

```tsx
if (isLoading) return <div>Loading...</div>;
```

thì dù route đã mount, người dùng vẫn chưa thấy layout thật. Trải nghiệm này không giống native app vì khung màn hình không xuất hiện ngay.

### 4. Query key giữa prefetch và query thật dễ lệch nhau

Prefetch chỉ hiệu quả nếu query ở màn trước và query ở màn đích dùng cùng một `queryKey`. Nếu key lệch nhau, dữ liệu đã prefetch không được tái sử dụng, màn đích vẫn fetch lại như lần đầu.

## Cách giải quyết

### 1. Không chặn `navigate` bằng API

Handler click chỉ nên làm việc tối thiểu:

```tsx
const handleNavigate = (route: string) => {
  setNavigating(true);

  window.requestAnimationFrame(() => {
    navigate(route);
  });
};
```

Không nên:

```tsx
const handleNavigate = async () => {
  await fetchData();
  navigate("/schedules");
};
```

### 2. Tạo route shell nhẹ

Với các route lớn hoặc lazy-load nặng, không để router chờ toàn bộ screen thật. Tạo một route shell nhẹ mount ngay:

```tsx
export function ClassSchedulesRoute() {
  return (
    <Suspense fallback={<ClassSchedulesRouteShell />}>
      <ClassSchedulesContent />
    </Suspense>
  );
}
```

Router dùng shell này:

```tsx
<Route path="schedules" element={<ClassSchedulesRoute />} />
```

Shell cần mô phỏng layout thật: header, action bar, filter, list/card skeleton.

### 3. Luôn render app shell ở màn đích

Màn đích không nên return loading text toàn màn hình. Thay vào đó:

```tsx
return (
  <div className={styles.page}>
    <Header />
    <ActionBar />

    {isInitialLoading ? (
      <ContentSkeleton />
    ) : isInitialError ? (
      <ErrorState onRetry={retry} />
    ) : (
      <Content data={data} />
    )}
  </div>
);
```

### 4. Dùng cache và stale-while-revalidate

Nếu project đã có TanStack Query, dùng cùng `QueryClient` đã được khai báo ở app root. Không tạo thêm `QueryClient` mới trong từng page.

Nên tách query key/helper để prefetch và query thật dùng chung:

```ts
export const classSchedulesQueryKey = (scheduleIds: string[]) =>
  ["class-schedules", { scheduleIds }] as const;
```

Query ở màn đích:

```ts
useQuery({
  queryKey: classSchedulesQueryKey(scheduleIds),
  queryFn: () => classScheduleAPI.getAllClassSchedules({ scheduleIds }),
  refetchOnMount: "always",
  refetchOnWindowFocus: true,
});
```

Prefetch ở màn trước:

```ts
queryClient.prefetchQuery({
  queryKey: classSchedulesQueryKey(scheduleIds),
  queryFn: () => classScheduleAPI.getAllClassSchedules({ scheduleIds }),
});
```

Khi quay lại màn đã từng tải:

- Hiển thị cache ngay.
- Refetch chạy nền.
- Không làm mất dữ liệu cũ trong lúc refetch.

### 5. Prefetch đúng thời điểm

Desktop:

- Có thể prefetch khi hover.
- Có thể prefetch khi focus bằng keyboard nếu nhẹ.

Mobile/PWA:

- Tránh prefetch nặng ở `touchstart`.
- Ưu tiên prefetch sau khi màn trước đã render xong bằng `requestIdleCallback`.
- Nếu không có `requestIdleCallback`, dùng `setTimeout` ngắn.

Ví dụ:

```tsx
useEffect(() => {
  if (window.requestIdleCallback) {
    const id = window.requestIdleCallback(() => {
      prefetchSchedules();
    }, { timeout: 1800 });

    return () => window.cancelIdleCallback?.(id);
  }

  const id = window.setTimeout(prefetchSchedules, 700);
  return () => window.clearTimeout(id);
}, [prefetchSchedules]);
```

### 6. Phản hồi thị giác ngay khi tap

Ngay khi user tap, UI nên phản hồi bằng state như `pressed`, `selected`, hoặc `navigating`.

Ví dụ:

```tsx
setNavigatingItemId(item.id);
```

Sau đó card/button đổi style nhẹ:

- Scale xuống một chút.
- Đổi màu icon.
- Hiển thị trạng thái đang mở.

Điều này giúp người dùng biết thao tác đã được nhận, ngay cả khi route chunk hoặc API vẫn đang tải.

## Flow mong muốn

```txt
User tap card/nút
-> UI phản hồi ngay trên card/nút
-> navigate ở frame kế tiếp
-> route shell mount ngay
-> app shell + skeleton xuất hiện
-> nếu có cache thì hiện data cũ ngay
-> API refetch chạy nền
-> data mới fill vào UI
-> lỗi thì hiện error state trong layout, có retry
```

## Checklist áp dụng cho route tương tự

- [ ] Click handler không `await fetch` trước `navigate`.
- [ ] Route lớn có route shell nhẹ.
- [ ] `Suspense fallback` là skeleton theo layout thật, không phải text loading.
- [ ] Màn đích không `return` loading text toàn màn hình.
- [ ] Header/action bar/content frame render ngay.
- [ ] Skeleton giữ gần đúng kích thước layout thật để tránh layout shift.
- [ ] Prefetch và query thật dùng chung `queryKey`.
- [ ] Không tạo `QueryClient` mới ở page/helper.
- [ ] Có cache-first UI và refetch nền.
- [ ] Mobile/PWA không prefetch nặng ở `touchstart`.
- [ ] Có visual feedback ngay khi tap.
- [ ] Có đủ state: loading lần đầu, cached + refetching, empty, error, retry, success.

## Ghi chú về TanStack Query

Các file helper như `classSchedulesQueries.ts` không có nhiệm vụ khởi tạo `QueryClient`, `MutationCache`, hoặc `QueryCache`. Việc khởi tạo client nên chỉ nằm ở tầng app root, ví dụ `src/lib/react-query.ts` và được inject qua `QueryClientProvider` trong `main.tsx`.

Helper query chỉ nên chứa:

- Query key dùng chung.
- Query function hoặc prefetch function nhận `queryClient` từ context hiện có.
- Logic nhỏ giúp tránh lệch cache key giữa màn trước và màn đích.
