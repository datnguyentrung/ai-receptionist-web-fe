// import React, { Suspense } from "react";
// import { Navigate, useParams } from "react-router-dom";
// import { useRoleStudent } from "../../utils/roleUtils";
// import "./PersonalPage.scss";

// // Kỹ thuật Lazy Load: Phân tách bundle code.
// // Ai vào trang của Student thì trình duyệt mới tải StudentProfile và ngược lại.
// const CoachProfile = React.lazy(() => import("./components/CoachProfile"));
// const StudentProfile = React.lazy(() => import("./components/StudentProfile"));

// export default function PersonalPage() {
//   const { canViewCoach } = useRoleStudent();
//   const { userCode = "" } = useParams();

//   const isCoach = userCode.startsWith("VQT");
//   const isStudent = userCode.includes("_") && !isCoach;

//   // Xử lý bảo mật: Trực quan, dễ đọc ngay từ dòng đầu tiên
//   if (isCoach && !canViewCoach) {
//     return <Navigate to="/403" replace />;
//   }

//   // Fallback khi code chưa hợp lệ
//   if (!isCoach && !isStudent) {
//     return <div>Mã định danh không hợp lệ.</div>;
//   }

//   // Render Component dựa trên phân loại
//   return (
//     <main className="personal-page">
//       <Suspense fallback={<div>Đang phân tích giao diện...</div>}>
//         {isCoach ? (
//           <CoachProfile userCode={userCode} />
//         ) : (
//           <StudentProfile userCode={userCode} />
//         )}
//       </Suspense>
//     </main>
//   );
// }

import { useState } from "react";
import PersonalInfoTab from "./components/PersonalInfoTab";
import ProfileHeader from "./components/ProfileHeader";
import S from "./PersonalPage.module.scss";
import { useRoleStudent } from '../../utils/roleUtils';
import { Navigate, useParams } from 'react-router-dom';

// Mock Data
const mockUserData = {
  fullName: "Jin-Woo Sung",
  belt: "Black Belt 1st Dan",
  role: "Student",
  gender: "Male",
  birthDate: "12 Apr 2005",
  phone: "+1 (555) 019-2834",
  email: "jinwoo.sung@dojo.com",
  avatarUrl:
    "https://images.unsplash.com/photo-1770392988936-dc3d8581e0c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGFzaWFuJTIwbWFsZXxlbnwxfHx8fDE3NzY4NzEzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  coverUrl:
    "https://images.unsplash.com/photo-1717303423995-40b734d1daa5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGFzaWFuJTIwbWFsZXxlbnwxfHx8fDE3NzY4NzEzNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
};

const mockStudentInfo = {
  userId: "USR-8F72C1A9",
  gender: "Male",
  birthDate: "April 12, 2005",
  createdAt: "January 15, 2023",
  branchName: "Downtown Elite Center",
  studentCode: "STD-2023-042",
  nationalCode: "123-456-789",
  enrollmentsCount: 3,
  status: "Active",
  role: "Elite Student",
  email: "jinwoo.sung@dojo.com",
  lastLogin: "2 hours ago",
};

export default function PersonalPage() {
  const [activeTab, setActiveTab] = useState<
    "personal" | "classes" | "payments"
  >("personal");

    const { canViewCoach } = useRoleStudent();
    const { userCode = "" } = useParams();

    const isCoach = userCode.startsWith("VQT");
    const isStudent = userCode.includes("_") && !isCoach;

    // Xử lý bảo mật: Trực quan, dễ đọc ngay từ dòng đầu tiên
    if (isCoach && !canViewCoach) {
      return <Navigate to="/403" replace />;
    }

    // Fallback khi code chưa hợp lệ
    if (!isCoach && !isStudent) {
      return <div>Mã định danh không hợp lệ.</div>;
    }

  return (
    <div className={S.page}>
      <div className={S.container}>
        {/* Hero Section */}
        <ProfileHeader user={mockUserData} />

        {/* Tab Navigation */}
        <div className={S.tabNav}>
          <button
            onClick={() => setActiveTab("personal")}
            className={`${S.tabButton} ${activeTab === "personal" ? S.active : S.inactive}`}
          >
            Personal Info
          </button>

          <button
            onClick={() => setActiveTab("classes")}
            className={`${S.tabButton} ${activeTab === "classes" ? S.active : S.inactive}`}
          >
            Classes
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`${S.tabButton} ${activeTab === "payments" ? S.active : S.inactive}`}
          >
            Payments
          </button>
        </div>

        {/* Tab Content */}
        <div className={S.tabContent}>
          {activeTab === "personal" && (
            <PersonalInfoTab student={mockStudentInfo} />
          )}
          {activeTab === "classes" && (
            <div className={S.placeholderCard}>
              <div className={S.placeholderIcon}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className={S.placeholderTitle}>Classes Schedule</h3>
              <p className={S.placeholderDesc}>
                The classes schedule feature is currently under construction.
              </p>
            </div>
          )}
          {activeTab === "payments" && (
            <div className={S.placeholderCard}>
              <div className={S.placeholderIcon}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className={S.placeholderTitle}>Payment History</h3>
              <p className={S.placeholderDesc}>
                Payment records will be displayed here soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
