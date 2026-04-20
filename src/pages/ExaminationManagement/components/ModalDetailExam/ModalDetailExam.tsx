import { ModalLayout } from "@/components/ui/modal-layout";
import rubricRaw from "@/store/mau_kiem_tra.json?raw";
import type { CalculatedEntranceExamResult } from "@/utils/calculateUtils";
import "./ModalDetailExam.scss";

type ModalDetailExamProps = {
  isOpen: boolean;
  examResult: CalculatedEntranceExamResult | null;
  onClose: () => void;
};

type RubricContentMap = Record<string, string>;

type RubricCriterion = {
  max: number;
  comments: RubricContentMap;
};

type RubricItem = {
  key: string;
  criterion: RubricCriterion;
};

type RubricTanTayChild = {
  key: string;
  criterion: RubricCriterion;
};

type RubricTanTayGroup = {
  key: string;
  label: string;
  criterion: RubricCriterion;
  children: RubricTanTayChild[];
};

type RubricSection<TItem> = {
  label: string;
  max: number;
  items: TItem[];
};

type RubricIndex = {
  dam: RubricSection<RubricItem>;
  tan: RubricSection<RubricItem>;
  tan_tay: RubricSection<RubricTanTayGroup>;
  chan: RubricSection<RubricItem>;
};

type RubricRow = {
  label: string;
  score: number;
  max: number;
  comment: string;
};

function createEmptyCriterion(max = 0): RubricCriterion {
  return { max, comments: {} };
}

function createDefaultRubric(): RubricIndex {
  return {
    dam: {
      label: "1) Đấm",
      max: 10,
      items: [
        { key: "kt_tay", criterion: createEmptyCriterion(3) },
        { key: "kt_tan", criterion: createEmptyCriterion(3) },
        { key: "ky_nang", criterion: createEmptyCriterion(3) },
        { key: "tieng_het", criterion: createEmptyCriterion(1) },
      ],
    },
    tan: {
      label: "2) Tấn & Thuật ngữ",
      max: 20,
      items: [
        { key: "thuat_ngu", criterion: createEmptyCriterion(7) },
        { key: "kt_tay", criterion: createEmptyCriterion(3) },
        { key: "kt_tan", criterion: createEmptyCriterion(10) },
      ],
    },
    tan_tay: {
      label: "3) Tấn kết hợp tay",
      max: 30,
      items: [
        {
          key: "dt1",
          label: "ĐT1",
          criterion: createEmptyCriterion(10),
          children: [
            { key: "kt_tan", criterion: createEmptyCriterion(6) },
            { key: "kt_tay", criterion: createEmptyCriterion(3) },
            { key: "tieng_het", criterion: createEmptyCriterion(1) },
          ],
        },
        {
          key: "dt2",
          label: "ĐT2",
          criterion: createEmptyCriterion(10),
          children: [
            { key: "kt_tan", criterion: createEmptyCriterion(6) },
            { key: "kt_tay", criterion: createEmptyCriterion(3) },
            { key: "tieng_het", criterion: createEmptyCriterion(1) },
          ],
        },
        {
          key: "dt3",
          label: "ĐT3",
          criterion: createEmptyCriterion(10),
          children: [
            { key: "kt_tan", criterion: createEmptyCriterion(6) },
            { key: "kt_tay", criterion: createEmptyCriterion(3) },
            { key: "tieng_het", criterion: createEmptyCriterion(1) },
          ],
        },
      ],
    },
    chan: {
      label: "4) Kỹ thuật đòn chân",
      max: 40,
      items: [
        { key: "ap_chagi", criterion: createEmptyCriterion(10) },
        { key: "dop_chagi", criterion: createEmptyCriterion(10) },
        { key: "tolo_chagi", criterion: createEmptyCriterion(10) },
        { key: "dwit_chagi", criterion: createEmptyCriterion(10) },
      ],
    },
  };
}

function RubricSummaryStrip() {
  return (
    <div className="detail-exam-modal__rubric-summary">
      <span>Đấm</span>
      <span>Tấn & Thuật ngữ</span>
      <span>DT1</span>
      <span>DT2</span>
      <span>DT3</span>
      <span>Đòn chân</span>
    </div>
  );
}

function parseRubric(): RubricIndex {
  const defaultRubric = createDefaultRubric();

  try {
    const parsed = JSON.parse(rubricRaw) as Array<
      Record<string, unknown> & {
        content?: Array<
          Record<string, unknown> & { content?: RubricContentMap }
        >;
      }
    >;

    parsed.forEach((sectionEntry) => {
      if (Object.prototype.hasOwnProperty.call(sectionEntry, "dam")) {
        const damContent = Array.isArray(sectionEntry.content)
          ? sectionEntry.content
          : [];

        defaultRubric.dam.items = damContent.map((item) => {
          const criterionKey = Object.keys(item).find(
            (key) => key !== "content",
          );

          return {
            key: criterionKey ?? "unknown",
            criterion: {
              max: Number(criterionKey ? (item[criterionKey] ?? 0) : 0),
              comments: (item.content ?? {}) as RubricContentMap,
            },
          };
        });
      }

      if (Object.prototype.hasOwnProperty.call(sectionEntry, "tan")) {
        const tanContent = Array.isArray(sectionEntry.content)
          ? sectionEntry.content
          : [];

        defaultRubric.tan.items = tanContent.map((item) => {
          const criterionKey = Object.keys(item).find(
            (key) => key !== "content",
          );

          return {
            key: criterionKey ?? "unknown",
            criterion: {
              max: Number(criterionKey ? (item[criterionKey] ?? 0) : 0),
              comments: (item.content ?? {}) as RubricContentMap,
            },
          };
        });
      }

      if (Object.prototype.hasOwnProperty.call(sectionEntry, "tan_tay")) {
        const tanTayContent = Array.isArray(sectionEntry.content)
          ? sectionEntry.content
          : [];

        defaultRubric.tan_tay.items = tanTayContent.map((groupItem) => {
          const groupKey = Object.keys(groupItem).find(
            (key) => key !== "content",
          );
          const children = Array.isArray(groupItem.content)
            ? groupItem.content
            : [];

          return {
            key: groupKey ?? "unknown",
            label: (groupKey ?? "").toUpperCase(),
            criterion: {
              max: Number(groupKey ? (groupItem[groupKey] ?? 0) : 0),
              comments: {},
            },
            children: children.map((childItem) => {
              const childKey = Object.keys(childItem).find(
                (key) => key !== "content",
              );

              return {
                key: childKey ?? "unknown",
                criterion: {
                  max: Number(childKey ? (childItem[childKey] ?? 0) : 0),
                  comments: (childItem.content ?? {}) as RubricContentMap,
                },
              };
            }),
          };
        });
      }

      if (Object.prototype.hasOwnProperty.call(sectionEntry, "chan")) {
        const chanContent = Array.isArray(sectionEntry.content)
          ? sectionEntry.content
          : [];

        defaultRubric.chan.items = chanContent.map((item) => {
          const criterionKey = Object.keys(item).find(
            (key) => key !== "content",
          );

          return {
            key: criterionKey ?? "unknown",
            criterion: {
              max: Number(criterionKey ? (item[criterionKey] ?? 0) : 0),
              comments: (item.content ?? {}) as RubricContentMap,
            },
          };
        });
      }
    });
  } catch {
    return defaultRubric;
  }

  return defaultRubric;
}

const RUBRIC = parseRubric();

function resolveRubricComment(
  score: number,
  criterion: RubricCriterion,
): string {
  const exactMatch = criterion.comments[String(score)];

  if (exactMatch?.trim()) {
    return exactMatch;
  }

  const entries = Object.entries(criterion.comments ?? {}).map(
    ([key, value]) => ({
      score: Number(key),
      value,
    }),
  );

  if (!entries.length) {
    return "Chưa có nhận xét mẫu cho tiêu chí này.";
  }

  const sorted = entries
    .filter((entry) => Number.isFinite(entry.score))
    .sort((a, b) => b.score - a.score);

  const matched =
    sorted.find((entry) => score >= entry.score) ?? sorted[sorted.length - 1];

  if (!matched?.value?.trim()) {
    return score >= criterion.max
      ? "Đạt mức tối đa của tiêu chí."
      : "Đạt mức kỹ thuật tốt ở tiêu chí này.";
  }

  return matched.value;
}

function buildRow(
  label: string,
  score: number,
  criterion: RubricCriterion,
): RubricRow {
  return {
    label,
    score,
    max: criterion.max,
    comment: resolveRubricComment(score, criterion),
  };
}

function SectionTable({
  title,
  total,
  rows,
}: {
  title: string;
  total: string;
  rows: RubricRow[];
}) {
  return (
    <section className="detail-exam-modal__section">
      <div className="detail-exam-modal__section-head">
        <h4>{title}</h4>
        <span>{total}</span>
      </div>
      <div className="detail-exam-modal__table-wrap">
        <table className="detail-exam-modal__table">
          <thead>
            <tr>
              <th>Tiêu chí</th>
              <th>Điểm</th>
              <th>Nhận xét theo mẫu</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>
                  <strong>
                    {row.score}/{row.max}
                  </strong>
                </td>
                <td>{row.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function NestedSectionTable({
  title,
  total,
  groups,
}: {
  title: string;
  total: string;
  groups: Array<{
    label: string;
    score: number;
    max: number;
    rows: RubricRow[];
  }>;
}) {
  return (
    <section className="detail-exam-modal__section">
      <div className="detail-exam-modal__section-head">
        <h4>{title}</h4>
        <span>{total}</span>
      </div>

      <div className="detail-exam-modal__nested-grid">
        {groups.map((group) => (
          <div key={group.label} className="detail-exam-modal__nested-card">
            <div className="detail-exam-modal__nested-card-head">
              <strong>{group.label}</strong>
              <span>
                {group.score}/{group.max}
              </span>
            </div>
            <div className="detail-exam-modal__table-wrap">
              <table className="detail-exam-modal__table detail-exam-modal__table--compact">
                <thead>
                  <tr>
                    <th>Tiêu chí</th>
                    <th>Điểm</th>
                    <th>Nhận xét theo mẫu</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>
                        <strong>
                          {row.score}/{row.max}
                        </strong>
                      </td>
                      <td>{row.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ModalDetailExam({
  isOpen,
  examResult,
  onClose,
}: ModalDetailExamProps) {
  if (!isOpen || !examResult) return null;

  const { breakdown } = examResult;

  const punchRows: RubricRow[] = [
    buildRow(
      "Kỹ thuật tay",
      breakdown.damKtTay,
      RUBRIC.dam.items[0]?.criterion ?? createEmptyCriterion(3),
    ),
    buildRow(
      "Kỹ thuật tấn",
      breakdown.damKtTan,
      RUBRIC.dam.items[1]?.criterion ?? createEmptyCriterion(3),
    ),
    buildRow(
      "Kỹ năng",
      breakdown.damKyNang,
      RUBRIC.dam.items[2]?.criterion ?? createEmptyCriterion(3),
    ),
    buildRow(
      "Tiếng hét",
      breakdown.damTiengHet,
      RUBRIC.dam.items[3]?.criterion ?? createEmptyCriterion(1),
    ),
  ];

  const stanceRows: RubricRow[] = [
    buildRow(
      "Thuật ngữ",
      breakdown.tanThuatNgu,
      RUBRIC.tan.items[0]?.criterion ?? createEmptyCriterion(7),
    ),
    buildRow(
      "Kỹ thuật tay",
      breakdown.tanKtTay,
      RUBRIC.tan.items[1]?.criterion ?? createEmptyCriterion(3),
    ),
    buildRow(
      "Kỹ thuật tấn",
      breakdown.tanKtTan,
      RUBRIC.tan.items[2]?.criterion ?? createEmptyCriterion(10),
    ),
  ];

  const stanceHandGroups = [
    {
      label: RUBRIC.tan_tay.items[0]?.label ?? "ĐT1",
      score:
        breakdown.tanTayDt1KtTan +
        breakdown.tanTayDt1KtTay +
        breakdown.tanTayDt1TiengHet,
      max: RUBRIC.tan_tay.items[0]?.criterion.max ?? 10,
      rows: [
        buildRow(
          "Kỹ thuật tấn",
          breakdown.tanTayDt1KtTan,
          RUBRIC.tan_tay.items[0]?.children[0]?.criterion ??
            createEmptyCriterion(6),
        ),
        buildRow(
          "Kỹ thuật tay",
          breakdown.tanTayDt1KtTay,
          RUBRIC.tan_tay.items[0]?.children[1]?.criterion ??
            createEmptyCriterion(3),
        ),
        buildRow(
          "Tiếng hét",
          breakdown.tanTayDt1TiengHet,
          RUBRIC.tan_tay.items[0]?.children[2]?.criterion ??
            createEmptyCriterion(1),
        ),
      ],
    },
    {
      label: RUBRIC.tan_tay.items[1]?.label ?? "ĐT2",
      score:
        breakdown.tanTayDt2KtTan +
        breakdown.tanTayDt2KtTay +
        breakdown.tanTayDt2TiengHet,
      max: RUBRIC.tan_tay.items[1]?.criterion.max ?? 10,
      rows: [
        buildRow(
          "Kỹ thuật tấn",
          breakdown.tanTayDt2KtTan,
          RUBRIC.tan_tay.items[1]?.children[0]?.criterion ??
            createEmptyCriterion(6),
        ),
        buildRow(
          "Kỹ thuật tay",
          breakdown.tanTayDt2KtTay,
          RUBRIC.tan_tay.items[1]?.children[1]?.criterion ??
            createEmptyCriterion(3),
        ),
        buildRow(
          "Tiếng hét",
          breakdown.tanTayDt2TiengHet,
          RUBRIC.tan_tay.items[1]?.children[2]?.criterion ??
            createEmptyCriterion(1),
        ),
      ],
    },
    {
      label: RUBRIC.tan_tay.items[2]?.label ?? "ĐT3",
      score:
        breakdown.tanTayDt3KtTan +
        breakdown.tanTayDt3KtTay +
        breakdown.tanTayDt3TiengHet,
      max: RUBRIC.tan_tay.items[2]?.criterion.max ?? 10,
      rows: [
        buildRow(
          "Kỹ thuật tấn",
          breakdown.tanTayDt3KtTan,
          RUBRIC.tan_tay.items[2]?.children[0]?.criterion ??
            createEmptyCriterion(6),
        ),
        buildRow(
          "Kỹ thuật tay",
          breakdown.tanTayDt3KtTay,
          RUBRIC.tan_tay.items[2]?.children[1]?.criterion ??
            createEmptyCriterion(3),
        ),
        buildRow(
          "Tiếng hét",
          breakdown.tanTayDt3TiengHet,
          RUBRIC.tan_tay.items[2]?.children[2]?.criterion ??
            createEmptyCriterion(1),
        ),
      ],
    },
  ];

  const kickRows: RubricRow[] = [
    buildRow(
      "Ap chagi",
      breakdown.apChagi,
      RUBRIC.chan.items[0]?.criterion ?? createEmptyCriterion(10),
    ),
    buildRow(
      "Dop chagi",
      breakdown.dopChagi,
      RUBRIC.chan.items[1]?.criterion ?? createEmptyCriterion(10),
    ),
    buildRow(
      "Tolo chagi",
      breakdown.toloChagi,
      RUBRIC.chan.items[2]?.criterion ?? createEmptyCriterion(10),
    ),
    buildRow(
      "Dwit chagi",
      breakdown.dwitChagi,
      RUBRIC.chan.items[3]?.criterion ?? createEmptyCriterion(10),
    ),
  ];

  return (
    <ModalLayout
      open={isOpen}
      onClose={onClose}
      withSurface={false}
      maxWidth={1200}
    >
      <div className="detail-exam-modal__content">
        <header className="detail-exam-modal__header">
          <div>
            <h3>Chi tiết bài thi đầu vào</h3>
            <p>
              {examResult.fullName} • {examResult.studentId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="detail-exam-modal__close-btn"
          >
            Đóng
          </button>
        </header>

        <section className="detail-exam-modal__student-info">
          <p>
            <strong>Ngày thi:</strong> {examResult.date}
          </p>
          <p>
            <strong>Năm sinh:</strong> {examResult.birthYear}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {examResult.phone || "-"}
          </p>
          <p>
            <strong>Tổng điểm:</strong> {examResult.totalScore}/100
          </p>
        </section>

        <div className="detail-exam-modal__body">
          <RubricSummaryStrip />
          <SectionTable
            title={RUBRIC.dam.label}
            total={`${examResult.punchingTechnique}/10`}
            rows={punchRows}
          />
          <SectionTable
            title={RUBRIC.tan.label}
            total={`${examResult.stanceAndTerminology}/20`}
            rows={stanceRows}
          />
          <NestedSectionTable
            title={RUBRIC.tan_tay.label}
            total={`${examResult.stanceWithHandTechniques}/30`}
            groups={stanceHandGroups}
          />
          <SectionTable
            title={RUBRIC.chan.label}
            total={`${examResult.kickingTechnique}/40`}
            rows={kickRows}
          />
        </div>
      </div>
    </ModalLayout>
  );
}
