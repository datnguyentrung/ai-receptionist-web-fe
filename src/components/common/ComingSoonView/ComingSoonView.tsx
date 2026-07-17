import { Hammer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import S from "./ComingSoonView.module.scss";

export interface ComingSoonViewProps {
  featureName?: string;
  description?: string;
  expectedDate?: string;
  onBackClick?: () => void;
}

export default function ComingSoonView({
  featureName = "Tính năng này",
  description = "Chúng tôi đang nỗ lực hoàn thiện trải nghiệm cho khu vực này.",
  expectedDate,
  onBackClick,
}: ComingSoonViewProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    // <div className={S.container}>
    <div className={S.content}>
      <div className={S.iconWrapper}>
        <Hammer className={S.icon} strokeWidth={2} />
      </div>

      <h2 className={S.title}>{featureName}</h2>

      <p className={S.description}>{description}</p>

      {expectedDate && (
        <p className={S.expectedDate}>Dự kiến: {expectedDate}</p>
      )}

      <button className={S.backButton} onClick={handleBack}>
        ← Quay lại trang trước
      </button>
    </div>
    // </div>
  );
}
