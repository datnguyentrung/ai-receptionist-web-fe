import { useAuthStore } from "@/store/authStore";
import { Check, ChevronsUpDown, UserRoundPen } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"; // Thêm import
import styles from "./SidebarSettings.module.scss";

export default function SidebarSettings() {
  const profiles = useAuthStore((s) => s.profiles);
  const activeProfile = useAuthStore((s) => s.activeProfile);
  const switchProfile = useAuthStore((s) => s.switchProfile);

  // Khởi tạo các hook của react-router-dom
  const navigate = useNavigate();
  const location = useLocation();

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
          const newUserCode = profile.userInfo.userCode; // Lấy userCode của nick được chọn
          const isActive = activeProfile?.userInfo.idUser === id;

          return (
            <li key={id}>
              <button
                type="button"
                className={`${styles.profileItem} ${isActive ? styles.profileItemActive : ""}`}
                onClick={() => {
                  if (!isActive) {
                    // 1. Chuyển đổi trạng thái trong store
                    switchProfile(id);

                    // 2. Chuyển hướng URL
                    const oldUserCode = activeProfile?.userInfo.userCode;

                    // Nếu URL hiện tại đang là trang cá nhân của nick cũ (VD: /SV001/classes)
                    if (
                      oldUserCode &&
                      location.pathname.startsWith(`/${oldUserCode}`)
                    ) {
                      // Đổi sang URL của nick mới nhưng giữ nguyên tab (Thành: /SV002/classes)
                      const newPath = location.pathname.replace(
                        `/${oldUserCode}`,
                        `/${newUserCode}`,
                      );
                      navigate(newPath);
                    } else {
                      // Nếu đang ở trang dùng chung (như /rankings), đẩy thẳng về trang cá nhân của nick mới
                      navigate(`/${newUserCode}`);
                    }
                  }
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
