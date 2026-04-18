import { useNavigate } from "react-router-dom";
import { showInfoToast, showWarningToast } from "../../components/ui/toast";
import { useAuthStore } from "../../store/authStore";
import { isCoach } from "../../utils/roleUtils";
import styles from "./Welcome.module.scss";

export default function Welcome() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const hasToken = Boolean(accessToken) && isAuthenticated;
  const canViewExamResult = isCoach(user?.userInfo?.idRole);

  const handleFeatureClick = (
    path: string,
    requiresExamPermission = false,
    requiresAuth = true,
  ) => {
    if (requiresAuth && !hasToken) {
      showInfoToast("Vui lòng đăng nhập để sử dụng tính năng này.");
      navigate("/login");
      return;
    }

    if (requiresExamPermission && !canViewExamResult) {
      showWarningToast("Bạn chưa có quyền xem nội dung này.");
      return;
    }

    navigate(path);
  };

  const features = [
    {
      icon: "👥",
      title: "Quản Lý Học Viên",
      description: "Theo dõi thông tin và tiến độ học tập",
      colorClass: styles.red,
      path: "/students",
    },
    {
      icon: "📚",
      title: "Quản Lý Lớp Học",
      description: "Tổ chức và sắp xếp lịch học hiệu quả",
      colorClass: styles.blue,
      path: "/schedules",
    },
    {
      icon: "🥋",
      title: "Quản Lý Thi Đấu",
      description: "Theo dõi giải đấu và thành tích",
      colorClass: styles.yellow,
      path: "/history",
    },
    {
      icon: "📋",
      title: "Quản Lý Khảo Thí",
      description:
        "Theo dõi kết quả đánh giá định kỳ và hồ sơ xét thăng cấp của học viên.",
      colorClass: styles.green,
      path: "/public/exam",
      requiresExamPermission: false, // TODO: true
      requiresAuth: false,
      specialClass: styles.examFeature,
    },
  ];

  return (
    <div className={styles.homeContainer}>
      <div className={styles.card}>
        <div>
          <div className={styles.iconWrapper}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className={styles.title}>Chào Mừng Đến Với Hệ Thống</h1>
          <h2 className={styles.subtitle}>Taekwondo Văn Quán</h2>
          <p className={styles.description}>
            Hệ thống quản lý đào tạo và thi đấu Taekwondo chuyên nghiệp. Quản lý
            học viên, huấn luyện viên, lớp học và các hoạt động thi đấu một cách
            hiệu quả.
          </p>
        </div>

        <div className={styles.features}>
          {features.map((feature) => (
            <div
              key={feature.title}
              role="button"
              tabIndex={0}
              className={`${styles.featureCard} ${feature.colorClass} ${feature.specialClass || ""}`}
              onClick={() =>
                handleFeatureClick(
                  feature.path,
                  feature.requiresExamPermission,
                  feature.requiresAuth,
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleFeatureClick(
                    feature.path,
                    feature.requiresExamPermission,
                    feature.requiresAuth,
                  );
                }
              }}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.buttonPrimary}
            onClick={() => {
              if (!hasToken) {
                navigate("/login");
                return;
              }
              navigate("/");
            }}
          >
            Đăng Nhập
          </button>
          <button className={styles.buttonSecondary}>Tìm Hiểu Thêm</button>
        </div>
      </div>
    </div>
  );
}
