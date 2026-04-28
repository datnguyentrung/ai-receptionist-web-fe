import img from "@/assets/taekwondo.jpg";
import Avatar from "@/components/Avatar";
import type { CoachDetail, StudentDetail, UserResponse } from "@/types";
import { formatDateDMY } from "@/utils/format";
import {
  Award,
  Calendar,
  Edit3,
  KeyRound,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { BeltBadge } from "../../../../components/BeltBadge";
import { showComingSoonActionToast } from "../../../../components/ui/mini-action-popover.toast";
import S from "./ProfileHeader.module.scss";

interface ProfileHeaderProps {
  user: StudentDetail | CoachDetail;
  currentUserData: UserResponse | null; // Thêm prop để nhận thông tin user đã đăng nhập
}

export default function ProfileHeader({
  user,
  currentUserData,
}: ProfileHeaderProps) {
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
              className={S.btnChangePassword}
              onClick={() => showComingSoonActionToast("Đổi mật khẩu")}
            >
              <KeyRound size={16} />
              <span>Đổi mật khẩu</span>
            </button>
            <button
              className={S.btnEditProfile}
              onClick={() => showComingSoonActionToast("Chỉnh sửa hồ sơ")}
            >
              <Edit3 size={16} />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          </div>
        </div>

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
    </div>
  );
}
