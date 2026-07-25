import { ModalLayout } from "@/components/ui/modal-layout";
import {
  CoachAssignmentModal,
  CoachCard,
  CoachCreateModal,
  CoachFilters,
  CoachUpdateModal,
  useCoachesGroupedByRole,
} from "@/features/coach";
import { coachAPI } from "@/features/coach/api/coachAPI";
import { useRegisterPullToRefresh } from "@/app/providers/pull-to-refresh";
import { useGetQuery } from "@/hooks/useCrud";
import { Plus, Users } from "lucide-react";
import { useCallback, useState } from "react";
import type { CoachStatus } from "../../config/constants";
import type { CoachDetail } from "../../types";
import styles from "./CoachManagement.module.scss";

function CoachManagementSkeleton() {
  return (
    <div className={styles.skeletonWrap} aria-hidden>
      <div className={styles.skeletonFilters} />
      <div className={styles.skeletonGroups}>
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div key={groupIndex} className={styles.skeletonGroup}>
            <div className={styles.skeletonGroupTitle} />
            <div className={styles.coachGrid}>
              {Array.from({ length: 3 }).map((_, cardIndex) => (
                <div key={cardIndex} className={styles.skeletonCard}>
                  <div className={styles.skeletonAvatar} />
                  <div className={styles.skeletonLines}>
                    <div />
                    <div />
                    <div />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type CoachModalAction = "assignment" | "update";

type ActiveCoachModal = {
  action: CoachModalAction;
  coach: CoachDetail;
};

export function CoachManagement() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | CoachStatus>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCoachModal, setActiveCoachModal] =
    useState<ActiveCoachModal | null>(null);

  const { data: coaches, isLoading, refetch: refetchCoaches } = useGetQuery(
    ["coaches"],
    coachAPI.getAllCoaches,
  );

  const refreshCoachManagement = useCallback(async () => {
    await refetchCoaches();
  }, [refetchCoaches]);

  useRegisterPullToRefresh(refreshCoachManagement);

  const coachGroups = useCoachesGroupedByRole(coaches || [], search, filter);

  const handleOpenAssignmentModal = (coach: CoachDetail) => {
    setActiveCoachModal({ action: "assignment", coach });
  };

  const handleOpenUpdateModal = (coach: CoachDetail) => {
    setActiveCoachModal({ action: "update", coach });
  };

  const handleCloseCoachModal = () => {
    setActiveCoachModal(null);
  };

  // Calculate filteredCoaches from groups to ensure consistency
  const filteredCoaches = coachGroups.flatMap((group) => group.coaches);

  return (
    <div className={styles.page}>
      {/* Header row */}
      <div className={styles.pageHead}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            Quản lý Huấn luyện viên
          </h2>
          <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
            {filteredCoaches.length} huấn luyện viên ·{" "}
            {filteredCoaches.filter((c) => c.coachStatus === "ACTIVE").length}{" "}
            đang hoạt động
          </p>
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={16} /> Thêm HLV mới
        </button>
      </div>

      {/* Filters */}
      <CoachFilters
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
      />

      {/* Coach groups */}
      {isLoading ? (
        <CoachManagementSkeleton />
      ) : coachGroups.length > 0 ? (
        <div className={styles.coachGroups}>
          {coachGroups.map((group) => (
            <div key={group.roleCode} className={styles.roleGroup}>
              <h3 className={styles.roleGroupHeader}>{group.label}</h3>
              <div className={styles.coachGrid}>
                {group.coaches.map((coach) => (
                  <CoachCard
                    key={coach.staffCode}
                    coach={coach}
                    onOpenAssignment={handleOpenAssignmentModal}
                    onOpenUpdate={handleOpenUpdateModal}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Users
            size={40}
            style={{ color: "#D1D5DB", margin: "0 auto 12px" }}
          />
          <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
            Không tìm thấy huấn luyện viên
          </p>
        </div>
      )}

      <CoachCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {activeCoachModal?.action === "assignment" ? (
        <ModalLayout
          open
          onClose={handleCloseCoachModal}
          withSurface={false}
          maxWidth={1020}
          overlayClassName="coach-create-modal__overlay"
        >
          <div className={styles.modalContainer}>
            <CoachAssignmentModal
              coach={activeCoachModal.coach}
              onClose={handleCloseCoachModal}
            />
          </div>
        </ModalLayout>
      ) : null}

      <CoachUpdateModal
        open={activeCoachModal?.action === "update"}
        coach={
          activeCoachModal?.action === "update"
            ? activeCoachModal.coach
            : null
        }
        onClose={handleCloseCoachModal}
      />
    </div>
  );
}
