import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import {
  BeltLabel,
  type Belt,
  type CoachStatus,
  type StudentStatus,
  type UserStatus,
} from "@/config/constants";
import { coachAPI } from "@/features/coach/api/coachAPI";
import { studentAPI } from "@/features/student/api/studentAPI";
import { usePlainMutation } from "@/hooks/useCrud";
import { useQueryClient } from "@tanstack/react-query";
import type { CoachDetail, CoachUpdateRequest, StudentDetail, StudentUpdateRequest } from "@/types";
import { formatDateDMY, formatDateDMYHM } from "@/utils/format";
import { useRoleStudent } from "@/utils/roleUtils";
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
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import "./UserInfomation.scss";

type OutletContextType = {
  data?: StudentDetail | CoachDetail;
};

type FieldItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "red" | "rose" | "wine" | "neutral";
};

type StudentFormState = {
  fullName: string;
  phoneNumber: string;
  birthDate: string;
  belt: Belt;
  nationalCode: string;
  startDate: string;
  studentStatus: StudentStatus;
};

type CoachFormState = {
  fullName: string;
  phoneNumber: string;
  birthDate: string;
  belt: Belt;
  coachStatus: CoachStatus;
};

const BELT_OPTIONS = Object.keys(BeltLabel) as Belt[];

const coachStatusOptions: Array<{ value: CoachStatus; label: string }> = [
  { value: "ACTIVE", label: "Đang công tác" },
  { value: "INACTIVE", label: "Tạm nghỉ" },
  { value: "SUSPENDED", label: "Tạm ngưng" },
  { value: "RETIRED", label: "Nghỉ hưu" },
];

const studentStatusOptions: Array<{ value: StudentStatus; label: string }> = [
  { value: "ACTIVE", label: "Đang học" },
  { value: "RESERVED", label: "Bảo lưu" },
  { value: "DROPPED", label: "Nghỉ học" },
];

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

function getToneClass(tone: FieldItem["tone"]) {
  return `personal-info__field-icon--${tone}`;
}

function toDateInputValue(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidPhone(phone: string) {
  return /^\d{9,11}$/.test(phone.trim());
}

function createStudentForm(profile: StudentDetail): StudentFormState {
  return {
    fullName: profile.fullName,
    phoneNumber: profile.phoneNumber,
    birthDate: toDateInputValue(profile.birthDate),
    belt: profile.belt,
    nationalCode: profile.nationalCode ?? "",
    startDate: toDateInputValue(profile.startDate),
    studentStatus: profile.studentStatus,
  };
}

function createCoachForm(profile: CoachDetail): CoachFormState {
  return {
    fullName: profile.fullName,
    phoneNumber: profile.phoneNumber,
    birthDate: toDateInputValue(profile.birthDate),
    belt: profile.belt,
    coachStatus: profile.coachStatus,
  };
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
  const { canViewHeadCoach, canViewManagerSenior } = useRoleStudent();
  const context = useOutletContext<OutletContextType>();
  const profile = context?.data;
  const queryClient = useQueryClient();
  const updateStudentMutation = usePlainMutation<
    StudentDetail,
    { id: number; studentCode?: string; data: StudentUpdateRequest }
  >(({ id, data }) => studentAPI.updateStudent(id, data), {
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      if (variables.studentCode) {
        queryClient.invalidateQueries({ queryKey: ["students", variables.studentCode] });
      }
    },
  });
  const updateCoachMutation = usePlainMutation<
    CoachDetail,
    { id: number; staffCode?: string; data: CoachUpdateRequest }
  >(({ id, data }) => coachAPI.updateCoach(id, data), {
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      if (variables.staffCode) {
        queryClient.invalidateQueries({ queryKey: ["coaches", variables.staffCode] });
      }
    },
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentForm, setStudentForm] = useState<StudentFormState | null>(null);
  const [coachForm, setCoachForm] = useState<CoachFormState | null>(null);

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

  const studentProfile = "studentCode" in profile ? profile : null;
  const coachProfile = "staffCode" in profile ? profile : null;
  const isStudent = !!studentProfile;
  const userRoleLabel = isStudent ? "Học viên" : "Huấn luyện viên";
  const canUpdateProfile = studentProfile
    ? studentProfile.studentCode.includes("VQ_") && canViewManagerSenior
    : (coachProfile?.staffCode.includes("VQT") ?? false) && canViewHeadCoach;
  const isSubmitting =
    updateStudentMutation.isPending || updateCoachMutation.isPending;

  const enrollments = studentProfile?.enrollments ?? [];
  const currentAssignments = coachProfile?.currentAssignments ?? [];

  const commonFields: FieldItem[] = [
    {
      label: "Mã người dùng",
      value: profile.userId,
      icon: CreditCard,
      tone: "red",
    },
    {
      label: "Họ và tên",
      value: profile.fullName,
      icon: User,
      tone: "rose",
    },
    {
      label: "Vai trò",
      value: formatValue(profile.role),
      icon: BadgeCheck,
      tone: "wine",
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
      tone: "neutral",
    },
    {
      label: "Ngày sinh",
      value: formatDateValue(profile.birthDate),
      icon: CalendarClock,
      tone: "red",
    },
    {
      label: "Số điện thoại",
      value: profile.phoneNumber,
      icon: Phone,
      tone: "rose",
    },
    {
      label: "Cấp đai",
      value: BeltLabel[profile.belt],
      icon: ShieldCheck,
      tone: "wine",
    },
    {
      label: "Ngày tạo",
      value: formatDateTimeValue(profile.createdAt),
      icon: Sparkles,
      tone: "neutral",
    },
    {
      label: "Cập nhật gần nhất",
      value: formatDateTimeValue(profile.updatedAt),
      icon: CalendarClock,
      tone: "red",
    },
    {
      label: "Đăng nhập gần nhất",
      value: formatDateTimeValue(profile.lastLogin),
      icon: Landmark,
      tone: "rose",
    },
  ];

  const detailFields: FieldItem[] = studentProfile
    ? [
        {
          label: "Mã học viên",
          value: studentProfile.studentCode,
          icon: Users,
          tone: "red",
        },
        {
          label: "Mã định danh quốc gia",
          value: formatValue(studentProfile.nationalCode),
          icon: CreditCard,
          tone: "rose",
        },
        {
          label: "Ngày bắt đầu",
          value: formatDateValue(studentProfile.startDate),
          icon: CalendarClock,
          tone: "wine",
        },
        {
          label: "Trạng thái học viên",
          value: studentStatusLabel[studentProfile.studentStatus],
          icon: BadgeCheck,
          tone: "neutral",
        },
        {
          label: "Chi nhánh",
          value: studentProfile.branchName,
          icon: MapPin,
          tone: "red",
        },
        {
          label: "Địa chỉ chi nhánh",
          value: studentProfile.branchAddress,
          icon: Landmark,
          tone: "rose",
        },
        {
          label: "Mã chi nhánh",
          value: formatValue(studentProfile.branchId),
          icon: CreditCard,
          tone: "wine",
        },
        {
          label: "Số lớp đã đăng ký",
          value: `${enrollments.length} lớp`,
          icon: Users,
          tone: "neutral",
        },
      ]
    : [
        {
          label: "Mã HLV",
          value: coachProfile?.staffCode ?? "Chưa cập nhật",
          icon: Users,
          tone: "red",
        },
        {
          label: "Email",
          value: formatValue(coachProfile?.email),
          icon: Mail,
          tone: "rose",
        },
        {
          label: "Trạng thái HLV",
          value: coachProfile
            ? coachStatusLabel[coachProfile.coachStatus]
            : "Chưa cập nhật",
          icon: BadgeCheck,
          tone: "wine",
        },
        {
          label: "Số phân công hiện tại",
          value: `${currentAssignments.length} lớp`,
          icon: Users,
          tone: "neutral",
        },
      ];

  const groupedCommonFields = [commonFields.slice(0, 5), commonFields.slice(5)];

  const handleStudentFieldChange = <K extends keyof StudentFormState>(
    key: K,
    value: StudentFormState[K],
  ) => {
    setStudentForm((previous) =>
      previous
        ? {
            ...previous,
            [key]: value,
          }
        : previous,
    );
  };

  const handleCoachFieldChange = <K extends keyof CoachFormState>(
    key: K,
    value: CoachFormState[K],
  ) => {
    setCoachForm((previous) =>
      previous
        ? {
            ...previous,
            [key]: value,
          }
        : previous,
    );
  };

  const onEnterEdit = () => {
    if (!canUpdateProfile) {
      showErrorToast("Bạn không có quyền cập nhật hồ sơ này.");
      return;
    }

    if (studentProfile) {
      setStudentForm(createStudentForm(studentProfile));
      setCoachForm(null);
    }

    if (coachProfile) {
      setCoachForm(createCoachForm(coachProfile));
      setStudentForm(null);
    }

    setIsEditMode(true);
  };

  const onCancelEdit = () => {
    setIsEditMode(false);
    setStudentForm(null);
    setCoachForm(null);
  };

  const onSubmitUpdate = async () => {
    if (!canUpdateProfile) {
      showErrorToast("Bạn không có quyền cập nhật hồ sơ này.");
      return;
    }

    const numericUserId = Number(profile.userId);
    if (!Number.isFinite(numericUserId)) {
      showErrorToast("Không thể cập nhật do mã người dùng không hợp lệ.");
      return;
    }

    try {
      if (studentProfile && studentForm) {
        if (!studentForm.fullName.trim()) {
          showErrorToast("Vui lòng nhập họ và tên học viên.");
          return;
        }

        if (!isValidPhone(studentForm.phoneNumber)) {
          showErrorToast(
            "Số điện thoại không hợp lệ. Chỉ cho phép 9-11 chữ số.",
          );
          return;
        }

        if (!studentForm.birthDate || !studentForm.startDate) {
          showErrorToast("Vui lòng chọn đầy đủ ngày sinh và ngày bắt đầu.");
          return;
        }

        await updateStudentMutation.mutateAsync({
          id: numericUserId,
          studentCode: studentProfile.studentCode,
          data: {
            userId: profile.userId,
            fullName: studentForm.fullName.trim(),
            phoneNumber: studentForm.phoneNumber.trim(),
            birthDate: studentForm.birthDate,
            belt: studentForm.belt,
            nationalCode: studentForm.nationalCode.trim() || undefined,
            startDate: studentForm.startDate,
            studentStatus: studentForm.studentStatus,
          },
        });
      }

      if (coachProfile && coachForm) {
        if (!coachForm.fullName.trim()) {
          showErrorToast("Vui lòng nhập họ và tên huấn luyện viên.");
          return;
        }

        if (!isValidPhone(coachForm.phoneNumber)) {
          showErrorToast(
            "Số điện thoại không hợp lệ. Chỉ cho phép 9-11 chữ số.",
          );
          return;
        }

        if (!coachForm.birthDate) {
          showErrorToast("Vui lòng chọn ngày sinh.");
          return;
        }

        await updateCoachMutation.mutateAsync({
          id: numericUserId,
          staffCode: coachProfile.staffCode,
          data: {
            userId: profile.userId,
            fullName: coachForm.fullName.trim(),
            phoneNumber: coachForm.phoneNumber.trim(),
            birthDate: coachForm.birthDate,
            belt: coachForm.belt,
            coachStatus: coachForm.coachStatus,
          },
        });
      }

      showSuccessToast("Cập nhật thông tin thành công.");
      onCancelEdit();
    } catch {
      showErrorToast("Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };

  return (
    <div className="personal-info">
      <Card className="personal-info__hero-card">
        <CardContent className="personal-info__hero-content">
          {/* <div className="personal-info__hero-identity">
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
                  {userStatusLabel[profile.status] ?? "Chưa cập nhật"}
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
          </div> */}

          <div className="personal-info__hero-actions">
            {canUpdateProfile ? (
              isEditMode ? (
                <>
                  <Button
                    variant="outline"
                    className="personal-info__action-button personal-info__action-button--cancel"
                    onClick={onCancelEdit}
                    disabled={isSubmitting}
                  >
                    Hủy chỉnh sửa
                  </Button>
                  <Button
                    className="personal-info__action-button personal-info__action-button--save"
                    onClick={onSubmitUpdate}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
                  </Button>
                </>
              ) : (
                <Button
                  className="personal-info__action-button personal-info__action-button--edit"
                  onClick={onEnterEdit}
                >
                  Cập nhật thông tin
                </Button>
              )
            ) : (
              <p className="personal-info__permission-note">
                {studentProfile
                  ? 'Hồ sơ học viên mã chứa "VQ_" cần quyền Quản Lý Cấp Cao để cập nhật.'
                  : 'Hồ sơ huấn luyện viên mã chứa "VQT" cần quyền Huấn Luyện Viên Trưởng để cập nhật.'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {isEditMode ? (
        <section className="personal-info__section">
          <div className="personal-info__section-heading">
            <h4 className="personal-info__section-title">Chế độ cập nhật</h4>
            <p className="personal-info__section-description">
              Chỉnh sửa thông tin cốt lõi và lưu trực tiếp vào hệ thống.
            </p>
          </div>

          {studentProfile && studentForm ? (
            <div className="personal-info__form-grid">
              <label className="personal-info__form-field">
                <span>Họ và tên</span>
                <Input
                  value={studentForm.fullName}
                  onChange={(event) =>
                    handleStudentFieldChange("fullName", event.target.value)
                  }
                  placeholder="Nhập họ và tên"
                />
              </label>

              <label className="personal-info__form-field">
                <span>Số điện thoại</span>
                <Input
                  value={studentForm.phoneNumber}
                  onChange={(event) =>
                    handleStudentFieldChange("phoneNumber", event.target.value)
                  }
                  placeholder="Ví dụ: 0912345678"
                />
              </label>

              <label className="personal-info__form-field">
                <span>Ngày sinh</span>
                <Input
                  type="date"
                  value={studentForm.birthDate}
                  onChange={(event) =>
                    handleStudentFieldChange("birthDate", event.target.value)
                  }
                />
              </label>

              <label className="personal-info__form-field">
                <span>Cấp đai</span>
                <Select
                  value={studentForm.belt}
                  onValueChange={(value) =>
                    handleStudentFieldChange("belt", value as Belt)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp đai" />
                  </SelectTrigger>
                  <SelectContent>
                    {BELT_OPTIONS.map((belt) => (
                      <SelectItem key={belt} value={belt}>
                        {BeltLabel[belt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="personal-info__form-field">
                <span>Mã định danh quốc gia</span>
                <Input
                  value={studentForm.nationalCode}
                  onChange={(event) =>
                    handleStudentFieldChange("nationalCode", event.target.value)
                  }
                  placeholder="Tùy chọn"
                />
              </label>

              <label className="personal-info__form-field">
                <span>Ngày bắt đầu</span>
                <Input
                  type="date"
                  value={studentForm.startDate}
                  onChange={(event) =>
                    handleStudentFieldChange("startDate", event.target.value)
                  }
                />
              </label>

              <label className="personal-info__form-field personal-info__form-field--full">
                <span>Trạng thái học viên</span>
                <Select
                  value={studentForm.studentStatus}
                  onValueChange={(value) =>
                    handleStudentFieldChange(
                      "studentStatus",
                      value as StudentStatus,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentStatusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          ) : null}

          {coachProfile && coachForm ? (
            <div className="personal-info__form-grid">
              <label className="personal-info__form-field">
                <span>Họ và tên</span>
                <Input
                  value={coachForm.fullName}
                  onChange={(event) =>
                    handleCoachFieldChange("fullName", event.target.value)
                  }
                  placeholder="Nhập họ và tên"
                />
              </label>

              <label className="personal-info__form-field">
                <span>Số điện thoại</span>
                <Input
                  value={coachForm.phoneNumber}
                  onChange={(event) =>
                    handleCoachFieldChange("phoneNumber", event.target.value)
                  }
                  placeholder="Ví dụ: 0912345678"
                />
              </label>

              <label className="personal-info__form-field">
                <span>Ngày sinh</span>
                <Input
                  type="date"
                  value={coachForm.birthDate}
                  onChange={(event) =>
                    handleCoachFieldChange("birthDate", event.target.value)
                  }
                />
              </label>

              <label className="personal-info__form-field">
                <span>Cấp đai</span>
                <Select
                  value={coachForm.belt}
                  onValueChange={(value) =>
                    handleCoachFieldChange("belt", value as Belt)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp đai" />
                  </SelectTrigger>
                  <SelectContent>
                    {BELT_OPTIONS.map((belt) => (
                      <SelectItem key={belt} value={belt}>
                        {BeltLabel[belt]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              <label className="personal-info__form-field personal-info__form-field--full">
                <span>Trạng thái huấn luyện viên</span>
                <Select
                  value={coachForm.coachStatus}
                  onValueChange={(value) =>
                    handleCoachFieldChange("coachStatus", value as CoachStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {coachStatusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>
          ) : null}
        </section>
      ) : null}

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
              {userStatusLabel[profile.status] ?? "Chưa cập nhật"}
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
        <div className="personal-info__panel-grid">
          {groupedCommonFields.map((group, groupIndex) => (
            <div
              key={`common-group-${groupIndex}`}
              className="personal-info__panel"
            >
              {group.map((field) => (
                <div key={field.label} className="personal-info__panel-row">
                  <DetailField {...field} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="personal-info__section">
        <div className="personal-info__section-heading">
          <h4 className="personal-info__section-title">
            {studentProfile
              ? "Thông tin học viên"
              : "Thông tin huấn luyện viên"}
          </h4>
          <p className="personal-info__section-description">
            Các trường nghiệp vụ đặc thù cho loại hồ sơ này.
          </p>
        </div>
        <div className="personal-info__grid personal-info__grid--compact">
          {detailFields.map((field) => (
            <div key={field.label} className="personal-info__detail-item">
              <DetailField {...field} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
