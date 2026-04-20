import styles from "./AssignmentSubjectHero.module.scss";

type AssignmentSubjectHeroProps = {
  subjectLabel: string;
  statusText?: string;
  name: string;
  codeLabel: string;
  codeValue: string;
  secondaryText?: string;
};

export function AssignmentSubjectHero({
  subjectLabel,
  statusText,
  name,
  codeLabel,
  codeValue,
  secondaryText,
}: AssignmentSubjectHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.labelRow}>
        <label className={styles.label}>{subjectLabel}</label>
        {statusText ? (
          <span className={styles.statusPill}>{statusText}</span>
        ) : null}
      </div>

      <div className={styles.infoBox}>
        <div className={styles.initial}>{name.slice(0, 2).toUpperCase()}</div>
        <div className={styles.infoText}>
          <div className={styles.nameText}>{name}</div>
          <div className={styles.metaText}>
            {codeLabel}: {codeValue}
            {secondaryText ? ` · ${secondaryText}` : ""}
          </div>
        </div>
      </div>
    </section>
  );
}
