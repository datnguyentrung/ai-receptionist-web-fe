import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  Activity,
  BookOpen,
  Clock,
  CreditCard,
  Info,
  MapPin,
} from "lucide-react";
import type { ComponentProps } from "react";
import type { Student } from "../../mockData";
import "./StudentViews.scss";

export function StudentViews({ data }: { data: Student }) {
  const getStatusBadgeVariant = (
    status: string,
  ): ComponentProps<typeof Badge>["variant"] => {
    switch (status) {
      case "Đang học":
      case "Active":
      case "Có mặt":
        return "default";
      case "Bảo lưu":
        return "secondary";
      case "Nghỉ học":
      case "Kết thúc":
      case "Vắng":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Đang học":
      case "Active":
      case "Có mặt":
        return "student-views__status-badge student-views__status-badge--success";
      case "Bảo lưu":
        return "student-views__status-badge student-views__status-badge--warning";
      case "Nghỉ học":
      case "Kết thúc":
      case "Vắng":
        return "student-views__status-badge student-views__status-badge--danger";
      default:
        return "student-views__status-badge student-views__status-badge--neutral";
    }
  };

  const tabs = [
    {
      id: "info",
      label: "Thông tin Học viên",
      icon: <Info size={16} />,
      content: (
        <div className="student-views__tab-panel">
          <h3 className="student-views__section-title">
            Chi tiết tài khoản học viên
          </h3>
          <div className="student-views__info-grid">
            <Card>
              <CardContent className="student-views__card-content student-views__card-content--compact">
                <div className="student-views__icon-box student-views__icon-box--blue">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="student-views__meta-label">Mã học viên</p>
                  <p className="student-views__meta-value">
                    {data.studentCode}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="student-views__card-content student-views__card-content--compact">
                <div className="student-views__icon-box student-views__icon-box--emerald">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="student-views__meta-label">Ngày bắt đầu tập</p>
                  <p className="student-views__meta-value">
                    {format(new Date(data.startDate), "dd/MM/yyyy")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="student-views__full-width-card">
              <CardContent className="student-views__card-content student-views__card-content--split">
                <div className="student-views__branch-wrap">
                  <div className="student-views__icon-box student-views__icon-box--amber">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="student-views__meta-label">
                      Chi nhánh theo học
                    </p>
                    <p className="student-views__meta-value">{data.branch}</p>
                  </div>
                </div>
                <div className="student-views__meta-stack student-views__meta-stack--right">
                  <p className="student-views__meta-label">
                    Trạng thái hiện tại
                  </p>
                  <Badge
                    variant={getStatusBadgeVariant(data.studentStatus)}
                    className={getStatusBadgeClass(data.studentStatus)}
                  >
                    {data.studentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "classes",
      label: "Lớp học & Lịch sử",
      icon: <BookOpen size={16} />,
      content: (
        <div className="student-views__tab-panel student-views__tab-panel--tight">
          <h3 className="student-views__section-title student-views__section-title--with-gap">
            Danh sách lớp đăng ký
          </h3>
          {data.enrollments.map((enrollment) => (
            <Card
              key={enrollment.id}
              className="student-views__enrollment-card"
            >
              <CardContent className="student-views__enrollment-content">
                <div className="student-views__enrollment-row">
                  <div className="student-views__enrollment-main">
                    <h4 className="student-views__enrollment-title">
                      {enrollment.classSchedule}
                    </h4>
                    <p className="student-views__enrollment-subline">
                      <Clock size={14} /> Tham gia:{" "}
                      {format(new Date(enrollment.joinDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div className="student-views__enrollment-side">
                    <Badge
                      variant={getStatusBadgeVariant(enrollment.status)}
                      className={getStatusBadgeClass(enrollment.status)}
                    >
                      {enrollment.status}
                    </Badge>
                    {enrollment.note && (
                      <span className="student-views__enrollment-note">
                        "{enrollment.note}"
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: "attendance",
      label: "Tiến trình & Điểm danh",
      icon: <Activity size={16} />,
      content: (
        <div className="student-views__tab-panel student-views__tab-panel--tight">
          <h3 className="student-views__section-title student-views__section-title--with-gap">
            Lịch sử điểm danh gần đây
          </h3>
          <div className="student-views__table-card">
            <div className="student-views__table-scroll">
              <table className="student-views__table">
                <thead className="student-views__table-head-row">
                  <tr>
                    <th className="student-views__th">Ngày</th>
                    <th className="student-views__th">Trạng thái</th>
                    <th className="student-views__th">Giờ Check-in</th>
                    <th className="student-views__th">Đánh giá</th>
                    <th className="student-views__th">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attendance.map((record) => (
                    <tr key={record.id} className="student-views__tr">
                      <td className="student-views__td student-views__td--strong">
                        {format(new Date(record.sessionDate), "dd/MM/yyyy")}
                      </td>
                      <td className="student-views__td">
                        <Badge
                          variant={getStatusBadgeVariant(
                            record.attendanceStatus,
                          )}
                          className={getStatusBadgeClass(
                            record.attendanceStatus,
                          )}
                        >
                          {record.attendanceStatus}
                        </Badge>
                      </td>
                      <td className="student-views__td student-views__td--mono">
                        {record.checkInTime || "-"}
                      </td>
                      <td className="student-views__td">
                        <span
                          className={`student-views__evaluation ${record.evaluationStatus === "Tốt" ? "student-views__evaluation--good" : record.evaluationStatus === "Không đạt" ? "student-views__evaluation--bad" : "student-views__evaluation--pass"}`}
                        >
                          {record.evaluationStatus}
                        </span>
                      </td>
                      <td
                        className="student-views__td student-views__td--note"
                        title={record.note}
                      >
                        {record.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "tuition",
      label: "Học phí",
      icon: <CreditCard size={16} />,
      content: (
        <div className="student-views__tab-panel student-views__tab-panel--tight">
          <h3 className="student-views__section-title student-views__section-title--with-gap">
            Lịch sử đóng học phí
          </h3>
          <div className="student-views__tuition-grid">
            {data.tuition.map((record) => (
              <Card key={record.id} className="student-views__tuition-card">
                <CardContent className="student-views__tuition-content">
                  <div className="student-views__tuition-main">
                    <div className="student-views__tuition-amount-row">
                      <h4 className="student-views__tuition-amount">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(record.totalAmount)}
                      </h4>
                      <Badge
                        variant="default"
                        className="student-views__paid-badge"
                      >
                        Đã thanh toán
                      </Badge>
                    </div>
                    <p className="student-views__tuition-time">
                      Thanh toán lúc:{" "}
                      {format(new Date(record.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                  <div className="student-views__tuition-meta">
                    <p>
                      <span className="student-views__tuition-key">
                        Tháng học:
                      </span>{" "}
                      {record.forMonth}/{record.forYear}
                    </p>
                    <p>
                      <span className="student-views__tuition-key">Lớp:</span>{" "}
                      {record.enrollment}
                    </p>
                    <p className="student-views__tuition-allocation">
                      Phân bổ:{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(record.amountAllocated)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Tabs defaultValue="info" className="student-views">
      <TabsList className="student-views__tabs-list">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="student-views__tab-trigger"
          >
            <span className="student-views__tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="student-views__tab-content"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
