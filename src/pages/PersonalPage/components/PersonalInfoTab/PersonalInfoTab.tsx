import {
  Activity,
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  Flag,
  GraduationCap,
  IdCard,
  Mail,
  User,
} from "lucide-react";
import S from "./PersonalInfoTab.module.scss";

interface PersonalInfoProps {
  student: {
    userId: string;
    gender: string;
    birthDate: string;
    createdAt: string;
    branchName: string;
    studentCode: string;
    nationalCode: string;
    enrollmentsCount: number;
    status: string;
    role: string;
    email: string;
    lastLogin: string;
  };
}

export default function PersonalInfoTab({ student }: PersonalInfoProps) {
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
            <p className={S.statValue}>{student.role}</p>
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
              <p className={S.statValue}>{student.status}</p>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className={S.statCard}>
          <div className={`${S.statIcon} ${S.orange}`}>
            <Mail size={24} strokeWidth={2} />
          </div>
          <div className={S.statOverflow}>
            <p className={S.statLabel}>Primary Contact</p>
            <p className={S.statSmall}>{student.email}</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className={S.statCard}>
          <div className={`${S.statIcon} ${S.blue}`}>
            <Clock size={24} strokeWidth={2} />
          </div>
          <div>
            <p className={S.statLabel}>Last Login</p>
            <p className={S.statValue}>{student.lastLogin}</p>
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
                <p className={`${S.infoValue} ${S.infoMono}`}>{student.userId}</p>
              </div>
            </div>

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.pink}`}>
                <User size={20} />
              </div>
              <div className={S.infoContent}>
                <p className={S.infoLabel}>Gender</p>
                <p className={S.infoValue}>{student.gender}</p>
              </div>
            </div>

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.amber}`}>
                <CalendarDays size={20} />
              </div>
              <div className={S.infoContent}>
                <p className={S.infoLabel}>Date of Birth</p>
                <p className={S.infoValue}>{student.birthDate}</p>
              </div>
            </div>

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.teal}`}>
                <Flag size={20} />
              </div>
              <div className={`${S.infoContent} ${S.last}`}>
                <p className={S.infoLabel}>Join Date</p>
                <p className={S.infoValue}>{student.createdAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Specific Info */}
        <div className={S.infoCard}>
          <h2 className={S.cardTitle}>Taekwondo Registration</h2>
          <div className={S.infoList}>
            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.red}`}>
                <Building2 size={20} />
              </div>
              <div className={S.infoContent}>
                <p className={S.infoLabel}>Branch Name</p>
                <p className={S.infoValue}>{student.branchName}</p>
              </div>
            </div>

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.violet}`}>
                <GraduationCap size={20} />
              </div>
              <div className={S.infoContent}>
                <p className={S.infoLabel}>Student Code</p>
                <p className={`${S.infoValue} ${S.infoMono}`}>{student.studentCode}</p>
              </div>
            </div>

            <div className={S.infoRow}>
              <div className={`${S.infoIcon} ${S.cyan}`}>
                <IdCard size={20} />
              </div>
              <div className={S.infoContent}>
                <p className={S.infoLabel}>National Code</p>
                <p className={`${S.infoValue} ${S.infoMono}`}>{student.nationalCode}</p>
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
                    {student.enrollmentsCount} Active Classes
                  </p>
                  <span className={S.viewingBadge}>Viewing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
