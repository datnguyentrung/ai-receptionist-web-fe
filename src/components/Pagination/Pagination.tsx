import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const visiblePages = (() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 2) {
      return [1, 2, 3, "ellipsis", totalPages] as const;
    }

    if (currentPage >= totalPages - 1) {
      return [
        1,
        "ellipsis",
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ] as const;
    }

    return [
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ] as const;
  })();

  return (
    <div className={styles.footer}>
      <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
        Hiển thị {currentListLength} kết quả
      </p>
      <div className={styles.btns}>
        <button
          type="button"
          className={styles.arrowBtn}
          onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Trang trước"
        >
          <ChevronLeft size={14} />
        </button>

        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={styles.btn}
              onClick={() => onPageChange(page)}
              style={{
                background: page === currentPage ? "#E02020" : "transparent",
                color: page === currentPage ? "white" : "#6B7280",
              }}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          className={styles.arrowBtn}
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Trang sau"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
