import { formatDateDMY } from "@/utils/format";
import { Skeleton } from "boneyard-js/react";
import {
  Activity,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  Flag,
  GraduationCap,
  IdCard,
  Mail,
  User,
  Users,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  COACH_ROLE_CODE_LABELS,
  CoachStatusLabel,
  type CoachRoleCode,
} from "../../../../config/constants";
import PersonalPageSkeleton from "../../PersonalPageSkeleton/PersonalPageSkeleton";
import type { OutletContextType } from "../TabViews/TabViews";
import S from "./PersonalInfoTab.module.scss";

export default function PersonalInfoTab() {
  const navigate = useNavigate();
  const context = useOutletContext<OutletContextType>();
  const user = context?.user;
  const canViewManagerSenior = context?.canViewManagerSenior;

  console.log("PersonalInfoTab Context:", context); // Debug: Kiểm tra dữ liệu context nhận được

  if (!user)
    return (
      <Skeleton
        loading
        name="personal-info-tab"
        fallback={<PersonalPageSkeleton variant="tab" />}
      >
        <div />
      </Skeleton>
    );

  const handleNavigateToEnrollments = () => {
    navigate("classes"); // React Router tự động hiểu là nối thêm "classes" vào "/:userCode" hiện tại
  };

  return (
    <div className={S.wrapper}>
      {/* Stats Overview */}
      <div className={S.statsGrid}>
        {/* Stat 1 */}
        <div className={S.statCard}>
          <div className={`${S.statIcon} ${S.indigo}`}>
            <User size={24} strokeWidth={2} />
          </div>
          <div>
            <p className={S.statLabel}>Chức vụ</p>
            <p className={S.statValue}>
              {COACH_ROLE_CODE_LABELS[user.role as CoachRoleCode] || user.role}
            </p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className={S.statCard}>
          <div className={`${S.statIcon} ${S.emerald}`}>
            <Activity size={24} strokeWidth={2} />
            <div className={S.statusDot}></div>
          </div>
          <div>
            <p className={S.statLabel}>Trạng thái hiện tại</p>
            <div className={S.statusRow}>
              <span></span>
              <p className={S.statValue}>{user.status}</p>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        {"email" in user && user.email && (
          <div className={S.statCard}>
            <div className={`${S.statIcon} ${S.orange}`}>
              <Mail size={24} strokeWidth={2} />
            </div>
            <div className={S.statOverflow}>
              <p className={S.statLabel}>Primary Contact</p>
              {/* Lúc này TS đã hiểu user chắc chắn là CoachDetail */}
              <p className={S.statSmall}>{user.email}</p>
            </div>
          </div>
        )}

        {/* Stat 4 */}
        <div className={S.statCard}>
          <div className={`${S.statIcon} ${S.blue}`}>
            <Clock size={24} strokeWidth={2} />
          </div>
          <div>
            <p className={S.statLabel}>Lần đăng nhập cuối</p>
            <p className={S.statValue}>{formatDateDMY(user.lastLoginAt)}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={S.contentGrid}>
        {/* Left Column: General Info */}
        <div className={S.infoCard}>
          <h2 className={S.cardTitle}>Thông tin chung</h2>
          <div className={S.infoList}>
            {canViewManagerSenior && (
              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.slate}`}>
                  <IdCard size={20} />
                </div>
                <div className={S.infoContent}>
                  <p className={S.infoLabel}>System User ID</p>
                  <p className={`${S.infoValue} ${S.infoMono}`}>
                    {user.userId}
                  </p>
                </div>
              </div>
            )}

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.pink}`}>
                <User size={20} />
              </div>
              <div className={S.infoContent}>
                <p className={S.infoLabel}>Giới tính</p>
                <p className={S.infoValue}>
                  {user.gender === true ? "Nam" : "Nữ"}
                </p>
              </div>
            </div>

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.amber}`}>
                <CalendarDays size={20} />
              </div>
              <div className={S.infoContent}>
                <p className={S.infoLabel}>Ngày sinh</p>
                <p className={S.infoValue}>{formatDateDMY(user.birthDate)}</p>
              </div>
            </div>

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.teal}`}>
                <Flag size={20} />
              </div>
              <div className={`${S.infoContent} ${S.last}`}>
                <p className={S.infoLabel}>Ngày tham gia</p>
                <p className={S.infoValue}>{formatDateDMY(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Specific Info */}
        {/* Right Column: Specific Info (Tẽ nhánh hiển thị theo Role) */}
        {"studentCode" in user ? (
          /* TRƯỜNG HỢP 1: NẾU LÀ HỌC VIÊN */
          <div className={S.infoCard}>
            <h2 className={S.cardTitle}>Thông tin học viên</h2>
            <div className={S.infoList}>
              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.red}`}>
                  <Building2 size={20} />
                </div>
                <div className={S.infoContent}>
                  <p className={S.infoLabel}>{user.branchName}</p>
                  <p className={S.infoValue}>{user.branchAddress}</p>
                </div>
              </div>

              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.violet}`}>
                  <GraduationCap size={20} />
                </div>
                <div className={S.infoContent}>
                  <p className={S.infoLabel}>Mã học viên</p>
                  <p className={`${S.infoValue} ${S.infoMono}`}>
                    {user.studentCode}
                  </p>
                </div>
              </div>

              {canViewManagerSenior && (
                <div className={S.infoRow}>
                  <div className={`${S.infoIcon} ${S.cyan}`}>
                    <IdCard size={20} />
                  </div>
                  <div className={S.infoContent}>
                    <p className={S.infoLabel}>Mã hội viên</p>
                    <p className={`${S.infoValue} ${S.infoMono}`}>
                      {user.nationalCode || "N/A"}
                    </p>
                  </div>
                </div>
              )}

              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.redLight}`}>
                  <BookOpen size={20} />
                </div>
                <div className={`${S.infoContent} ${S.last}`}>
                  <p className={S.infoLabel}>Lớp học đã đăng ký</p>
                  <div className={S.enrolledRow}>
                    <p className={S.infoValue}>
                      {/* Lấy độ dài mảng enrollments làm số lượng lớp */}
                      {user.enrollments?.length || 0} Lớp
                    </p>
                    <button
                      onClick={handleNavigateToEnrollments}
                      className={S.viewingBadge}
                    >
                      Xem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TRƯỜNG HỢP 2: NẾU LÀ HUẤN LUYỆN VIÊN (COACH) */
          <div className={S.infoCard}>
            <h2 className={S.cardTitle}>Thông tin nhân viên</h2>
            <div className={S.infoList}>
              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.violet}`}>
                  <Briefcase size={20} />
                </div>
                <div className={S.infoContent}>
                  <p className={S.infoLabel}>Mã nhân viên</p>
                  <p className={`${S.infoValue} ${S.infoMono}`}>
                    {user.staffCode}
                  </p>
                </div>
              </div>

              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.cyan}`}>
                  <Activity size={20} />
                </div>
                <div className={S.infoContent}>
                  <p className={S.infoLabel}>Trạng thái huấn luyện viên</p>
                  <p className={S.infoValue}>
                    {CoachStatusLabel[user.coachStatus] || user.coachStatus}
                  </p>
                </div>
              </div>

              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.redLight}`}>
                  <Users size={20} />
                </div>
                <div className={`${S.infoContent} ${S.last}`}>
                  <p className={S.infoLabel}>Phân công hiện tại</p>
                  <div className={S.enrolledRow}>
                    <p className={S.infoValue}>
                      {user.currentAssignments?.length || 0} Lớp
                    </p>
                    <button
                      onClick={handleNavigateToEnrollments}
                      className={S.viewingBadge}
                    >
                      Xem
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
