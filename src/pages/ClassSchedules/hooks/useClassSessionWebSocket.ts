import type { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useClassSessionWebSocket(queryClient: QueryClient) {
  useEffect(() => {
    const apiBaseUrl =
      import.meta.env.VITE_API_URL_JAVA || "http://localhost:8080";

    // Lấy ra phần gốc (origin), ví dụ từ "http://localhost:8080/api/v1" nó chỉ lấy "http://localhost:8080"
    const baseUrlOrigin = new URL(apiBaseUrl).origin;

    const wsUrl = baseUrlOrigin
      .replace(/^http:/, "ws:")
      .replace(/^https:/, "wss:")
      .concat("/ws/class-sessions");

    let ws: WebSocket | null = null;
    let shouldReconnect = true;
    let reconnectAttempt = 0;
    let reconnectTimer: number | undefined;

    const invalidateSessions = () => {
      // React Query sẽ refetch các query đang active khi bị invalidate.
      queryClient.invalidateQueries({ queryKey: ["class-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["class-schedules"] });
    };

    const scheduleInvalidateSafely = () => {
      // NOTE: Scheduler jobs của BE đang broadcast trong @Transactional
      // (chưa afterCommit), nên có thể refetch quá sớm và vẫn ra data cũ.
      // Làm 2 nhịp: invalidate ngay, rồi refetch lại sau một nhịp ngắn.
      invalidateSessions();
      window.setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: ["class-sessions"],
          type: "active",
        });
        queryClient.refetchQueries({
          queryKey: ["class-schedules"],
          type: "active",
        });
      }, 600);
    };

    const connect = () => {
      if (!shouldReconnect) {
        return;
      }

      try {
        ws = new WebSocket(wsUrl);
      } catch (error) {
        console.error("❌ [ClassSchedules] WS init error:", error);
        return;
      }

      ws.onopen = () => {
        reconnectAttempt = 0;
        console.log("✅ [ClassSchedules] WS connected:", wsUrl);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const type = String(message?.type ?? "");
          console.log("🔥 [ClassSchedules] WS event:", type);

          const isSessionEvent =
            /SESSION/i.test(type) &&
            /(ACTIVATED|COMPLETED|CREATED|UPDATED|DELETED|GENERATED)/i.test(
              type,
            );

          if (!isSessionEvent) {
            return;
          }

          // Scheduler jobs đang broadcast ngay trong @Transactional, có thể race trước commit.
          // CRUD handlers dùng broadcastAfterCommit nên invalidate 1 nhịp là đủ.
          const schedulerTypes = [
            "SESSIONS_ACTIVATED",
            "SESSION_COMPLETED",
            "SESSIONS_GENERATED",
          ];

          if (schedulerTypes.includes(type)) {
            scheduleInvalidateSafely();
            return;
          }

          invalidateSessions();
        } catch (error) {
          console.error("❌ [ClassSchedules] WS parse error:", error);
        }
      };

      ws.onerror = (event) => {
        console.error("❌ [ClassSchedules] WS error:", event);
        // Để onclose xử lý reconnect.
      };

      ws.onclose = () => {
        if (!shouldReconnect) {
          return;
        }

        // Exponential backoff (max ~30s)
        const delayMs = Math.min(30_000, 500 * 2 ** reconnectAttempt);
        reconnectAttempt += 1;
        window.clearTimeout(reconnectTimer);
        reconnectTimer = window.setTimeout(() => {
          connect();
        }, delayMs);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;
      window.clearTimeout(reconnectTimer);
      try {
        ws?.close();
      } catch {
        // ignore
      }
      ws = null;
    };
  }, [queryClient]);
}
