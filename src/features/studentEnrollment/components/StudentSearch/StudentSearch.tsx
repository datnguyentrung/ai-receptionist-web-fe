import { cn } from "@/components/ui/utils";
import type { StudentStatus } from "@/config/constants";
import { useGetStudents } from "@/features/student";
import { useDebounce } from "@/hooks/useDebounce";
import type { StudentOverview } from "@/types";
import { Search, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useRoleStudent } from "../../../../utils/roleUtils";
import styles from "./StudentSearch.module.scss";

interface StudentSearchProps {
  selectedStudents: StudentOverview[];
  onSelect: (student: StudentOverview) => void;
  onRemoveStudent?: (student: StudentOverview) => void;
  onClear: () => void;
}

export default function StudentSearch({
  selectedStudents,
  onSelect,
  onRemoveStudent,
  onClear,
}: StudentSearchProps) {
  const [search, setSearch] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const debouncedSearch = useDebounce(search, 500);
  const { canViewManagerSenior } = useRoleStudent();

  const { data } = useGetStudents(
    {
      search: debouncedSearch,
      status: "ACTIVE" as StudentStatus,
      scheduleIds: undefined,
      page: 0,
      size: 10,
    },
    {
      enabled: canViewManagerSenior && !!debouncedSearch.trim(),
    },
  );

  const dropdownResults = data?.students?.content ?? [];
  const selectedCodes = new Set(selectedStudents.map((s) => s.studentCode));
  const filteredDropdown = dropdownResults.filter(
    (s) => !selectedCodes.has(s.studentCode),
  );

  const handleSelectStudent = (student: StudentOverview) => {
    onSelect(student);
    setSearch("");
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const handleRemoveStudent = (student: StudentOverview) => {
    if (onRemoveStudent) {
      onRemoveStudent(student);
    }
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (!showDropdown) {
        itemRefs.current = [];
      }
    };
  }, [showDropdown]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        if (filteredDropdown.length === 0) return;
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredDropdown.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        if (filteredDropdown.length === 0) return;
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredDropdown.length - 1,
        );
        break;
      case "Enter":
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredDropdown.length
        ) {
          event.preventDefault();
          handleSelectStudent(filteredDropdown[highlightedIndex]);
          setHighlightedIndex(-1);
        }
        break;
      case "Escape":
        event.preventDefault();
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        Tìm kiếm Võ sinh <span className={styles.redText}>*</span>
      </label>

      <div className={styles.searchWrap} ref={searchWrapRef}>
        <Search className={styles.searchIcon} size={16} />
        <input
          ref={inputRef}
          type="text"
          className={styles.inputWithSearch}
          placeholder="Tìm kiếm Võ sinh theo tên hoặc mã..."
          value={search}
          onKeyDown={handleInputKeyDown}
          onChange={(e) => {
            setSearch(e.target.value);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            setShowDropdown(true);
            setHighlightedIndex(-1);
          }}
          style={{ fontSize: "13px", color: "#374151" }}
        />

        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => {
            setSearch("");
            setShowDropdown(false);
            setHighlightedIndex(-1);
            onClear();
          }}
          title="Xóa nội dung"
        >
          <X size={16} />
        </button>

        {/* Dropdown kết quả tìm kiếm, chỉ hiện khi có dữ liệu và đang focus */}
        {showDropdown && filteredDropdown.length > 0 && (
          <div className={styles.autocomplete}>
            {filteredDropdown.map((student, index) => (
              <div
                key={student.studentCode}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                className={cn(
                  styles.acItem,
                  highlightedIndex === index && styles.acItemHighlighted,
                )}
                onClick={() => {
                  setHighlightedIndex(index);
                  handleSelectStudent(student);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className={styles.studentAvatar}>
                  {student.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.studentInfo}>
                  <div className={styles.studentName}>{student.fullName}</div>
                  <div className={styles.scMeta}>
                    Mã: {student.studentCode} · {student.branchName}
                  </div>
                </div>
                <div className={cn(styles.acBadge, styles.statusActive)}>
                  {student.studentStatus}
                </div>
              </div>
            ))}
          </div>
        )}

        {showDropdown &&
          debouncedSearch.trim() &&
          filteredDropdown.length === 0 && (
            <div className={styles.autocomplete}>
              <div className={styles.emptyState}>
                Không tìm thấy võ sinh phù hợp.
              </div>
            </div>
          )}
      </div>

      {selectedStudents.length > 0 && (
        <div className={styles.selectedList}>
          {selectedStudents.map((student) => (
            <div className={styles.studentCard} key={student.studentCode}>
              <div className={styles.studentAvatar}>
                {student.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className={styles.studentInfo}>
                <div className={styles.studentName}>{student.fullName}</div>
                <div className={styles.scMeta}>
                  Mã: {student.studentCode} · {student.branchName}
                </div>
              </div>
              <div className={cn(styles.scBadge, styles.statusActive)}>
                {student.studentStatus}
              </div>
              {onRemoveStudent && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => handleRemoveStudent(student)}
                  title="Xóa học viên"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
