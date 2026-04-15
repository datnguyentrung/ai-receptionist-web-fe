import { Search } from "lucide-react";
import "./DataFilters.scss";

type DataFiltersProps = {
  searchValue: string;
  selectedYear: string;
  selectedQuarter: string;
  yearOptions: string[];
  quarterOptions: string[];
  onSearchChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onQuarterChange: (value: string) => void;
  onApply: () => void;
};

export default function DataFilters({
  searchValue,
  selectedYear,
  selectedQuarter,
  yearOptions,
  quarterOptions,
  onSearchChange,
  onYearChange,
  onQuarterChange,
  onApply,
}: DataFiltersProps) {
  return (
    <div className="exam-data-filters">
      <div className="exam-data-filters__search-wrap">
        <Search className="exam-data-filters__search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm học viên theo mã hoặc tên..."
          className="exam-data-filters__search-input"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="exam-data-filters__actions">
        <select
          className="exam-data-filters__select"
          value={selectedYear}
          onChange={(event) => onYearChange(event.target.value)}
        >
          <option value="">Chọn Năm học</option>
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          className="exam-data-filters__select"
          value={selectedQuarter}
          onChange={(event) => onQuarterChange(event.target.value)}
        >
          <option value="">Chọn Quý thi</option>
          {quarterOptions.map((quarter) => (
            <option key={quarter} value={quarter}>
              {quarter}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="exam-data-filters__apply-btn"
          onClick={onApply}
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}
