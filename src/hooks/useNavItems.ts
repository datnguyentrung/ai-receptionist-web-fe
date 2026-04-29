import { useUserLevel } from "@/utils/roleUtils";
import { NAV_ITEMS } from "../config/constants/path";
import { ROLE_LEVELS } from "../config/constants/roleLevels";
import { useAuthStore } from "../store/authStore";

export const useNavItems = () => {
  const { level, isAuthenticated } = useUserLevel();

  // Lấy userCode từ profile đang active
  const activeProfile = useAuthStore((s) => s.activeProfile);
  const studentCode = activeProfile?.userInfo?.userCode;

  const currentLevel = isAuthenticated ? level : ROLE_LEVELS.GUEST;

  // Gọi hàm NAV_ITEMS và truyền studentCode vào (nếu có)
  const items = NAV_ITEMS({ studentCode });

  return items.filter((item) => {
    if (!item.minLevel) return true;
    if (!item.maxLevel) return currentLevel >= item.minLevel;
    return currentLevel >= item.minLevel && currentLevel <= item.maxLevel;
  });
};
