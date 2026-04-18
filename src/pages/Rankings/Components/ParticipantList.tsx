import type { FC } from "react";
import type { Participant } from "../types";

interface ParticipantListProps {
  participants: Participant[];
}

export const ParticipantList: FC<ParticipantListProps> = ({ participants }) => {
  return (
    <section className="rankings-list" aria-label="Participant list">
      <h3 className="rankings-list__heading">
        <span>DANH SACH THANH VIEN</span>
        <span className="rankings-list__counter">
          {participants.length} THANH VIEN
        </span>
      </h3>

      <div className="rankings-list__items">
        {participants.map((participant) => (
          <article key={participant.id} className="rankings-list-card">
            <div className="rankings-list-card__rank">{participant.rank}</div>

            <div className="rankings-list-card__avatar-wrap">
              <img
                src={participant.avatar}
                alt={participant.name}
                className="rankings-list-card__avatar"
              />
            </div>

            <div className="rankings-list-card__identity">
              <p className="rankings-list-card__name">{participant.name}</p>
              <p className="rankings-list-card__status">Thanh vien tich cuc</p>
            </div>

            <div className="rankings-list-card__score-wrap">
              <p className="rankings-list-card__score">{participant.score}</p>
              <p className="rankings-list-card__metric">luot</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
