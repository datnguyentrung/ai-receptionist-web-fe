import { Button } from "@/components/ui/button";
import { ArrowLeft, House, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./AccessDeniedView.scss";

export function AccessDeniedView() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <main className="access-denied">
      <div className="access-denied__ambient access-denied__ambient--top" />
      <div className="access-denied__ambient access-denied__ambient--bottom" />

      <section
        className="access-denied__panel"
        aria-labelledby="access-denied-title"
      >
        <div className="access-denied__icon-wrap" aria-hidden="true">
          <ShieldAlert size={44} />
        </div>

        <div className="access-denied__content">
          <p className="access-denied__eyebrow">403 • Access Denied</p>
          <h1 id="access-denied-title" className="access-denied__title">
            Từ chối truy cập
          </h1>
          <p className="access-denied__subtitle">
            Rất tiếc, bạn không có quyền hạn để xem nội dung này. Vui lòng liên
            hệ quản trị viên nếu bạn nghĩ đây là sự nhầm lẫn.
          </p>
        </div>

        <div className="access-denied__actions">
          <Button
            type="button"
            variant="default"
            size="lg"
            className="access-denied__action access-denied__action--primary"
            onClick={handleGoHome}
          >
            <House size={18} />
            Quay lại Trang chủ
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="access-denied__action"
            onClick={handleGoBack}
          >
            <ArrowLeft size={18} />
            Quay lại trang trước
          </Button>
        </div>

        <p className="access-denied__hint">
          Nếu bạn cần quyền truy cập, hãy liên hệ quản trị viên hoặc thử đăng
          nhập bằng tài khoản phù hợp.
        </p>
      </section>
    </main>
  );
}
