import type { Participant, RankingCategory } from "./types";

export const CATEGORIES: RankingCategory[] = [
  { id: "da_tolo_1", name: "Da Tolo Chagi 1 chan lien tuc", hasSides: true },
  {
    id: "vay_tolo_1",
    name: "Vay Tolo Chagi 1 chan lien tuc",
    hasSides: true,
  },
  { id: "kep_tolo", name: "Kep Tolo chagi lien tuc", hasSides: false },
  {
    id: "tolo_2_tien_2_lui",
    name: "Tolo 2 tien - 2 lui phan",
    hasSides: false,
  },
];

const MOCK_AVATARS = [
  "https://images.unsplash.com/photo-1575992877113-6a7dda2d1592?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1655840221208-c096c50c7758?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
];

const firstNames = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Do"];
const middleNames = ["Van", "Minh", "Thi", "Hai", "Ngoc", "Thanh"];
const lastNames = ["Khoa", "Anh", "Long", "Trang", "Huy", "Linh"];

const generateParticipants = (): Participant[] => {
  return Array.from({ length: 15 }).map((_, i) => {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const mn = middleNames[Math.floor(Math.random() * middleNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];

    return {
      id: `p-${i}`,
      name: `${fn} ${mn} ${ln}`,
      avatar: i < 6 ? MOCK_AVATARS[i] : `https://i.pravatar.cc/150?u=${i + 10}`,
      score: 0,
      rank: 0,
    };
  });
};

const mockDataStore: Record<string, Participant[]> = {};

for (const category of CATEGORIES) {
  if (category.hasSides) {
    const leftParticipants = generateParticipants()
      .map((participant) => ({
        ...participant,
        score: Math.floor(Math.random() * 100) + 80,
      }))
      .sort((a, b) => b.score - a.score)
      .map((participant, index) => ({ ...participant, rank: index + 1 }));

    const rightParticipants = generateParticipants()
      .map((participant) => ({
        ...participant,
        score: Math.floor(Math.random() * 100) + 80,
      }))
      .sort((a, b) => b.score - a.score)
      .map((participant, index) => ({ ...participant, rank: index + 1 }));

    mockDataStore[`${category.id}-left`] = leftParticipants;
    mockDataStore[`${category.id}-right`] = rightParticipants;
  } else {
    const participants = generateParticipants()
      .map((participant) => ({
        ...participant,
        score: Math.floor(Math.random() * 100) + 80,
      }))
      .sort((a, b) => b.score - a.score)
      .map((participant, index) => ({ ...participant, rank: index + 1 }));

    mockDataStore[category.id] = participants;
  }
}

export const RANKING_PARTICIPANTS = mockDataStore;
