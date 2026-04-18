import type { FC } from "react";
import type { RankingSide } from "../types";

interface SideSwitcherProps {
  selectedSide: RankingSide;
  onChange: (side: RankingSide) => void;
}

export const SideSwitcher: FC<SideSwitcherProps> = ({
  selectedSide,
  onChange,
}) => {
  return (
    <div
      className="rankings-side-switcher"
      role="tablist"
      aria-label="Select side"
    >
      <button
        type="button"
        role="tab"
        aria-selected={selectedSide === "left"}
        className={`rankings-side-switcher__item ${
          selectedSide === "left" ? "is-active" : ""
        }`}
        onClick={() => onChange("left")}
      >
        CHAN TRAI
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={selectedSide === "right"}
        className={`rankings-side-switcher__item ${
          selectedSide === "right" ? "is-active" : ""
        }`}
        onClick={() => onChange("right")}
      >
        CHAN PHAI
      </button>
    </div>
  );
};
