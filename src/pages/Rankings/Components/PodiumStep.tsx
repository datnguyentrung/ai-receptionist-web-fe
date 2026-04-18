import { Trophy } from "lucide-react";
import type { FC } from "react";
import type { Participant } from "../types";

interface PodiumStepProps {
  participant: Participant;
  rank: number;
  metric: string;
}

const PODIUM_STYLE_MAP = {
  1: {
    rootClassName: "is-rank-1",
    iconClassName: "is-crown",
  },
  2: {
    rootClassName: "is-rank-2",
    iconClassName: "",
  },
  3: {
    rootClassName: "is-rank-3",
    iconClassName: "",
  },
} as const;

export const PodiumStep: FC<PodiumStepProps> = ({
  participant,
  rank,
  metric,
}) => {
  const style = PODIUM_STYLE_MAP[rank as keyof typeof PODIUM_STYLE_MAP] ?? {
    rootClassName: "",
    iconClassName: "",
  };

  return (
    <article className={`podium-step ${style.rootClassName}`}>
      <div className="podium-step__head">
        {rank === 1 && (
          <div className={`podium-step__crown ${style.iconClassName}`}>
            <Trophy size={38} fill="currentColor" />
          </div>
        )}

        <div className="podium-step__avatar-wrap">
          <img
            src={participant.avatar}
            alt={participant.name}
            className="podium-step__avatar"
          />
          <span className="podium-step__rank">{rank}</span>
        </div>
      </div>

      <div className="podium-step__content">
        <h4 className="podium-step__name">{participant.name}</h4>
        <p className="podium-step__score">{participant.score}</p>
        <p className="podium-step__metric">{metric}</p>
      </div>
    </article>
  );
};
