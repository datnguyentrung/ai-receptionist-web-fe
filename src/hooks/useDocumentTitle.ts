import { useEffect } from "react";

export function useDocumentTitle(
  title: string,
  suffix: string = " | Văn Quán",
) {
  useEffect(() => {
    // Lưu lại title gốc để reset nếu cần (tùy chọn)
    const originalTitle = document.title;

    // Cập nhật title mới
    document.title = title + suffix;

    // Khi component bị unmount, có thể trả về title mặc định nếu muốn
    return () => {
      document.title = originalTitle;
    };
  }, [title, suffix]); // Cập nhật lại nếu title thay đổi
}
