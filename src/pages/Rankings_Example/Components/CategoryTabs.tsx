import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import type { RankingCategory } from "../types";

interface CategoryTabsProps {
  categories: RankingCategory[];
  selectedCategoryId: string;
  onSelectCategory: (category: RankingCategory) => void;
}

export const CategoryTabs: FC<CategoryTabsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    canLeft: false,
    canRight: false,
  });

  const selectedCategoryName = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId)?.name ??
      "",
    [categories, selectedCategoryId],
  );

  useEffect(() => {
    const updateScrollState = () => {
      const element = scrollContainerRef.current;

      if (!element) {
        return;
      }

      setScrollState({
        canLeft: element.scrollLeft > 0,
        canRight:
          element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
      });
    };

    updateScrollState();

    const element = scrollContainerRef.current;
    if (!element) {
      return;
    }

    element.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollTabs = (direction: "left" | "right") => {
    const element = scrollContainerRef.current;
    if (!element) {
      return;
    }

    const scrollAmount = direction === "left" ? -220 : 220;
    element.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="rankings-categories" aria-label="Ranking categories">
      <p className="rankings-categories__selected" aria-live="polite">
        {selectedCategoryName}
      </p>

      <div className="rankings-categories__track-wrap">
        <button
          type="button"
          onClick={() => scrollTabs("left")}
          className={`rankings-categories__scroll-btn is-left ${
            scrollState.canLeft ? "is-visible" : ""
          }`}
          disabled={!scrollState.canLeft}
          aria-label="Scroll category list left"
        >
          <ChevronLeft size={16} />
        </button>

        <div ref={scrollContainerRef} className="rankings-categories__track">
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              onClick={() => onSelectCategory(category)}
              className={`rankings-categories__item ${
                selectedCategoryId === category.id ? "is-active" : ""
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollTabs("right")}
          className={`rankings-categories__scroll-btn is-right ${
            scrollState.canRight ? "is-visible" : ""
          }`}
          disabled={!scrollState.canRight}
          aria-label="Scroll category list right"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
};
