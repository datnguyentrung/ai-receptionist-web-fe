import {
  SKILL_LEVEL_LABELS,
  type SkillLevel,
} from "@/config/constants/SkillEnums";
import { fitnessAPI } from "@/features/fitness/apis/FitnessAPI";
import { useGetQuery } from "@/hooks/useCrud";
import type { Fitness } from "@/types/Core/FitnessTypes";
import { Skeleton } from "boneyard-js/react";
import styles from "./FitnessStandards.module.scss";

function getSpeed(amount: number, duration: number) {
  if (!duration) return 0;
  return amount / duration;
}

export default function FitnessStandards({
  skillLevel,
}: {
  skillLevel: SkillLevel;
}) {
  const query = useGetQuery<Fitness[]>(
    ["fitness-standards", skillLevel],
    () => fitnessAPI.getFitnessBySkillLevel(skillLevel),
    {},
  );

  if (query.isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.subtitle}>
          Mức: {SKILL_LEVEL_LABELS[skillLevel]}
        </div>
        <div className={styles.loadingBar} aria-hidden="true">
          <span className={styles.loadingBar__track} />
        </div>

        <Skeleton
          loading
          name="fitness-standards"
          fallback={<StandardsTableSkeleton />}
        >
          <StandardsTable items={[]} />
        </Skeleton>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className={styles.container}>
        <div className={styles.subtitle}>
          Mức: {SKILL_LEVEL_LABELS[skillLevel]}
        </div>
        <div className={styles.error}>Không thể tải dữ liệu.</div>
      </div>
    );
  }

  const items = query.data ?? [];

  const isRefreshing = query.isFetching;

  return (
    <div className={styles.container}>
      <div className={styles.subtitle}>
        Mức: {SKILL_LEVEL_LABELS[skillLevel]}
      </div>

      {isRefreshing ? (
        <div className={styles.loadingBar} aria-hidden="true">
          <span className={styles.loadingBar__track} />
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className={styles.empty}>Chưa có dữ liệu</div>
      ) : (
        <StandardsTable items={items} />
      )}
    </div>
  );
}

function StandardsTable({ items }: { items: Fitness[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>STT</th>
          <th>Cấp độ</th>
          <th>Mức kỹ năng</th>
          <th>Thời lượng (giây)</th>
          <th>Số lượng</th>
          <th>Tốc độ (đòn/10 giây)</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it, idx) => (
          <tr key={idx}>
            <td className={styles.indexCol}>{idx + 1}</td>
            <td>
              <span className={styles.levelBadge}>Lv.{it.fitnessLevel}</span>
            </td>
            <td>{SKILL_LEVEL_LABELS[it.skillLevel] ?? it.skillLevel}</td>
            <td>{it.duration}</td>
            <td>{it.amount}</td>
            <td>{getSpeed(it.amount, it.duration / 10).toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StandardsTableSkeleton() {
  return (
    <div className={styles.loadingTable}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className={styles.loadingRow}>
          <span className={styles.loadingCellSm} />
          <span className={styles.loadingCellMd} />
          <span className={styles.loadingCellMd} />
          <span className={styles.loadingCellLg} />
          <span className={styles.loadingCellMd} />
          <span className={styles.loadingCellSm} />
        </div>
      ))}
    </div>
  );
}
