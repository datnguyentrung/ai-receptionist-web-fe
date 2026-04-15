import "./SelectViewExam.scss";

export type ExamViewKey = "entrance" | "mock" | "official";

type SelectViewExamProps = {
  activeTab: ExamViewKey;
  onTabChange: (tab: ExamViewKey) => void;
};

const TABS: { key: ExamViewKey; label: string }[] = [
  { key: "entrance", label: "Kiểm tra đầu vào" },
  { key: "mock", label: "Kiểm tra thi thử" },
  { key: "official", label: "Thi chính thức" },
];

export default function SelectViewExam({
  activeTab,
  onTabChange,
}: SelectViewExamProps) {
  return (
    <div
      className="exam-view-selector"
      role="tablist"
      aria-label="Chọn chế độ thi"
    >
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`exam-view-selector__tab ${
            activeTab === tab.key ? "is-active" : ""
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
