import StatusFilters from "@/components/StatusFilters";
import type { CoachStatus } from "@/config/constants";

const FILTER_OPTIONS = [
  { value: "all" as const, label: "Tất cả" },
  { value: "ACTIVE" as CoachStatus, label: "Đang hoạt động" },
  { value: "INACTIVE" as CoachStatus, label: "Tạm nghỉ" },
  { value: "SUSPENDED" as CoachStatus, label: "Đình chỉ" },
  { value: "RETIRED" as CoachStatus, label: "Đã nghỉ hưu" },
];

type Props = {
  search: string;
  setSearch: (value: string) => void;
  filter: "all" | CoachStatus;
  setFilter: (value: "all" | CoachStatus) => void;
};

export default function CoachFilters({
  search,
  setSearch,
  filter,
  setFilter,
}: Props) {
  return (
    <StatusFilters
      search={search}
      setSearch={setSearch}
      filter={filter}
      setFilter={setFilter}
      filterOptions={FILTER_OPTIONS}
      searchPlaceholder="Tìm huấn luyện viên..."
    />
  );
}
