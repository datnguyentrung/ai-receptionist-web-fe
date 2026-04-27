import type { CoachDetail, StudentDetail } from "@/types";
import { formatDateDMY } from "@/utils/format";
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
import { useOutletContext } from "react-router-dom";
import S from "./PersonalInfoTab.module.scss";

export default function PersonalInfoTab() {
  const context = useOutletContext<{ user: StudentDetail | CoachDetail }>();
  const user = context?.user;

  if (!user) return null;

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
            <p className={S.statLabel}>Role Profile</p>
            <p className={S.statValue}>{user.role}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className={S.statCard}>
          <div className={`${S.statIcon} ${S.emerald}`}>
            <Activity size={24} strokeWidth={2} />
            <div className={S.statusDot}></div>
          </div>
          <div>
            <p className={S.statLabel}>Current Status</p>
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
            <p className={S.statLabel}>Last Login</p>
            <p className={S.statValue}>{formatDateDMY(user.lastLoginAt)}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={S.contentGrid}>
        {/* Left Column: General Info */}
        <div className={S.infoCard}>
          <h2 className={S.cardTitle}>General Information</h2>
          <div className={S.infoList}>
            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.slate}`}>
                <IdCard size={20} />
              </div>
              <div className={S.infoContent}>
                <p className={S.infoLabel}>System User ID</p>
                <p className={`${S.infoValue} ${S.infoMono}`}>{user.userId}</p>
              </div>
            </div>

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.pink}`}>
                <User size={20} />
              </div>
              <div className={S.infoContent}>
                <p className={S.infoLabel}>Gender</p>
                <p className={S.infoValue}>{user.gender === true ? "Nam" : "Nữ"}</p>
              </div>
            </div>

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.amber}`}>
                <CalendarDays size={20} />
              </div>
              <div className={S.infoContent}>
                <p className={S.infoLabel}>Date of Birth</p>
                <p className={S.infoValue}>{formatDateDMY(user.birthDate)}</p>
              </div>
            </div>

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.teal}`}>
                <Flag size={20} />
              </div>
              <div className={`${S.infoContent} ${S.last}`}>
                <p className={S.infoLabel}>Join Date</p>
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
            <h2 className={S.cardTitle}>Taekwondo Registration</h2>
            <div className={S.infoList}>
              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.red}`}>
                  <Building2 size={20} />
                </div>
                <div className={S.infoContent}>
                  <p className={S.infoLabel}>Branch Name</p>
                  <p className={S.infoValue}>{user.branchName}</p>
                </div>
              </div>

              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.violet}`}>
                  <GraduationCap size={20} />
                </div>
                <div className={S.infoContent}>
                  <p className={S.infoLabel}>Student Code</p>
                  <p className={`${S.infoValue} ${S.infoMono}`}>
                    {user.studentCode}
                  </p>
                </div>
              </div>

              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.cyan}`}>
                  <IdCard size={20} />
                </div>
                <div className={S.infoContent}>
                  <p className={S.infoLabel}>National Code</p>
                  <p className={`${S.infoValue} ${S.infoMono}`}>
                    {user.nationalCode || "N/A"}
                  </p>
                </div>
              </div>

              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.redLight}`}>
                  <BookOpen size={20} />
                </div>
                <div className={`${S.infoContent} ${S.last}`}>
                  <p className={S.infoLabel}>Enrolled Classes</p>
                  <div className={S.enrolledRow}>
                    <p className={S.infoValue}>
                      {/* Lấy độ dài mảng enrollments làm số lượng lớp */}
                      {user.enrollments?.length || 0} Active Classes
                    </p>
                    <span className={S.viewingBadge}>Viewing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TRƯỜNG HỢP 2: NẾU LÀ HUẤN LUYỆN VIÊN (COACH) */
          <div className={S.infoCard}>
            <h2 className={S.cardTitle}>Employment Details</h2>
            <div className={S.infoList}>
              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.violet}`}>
                  <Briefcase size={20} />
                </div>
                <div className={S.infoContent}>
                  <p className={S.infoLabel}>Staff Code</p>
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
                  <p className={S.infoLabel}>Coach Status</p>
                  <p className={S.infoValue}>{user.coachStatus}</p>
                </div>
              </div>

              <div className={S.infoRow}>
                <div className={`${S.infoIcon} ${S.redLight}`}>
                  <Users size={20} />
                </div>
                <div className={`${S.infoContent} ${S.last}`}>
                  <p className={S.infoLabel}>Current Assignments</p>
                  <div className={S.enrolledRow}>
                    <p className={S.infoValue}>
                      {user.currentAssignments?.length || 0} Assigned Classes
                    </p>
                    <span className={S.viewingBadge}>Viewing</span>
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
