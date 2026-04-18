import "./Rankings.scss";

import { ChevronDown, Trophy } from "lucide-react";
import { useState } from "react";
import {
  CategoryTabs,
  MobileHeader,
  ParticipantList,
  PodiumSection,
  Sidebar,
  SideSwitcher,
} from "./Components";
import { CATEGORIES, RANKING_PARTICIPANTS } from "./mockData";
import type { RankingCategory, RankingSide } from "./types";

export default function Rankings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0].id);
  const [selectedSide, setSelectedSide] = useState<RankingSide>("left");

  const activeCategory =
    CATEGORIES.find((category) => category.id === selectedCat) ?? CATEGORIES[0];

  const currentDataKey = activeCategory.hasSides
    ? `${selectedCat}-${selectedSide}`
    : selectedCat;

  const participants = RANKING_PARTICIPANTS[currentDataKey] ?? [];
  const top3 = participants.slice(0, 3);
  const others = participants.slice(3);

  const handleSelectCategory = (category: RankingCategory) => {
    setSelectedCat(category.id);

    if (category.hasSides) {
      setSelectedSide("left");
    }
  };

  return (
    <div className="rankings-page">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="rankings-main">
        <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <div className="rankings-layout">
          <header className="rankings-header">
            <div>
              <p className="rankings-header__eyebrow">
                <Trophy size={14} />
                Ket qua thi dua
              </p>
              <h1 className="rankings-header__title">BANG XEP HANG</h1>
            </div>

            <button className="rankings-header__period-btn" type="button">
              <span className="rankings-header__period-label">
                Ky danh gia:
              </span>
              QUY 2 / 2024
              <ChevronDown size={16} />
            </button>
          </header>

          <section className="rankings-nav" aria-label="Ranking controls">
            <CategoryTabs
              categories={CATEGORIES}
              selectedCategoryId={selectedCat}
              onSelectCategory={handleSelectCategory}
            />

            {activeCategory.hasSides && (
              <SideSwitcher
                selectedSide={selectedSide}
                onChange={setSelectedSide}
              />
            )}
          </section>

          <div className="rankings-content">
            <PodiumSection participants={top3} metric="luot" />
            <ParticipantList participants={others} />
          </div>
        </div>
      </main>
    </div>
  );
}
