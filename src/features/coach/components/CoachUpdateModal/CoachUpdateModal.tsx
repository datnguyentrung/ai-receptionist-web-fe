import { AssignmentSubjectHero } from "@/components/AssignmentSubjectHero/AssignmentSubjectHero";
import ConfirmModal from "@/components/ConfirmModal";
import { showErrorToast, showInfoToast } from "@/components/ui/toast";
import { coachAssignmentAPI } from "@/features/coach/api/coachAssignmentAPI";
import { ClassAssignmentModal } from "@/features/studentEnrollment/components/ClassAssignmentModal/ClassAssignmentModal";
import { useGetQuery, useGenericMutation } from "@/hooks/useCrud";
import type {
  CoachAssignmentCreateRequest,
  CoachAssignmentResponse,
  CoachAssignmentSimpleResponse,
  CoachDetail,
} from "@/types";
import { useEffect, useMemo, useState } from "react";
import CoachAssignmentList from "./CoachAssignmentList";

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

  const [deletingAssignmentIds, setDeletingAssignmentIds] = useState<
    Set<string>
  >(new Set());
  const [pendingDeleteAssignment, setPendingDeleteAssignment] =
    useState<CoachAssignmentResponse | null>(null);

  const { data: coachAssignments = [], isLoading: isCoachAssignmentsLoading } =
    useGetQuery(
      ["coach-assignments", coach?.userId ?? ""],
      () => coachAssignmentAPI.getAssignmentsByCoachId(coach?.userId ?? ""),
      { enabled: !!coach?.userId },
    );

  const activeAssignments = useMemo(
    () =>
      coachAssignments
        .filter((assignment) => assignment.status === "ACTIVE")
        .sort(
          (a, b) =>
            a.classSchedule.weekday - b.classSchedule.weekday ||
            a.classSchedule.startTime.localeCompare(b.classSchedule.startTime),
        ),
    [coachAssignments],
  );

  const { mutate: createCoachAssignment, isPending: isCreatingAssignment } =
    useGenericMutation<CoachAssignmentSimpleResponse[], CoachAssignmentCreateRequest>(
      (request) => coachAssignmentAPI.createCoachAssignment(request),
      [["coach-assignments"]],
    );

  const {
    mutateAsync: deleteCoachAssignment,
    isPending: isDeletingAssignment,
  } = useGenericMutation<void, string>(
    (id) => coachAssignmentAPI.deleteCoachAssignment(id),
    [["coach-assignments"]],
  );

  const handleOpenDeleteConfirm = (assignment: CoachAssignmentResponse) => {
    setPendingDeleteAssignment(assignment);
  };

  const handleCloseDeleteConfirm = () => {
    if (isDeletingAssignment) {
      return;
    }

    setPendingDeleteAssignment(null);
  };

  const handleConfirmDeleteAssignment = async () => {
    if (!coach) {
      return;
    }

    if (!pendingDeleteAssignment) {
      return;
    }

    const assignment = pendingDeleteAssignment;

    const assignmentId = pendingDeleteAssignment.assignmentId;

    setDeletingAssignmentIds((prev) => new Set(prev).add(assignmentId));

    try {
      await deleteCoachAssignment(assignmentId);

      showInfoToast(
        `Đã xóa lớp ${assignment.classSchedule.scheduleId} khỏi phân công của ${coach.fullName}.`,
      );

      setPendingDeleteAssignment(null);
    } catch {
      showErrorToast("Có lỗi xảy ra khi xóa lớp đã phân công.");
    } finally {
      setDeletingAssignmentIds((prev) => {
        const next = new Set(prev);
        next.delete(assignmentId);
        return next;
      });
    }
  };

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

    createCoachAssignment(assignmentRequest, {
      onSuccess: (data: CoachAssignmentSimpleResponse[]) => {
        const text =
          "Đã phân công thêm cho HLV " +
          coach.fullName +
          " các lớp: " +
          data.map((d) => d.classSchedule.scheduleId).join(", ");
        showInfoToast(text);
        onClose();
      },
      onError: () => {
        showErrorToast("Có lỗi xảy ra khi cập nhật phân công huấn luyện viên.");
      },
    });
  };

  if (!coach) {
    return null;
  }

  return (
    <div className="coach-update-modal">
      <div className="coach-update-modal__content">
        <AssignmentSubjectHero
          subjectLabel="Huấn luyện viên"
          statusText={coach.coachStatus}
          name={coach.fullName}
          codeLabel="Mã"
          codeValue={coach.staffCode}
          secondaryText={coach.email || coach.phoneNumber}
        />

        <CoachAssignmentList
          isLoading={isCoachAssignmentsLoading}
          assignments={activeAssignments}
          deletingAssignmentIds={deletingAssignmentIds}
          onDeleteAssignment={handleOpenDeleteConfirm}
        />

        <ClassAssignmentModal
          mode="coach-inline"
          assignmentRequest={assignmentRequest}
          onAssignmentChange={setAssignmentRequest}
          disabled={isCreatingAssignment}
        />
      </div>

      <div className="coach-update-modal__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>
          Hủy
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleSubmit}
          disabled={isCreatingAssignment}
        >
          {isCreatingAssignment ? "Đang lưu phân lớp..." : "Lưu phân lớp dạy"}
        </button>
      </div>

      <ConfirmModal
        open={!!pendingDeleteAssignment}
        title="Xóa lớp đã phân công?"
        description={
          pendingDeleteAssignment
            ? `Bạn có chắc muốn xóa lớp ${pendingDeleteAssignment.classSchedule.scheduleId} khỏi huấn luyện viên ${coach.fullName}?`
            : ""
        }
        confirmText="Xóa lớp"
        loadingText="Đang xóa lớp..."
        isLoading={isDeletingAssignment}
        showSuccessToastOnConfirm={false}
        showErrorToastOnFail={false}
        onCancel={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDeleteAssignment}
      />
    </div>
  );
}
