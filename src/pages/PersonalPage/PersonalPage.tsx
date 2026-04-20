import { CoachViews } from "./components/CoachViews/CoachViews";
import { ProfileHeader } from "./components/ProfileHeader/ProfileHeader";
import { StudentViews } from "./components/StudentViews/StudentViews";
import { mockCoach, mockStudent, type Role } from "./mockData";
import "./PersonalPage.scss";

export default function PersonalPage() {
  const currentRole: Role = mockStudent.role;
  const currentProfile = currentRole === "STUDENT" ? mockStudent : mockCoach;

  return (
    <main className="personal-page">
      <section className="personal-page__header-block">
        <ProfileHeader profile={currentProfile} />
      </section>

      <section className="personal-page__content-block">
        {currentRole === "STUDENT" ? (
          <StudentViews data={mockStudent} />
        ) : (
          <CoachViews data={mockCoach} />
        )}
      </section>
    </main>
  );
}
