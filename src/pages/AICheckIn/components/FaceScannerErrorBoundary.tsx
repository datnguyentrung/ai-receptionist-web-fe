import { Component, type ErrorInfo, type ReactNode } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";
import styles from "../AICheckIn.module.scss";

interface FaceScannerErrorBoundaryProps {
  children: ReactNode;
}

interface FaceScannerErrorBoundaryState {
  hasError: boolean;
}

export class FaceScannerErrorBoundary extends Component<
  FaceScannerErrorBoundaryProps,
  FaceScannerErrorBoundaryState
> {
  state: FaceScannerErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): FaceScannerErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("FaceScanner failed to render:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className={styles.faceScannerError} role="alert">
        <CircleAlert size={28} aria-hidden="true" />
        <div>
          <h2>Không thể mở AI khuôn mặt</h2>
          <p>Đã xảy ra lỗi khi tải camera nhận diện. Vui lòng tải lại và thử lại.</p>
        </div>
        <button type="button" onClick={this.handleReload}>
          <RotateCcw size={18} aria-hidden="true" />
          Tải lại
        </button>
      </div>
    );
  }
}
