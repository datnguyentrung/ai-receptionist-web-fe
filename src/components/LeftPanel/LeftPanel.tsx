import styles from "./LeftPanel.module.scss";
import logoImage from "/taekwondo.jpg";

export default function LeftPanel() {
  return (
    <div className={styles.leftPanel}>
      {/* Abstract SVG decorations */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        viewBox="0 0 480 560"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="80" cy="100" r="130" fill="rgba(255,100,100,0.18)" />
        <circle cx="400" cy="460" r="110" fill="rgba(255,100,100,0.15)" />
        <path
          d="M 0 500 Q 200 300 420 80"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
          fill="none"
          filter="url(#glow2)"
        />
        <path
          d="M 0 540 Q 220 340 460 100"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 60 560 Q 250 370 480 130"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M -30 180 Q 220 260 480 160"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M -30 220 Q 220 300 480 200"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          fill="none"
        />
        <polygon
          points="60,60 80,72 80,96 60,108 40,96 40,72"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
          fill="rgba(255,255,255,0.05)"
        />
        <polygon
          points="400,420 418,431 418,453 400,464 382,453 382,431"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          fill="rgba(255,255,255,0.04)"
        />
        <circle
          cx="60"
          cy="84"
          r="5"
          fill="white"
          opacity="0.8"
          filter="url(#glow2)"
        />
        <circle cx="60" cy="84" r="12" fill="rgba(255,255,255,0.12)" />
        <circle
          cx="400"
          cy="440"
          r="5"
          fill="white"
          opacity="0.75"
          filter="url(#glow2)"
        />
        <line
          x1="60"
          y1="84"
          x2="420"
          y2="98"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      </svg>

      {/* Logo & brand content */}
      <div className={styles.leftPanelContent}>
        <div className={styles.logoWrapper}>
          <img
            src={logoImage}
            alt="Hệ Thống Taekwondo Văn Quán"
            className={styles.logoImage}
          />
        </div>

        <div className={styles.welcomeText}>
          <p className={styles.welcomeTitle}>Chào mừng trở lại</p>
          <p className={styles.welcomeSubtitle}>Đăng nhập để quản lý hệ thống</p>
        </div>

        <div className={styles.brandDivider}>
          <div className={styles.brandDividerLine} />
          <div className={styles.brandDividerDot} />
          <div className={styles.brandDividerLine} />
        </div>
      </div>
    </div>
  );
}
