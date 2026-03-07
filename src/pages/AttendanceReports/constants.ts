import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

export const PIE_DATA = [
  { name: "Có mặt", value: 64, color: "#10B981" },
  { name: "Đi muộn", value: 18, color: "#F59E0B" },
  { name: "Có phép", value: 10, color: "#6366F1" },
  { name: "Vắng", value: 8, color: "#EF4444" },
];

export const SUMMARY_CARDS = [
  {
    label: "Có mặt",
    value: "64%",
    icon: CheckCircle2,
    color: "#10B981",
    bg: "#D1FAE5",
  },
  {
    label: "Đi muộn",
    value: "18%",
    icon: Clock,
    color: "#F59E0B",
    bg: "#FEF3C7",
  },
  {
    label: "Có phép",
    value: "10%",
    icon: AlertCircle,
    color: "#6366F1",
    bg: "#E0E7FF",
  },
  {
    label: "Vắng mặt",
    value: "8%",
    icon: XCircle,
    color: "#EF4444",
    bg: "#FEE2E2",
  },
];
