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

import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Navigate, useParams } from "react-router-dom";
import { coachAPI } from "../../features/coach";
import { studentAPI } from "../../features/student";
import { useGetQuery } from "../../hooks/useCrud";
import { useAuthStore } from "../../store/authStore";
import type { CoachDetail, StudentDetail } from "../../types";
import { useRoleStudent } from "../../utils/roleUtils";
import ProfileHeader from "./components/ProfileHeader";
import { TabViews } from "./components/TabViews";
import S from "./PersonalPage.module.scss";

export default function PersonalPage() {
  const { canViewCoach, canViewManagerSenior } = useRoleStudent();
  const { userCode = "" } = useParams();

  const isCoach = userCode.startsWith("VQT");
  const isStudent = userCode.includes("_") && !isCoach;

  const user = useAuthStore((state) => state.activeProfile); // Lấy thông tin user đã đăng nhập từ Zustand Store

  // ---------------------------------------------------------------------------
  // 1. GỌI HOOKS Ở TOP LEVEL (Trước mọi câu lệnh if...return)
  // Sử dụng 'enabled' để tự động khóa/mở fetch API thay vì dùng if/else
  // ---------------------------------------------------------------------------
  const { data: coachData, isFetching: isFetchingCoach } = useGetQuery(
    ["coaches", userCode],
    () => coachAPI.getCoachByStaffCode(userCode),
    {
      // Chỉ fetch nếu đúng là mã Coach VÀ có quyền xem
      enabled: isCoach && canViewCoach,
      staleTime: 5 * 60 * 1000,
    },
  );

  const { data: studentData, isFetching: isFetchingStudent } = useGetQuery(
    ["students", userCode],
    () => studentAPI.getStudentByStudentCode(userCode),
    {
      // Chỉ fetch nếu đúng là mã Student
      enabled: isStudent,
      staleTime: 5 * 60 * 1000,
    },
  );

  // Lấy data tương ứng để truyền xuống component con
  const userInfo = isCoach ? coachData : studentData;

  console.log("Fetched User Info:", userInfo); // Debug: Kiểm tra dữ liệu nhận được từ API

  useDocumentTitle(
    userInfo?.fullName ? `${userInfo.fullName}` : "Đang tải...",
  );

  // ---------------------------------------------------------------------------
  // 2. XỬ LÝ ĐIỀU KIỆN RẼ NHÁNH (Early Returns) SAU KHI ĐÃ GỌI XONG HOOKS
  // ---------------------------------------------------------------------------
  if (isCoach && !canViewCoach) {
    return <Navigate to="/403" replace />;
  }

  if (!isCoach && !isStudent) {
    return <div>Mã định danh không hợp lệ.</div>;
  }

  // Gộp cờ loading
  if (isFetchingCoach || isFetchingStudent) {
    return <div>Đang tải thông tin...</div>;
  }

  if (!userInfo) {
    return <div>Không tìm thấy dữ liệu.</div>;
  }

  return (
    <div className={S.page}>
      <div className={S.container}>
        {/* Hero Section */}
        <ProfileHeader user={userInfo} currentUserData={user} />

        {/* Tab Navigation */}
        {/* Render TabViews rẽ nhánh để thỏa mãn TypeScript Discriminated Union */}
        {isCoach ? (
          <TabViews
            userType="coach"
            userInfo={userInfo as CoachDetail}
            canViewCoach={canViewCoach}
            canViewManagerSenior={canViewManagerSenior}
          />
        ) : (
          <TabViews
            userType="student"
            userInfo={userInfo as StudentDetail}
            canViewCoach={canViewCoach}
            canViewManagerSenior={canViewManagerSenior}
          />
        )}
      </div>
    </div>
  );
}
