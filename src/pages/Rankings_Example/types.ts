export type RankingSide = "left" | "right";

export interface RankingCategory {
  id: string;
  name: string;
  hasSides: boolean;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  score: number;
  rank: number;
}
