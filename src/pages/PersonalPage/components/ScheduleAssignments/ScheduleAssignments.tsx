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
import { Skeleton } from "boneyard-js/react";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, Clock, Landmark, MapPinned, Route } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import PersonalPageSkeleton from "../../PersonalPageSkeleton/PersonalPageSkeleton";
import type { OutletContextType } from "../TabViews/TabViews";
import "./ScheduleAssignments.scss";

type TimelineRecord =
  | StudentEnrollmentSimpleResponse
  | CoachAssignmentSimpleResponse;

type InfoRowProps = {
  icon: LucideIcon;
  label: string;
  value: string;
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

function getScheduleSummary(record: TimelineRecord) {
  return "classScheduleSummary" in record
    ? record.classScheduleSummary
    : record.classSchedule;
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

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="schedule-assignments__info-row">
      <Icon size={14} className="schedule-assignments__info-icon" />
      <span className="schedule-assignments__info-label">{label}</span>
      <span className="schedule-assignments__info-value">{value}</span>
    </div>
  );
}

export default function ScheduleAssignments() {
  const context = useOutletContext<OutletContextType>();
  const profile = context?.user;

  if (!profile) {
    return (
      <Skeleton
        loading
        name="schedule-assignments"
        fallback={<PersonalPageSkeleton variant="tab" />}
      >
        <div />
      </Skeleton>
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
                        {summary.scheduleId}
                      </h4>
                      <p className="schedule-assignments__item-subtitle">
                        {ScheduleLevelLabel[summary.scheduleLevel]}
                      </p>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(record.status)}
                      className="schedule-assignments__status-badge"
                    >
                      {getStatusLabel(record.status)}
                    </Badge>
                  </div>

                  <div className="schedule-assignments__info-grid">
                    <InfoRow
                      icon={Landmark}
                      label="Chi nhánh"
                      value={summary.branchName}
                    />
                    <InfoRow
                      icon={MapPinned}
                      label="Địa điểm"
                      value={ScheduleLocationLabel[summary.scheduleLocation]}
                    />
                    <InfoRow
                      icon={Route}
                      label="Ca học"
                      value={ScheduleShiftLabel[summary.scheduleShift]}
                    />
                    <InfoRow
                      icon={CalendarDays}
                      label="Thứ"
                      value={formatScheduleWeekday(summary.weekday)}
                    />
                    <InfoRow
                      icon={Clock}
                      label="Thời gian"
                      value={`${summary.startTime} - ${summary.endTime}`}
                    />
                    <InfoRow
                      icon={CalendarDays}
                      label={getRecordDateLabel(record)}
                      value={formatDateDMY(recordDate)}
                    />
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
