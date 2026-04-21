import { useGetCoachByStaffCode } from "@/features/coach";
import { ProfileHeader } from "../ProfileHeader";
import { TabViews } from '../TabViews';

export default function CoachProfile({ userCode }: { userCode: string }) {
  // Không cần enabled, vì component này đã render thì chắc chắn là Coach
  const { data: coachData, isFetching } = useGetCoachByStaffCode(userCode);

  if (isFetching) return <div>Đang tải thông tin HLV...</div>;
  if (!coachData) return <div>Không tìm thấy HLV.</div>;

  return (
    <>
      <section className="personal-page__header-block">
        <ProfileHeader profile={coachData} />
      </section>
      <section className="personal-page__content-block">
        <TabViews userInfo={coachData} userType="coach" />
      </section>
    </>
  );
}
