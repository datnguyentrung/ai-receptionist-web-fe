import { studentAPI } from "@/features/student/api/studentAPI";
import { useGetQuery } from "@/hooks/useCrud";
import  ProfileHeader  from "../ProfileHeader";
import { TabViews } from "../TabViews";

export default function StudentProfile({ userCode }: { userCode: string }) {
  const { data: studentData, isFetching } = useGetQuery(
    ["students", userCode],
    () => studentAPI.getStudentByStudentCode(userCode),
    { enabled: !!userCode, staleTime: 5 * 60 * 1000 },
  );

  if (isFetching) return <div>Đang tải thông tin Học viên...</div>;
  if (!studentData) return <div>Không tìm thấy Học viên.</div>;

  return (
    <>
      <section className="personal-page__header-block">
        <ProfileHeader profile={studentData} />
      </section>
      <section className="personal-page__content-block">
        <TabViews userInfo={studentData} userType="student" />
      </section>
    </>
  );
}
