import { useGetStudentByStudentCode } from "@/features/student";
import { StudentViews } from "../StudentViews";
import { ProfileHeader } from "../ProfileHeader";

export default function StudentProfile({ userCode }: { userCode: string }) {
  const { data: studentData, isFetching } =
    useGetStudentByStudentCode(userCode);

  if (isFetching) return <div>Đang tải thông tin Học viên...</div>;
  if (!studentData) return <div>Không tìm thấy Học viên.</div>;

  return (
    <>
      <section className="personal-page__header-block">
        <ProfileHeader profile={studentData} />
      </section>
      <section className="personal-page__content-block">
        <StudentViews data={studentData} />
      </section>
    </>
  );
}
