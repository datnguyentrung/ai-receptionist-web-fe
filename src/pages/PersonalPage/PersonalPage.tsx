import React, { Suspense } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useRoleStudent } from "../../utils/roleUtils";
import "./PersonalPage.scss";

// Kỹ thuật Lazy Load: Phân tách bundle code.
// Ai vào trang của Student thì trình duyệt mới tải StudentProfile và ngược lại.
const CoachProfile = React.lazy(() => import("./components/CoachProfile"));
const StudentProfile = React.lazy(() => import("./components/StudentProfile"));

export default function PersonalPage() {
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

  // Render Component dựa trên phân loại
  return (
    <main className="personal-page">
      <Suspense fallback={<div>Đang phân tích giao diện...</div>}>
        {isCoach ? (
          <CoachProfile userCode={userCode} />
        ) : (
          <StudentProfile userCode={userCode} />
        )}
      </Suspense>
    </main>
  );
}
