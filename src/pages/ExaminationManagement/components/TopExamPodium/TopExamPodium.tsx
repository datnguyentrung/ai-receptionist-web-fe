import logoImage from "@/assets/taekwondo.jpg";
import "./TopExamPodium.scss";

export type TopExamStudent = {
  studentId: string;
  fullName: string;
  totalScore: number;
};

type TopExamPodiumProps = {
  students: TopExamStudent[];
};

type PodiumSlot = {
  visualRank: 1 | 2 | 3;
  student?: TopExamStudent;
};

const PODIUM_DISPLAY_ORDER: Array<1 | 2 | 3> = [3, 1, 2];

function buildSlots(students: TopExamStudent[]): PodiumSlot[] {
  const rankMap = new Map<number, TopExamStudent>();

  students.slice(0, 3).forEach((student, index) => {
    rankMap.set(index + 1, student);
  });

  return PODIUM_DISPLAY_ORDER.map((visualRank) => ({
    visualRank,
    student: rankMap.get(visualRank),
  }));
}

export default function TopExamPodium({ students }: TopExamPodiumProps) {
  const slots = buildSlots(students);

  return (
    <section
      className="top-exam-podium"
      aria-label="Vinh danh học viên điểm cao"
    >
      <div className="top-exam-podium__header">
        <h3>Vinh danh học viên xuất sắc</h3>
        <p>Top 3 điểm cao nhất trong đợt lọc hiện tại</p>
      </div>

      <div className="top-exam-podium__stage">
        {slots.map((slot) => {
          const { visualRank, student } = slot;
          const className = `top-exam-podium__item rank-${visualRank}`;

          return (
            <article key={visualRank} className={className}>
              <div className="top-exam-podium__card">
                {visualRank === 1 && (
                  <img
                    src={logoImage}
                    alt="Taekwondo"
                    className="top-exam-podium__logo"
                  />
                )}

                <span className="top-exam-podium__rank-label">
                  Top {visualRank}
                </span>

                {student ? (
                  <>
                    <h4>{student.fullName}</h4>
                    <p className="top-exam-podium__student-id">
                      {student.studentId}
                    </p>
                    <p className="top-exam-podium__score">
                      {student.totalScore} điểm
                    </p>
                  </>
                ) : (
                  <>
                    <h4>Chưa có dữ liệu</h4>
                    <p className="top-exam-podium__student-id">-</p>
                    <p className="top-exam-podium__score">0 điểm</p>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
