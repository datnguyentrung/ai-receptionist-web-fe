import { useUserLevel } from "@/utils/roleUtils";
import { NAV_ITEMS } from "../config/constants/path";
import { ROLE_LEVELS } from "../config/constants/roleLevels";

export const useNavItems = () => {
  const { level, isAuthenticated } = useUserLevel();

  // Nếu chưa đăng nhập, trả về mảng rỗng (hoặc tuỳ logic của bạn)
  // Xác định level thực tế sẽ dùng để tính toán
  const currentLevel = isAuthenticated ? level : ROLE_LEVELS.GUEST;

  // Lọc menu: Chỉ giữ lại các menu mà Cấp độ của User >= Cấp độ yêu cầu của Menu
  return NAV_ITEMS.filter((item) => {
    if (!item.minLevel) return true; // Nếu menu không yêu cầu quyền thì luôn hiện

    return currentLevel >= item.minLevel;
  });
};
