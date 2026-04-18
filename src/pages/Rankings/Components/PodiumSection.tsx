import type { FC } from "react";
import type { Participant } from "../types";
import { PodiumStep } from "./PodiumStep";

interface PodiumSectionProps {
  participants: Participant[];
  metric: string;
}

export const PodiumSection: FC<PodiumSectionProps> = ({
  participants,
  metric,
}) => {
  if (participants.length < 3) {
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
      <PodiumStep participant={participants[1]} rank={2} metric={metric} />
      <PodiumStep participant={participants[0]} rank={1} metric={metric} />
      <PodiumStep participant={participants[2]} rank={3} metric={metric} />
    </section>
  );
};
