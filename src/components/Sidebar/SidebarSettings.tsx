import { useAuthStore } from "@/store/authStore";
import { Check, ChevronsUpDown, UserRoundPen } from "lucide-react";
import styles from "./SidebarSettings.module.scss";

export default function SidebarSettings() {
  const profiles = useAuthStore((s) => s.profiles);
  const activeProfile = useAuthStore((s) => s.activeProfile);
  const switchProfile = useAuthStore((s) => s.switchProfile);

  if (profiles.length <= 1) return null;

  return (
    <div className={styles.profileSection}>
      <div className={styles.sectionHeader}>
        <UserRoundPen size={14} />
        <span className={styles.sectionLabel}>Chuyển tài khoản</span>
        <ChevronsUpDown size={12} className={styles.sectionIcon} />
      </div>

      <ul className={styles.profileList}>
        {profiles.map((profile) => {
          const id = profile.userInfo.idUser;
          const name = profile.userProfile.name;
          const isActive = activeProfile?.userInfo.idUser === id;

          return (
            <li key={id}>
              <button
                type="button"
                className={`${styles.profileItem} ${isActive ? styles.profileItemActive : ""}`}
                onClick={() => {
                  if (!isActive) switchProfile(id);
                }}
                disabled={isActive}
              >
                <div className={styles.profileAvatar}>
                  {isActive && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={styles.profileName}>{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
