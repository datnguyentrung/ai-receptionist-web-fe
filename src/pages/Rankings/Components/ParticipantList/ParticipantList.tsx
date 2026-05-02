import type { RankItem } from "@/types/Report/LeaderboardTypes";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import type { FC } from "react";
import Avatar from "../../../../components/Avatar";
import { BeltLabel } from "../../../../config/constants";
import QuarterSummaryDetail from "../../../PersonalPage/components/ScoreTab/QuarterSummaryDetail/QuarterSummaryDetail";
import styles from "./ParticipantList.module.scss";

interface ParticipantListProps {
  items: RankItem[];
  expandedRank: number | null;
  onToggle: (rank: number) => void;
  metric: string;
}

export const ParticipantList: FC<ParticipantListProps> = ({
  items,
  expandedRank,
  onToggle,
  metric,
}) => {
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
                <div className="rankings-list-card__rank">{item.rank}</div>

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
                    {item.quarterSummary.totalQuarterScore}
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
                  <QuarterSummaryDetail summary={item.quarterSummary} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
