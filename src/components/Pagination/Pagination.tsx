import styles from "./Pagination.module.scss";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  currentListLength: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  currentListLength, // Hiển thị số lượng kết quả trên trang hiện tại
}: PaginationProps) {
  return (
    <div className={styles.footer}>
      <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
        Hiển thị {currentListLength} kết quả
      </p>
      <div className={styles.btns}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={styles.btn}
            onClick={() => onPageChange(p)}
            style={{
              background: p === currentPage ? "#E02020" : "transparent",
              color: p === currentPage ? "white" : "#6B7280",
            }}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
