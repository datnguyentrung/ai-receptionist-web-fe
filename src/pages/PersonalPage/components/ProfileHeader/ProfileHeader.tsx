import Avatar from "@/components/common/Avatar";
import ConfirmModal from "@/components/common/ConfirmModal";
import { isPWA } from "@/config/appMode";
import type { CoachDetail, StudentDetail, UserResponse } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { formatDateDMY } from "@/utils/format";
import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Calendar,
  Edit3,
  KeyRound,
  Mail,
  Phone,
  User,
  LogOut,
} from "lucide-react";
import { useCallback, useState } from "react";
import { BeltBadge } from "../../../../components/common/BeltBadge/BeltBadge";
import { showComingSoonActionToast } from "../../../../components/ui/mini-action-popover.toast";
import S from "./ProfileHeader.module.scss";
import img from "/taekwondo.jpg";

interface ProfileHeaderProps {
  user: StudentDetail | CoachDetail;
  currentUserData: UserResponse | null; // Thêm prop để nhận thông tin user đã đăng nhập
}

export default function ProfileHeader({
  user,
  currentUserData,
}: ProfileHeaderProps) {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLogoutPending, setIsLogoutPending] = useState(false);

  const openLogoutModal = useCallback(() => {
    setIsLogoutModalOpen(true);
  }, []);

  const cancelLogout = useCallback(() => {
    setIsLogoutPending(false);
    setIsLogoutModalOpen(false);
  }, []);

  const confirmLogout = useCallback(async () => {
    if (isLogoutPending) return;

    setIsLogoutPending(true);
    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 900));
      logout();
      queryClient.clear();
      setIsLogoutModalOpen(false);
    } finally {
      setIsLogoutPending(false);
    }
  }, [isLogoutPending, logout, queryClient]);

  console.log("ProfileHeader received user:", user); // Debug: Kiểm tra dữ liệu nhận được từ props
  console.log("ProfileHeader received currentUserData:", currentUserData); // Debug: Kiểm tra dữ liệu user đã đăng nhập

  return (
    <div className={S.card}>
      {/* Cover Photo */}
      <div className={S.coverPhoto}>
        <img src={img} alt="Cover" />
        <div className={S.coverOverlay}></div>
      </div>

      {/* Main Content Area */}
      <div className={S.mainContent}>
        {/* Avatar Setup */}
        <div className={S.topRow}>
          <div className={S.avatarWrapper}>
            <Avatar
              fullName={user.fullName || ""}
              fontSize="31px"
              fontWeight={500}
              width="8rem"
              height="8rem"
              className={S.avatar}
            />
          </div>

          {/* Action Buttons */}
          <div className={S.actions}>
            <button
              type="button"
              className={S.btnChangePassword}
              onClick={() => showComingSoonActionToast("Đổi mật khẩu")}
              aria-label="Đổi mật khẩu"
            >
              <KeyRound size={16} />
              <span>Đổi mật khẩu</span>
            </button>
            <button
              type="button"
              className={S.btnEditProfile}
              onClick={() => showComingSoonActionToast("Chỉnh sửa hồ sơ")}
              aria-label="Chỉnh sửa hồ sơ"
            >
              <Edit3 size={16} />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          </div>
        </div>

        {isPWA ? (
          <div className={S.logoutAction}>
            <button
              type="button"
              className={S.btnLogout}
              onClick={openLogoutModal}
              aria-label="Đăng xuất"
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        ) : null}

        {/* Identity & Details */}
        <div className={S.identitySection}>
          <div className={S.nameRow}>
            <h1 className={S.name}>{user.fullName}</h1>

            <div className={S.badges}>
              {/* Belt Chip */}
              <div className={S.beltChip}>
                <Award size={14} />
                <BeltBadge belt={user.belt} size="md" />
              </div>

              {/* Role Badge */}
              <div className={S.roleBadge}>{user.role}</div>
            </div>
          </div>

          {/* Quick Details Grid */}
          <div className={S.detailsGrid}>
            <div className={S.detailItem}>
              <div className={`${S.detailIcon} ${S.blue}`}>
                <User size={16} />
              </div>
              <span className={S.detailText}>
                {user.gender === true ? "Nam" : "Nữ"}
              </span>
            </div>

            <div className={S.detailItem}>
              <div className={`${S.detailIcon} ${S.rose}`}>
                <Calendar size={16} />
              </div>
              <span className={S.detailText}>
                {formatDateDMY(user.birthDate)}
              </span>
            </div>

            <div className={S.detailItem}>
              <div className={`${S.detailIcon} ${S.emerald}`}>
                <Phone size={16} />
              </div>
              <span className={S.detailText}>
                {currentUserData?.userProfile.phone}{" "}
                {/* Sử dụng số điện thoại từ currentUserData thay vì user */}
              </span>
            </div>

            {"email" in user && user.email && (
              <div className={S.detailItem}>
                <div className={`${S.detailIcon} ${S.purple}`}>
                  <Mail size={16} />
                </div>
                <span className={S.detailText}>{user.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={isLogoutModalOpen}
        title="Bạn có chắc muốn đăng xuất?"
        description="Bạn sẽ kết thúc phiên đăng nhập hiện tại. Bạn có thể đăng nhập lại bất kỳ lúc nào."
        cancelText="Hủy"
        confirmText="Có, đăng xuất"
        loadingText="Đang đăng xuất..."
        isLoading={isLogoutPending}
        linkGoToAfterConfirm="/login"
        successToastMessage="Đăng xuất thành công"
        errorToastMessage="Đăng xuất thất bại. Vui lòng thử lại."
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
