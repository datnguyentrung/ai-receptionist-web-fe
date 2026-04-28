import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CoachAssignmentStatusLabel,
  ScheduleLevelLabel,
  ScheduleLocationLabel,
  ScheduleShiftLabel,
  WeekdayCodeToLabel,
  type CoachAssignmentStatus,
  type StudentEnrollmentStatus,
} from "@/config/constants";
import type {
  CoachAssignmentSimpleResponse,
  CoachDetail,
  StudentDetail,
  StudentEnrollmentSimpleResponse,
} from "@/types";
import { formatDateDMY } from "@/utils/format";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Clock,
  CreditCard,
  Landmark,
  MapPinned,
  Route,
  School2,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import "./ScheduleAssignments.scss";
import type { OutletContextType } from "../TabViews/TabViews";

type TimelineRecord =
  | StudentEnrollmentSimpleResponse
  | CoachAssignmentSimpleResponse;

type MetaItemProps = {
  label: string;
  value: string;
  icon: LucideIcon;
};

const enrollmentStatusLabel: Record<StudentEnrollmentStatus, string> = {
  ACTIVE: "Đang học",
  RESERVED: "Bảo lưu",
  TRANSFERRED: "Chuyển lớp",
  DROPPED: "Nghỉ học",
};

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "RESERVED":
    case "TRANSFERRED":
    case "PENDING":
    case "SUSPENDED":
      return "secondary";
    case "DROPPED":
    case "TERMINATED":
      return "destructive";
    case "COMPLETED":
      return "outline";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string) {
  if (status in enrollmentStatusLabel) {
    return enrollmentStatusLabel[status as StudentEnrollmentStatus];
  }

  if (status in CoachAssignmentStatusLabel) {
    return CoachAssignmentStatusLabel[status as CoachAssignmentStatus];
  }

  return status;
}

function formatScheduleWeekday(weekday: number) {
  return WeekdayCodeToLabel[weekday] ?? `Thứ ${weekday}`;
}

function getRecordTitle(record: TimelineRecord) {
  return "classScheduleSummary" in record
    ? record.classScheduleSummary.scheduleId
    : record.classSchedule.scheduleId;
}

function getScheduleSummary(record: TimelineRecord) {
  return "classScheduleSummary" in record
    ? record.classScheduleSummary
    : record.classSchedule;
}

function getPrimaryParty(record: TimelineRecord) {
  return "studentSummary" in record ? record.studentSummary : record.coach;
}

function getRecordDate(record: TimelineRecord) {
  return "joinDate" in record ? record.joinDate : record.assignedDate;
}

function getRecordDateLabel(record: TimelineRecord) {
  return "joinDate" in record ? "Ngày tham gia" : "Ngày phân công";
}

function getRecordLabel(profile: StudentDetail | CoachDetail) {
  return "enrollments" in profile ? "lớp đăng ký" : "lớp phân công";
}

function getIdentifier(record: TimelineRecord) {
  return "studentSummary" in record
    ? record.studentSummary.code
    : record.coach.staffCode;
}

function MetaItem({ label, value, icon: Icon }: MetaItemProps) {
  return (
    <div className="schedule-assignments__meta-item">
      <div className="schedule-assignments__meta-icon">
        <Icon size={15} />
      </div>
      <div className="schedule-assignments__meta-copy">
        <p className="schedule-assignments__meta-label">{label}</p>
        <p className="schedule-assignments__meta-value">{value}</p>
      </div>
    </div>
  );
}

export default function ScheduleAssignments() {
  const context = useOutletContext<OutletContextType>();
  const profile = context?.user;

  if (!profile) {
    return (
      <div className="schedule-assignments">
        <Card className="schedule-assignments__empty-card">
          <CardContent className="schedule-assignments__empty-content">
            <p className="schedule-assignments__empty-title">
              Không có dữ liệu lớp học.
            </p>
            <p className="schedule-assignments__empty-text">
              Hồ sơ người dùng chưa sẵn sàng hoặc chưa được tải về từ hệ thống.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const records =
    "enrollments" in profile
      ? Array.isArray(profile.enrollments)
        ? profile.enrollments
        : []
      : Array.isArray(profile.currentAssignments)
        ? profile.currentAssignments
        : [];
  const title =
    "enrollments" in profile
      ? "Danh sách lớp đăng ký"
      : "Danh sách lớp được phân công";
  const subtitle =
    "enrollments" in profile
      ? "Các lớp mà học viên hiện đang theo học hoặc đã từng ghi danh."
      : "Các lớp mà huấn luyện viên đang phụ trách hoặc đã được phân công.";

  return (
    <div className="schedule-assignments">
      <Card className="schedule-assignments__hero-card">
        <CardContent className="schedule-assignments__hero-content">
          <div className="schedule-assignments__hero-top">
            <div className="schedule-assignments__hero-copy">
              <p className="schedule-assignments__eyebrow">Lịch học cá nhân</p>
              <h3 className="schedule-assignments__title">{title}</h3>
              <p className="schedule-assignments__subtitle">{subtitle}</p>
            </div>
            <Badge
              variant="outline"
              className="schedule-assignments__count-badge"
            >
              {records.length} {getRecordLabel(profile)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <section className="schedule-assignments__list">
        {records.length === 0 ? (
          <Card className="schedule-assignments__empty-state-card">
            <CardContent className="schedule-assignments__empty-state-content">
              Chưa có dữ liệu {getRecordLabel(profile)}.
            </CardContent>
          </Card>
        ) : (
          records.map((record) => {
            const summary = getScheduleSummary(record);
            const party = getPrimaryParty(record);
            const recordDate = getRecordDate(record);

            const recordKey =
              "enrollmentId" in record
                ? record.enrollmentId
                : record.assignmentId;

            return (
              <Card key={recordKey} className="schedule-assignments__item-card">
                <CardContent className="schedule-assignments__item-content">
                  <div className="schedule-assignments__item-head">
                    <div className="schedule-assignments__item-heading">
                      <h4 className="schedule-assignments__item-title">
                        Mã lớp học: {getRecordTitle(record)}
                      </h4>
                      <p className="schedule-assignments__item-subtitle">
                        {party.fullName} · {getIdentifier(record)}
                      </p>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(record.status)}
                      className="schedule-assignments__status-badge"
                    >
                      {getStatusLabel(record.status)}
                    </Badge>
                  </div>

                  <div className="schedule-assignments__meta-grid">
                    <MetaItem
                      label={getRecordDateLabel(record)}
                      value={formatDateDMY(recordDate)}
                      icon={Clock}
                    />
                    <MetaItem
                      label="Chi nhánh"
                      value={summary.branchName}
                      icon={Landmark}
                    />
                    <MetaItem
                      label="Cấp độ lớp"
                      value={ScheduleLevelLabel[summary.scheduleLevel]}
                      icon={School2}
                    />
                    <MetaItem
                      label="Địa điểm"
                      value={ScheduleLocationLabel[summary.scheduleLocation]}
                      icon={MapPinned}
                    />
                    <MetaItem
                      label="Ca học"
                      value={ScheduleShiftLabel[summary.scheduleShift]}
                      icon={Route}
                    />
                    <MetaItem
                      label="Thứ"
                      value={formatScheduleWeekday(summary.weekday)}
                      icon={CalendarDays}
                    />
                    <MetaItem
                      label="Thời gian"
                      value={`${summary.startTime} - ${summary.endTime}`}
                      icon={Clock}
                    />
                    <MetaItem
                      label="Mã lịch học"
                      value={summary.scheduleId}
                      icon={CreditCard}
                    />
                  </div>

                  <div className="schedule-assignments__footer-note">
                    <p className="schedule-assignments__footer-label">
                      Thông tin học viên
                    </p>
                    <p className="schedule-assignments__footer-value">
                      {party.fullName} · {getIdentifier(record)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}
