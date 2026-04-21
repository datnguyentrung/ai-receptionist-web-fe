import Avatar from "@/components/Avatar";
import { BeltBadge } from "@/components/BeltBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  type CoachStatus,
  type StudentStatus,
  type UserStatus,
} from "@/config/constants";
import type { CoachDetail, StudentDetail } from "@/types";
import { formatDateDMY, formatDateDMYHM } from "@/utils/format";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CalendarClock,
  CircleUserRound,
  CreditCard,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import "./UserInfomation.scss";

type OutletContextType = {
  data?: StudentDetail | CoachDetail;
};

type FieldItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "blue" | "emerald" | "amber" | "violet";
};

const userStatusLabel: Record<UserStatus, string> = {
  ACTIVE: "Đang hoạt động",
  DEACTIVATED: "Ngừng hoạt động",
  BANNED: "Bị khóa",
  PENDING: "Chờ kích hoạt",
};

const coachStatusLabel: Record<CoachStatus, string> = {
  ACTIVE: "Đang công tác",
  INACTIVE: "Tạm nghỉ",
  SUSPENDED: "Tạm ngưng",
  RETIRED: "Nghỉ hưu",
};

const studentStatusLabel: Record<StudentStatus, string> = {
  ACTIVE: "Đang học",
  RESERVED: "Bảo lưu",
  DROPPED: "Nghỉ học",
};

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Chưa cập nhật";
  }

  return String(value);
}

function formatDateValue(value: string | Date | null | undefined) {
  if (!value) {
    return "Chưa cập nhật";
  }

  return formatDateDMY(value);
}

function formatDateTimeValue(value: string | Date | null | undefined) {
  if (!value) {
    return "Chưa cập nhật";
  }

  return formatDateDMYHM(value);
}

function getStatusVariant(status: UserStatus) {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "PENDING":
      return "secondary";
    case "DEACTIVATED":
    case "BANNED":
      return "destructive";
    default:
      return "outline";
  }
}

function getToneClass(tone: FieldItem["tone"]) {
  return `personal-info__field-icon--${tone}`;
}

function DetailField({ label, value, icon: Icon, tone }: FieldItem) {
  return (
    <div className="personal-info__field">
      <div className={`personal-info__field-icon ${getToneClass(tone)}`}>
        <Icon size={16} />
      </div>
      <div className="personal-info__field-body">
        <p className="personal-info__field-label">{label}</p>
        <p className="personal-info__field-value">{value}</p>
      </div>
    </div>
  );
}

export default function UserInfomation() {
  const context = useOutletContext<OutletContextType>();
  const profile = context?.data;

  if (!profile) {
    return (
      <div className="personal-info">
        <Card className="personal-info__empty-card">
          <CardContent className="personal-info__empty-content">
            <p className="personal-info__empty-title">
              Không có thông tin người dùng.
            </p>
            <p className="personal-info__empty-text">
              Vui lòng kiểm tra lại mã định danh hoặc dữ liệu từ hệ thống.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isStudent = "studentCode" in profile;
  const userRoleLabel = isStudent ? "Học viên" : "Huấn luyện viên";
  const userIdentifier = isStudent ? profile.studentCode : profile.staffCode;
  const enrollments =
    isStudent && Array.isArray(profile.enrollments) ? profile.enrollments : [];
  const currentAssignments =
    !isStudent && Array.isArray(profile.currentAssignments)
      ? profile.currentAssignments
      : [];

  const commonFields: FieldItem[] = [
    {
      label: "Mã người dùng",
      value: profile.userId,
      icon: CreditCard,
      tone: "blue",
    },
    {
      label: "Họ và tên",
      value: profile.fullName,
      icon: User,
      tone: "emerald",
    },
    {
      label: "Vai trò",
      value: formatValue(profile.role),
      icon: BadgeCheck,
      tone: "amber",
    },
    {
      label: "Giới tính",
      value:
        profile.gender === undefined
          ? "Chưa cập nhật"
          : profile.gender
            ? "Nam"
            : "Nữ",
      icon: CircleUserRound,
      tone: "violet",
    },
    {
      label: "Ngày sinh",
      value: formatDateValue(profile.birthDate),
      icon: CalendarClock,
      tone: "blue",
    },
    {
      label: "Số điện thoại",
      value: profile.phoneNumber,
      icon: Phone,
      tone: "emerald",
    },
    { label: "Cấp đai", value: profile.belt, icon: ShieldCheck, tone: "amber" },
    {
      label: "Ngày tạo",
      value: formatDateTimeValue(profile.createdAt),
      icon: Sparkles,
      tone: "violet",
    },
    {
      label: "Cập nhật gần nhất",
      value: formatDateTimeValue(profile.updatedAt),
      icon: CalendarClock,
      tone: "blue",
    },
    {
      label: "Đăng nhập gần nhất",
      value: formatDateTimeValue(profile.lastLogin),
      icon: Landmark,
      tone: "emerald",
    },
  ];

  const detailFields: FieldItem[] = isStudent
    ? [
        {
          label: "Mã học viên",
          value: profile.studentCode,
          icon: Users,
          tone: "blue",
        },
        {
          label: "Mã định danh quốc gia",
          value: formatValue(profile.nationalCode),
          icon: CreditCard,
          tone: "emerald",
        },
        {
          label: "Ngày bắt đầu",
          value: formatDateValue(profile.startDate),
          icon: CalendarClock,
          tone: "amber",
        },
        {
          label: "Trạng thái học viên",
          value: studentStatusLabel[profile.studentStatus],
          icon: BadgeCheck,
          tone: "violet",
        },
        {
          label: "Chi nhánh",
          value: profile.branchName,
          icon: MapPin,
          tone: "blue",
        },
        {
          label: "Địa chỉ chi nhánh",
          value: profile.branchAddress,
          icon: Landmark,
          tone: "emerald",
        },
        {
          label: "Mã chi nhánh",
          value: formatValue(profile.branchId),
          icon: CreditCard,
          tone: "amber",
        },
        {
          label: "Số lớp đã đăng ký",
          value: `${enrollments.length} lớp`,
          icon: Users,
          tone: "violet",
        },
      ]
    : [
        {
          label: "Mã HLV",
          value: profile.staffCode,
          icon: Users,
          tone: "blue",
        },
        {
          label: "Email",
          value: formatValue(profile.email),
          icon: Mail,
          tone: "emerald",
        },
        {
          label: "Trạng thái HLV",
          value: coachStatusLabel[profile.coachStatus],
          icon: BadgeCheck,
          tone: "amber",
        },
        {
          label: "Số phân công hiện tại",
          value: `${currentAssignments.length} lớp`,
          icon: Users,
          tone: "violet",
        },
      ];

  return (
    <div className="personal-info">
      <Card className="personal-info__hero-card">
        <CardContent className="personal-info__hero-content">
          <div className="personal-info__hero-identity">
            <Avatar
              fullName={profile.fullName}
              fontSize="1.25rem"
              fontWeight={700}
              width="5rem"
              height="5rem"
            />
            <div className="personal-info__hero-copy">
              <div className="personal-info__hero-headline">
                <h3 className="personal-info__hero-name">{profile.fullName}</h3>
                <Badge
                  variant={getStatusVariant(profile.status)}
                  className="personal-info__status-badge"
                >
                  {userStatusLabel[profile.status]}
                </Badge>
              </div>
              <div className="personal-info__hero-meta">
                <span className="personal-info__hero-role">
                  {userRoleLabel}
                </span>
                <span className="personal-info__hero-divider" />
                <span className="personal-info__hero-code">
                  {userIdentifier}
                </span>
              </div>
              <div className="personal-info__hero-tags">
                <BeltBadge belt={profile.belt} />
                <Badge variant="outline" className="personal-info__count-badge">
                  {isStudent
                    ? `${enrollments.length} lớp đăng ký`
                    : `${currentAssignments.length} lớp phân công`}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="personal-info__summary-grid">
        <Card className="personal-info__summary-card">
          <CardContent className="personal-info__summary-content">
            <div className="personal-info__summary-label">Vai trò</div>
            <div className="personal-info__summary-value">{userRoleLabel}</div>
          </CardContent>
        </Card>
        <Card className="personal-info__summary-card">
          <CardContent className="personal-info__summary-content">
            <div className="personal-info__summary-label">Trạng thái</div>
            <div className="personal-info__summary-value">
              {userStatusLabel[profile.status]}
            </div>
          </CardContent>
        </Card>
        <Card className="personal-info__summary-card">
          <CardContent className="personal-info__summary-content">
            <div className="personal-info__summary-label">Liên hệ</div>
            <div className="personal-info__summary-value">
              {formatValue(profile.phoneNumber)}
            </div>
          </CardContent>
        </Card>
        <Card className="personal-info__summary-card">
          <CardContent className="personal-info__summary-content">
            <div className="personal-info__summary-label">
              Đăng nhập gần nhất
            </div>
            <div className="personal-info__summary-value">
              {formatDateTimeValue(profile.lastLogin)}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="personal-info__section">
        <div className="personal-info__section-heading">
          <h4 className="personal-info__section-title">Thông tin chung</h4>
          <p className="personal-info__section-description">
            Toàn bộ dữ liệu hồ sơ và tài khoản đang được sử dụng.
          </p>
        </div>
        <div className="personal-info__grid">
          {commonFields.map((field) => (
            <Card key={field.label} className="personal-info__field-card">
              <CardContent className="personal-info__field-content">
                <DetailField {...field} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="personal-info__section">
        <div className="personal-info__section-heading">
          <h4 className="personal-info__section-title">
            {isStudent ? "Thông tin học viên" : "Thông tin huấn luyện viên"}
          </h4>
          <p className="personal-info__section-description">
            Các trường nghiệp vụ đặc thù cho loại hồ sơ này.
          </p>
        </div>
        <div className="personal-info__grid personal-info__grid--compact">
          {detailFields.map((field) => (
            <Card key={field.label} className="personal-info__field-card">
              <CardContent className="personal-info__field-content">
                <DetailField {...field} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
