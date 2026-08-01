import ConfirmModal from "@/components/common/ConfirmModal";
import { showErrorToast, showInfoToast } from "@/components/ui/toast";
import { coachAssignmentAPI } from "@/features/coach/api/coachAssignmentAPI";
import { AssignmentSubjectHero } from "@/features/studentEnrollment/components/AssignmentSubjectHero/AssignmentSubjectHero";
import { ClassAssignmentModal } from "@/features/studentEnrollment/components/ClassAssignmentModal/ClassAssignmentModal";
import { useGenericMutation, useGetQuery } from "@/hooks/useCrud";
import type {
  CoachAssignmentCreateRequest,
  CoachAssignmentResponse,
  CoachAssignmentSimpleResponse,
  CoachDetail,
} from "@/types";
import { useMemo, useState } from "react";
import CoachAssignmentList from "../CoachUpdateModal/CoachAssignmentList";
import "../CoachUpdateModal/CoachUpdateModal.scss";

type CoachAssignmentModalProps = {
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

export function CoachAssignmentModal({
  coach,
  onClose,
}: CoachAssignmentModalProps) {
  const assignmentCoachId = coach?.personId ?? "";
  const [assignmentState, setAssignmentState] = useState<{
    coachId: string;
    request: CoachAssignmentCreateRequest;
  }>(() => ({
    coachId: assignmentCoachId,
    request: createInitialAssignment(assignmentCoachId),
  }));
  const [deletingAssignmentIds, setDeletingAssignmentIds] = useState<
    Set<string>
  >(new Set());
  const [pendingDeleteAssignment, setPendingDeleteAssignment] =
    useState<CoachAssignmentResponse | null>(null);

  if (assignmentState.coachId !== assignmentCoachId) {
    setAssignmentState({
      coachId: assignmentCoachId,
      request: createInitialAssignment(assignmentCoachId),
    });
  }

  const assignmentRequest = assignmentState.request;
  const setAssignmentRequest = (request: CoachAssignmentCreateRequest) => {
    setAssignmentState({
      coachId: assignmentCoachId,
      request: { ...request, coachId: assignmentCoachId },
    });
  };

  const { data: coachAssignments = [], isLoading: isCoachAssignmentsLoading } =
    useGetQuery(
      ["coach-assignments", coach?.personId ?? ""],
      () => coachAssignmentAPI.getAssignmentsByCoachId(coach?.personId ?? ""),
      { enabled: Boolean(coach?.personId) },
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
    useGenericMutation<
      CoachAssignmentSimpleResponse[],
      CoachAssignmentCreateRequest
    >(coachAssignmentAPI.createCoachAssignment, [
      ["coach-assignments"],
      ["coaches"],
    ]);
  const {
    mutateAsync: deleteCoachAssignment,
    isPending: isDeletingAssignment,
  } = useGenericMutation<void, string>(
    coachAssignmentAPI.deleteCoachAssignment,
    [["coach-assignments"], ["coaches"]],
  );

  const handleConfirmDeleteAssignment = async () => {
    if (!coach || !pendingDeleteAssignment) return;

    const assignment = pendingDeleteAssignment;
    const assignmentId = assignment.assignmentId;
    setDeletingAssignmentIds((previous) => new Set(previous).add(assignmentId));

    try {
      await deleteCoachAssignment(assignmentId);
      showInfoToast(
        `Đã xóa lớp ${assignment.classSchedule.scheduleId} khỏi phân công của ${coach.fullName}.`,
      );
      setPendingDeleteAssignment(null);
    } catch {
      showErrorToast("Có lỗi xảy ra khi xóa lớp đã phân công.");
    } finally {
      setDeletingAssignmentIds((previous) => {
        const next = new Set(previous);
        next.delete(assignmentId);
        return next;
      });
    }
  };

  const handleSubmit = () => {
    if (!coach) return;
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

    createCoachAssignment(
      { ...assignmentRequest, coachId: assignmentCoachId },
      {
        onSuccess: (assignments) => {
          showInfoToast(
            `Đã phân công thêm cho HLV ${coach.fullName} các lớp: ${assignments
              .map((assignment) => assignment.classSchedule.scheduleId)
              .join(", ")}`,
          );
          onClose();
        },
        onError: () => {
          showErrorToast(
            "Có lỗi xảy ra khi cập nhật phân công huấn luyện viên.",
          );
        },
      },
    );
  };

  if (!coach) return null;

  return (
    <div className="coach-assignment-modal">
      <div className="coach-assignment-modal__content">
        <AssignmentSubjectHero
          subjectLabel="Huấn luyện viên"
          statusText={coach.coachStatus}
          name={coach.fullName}
          codeLabel="Mã"
          codeValue={coach.staffCode}
          secondaryText={coach.email || coach.phoneNumber || undefined}
        />
        <CoachAssignmentList
          isLoading={isCoachAssignmentsLoading}
          assignments={activeAssignments}
          deletingAssignmentIds={deletingAssignmentIds}
          onDeleteAssignment={setPendingDeleteAssignment}
        />
        <ClassAssignmentModal
          mode="coach-inline"
          assignmentRequest={assignmentRequest}
          onAssignmentChange={setAssignmentRequest}
          disabled={isCreatingAssignment}
        />
      </div>

      <div className="coach-assignment-modal__actions">
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
        open={Boolean(pendingDeleteAssignment)}
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
        onCancel={() =>
          !isDeletingAssignment && setPendingDeleteAssignment(null)
        }
        onConfirm={handleConfirmDeleteAssignment}
      />
    </div>
  );
}
