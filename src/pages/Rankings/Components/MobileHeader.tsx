import { Menu } from "lucide-react";
import type { FC } from "react";

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export const MobileHeader: FC<MobileHeaderProps> = ({ onOpenSidebar }) => {
  return (
    <header className="rankings-mobile-header">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rankings-mobile-header__menu-btn"
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      <p className="rankings-mobile-header__title">TAEKWONDO VAN QUAN</p>

      <div className="rankings-mobile-header__spacer" />
    </header>
  );
};
