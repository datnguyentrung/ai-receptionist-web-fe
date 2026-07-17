import { useEffect, useState } from "react";

export function CountdownBadge({
  sessionDate,
  startTime,
  endTime,
}: {
  sessionDate?: string | Date;
  startTime?: string;
  endTime?: string;
}) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!sessionDate || !startTime) return;

    // Tạo một baseDate gốc để tái sử dụng
    const baseDate = new Date(sessionDate);

    // Hàm phụ trợ: Chuyển đổi chuỗi giờ (VD: "14:30") thành timestamp (milliseconds)
    const parseTimeToMs = (timeStr: string) => {
      const d = new Date(baseDate.getTime()); // Clone ra để không mutate baseDate
      const [hours, minutes, seconds] = timeStr.split(":");
      d.setHours(
        Number(hours || 0),
        Number(minutes || 0),
        Number(seconds || 0),
        0,
      );
      return d.getTime();
    };

    const startMs = parseTimeToMs(startTime);
    const endMs = endTime ? parseTimeToMs(endTime) : 0;

    // Hàm phụ trợ: Format mili-giây sang định dạng HH:mm:ss
    const formatTime = (distance: number) => {
      const totalHours = Math.floor(distance / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      return [
        totalHours.toString().padStart(2, "0"),
        m.toString().padStart(2, "0"),
        s.toString().padStart(2, "0"),
      ].join(":");
    };

    // Hàm chính tính toán và cập nhật thời gian
    const updateTimer = () => {
      const now = new Date().getTime();

      // 1. Chưa đến giờ bắt đầu
      if (now < startMs) {
        setDisplayText(`⏳ Diễn ra sau ${formatTime(startMs - now)}`);
        return;
      }

      // 2. Đã bắt đầu nhưng API/Data không trả về endTime
      if (!endTime) {
        setDisplayText("Đang diễn ra");
        return;
      }

      // 3. Đang trong thời gian diễn ra (giữa startMs và endMs)
      if (now >= startMs && now < endMs) {
        setDisplayText(`⏳ Kết thúc sau ${formatTime(endMs - now)}`);
        return;
      }

      // 4. Đã qua giờ kết thúc
      if (now >= endMs) {
        // setDisplayText("Đã kết thúc");
        return null;
      }
    };

    updateTimer(); // Gọi lần đầu ngay lập tức

    // Set interval đếm ngược mỗi giây
    const intervalId = setInterval(updateTimer, 1000);

    // Dọn dẹp khi component unmount
    return () => clearInterval(intervalId);
  }, [sessionDate, startTime, endTime]);

  // Render HTML rất đơn giản vì chuỗi đã được xử lý xong ở trên
  if (!displayText) return <span>Sắp diễn ra</span>;

  return <span>{displayText}</span>;
}
