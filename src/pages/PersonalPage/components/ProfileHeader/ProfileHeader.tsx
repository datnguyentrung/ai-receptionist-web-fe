import {
  Award,
  Calendar,
  Edit3,
  KeyRound,
  Mail,
  Phone,
  User,
} from "lucide-react";
import S from "./ProfileHeader.module.scss";

interface ProfileHeaderProps {
  user: {
    fullName: string;
    belt: string;
    role: string;
    gender: string;
    birthDate: string;
    phone: string;
    email: string;
    avatarUrl: string;
    coverUrl: string;
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className={S.card}>
      {/* Cover Photo */}
      <div className={S.coverPhoto}>
        <img
          src={user.coverUrl}
          alt="Cover"
        />
        <div className={S.coverOverlay}></div>
      </div>

      {/* Main Content Area */}
      <div className={S.mainContent}>
        {/* Avatar Setup */}
        <div className={S.topRow}>
          <div className={S.avatarWrapper}>
            <div className={S.avatar}>
              <img
                src={user.avatarUrl}
                alt={user.fullName}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={S.actions}>
            <button className={S.btnChangePassword}>
              <KeyRound size={16} />
              <span>Change Password</span>
            </button>
            <button className={S.btnEditProfile}>
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Identity & Details */}
        <div className={S.identitySection}>
          <div className={S.nameRow}>
            <h1 className={S.name}>
              {user.fullName}
            </h1>

            <div className={S.badges}>
              {/* Belt Chip */}
              <div className={S.beltChip}>
                <Award size={14} />
                {user.belt}
              </div>

              {/* Role Badge */}
              <div className={S.roleBadge}>
                {user.role}
              </div>
            </div>
          </div>

          {/* Quick Details Grid */}
          <div className={S.detailsGrid}>
            <div className={S.detailItem}>
              <div className={`${S.detailIcon} ${S.blue}`}>
                <User size={16} />
              </div>
              <span className={S.detailText}>
                {user.gender}
              </span>
            </div>

            <div className={S.detailItem}>
              <div className={`${S.detailIcon} ${S.rose}`}>
                <Calendar size={16} />
              </div>
              <span className={S.detailText}>
                {user.birthDate}
              </span>
            </div>

            <div className={S.detailItem}>
              <div className={`${S.detailIcon} ${S.emerald}`}>
                <Phone size={16} />
              </div>
              <span className={S.detailText}>
                {user.phone}
              </span>
            </div>

            <div className={S.detailItem}>
              <div className={`${S.detailIcon} ${S.purple}`}>
                <Mail size={16} />
              </div>
              <span className={S.detailText}>
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
