import historyExamCsvRaw from "@/store/history_exam.csv?raw";
import {
  getCalculatedEntranceExamResults,
  type CalculatedEntranceExamResult,
} from "@/utils/calculateUtils";
import { useMemo, useState } from "react";
import DataFilters from "../DataFilters/DataFilters";
import ModalDetailExam from "../ModalDetailExam/ModalDetailExam";
import TopExamPodium from "../TopExamPodium/TopExamPodium";
import "./EntranceExam.scss";

type EntranceExamFilter = {
  search: string;
  year: string;
  quarter: string;
};

const QUARTER_OPTIONS = ["Quý 1", "Quý 2", "Quý 3", "Quý 4"];

type ScoreBandKey =
  | "critical"
  | "not-pass"
  | "basic"
  | "fair"
  | "good"
  | "excellent"
  | "perfect";

type ScoreBand = {
  key: ScoreBandKey;
  label: string;
  colorHex: string;
};

function getScoreBand(totalScore: number): ScoreBand {
  if (totalScore < 30) {
    return { key: "critical", label: "Cảnh báo", colorHex: "#CF1322" };
  }

  if (totalScore < 50) {
    return { key: "not-pass", label: "Cần cải thiện", colorHex: "#FF4D4F" };
  }

  if (totalScore < 70) {
    return { key: "basic", label: "Củng cố căn bản", colorHex: "#FA8C16" };
  }

  if (totalScore < 80) {
    return { key: "fair", label: "Khá", colorHex: "#1677FF" };
  }

  if (totalScore < 90) {
    return { key: "good", label: "Tốt", colorHex: "#52C41A" };
  }

  if (totalScore < 95) {
    return { key: "excellent", label: "Xuất sắc", colorHex: "#722ED1" };
  }

  return { key: "perfect", label: "Hoàn hảo", colorHex: "#FAAD14" };
}

function rankUniqueBestByStudent(
  rows: CalculatedEntranceExamResult[],
): CalculatedEntranceExamResult[] {
  const bestScoreMap = new Map<string, CalculatedEntranceExamResult>();

  rows.forEach((row) => {
    const currentBest = bestScoreMap.get(row.studentId);
    if (!currentBest || row.totalScore > currentBest.totalScore) {
      bestScoreMap.set(row.studentId, row);
    }
  });

  return Array.from(bestScoreMap.values()).sort(
    (a, b) => b.totalScore - a.totalScore,
  );
}

export default function EntranceExam() {
  const [selectedResult, setSelectedResult] =
    useState<CalculatedEntranceExamResult | null>(null);

  const allCalculatedResults = useMemo(
    () => getCalculatedEntranceExamResults(historyExamCsvRaw),
    [],
  );

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(allCalculatedResults.map((item) => item.year).filter(Boolean)),
    ).sort((a, b) => Number(b) - Number(a));
  }, [allCalculatedResults]);

  const defaultYear = yearOptions[0] ?? "";

  const [draftFilter, setDraftFilter] = useState<EntranceExamFilter>({
    search: "",
    year: defaultYear,
    quarter: "Quý 2",
  });
  const [appliedFilter, setAppliedFilter] = useState<EntranceExamFilter>({
    search: "",
    year: defaultYear,
    quarter: "Quý 2",
  });

  const filteredResults = useMemo<CalculatedEntranceExamResult[]>(() => {
    const normalizedSearch = appliedFilter.search.trim().toLowerCase();

    const matchedRows = allCalculatedResults.filter((item) => {
      const matchedYear =
        !appliedFilter.year || item.year === appliedFilter.year;
      const matchedQuarter =
        !appliedFilter.quarter || item.quarter === appliedFilter.quarter;

      const matchedSearch =
        !normalizedSearch ||
        item.studentId.toLowerCase().includes(normalizedSearch) ||
        item.fullName.toLowerCase().includes(normalizedSearch);

      return matchedYear && matchedQuarter && matchedSearch;
    });

    return rankUniqueBestByStudent(matchedRows);
  }, [allCalculatedResults, appliedFilter]);

  const top3Students = useMemo(() => {
    return filteredResults.slice(0, 3).map((student) => ({
      studentId: student.studentId,
      fullName: student.fullName,
      totalScore: student.totalScore,
    }));
  }, [filteredResults]);

  const batchName =
    appliedFilter.year && appliedFilter.quarter
      ? `${appliedFilter.quarter} - Năm ${appliedFilter.year}`
      : "Tất cả đợt";

  return (
    <div className="entrance-exam">
      <DataFilters
        searchValue={draftFilter.search}
        selectedYear={draftFilter.year}
        selectedQuarter={draftFilter.quarter}
        yearOptions={yearOptions}
        quarterOptions={QUARTER_OPTIONS}
        onSearchChange={(value) =>
          setDraftFilter((previous) => ({ ...previous, search: value }))
        }
        onYearChange={(value) =>
          setDraftFilter((previous) => ({ ...previous, year: value }))
        }
        onQuarterChange={(value) =>
          setDraftFilter((previous) => ({ ...previous, quarter: value }))
        }
        onApply={() => setAppliedFilter(draftFilter)}
      />

      <TopExamPodium students={top3Students} />

      <section className="entrance-exam__result-panel">
        <div className="entrance-exam__panel-header">
          <h2>Kết quả Tổng hợp Thi Đầu vào (Đợt: {batchName})</h2>
          <p>Tổng số học viên: {filteredResults.length}</p>
        </div>

        <div className="entrance-exam__table-wrap">
          <table className="entrance-exam__table">
            <colgroup>
              <col className="col-stt" />
              <col className="col-id" />
              <col className="col-name" />
              <col className="col-year" />
              <col className="col-score" />
              <col className="col-score" />
              <col className="col-score" />
              <col className="col-score" />
              <col className="col-total" />
              <col className="col-result" />
            </colgroup>
            <thead>
              <tr>
                <th>STT</th>
                <th>MÃ HỘI VIÊN</th>
                <th>HỌ TÊN</th>
                <th>NĂM SINH</th>
                <th>
                  KỸ THUẬT ĐẤM
                  <br />
                  (10)
                </th>
                <th className="entrance-exam__th-wrap">
                  KỸ THUẬT TẤN &amp; THUẬT NGỮ
                  <br />
                  (20)
                </th>
                <th className="entrance-exam__th-wrap">
                  TẤN KẾT HỢP TAY
                  <br />
                  (30)
                </th>
                <th>
                  KỸ THUẬT ĐÒN CHÂN
                  <br />
                  (40)
                </th>
                <th>TỔNG ĐIỂM (100)</th>
                <th>KQ ĐÁNH GIÁ</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => {
                  const scoreBand = getScoreBand(result.totalScore);

                  return (
                    <tr
                      key={result.studentId}
                      className={`entrance-exam__row entrance-exam__row--${scoreBand.key}`}
                    >
                      <td>{index + 1}</td>
                      <td>{result.studentId}</td>
                      <td>
                        <div className="entrance-exam__name-cell">
                          <span>{result.fullName}</span>
                          <button
                            type="button"
                            className="entrance-exam__detail-btn"
                            onClick={() => setSelectedResult(result)}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </td>
                      <td>{result.birthYear}</td>
                      <td>{result.punchingTechnique}</td>
                      <td>{result.stanceAndTerminology}</td>
                      <td>{result.stanceWithHandTechniques}</td>
                      <td>{result.kickingTechnique}</td>
                      <td className="entrance-exam__score-cell">
                        {result.totalScore}
                      </td>
                      <td>
                        <span
                          className={`entrance-exam__evaluation entrance-exam__evaluation--${scoreBand.key}`}
                          style={{
                            borderColor: scoreBand.colorHex,
                            color: scoreBand.colorHex,
                          }}
                        >
                          {scoreBand.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="entrance-exam__empty-cell">
                    Không tìm thấy kết quả phù hợp với điều kiện lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ModalDetailExam
        isOpen={Boolean(selectedResult)}
        examResult={selectedResult}
        onClose={() => setSelectedResult(null)}
      />
    </div>
  );
}
