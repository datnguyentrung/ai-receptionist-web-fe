import { type Belt, BeltLabel } from "../config/constants";

const BELT_MAP: Record<
  Belt,
  { bg: string; color: string; border: string; dot: string }
> = {
  C10: {
    bg: "#FFFFFF",
    color: "#374151",
    border: "#D1D5DB",
    dot: "#9CA3AF",
  },
  C9: {
    bg: "#FFFBEB",
    color: "#92400E",
    border: "#FDE68A",
    dot: "#F59E0B",
  },
  C8: {
    bg: "#FFFBEB",
    color: "#92400E",
    border: "#FDE68A",
    dot: "#F59E0B",
  },
  C7: {
    bg: "#F0FDF4",
    color: "#166534",
    border: "#86EFAC",
    dot: "#22C55E",
  },
  C6: {
    bg: "#EFF6FF",
    color: "#1E40AF",
    border: "#93C5FD",
    dot: "#3B82F6",
  },
  C5: {
    bg: "#EFF6FF",
    color: "#1E40AF",
    border: "#93C5FD",
    dot: "#3B82F6",
  },
  C4: {
    bg: "#FFF1F2",
    color: "#9F1239",
    border: "#FDA4AF",
    dot: "#F43F5E",
  },
  C3: {
    bg: "#FFF1F2",
    color: "#9F1239",
    border: "#FDA4AF",
    dot: "#F43F5E",
  },
  C2: {
    bg: "#FFF1F2",
    color: "#9F1239",
    border: "#FDA4AF",
    dot: "#F43F5E",
  },
  C1: {
    bg: "#FFF1F2",
    color: "#9F1239",
    border: "#FDA4AF",
    dot: "#F43F5E",
  },
  D1: {
    bg: "#1F2937",
    color: "#F9FAFB",
    border: "#374151",
    dot: "#6B7280",
  },
  D2: {
    bg: "#111827",
    color: "#F9FAFB",
    border: "#1F2937",
    dot: "#6B7280",
  },
  D3: {
    bg: "#111827",
    color: "#F9FAFB",
    border: "#1F2937",
    dot: "#6B7280",
  },
  D4: {
    bg: "#030712",
    color: "#F9FAFB",
    border: "#1F2937",
    dot: "#9CA3AF",
  },
  D5: {
    bg: "#030712",
    color: "#F9FAFB",
    border: "#1F2937",
    dot: "#9CA3AF",
  },
  D6: {
    bg: "#030712",
    color: "#F9FAFB",
    border: "#1F2937",
    dot: "#D1D5DB",
  },
  D7: {
    bg: "#030712",
    color: "#F9FAFB",
    border: "#1F2937",
    dot: "#D1D5DB",
  },
  D8: {
    bg: "#030712",
    color: "#F9FAFB",
    border: "#1F2937",
    dot: "#D1D5DB",
  },
  D9: {
    bg: "#030712",
    color: "#F9FAFB",
    border: "#1F2937",
    dot: "#D1D5DB",
  },
  D10: {
    bg: "#030712",
    color: "#F9FAFB",
    border: "#1F2937",
    dot: "#D1D5DB",
  },
};

export function BeltBadge({
  belt,
  size = "sm",
}: {
  belt: Belt;
  size?: "xs" | "sm" | "md";
}) {
  const style = BELT_MAP[belt] ?? {
    bg: "#F3F4F6",
    color: "#374151",
    border: "#E5E7EB",
    dot: "#9CA3AF",
  };

  const sizeStyles = {
    xs: { padding: "2px 8px", fontSize: "10px", dotSize: "6px" },
    sm: { padding: "3px 10px", fontSize: "11px", dotSize: "7px" },
    md: { padding: "5px 12px", fontSize: "12px", dotSize: "8px" },
  }[size];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border font-semibold"
      style={{
        background: style.bg,
        color: style.color,
        borderColor: style.border,
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span
        className="rounded-full shrink-0"
        style={{
          width: sizeStyles.dotSize,
          height: sizeStyles.dotSize,
          background: style.dot,
        }}
      />
      {BeltLabel[belt]}
    </span>
  );
}
