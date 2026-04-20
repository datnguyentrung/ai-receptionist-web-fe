import { AssignmentSubjectHero } from "@/components/AssignmentSubjectHero/AssignmentSubjectHero";
import { StudentScheduleSection } from "@/components/StudentScheduleSection/StudentScheduleSection";
import { showErrorToast, showInfoToast } from "@/components/ui/toast";
import { useGetCoachAssignmentsByCoachId } from "@/features/coach/api/useCoachAssignment";
import { ClassAssignmentModal } from "@/features/studentEnrollment/components/ClassAssignmentModal/ClassAssignmentModal";
import type { CoachAssignmentCreateRequest, CoachDetail } from "@/types";
import { useEffect, useMemo, useState } from "react";

import "./CoachUpdateModal.scss";

type CoachUpdateModalProps = {
  coach: CoachDetail | null;
  onClose: () => void;
};

function formatToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createInitialAssignment(
  coachId: string,
): CoachAssignmentCreateRequest {
  const today = formatToday();
  return {
    coachId,
    scheduleIds: [],
    assignmentDate: today,
    endDate: today,
    note: "",
  };
}

export default function CoachUpdateModal({
  coach,
  onClose,
}: CoachUpdateModalProps) {
  const initialAssignment = useMemo(
    () => createInitialAssignment(coach?.userId ?? ""),
    [coach?.userId],
  );
  const [assignmentRequest, setAssignmentRequest] =
    useState<CoachAssignmentCreateRequest>(initialAssignment);

  useEffect(() => {
    setAssignmentRequest(initialAssignment);
  }, [initialAssignment]);

  const { data: coachAssignments = [], isLoading: isCoachAssignmentsLoading } =
    useGetCoachAssignmentsByCoachId(coach?.userId ?? "");

  const activeAssignmentSchedules = useMemo(
    () =>
      coachAssignments
        .filter((assignment) => assignment.status === "ACTIVE")
        .map((assignment) => assignment.classSchedule),
    [coachAssignments],
  );

  const handleSubmit = () => {
    if (!coach) {
      return;
    }

    if (assignmentRequest.scheduleIds.length === 0) {
      showErrorToast("Vui lòng chọn ít nhất một lớp dạy.");
      return;
    }

    if (!assignmentRequest.assignmentDate || !assignmentRequest.endDate) {
      showErrorToast("Vui lòng chọn đầy đủ ngày phân công và ngày kết thúc.");
      return;
    }

    if (assignmentRequest.endDate < assignmentRequest.assignmentDate) {
      showErrorToast("Ngày kết thúc không được nhỏ hơn ngày phân công.");
      return;
    }

    showInfoToast(
      "Đã lưu cấu hình phân lớp dạy tạm thời. Chờ tích hợp API cập nhật HLV.",
    );
    onClose();
  };

  if (!coach) {
    return null;
  }

  return (
    <div className="coach-update-modal">
      <AssignmentSubjectHero
        subjectLabel="Huấn luyện viên"
        statusText={coach.coachStatus}
        name={coach.fullName}
        codeLabel="Mã"
        codeValue={coach.staffCode}
        secondaryText={coach.email || coach.phoneNumber}
      />

      <StudentScheduleSection
        isLoading={isCoachAssignmentsLoading}
        hasOwner
        title="🥋 Lịch dạy hiện tại"
        classList={activeAssignmentSchedules}
        actionLabel="Bỏ"
      />

      <ClassAssignmentModal
        mode="coach-inline"
        assignmentRequest={assignmentRequest}
        onAssignmentChange={setAssignmentRequest}
      />

      <div className="coach-update-modal__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Hủy
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleSubmit}
        >
          Lưu phân lớp dạy
        </button>
      </div>
    </div>
  );
}
