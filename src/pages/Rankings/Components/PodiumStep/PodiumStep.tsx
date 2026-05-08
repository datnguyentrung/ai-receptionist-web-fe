import type { RankItem } from "@/types/Report/LeaderboardTypes";
import { Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../../../../components/Avatar";
import { useRoleStudent } from "../../../../utils/roleUtils";
import "./PodiumStep.scss";

interface PodiumStepProps<T> {
  item: RankItem<T>;
  rank: number;
  metric: string;
  getScore: (data: T) => ReactNode;
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

export function PodiumStep<T>({
  item,
  rank,
  metric,
  getScore,
}: PodiumStepProps<T>) {
  const navigate = useNavigate();
  const style = PODIUM_STYLE_MAP[rank as keyof typeof PODIUM_STYLE_MAP] ?? {
    rootClassName: "",
    iconClassName: "",
  };

  const { canViewCoach } = useRoleStudent();

  const handleNameClick = (studentCode: string) => {
    if (!canViewCoach) return;

    navigate(`/${studentCode}`);
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
          <Avatar
            fullName={item.fullName}
            fontSize="md"
            fontWeight={500}
            width="70px"
            height="70px"
            className="podium-step__avatar"
          />
          <span className="podium-step__rank">{rank}</span>
        </div>
      </div>

      <div className="podium-step__content">
        <h4
          className="podium-step__name"
          style={{ cursor: "pointer" }}
          onClick={() => handleNameClick(item.studentCode)}
        >
          {item.fullName}
        </h4>
        <p className="podium-step__score">{getScore(item.data)}</p>
        <p className="podium-step__metric">{metric}</p>
      </div>
    </article>
  );
}
