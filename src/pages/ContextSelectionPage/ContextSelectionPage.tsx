import { useSwitchContext } from "@/features/auth/api/useAuthentication";
import { useAuthStore } from "@/store/authStore";
import type { UserContext } from "@/types";
import { BriefcaseBusiness, GraduationCap, ShieldCheck, UserRound } from "lucide-react";
import { Navigate } from "react-router-dom";
import styles from "./ContextSelectionPage.module.scss";

const contextLabel = (context: UserContext) => {
  if (context.contextType === "STUDENT") return "Học viên";
  if (context.contextType === "COACH") return "Huấn luyện viên";
  if (context.contextType === "GUARDIAN") return "Người giám hộ";
  if (context.contextType === "MANAGER") return "Quản lý";
  return context.contextType;
};

const relationshipLabel = (context: UserContext) => {
  if (!context.relationshipType) return null;
  if (context.relationshipType === "OWNER") return "Chính chủ";
  if (context.relationshipType === "GUARDIAN") return "Giám hộ";
  if (context.relationshipType === "MANAGER") return "Quản lý";
  return context.relationshipType;
};

const ContextIcon = ({ type }: { type: string }) => {
  if (type === "STUDENT") return <GraduationCap size={22} />;
  if (type === "COACH") return <ShieldCheck size={22} />;
  if (type === "MANAGER") return <BriefcaseBusiness size={22} />;
  return <UserRound size={22} />;
};

export function ContextSelectionPage() {
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const availableContexts = useAuthStore((state) => state.availableContexts);
  const requiresContextSelection = useAuthStore(
    (state) => state.requiresContextSelection,
  );
  const { mutate: switchContext, isPending } = useSwitchContext();

  if (authStatus === "anonymous" || !user) {
    return <Navigate to="/login" replace />;
  }

  if (authStatus === "authenticated" && !requiresContextSelection) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Chọn ngữ cảnh</p>
          <h1 className={styles.title}>Bạn muốn thao tác với hồ sơ nào?</h1>
          <p className={styles.subtitle}>
            Tài khoản này có nhiều vai trò hoặc hồ sơ liên kết. Chọn đúng ngữ
            cảnh để dữ liệu, quyền hạn và thông báo được đồng bộ chính xác.
          </p>
        </header>

        <section className={styles.list} aria-label="Danh sách ngữ cảnh">
          {availableContexts.map((context) => {
            const relationship = relationshipLabel(context);

            return (
              <button
                key={`${context.personId}:${context.contextType}`}
                type="button"
                className={styles.card}
                disabled={isPending}
                onClick={() =>
                  switchContext({
                    personId: context.personId,
                    contextType: context.contextType,
                  })
                }
              >
                <span className={styles.icon} aria-hidden="true">
                  <ContextIcon type={context.contextType} />
                </span>
                <span className={styles.content}>
                  <span className={styles.name}>{context.displayName}</span>
                  <span className={styles.meta}>
                    <span className={styles.pill}>{contextLabel(context)}</span>
                    {relationship ? (
                      <span className={styles.pill}>{relationship}</span>
                    ) : null}
                  </span>
                </span>
              </button>
            );
          })}
        </section>

        {availableContexts.length === 0 ? (
          <p className={styles.notice}>
            Chưa có ngữ cảnh khả dụng. Vui lòng liên hệ quản trị viên.
          </p>
        ) : null}
      </div>
    </main>
  );
}

export default ContextSelectionPage;
