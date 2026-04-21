import {
  ScheduleLevelLabel,
  ScheduleLocationLabel,
  ScheduleShiftLabel,
  WeekdayCodeToLabel,
} from "@/config/constants";
import type { CoachAssignmentResponse } from "@/types";
import { CalendarDays, Clock3, MapPin, Trash2 } from "lucide-react";
import "./CoachAssignmentList.scss";

type CoachAssignmentListProps = {
  assignments: CoachAssignmentResponse[];
  isLoading: boolean;
  deletingAssignmentIds: Set<string>;
  onDeleteAssignment: (assignment: CoachAssignmentResponse) => void;
};

function formatWeekday(weekday: number) {
  return WeekdayCodeToLabel[weekday] ?? `Thứ ${weekday}`;
}

export default function CoachAssignmentList({
  assignments,
  isLoading,
  deletingAssignmentIds,
  onDeleteAssignment,
}: CoachAssignmentListProps) {
  return (
    <section className="coach-assignment-list">
      <div className="coach-assignment-list__header">
        <h3 className="coach-assignment-list__title">🥋 Lịch dạy hiện tại</h3>
        <p className="coach-assignment-list__subtitle">
          {assignments.length} lớp đang được phân công
        </p>
      </div>

      {isLoading ? (
        <div className="coach-assignment-list__state">
          Đang tải danh sách lớp dạy...
        </div>
      ) : assignments.length === 0 ? (
        <div className="coach-assignment-list__state">
          Hiện chưa có lớp dạy nào ở trạng thái hoạt động.
        </div>
      ) : (
        <div className="coach-assignment-list__grid">
          {assignments.map((assignment) => {
            const schedule = assignment.classSchedule;
            const isDeleting = deletingAssignmentIds.has(
              assignment.assignmentId,
            );

            return (
              <article
                key={assignment.assignmentId}
                className="coach-assignment-list__card"
              >
                <div className="coach-assignment-list__card-head">
                  <h4 className="coach-assignment-list__schedule-id">
                    {schedule.scheduleId}
                  </h4>
                  <button
                    type="button"
                    className="coach-assignment-list__remove-btn"
                    onClick={() => onDeleteAssignment(assignment)}
                    disabled={isDeleting}
                  >
                    <Trash2 size={14} />
                    {isDeleting ? "Đang xóa..." : "Xóa lớp"}
                  </button>
                </div>

                <div className="coach-assignment-list__meta-grid">
                  <p>
                    <CalendarDays size={13} /> {formatWeekday(schedule.weekday)}
                  </p>
                  <p>
                    <Clock3 size={13} /> {schedule.startTime} -{" "}
                    {schedule.endTime}
                  </p>
                  <p>
                    <MapPin size={13} /> {schedule.branchName}
                  </p>
                  <p>{ScheduleLevelLabel[schedule.scheduleLevel]}</p>
                  <p>{ScheduleLocationLabel[schedule.scheduleLocation]}</p>
                  <p>{ScheduleShiftLabel[schedule.scheduleShift]}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
