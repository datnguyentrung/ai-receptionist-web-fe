// Thêm component này bên ngoài/bên trên SessionLayout
import { useEffect, useState } from "react";

export function CountdownBadge({
  sessionDate,
  startTime,
}: {
  sessionDate?: string | Date;
  startTime?: string;
}) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!sessionDate || !startTime) return;

    // Bước 1: Gộp sessionDate và startTime thành 1 object Date hoàn chỉnh
    const targetDate = new Date(sessionDate);
    // Giả sử startTime có format là "HH:mm" hoặc "HH:mm:ss"
    const [hours, minutes, seconds] = startTime.split(":");
    targetDate.setHours(
      Number(hours || 0),
      Number(minutes || 0),
      Number(seconds || 0),
      0,
    );
    const targetTimeMs = targetDate.getTime();

    // Bước 2: Hàm tính toán và cập nhật thời gian
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetTimeMs - now;

      // Nếu đã qua giờ bắt đầu
      if (distance < 0) {
        setTimeLeft("Đang diễn ra");
        return;
      }

      // Tính toán giờ, phút, giây còn lại
      // Dùng tổng số giờ (Math.floor(distance / ...)) để lỡ còn > 24 tiếng thì nó hiển thị dạng 48:00:00 thay vì bị reset về 0
      const totalHours = Math.floor(distance / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      // Format thêm số 0 đằng trước nếu nhỏ hơn 10 (vd: 05 thay vì 5)
      const formattedTime = [
        totalHours.toString().padStart(2, "0"),
        m.toString().padStart(2, "0"),
        s.toString().padStart(2, "0"),
      ].join(":");

      setTimeLeft(formattedTime);
    };

    updateTimer(); // Gọi lần đầu ngay lập tức để không bị delay 1 giây

    // Bước 3: Set interval đếm ngược mỗi giây
    const intervalId = setInterval(updateTimer, 1000);

    // Dọn dẹp khi component unmount
    return () => clearInterval(intervalId);
  }, [sessionDate, startTime]);

  // Nếu không có dữ liệu thời gian, fallback về chữ mặc định
  if (!timeLeft) return <span>Sắp diễn ra</span>;

  // Nếu đã tới giờ
  if (timeLeft === "Đang diễn ra") return <span>{timeLeft}</span>;

  // Hiển thị đồng hồ đếm ngược
  return <span>⏳ {timeLeft}</span>;
}
