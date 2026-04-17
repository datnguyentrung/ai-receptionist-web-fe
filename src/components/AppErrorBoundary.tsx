import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AppErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#F9FAFB",
        }}
      >
        <div
          style={{
            width: "min(560px, 100%)",
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "20px", color: "#111827" }}>
            Ứng dụng gặp lỗi ngoài dự kiến
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: "14px",
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            Hãy tải lại trang để tiếp tục. Nếu lỗi lặp lại, vui lòng kiểm tra dữ
            liệu đầu vào hoặc liên hệ đội phát triển.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              marginTop: "16px",
              border: "none",
              borderRadius: "8px",
              padding: "10px 14px",
              background: "#DC2626",
              color: "#FFFFFF",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }
}
