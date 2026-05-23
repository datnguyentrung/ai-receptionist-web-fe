import { Card, CardContent } from "@/components/ui/card";
import { ModalLayout } from "@/components/ui/modal-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_OPTIONS,
  type SkillLevel,
} from "@/config/constants/SkillEnums";
import FitnessStandards from "@/features/fitness/components/FitnessStandards";
import { leaderboardAPI } from "@/features/report/apis/LeaderboardAPI";
import { useGetQuery } from "@/hooks/useCrud";
import type { LeaderboardResponse } from "@/types/Report/LeaderboardTypes";
import type { FitnessMetrics } from "@/types/Skill/FitnessRecordTypes";
import { clsx } from "clsx";
import { Award, FileX, Gauge, Info, Timer } from "lucide-react";
import { useState } from "react";
import type { QuarterSummary } from "../../../../types/Report/YearlySummaryTypes";
import QuarterSummaryDetail from "../../../PersonalPage/components/ScoreTab/QuarterSummaryDetail/QuarterSummaryDetail";
import { ParticipantList } from "../ParticipantList/ParticipantList";
import { PodiumSection } from "../PodiumSection/PodiumSection";
import styles from "./QuarterLeaderboard.module.scss";

const FITNESS_CATEGORY_ID = "quarterly-fitness";

function getModeFromCategory(categoryId: string) {
  return categoryId === FITNESS_CATEGORY_ID ? "fitness" : "score";
}

function FitnessMetricsDetail({ summary }: { summary: FitnessMetrics }) {
  const skillLabel =
    SKILL_LEVEL_LABELS[summary.skillLevel as SkillLevel] ?? summary.skillLevel;
  const qualified = summary.isQualified;

  return (
    <Card className={styles.fitnessDetail}>
      <div className={styles.fitnessDetail__header}>
        <div>
          <h4 className={styles.fitnessDetail__title}>
            Kết quả thể lực & tốc độ
          </h4>
          <p className={styles.fitnessDetail__subtitle}>
            Đánh giá theo kỳ hiện tại
          </p>
        </div>

        <div
          className={clsx(
            styles.fitnessDetail__badge,
            qualified
              ? styles["fitnessDetail__badge--qualified"]
              : styles["fitnessDetail__badge--unqualified"],
          )}
        >
          {qualified ? "Đạt chuẩn" : "Chưa đạt"}
        </div>
      </div>

      <CardContent className={styles.fitnessDetail__body}>
        <div className={styles.fitnessDetail__grid}>
          <div className={styles.fitnessDetail__metric}>
            <div className={styles.fitnessDetail__metricLabel}>
              <Timer size={16} />
              <span>Thời lượng</span>
            </div>
            <strong>{summary.duration}</strong>
            <span>giây</span>
          </div>

          <div className={styles.fitnessDetail__metric}>
            <div className={styles.fitnessDetail__metricLabel}>
              <Gauge size={16} />
              <span>Số lượng</span>
            </div>
            <strong>{summary.amount}</strong>
            <span>đơn vị</span>
          </div>

          <div className={styles.fitnessDetail__metric}>
            <div className={styles.fitnessDetail__metricLabel}>
              <Award size={16} />
              <span>Cấp độ</span>
            </div>
            <strong>{skillLabel}</strong>
            <span>mức kỹ năng</span>
          </div>
        </div>

        <div className={styles.fitnessDetail__footer}>
          <div>
            <span className={styles.fitnessDetail__footerLabel}>
              Chỉ số thể lực & tốc độ
            </span>
            <div className={styles.fitnessDetail__footerValue}>
              {summary.fitnessLevel}
            </div>
          </div>
          <div className={styles.fitnessDetail__footerNote}>
            Chỉ số này dùng để xếp hạng trong tab Kỹ năng: Thể lực & Tốc độ.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton / Empty / Error                                          */
/* ------------------------------------------------------------------ */
function LeaderboardSkeleton() {
  return (
    <div className={styles.skeleton}>
      {/* podium skeletons */}
      <div className={styles.skeleton__podium}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.skeleton__podiumCard}>
            <Skeleton className="h-5 w-5 rounded-full mx-auto mb-2" />
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto mb-1" />
            <Skeleton className="h-6 w-10 mx-auto" />
          </div>
        ))}
      </div>
      {/* table skeletons */}
      <div className={styles.skeleton__table}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skeleton__row}>
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-8 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.empty__icon}>
        <FileX size={32} strokeWidth={1.5} />
      </div>
      <p className={styles.empty__title}>Chưa có dữ liệu xếp hạng</p>
      <p className={styles.empty__desc}>
        Quý này chưa có học viên nào có điểm. Vui lòng chọn quý khác.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className={styles.empty}>
      <div className={`${styles.empty__icon} ${styles["empty__icon--error"]}`}>
        <FileX size={32} strokeWidth={1.5} />
      </div>
      <p className={styles.empty__title}>Đã xảy ra lỗi</p>
      <p className={styles.empty__desc}>
        Không thể tải dữ liệu xếp hạng. Vui lòng thử lại sau.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */
export default function QuarterLeaderboard({
  year,
  quarter,
  categoryId,
}: {
  year: number;
  quarter: number;
  categoryId: string;
}) {
  const [expandedRank, setExpandedRank] = useState<number | null>(null);
  const [fitnessSkillLevel, setFitnessSkillLevel] =
    useState<SkillLevel>("ADVANCED");
  const [standardsOpen, setStandardsOpen] = useState(false);
  const mode = getModeFromCategory(categoryId);

  const scoreQuery = useGetQuery<LeaderboardResponse<QuarterSummary>>(
    ["quarter-leaderboard", "score", { year, quarter }],
    () => leaderboardAPI.getQuarterScoreLeaderboard(year, quarter, 0, 30),
    { enabled: mode === "score" },
  );

  const fitnessRecordQuery = useGetQuery<LeaderboardResponse<FitnessMetrics>>(
    ["quarter-leaderboard", "fitness", { year, quarter, fitnessSkillLevel }],
    () =>
      leaderboardAPI.getQuarterFitnessLeaderboard(
        year,
        quarter,
        fitnessSkillLevel,
        0,
        30,
      ),
    { enabled: mode === "fitness" },
  );

  const activeQuery = mode === "fitness" ? fitnessRecordQuery : scoreQuery;
  const scoreRankings = scoreQuery.data?.rankings ?? [];
  const fitnessRankings = fitnessRecordQuery.data?.rankings ?? [];

  return (
    <div className={styles.ql}>
      {/* States */}
      {activeQuery.isLoading && <LeaderboardSkeleton />}
      {activeQuery.isError && <ErrorState />}
      {!activeQuery.isLoading &&
        !activeQuery.isError &&
        (mode === "fitness"
          ? fitnessRankings === undefined
          : scoreRankings === undefined) && <EmptyState />}

      {/* Content */}
      {!activeQuery.isLoading &&
        !activeQuery.isError &&
        (mode === "fitness"
          ? fitnessRankings !== undefined
          : scoreRankings !== undefined) && (
          <div className={styles.content}>
            {mode === "fitness" ? (
              <>
                <div className={styles.fitnessFilterBar}>
                  <div>
                    <p className={styles.fitnessFilterBar__label}>
                      Mức kỹ năng
                    </p>
                    <p className={styles.fitnessFilterBar__hint}>
                      Chọn mức kỹ năng để xem bảng xếp hạng.
                    </p>
                  </div>

                  <Select
                    value={fitnessSkillLevel}
                    onValueChange={(value) =>
                      setFitnessSkillLevel(value as SkillLevel)
                    }
                  >
                    <SelectTrigger className={styles.fitnessFilterBar__select}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILL_LEVEL_OPTIONS.map((skillLevel) => (
                        <SelectItem key={skillLevel} value={skillLevel}>
                          {SKILL_LEVEL_LABELS[skillLevel]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className={styles.fitnessFilterBar__actions}>
                    <button
                      type="button"
                      className={styles.fitnessFilterBar__standardsBtn}
                      onClick={() => setStandardsOpen(true)}
                    >
                      <Info size={14} />
                      <span>Bảng tiêu chuẩn</span>
                    </button>
                  </div>
                </div>

                <ModalLayout
                  open={standardsOpen}
                  onClose={() => setStandardsOpen(false)}
                  title="Bảng tiêu chuẩn"
                  maxWidth={720}
                >
                  <FitnessStandards skillLevel={fitnessSkillLevel} />
                </ModalLayout>

                {fitnessRankings.length === 0 ? (
                  <EmptyState />
                ) : (
                  <>
                    <PodiumSection
                      items={fitnessRankings.slice(0, 3)}
                      metric="Cấp độ"
                      getScore={(data) => data.fitnessLevel}
                    />
                    <ParticipantList
                      items={fitnessRankings}
                      expandedRank={expandedRank}
                      onToggle={(r) =>
                        setExpandedRank((p) => (p === r ? null : r))
                      }
                      metric="Cấp độ"
                      getScore={(data) => data.fitnessLevel}
                      renderExpanded={(item) => (
                        <FitnessMetricsDetail summary={item.data} />
                      )}
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {scoreRankings.length === 0 ? (
                  <EmptyState />
                ) : (
                  <>
                    <PodiumSection
                      items={scoreRankings.slice(0, 3)}
                      metric="điểm"
                      getScore={(data) => data.totalQuarterScore}
                    />
                    <ParticipantList
                      items={scoreRankings}
                      expandedRank={expandedRank}
                      onToggle={(r) =>
                        setExpandedRank((p) => (p === r ? null : r))
                      }
                      metric="điểm"
                      getScore={(data) => data.totalQuarterScore}
                      renderExpanded={(item) =>
                        item.data ? (
                          <QuarterSummaryDetail summary={item.data} />
                        ) : null
                      }
                    />
                  </>
                )}
              </>
            )}
          </div>
        )}
    </div>
  );
}
