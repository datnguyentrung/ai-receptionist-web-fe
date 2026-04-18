import { Bot, Trophy } from "lucide-react";
import type { FC } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = ["Tong quan", "Bang xep hang", "Thong ke", "Cai dat"];

export const Sidebar: FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <div
        className={`rankings-sidebar-overlay ${isOpen ? "is-visible" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside className={`rankings-sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="rankings-sidebar__brand">
          <div className="rankings-sidebar__brand-icon">
            <Bot size={18} />
          </div>
          <div>
            <p className="rankings-sidebar__brand-name">AI Receptionist</p>
            <p className="rankings-sidebar__brand-subtitle">
              Taekwondo Van Quan
            </p>
          </div>
        </div>

        <nav className="rankings-sidebar__nav">
          {menuItems.map((item) => (
            <button
              key={item}
              className="rankings-sidebar__nav-item"
              type="button"
            >
              <Trophy size={14} />
              <span>{item}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};
