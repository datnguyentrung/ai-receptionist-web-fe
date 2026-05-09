import type { RankItem } from "@/types/Report/LeaderboardTypes";
import { clsx } from "clsx";
import { ChevronDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import Avatar from "../../../../components/Avatar";
import { BeltLabel } from "../../../../config/constants";
import styles from "./ParticipantList.module.scss";

interface ParticipantListProps<T> {
  items: RankItem<T>[];
  expandedRank: number | null;
  onToggle: (rank: number) => void;
  metric: string;
  getScore: (data: T) => ReactNode;
  renderExpanded?: (item: RankItem<T>) => ReactNode;
}

export function ParticipantList<T>({
  items,
  expandedRank,
  onToggle,
  metric,
  getScore,
  renderExpanded,
}: ParticipantListProps<T>) {
  return (
    <section className="rankings-list" aria-label="Participant list">
      <h3 className="rankings-list__heading">
        <span>DANH SÁCH HỌC VIÊN</span>
        <span className="rankings-list__counter">
          TOP {items.length} HỌC VIÊN
        </span>
      </h3>

      <div className="rankings-list__items">
        {items.map((item) => {
          const isItemExpanded = expandedRank === item.rank;
          const rankDelta =
            item.rankBefore != null ? item.rankBefore - item.rank : null;
          const isRankUp = rankDelta != null && rankDelta > 0;
          const rankUpTier = !isRankUp
            ? null
            : rankDelta >= 10
              ? "blaze"
              : rankDelta >= 5
                ? "flare"
                : rankDelta >= 2
                  ? "spark"
                  : "glow";
          return (
            <div key={item.studentCode}>
              <article
                className={clsx(
                  "rankings-list-card",
                  isItemExpanded && "rankings-list-card--expanded",
                )}
                onClick={() => onToggle(item.rank)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle(item.rank);
                  }
                }}
              >
                <div
                  className={clsx(
                    "rankings-list-card__rank",
                    styles.rankWrap,
                    isRankUp && styles["rankWrap--up"],
                  )}
                >
                  <span className={styles.rankNumber}>{item.rank}</span>

                  {isRankUp && rankUpTier && (
                    <span
                      className={clsx(
                        styles.rankUpBadge,
                        styles[`rankUpBadge--${rankUpTier}`],
                      )}
                      title={`Tăng ${rankDelta} bậc`}
                      aria-label={`Tăng ${rankDelta} bậc`}
                    >
                      <TrendingUp
                        size={12}
                        strokeWidth={2.25}
                        className={styles.rankUpIcon}
                        aria-hidden="true"
                      />
                      <span className={styles.rankUpValue}>+{rankDelta}</span>
                    </span>
                  )}
                </div>

                <Avatar
                  fullName={item.fullName}
                  fontSize="md"
                  fontWeight={500}
                  width="48px"
                  height="48px"
                  className="rankings-list-card__avatar"
                />

                <div className="rankings-list-card__identity">
                  <p className="rankings-list-card__name">{item.fullName}</p>
                  <p className="rankings-list-card__status">
                    {BeltLabel[item.belt]}
                  </p>
                </div>

                <div className="rankings-list-card__score-wrap">
                  <p className="rankings-list-card__score">
                    {getScore(item.data)}
                  </p>
                  <p className="rankings-list-card__metric">{metric}</p>
                </div>

                <ChevronDown
                  size={16}
                  className={clsx(
                    styles.chevron,
                    isItemExpanded && styles["chevron--open"],
                  )}
                />
              </article>

              {isItemExpanded && (
                <div className={styles.expandedContent}>
                  {renderExpanded?.(item)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
