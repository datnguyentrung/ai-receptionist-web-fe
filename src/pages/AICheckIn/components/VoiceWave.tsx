import { Mic } from "lucide-react";
import styles from "./VoiceWave.module.scss";

export function VoiceWave() {
  return (
    <div className={styles.container}>
      <div className={styles.micCircle}>
        <Mic />
      </div>

      <div className={styles.bars}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.bar} />
        ))}
      </div>

      <span className={styles.label}>AI Assistant</span>
    </div>
  );
}
