import type { RankItem } from "@/types/Report/LeaderboardTypes";
import type { ReactNode } from "react";
import { PodiumStep } from "../PodiumStep/PodiumStep";
import "./PodiumSection.scss";

interface PodiumSectionProps<T> {
  items: RankItem<T>[];
  metric: string;
  getScore: (data: T) => ReactNode;
}

export function PodiumSection<T>({
  items,
  metric,
  getScore,
}: PodiumSectionProps<T>) {
  if (items.length < 3) {
    return (
      <section
        className="rankings-podium rankings-podium--empty"
        aria-live="polite"
      >
        <p>Khong co du du lieu de hien thi top 3.</p>
      </section>
    );
  }

  return (
    <section className="rankings-podium" aria-label="Top 3 participants">
      <div className="rankings-podium__glow" />
      <PodiumStep
        item={items[1]}
        rank={2}
        metric={metric}
        getScore={getScore}
      />
      <PodiumStep
        item={items[0]}
        rank={1}
        metric={metric}
        getScore={getScore}
      />
      <PodiumStep
        item={items[2]}
        rank={3}
        metric={metric}
        getScore={getScore}
      />
    </section>
  );
}
