import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Briefcase, Clock, Info, Mail, Users } from "lucide-react";
import type { ComponentProps } from "react";
import type { Coach } from "../../mockData";
import "./CoachViews.scss";

export function CoachViews({ data }: { data: Coach }) {
  const getStatusBadgeVariant = (
    status: string,
  ): ComponentProps<typeof Badge>["variant"] => {
    switch (status) {
      case "Active":
      case "Đã duyệt":
        return "default";
      case "Nghỉ phép":
      case "Chờ duyệt":
        return "secondary";
      case "Nghỉ việc":
      case "Inactive":
      case "Không hợp lệ":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Active":
      case "Đã duyệt":
        return "coach-views__status-badge coach-views__status-badge--success";
      case "Nghỉ phép":
      case "Chờ duyệt":
        return "coach-views__status-badge coach-views__status-badge--warning";
      case "Nghỉ việc":
      case "Inactive":
      case "Không hợp lệ":
        return "coach-views__status-badge coach-views__status-badge--danger";
      default:
        return "coach-views__status-badge coach-views__status-badge--neutral";
    }
  };

  const tabs = [
    {
      id: "info",
      label: "Thông tin Nhân sự",
      icon: <Info size={16} />,
      content: (
        <div className="coach-views__tab-panel">
          <h3 className="coach-views__section-title">Hồ sơ công việc</h3>
          <div className="coach-views__info-grid">
            <Card>
              <CardContent className="coach-views__card-content coach-views__card-content--compact">
                <div className="coach-views__icon-box coach-views__icon-box--indigo">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="coach-views__meta-label">Mã nhân sự</p>
                  <p className="coach-views__meta-value">{data.staffCode}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="coach-views__card-content coach-views__card-content--compact">
                <div className="coach-views__icon-box coach-views__icon-box--rose">
                  <Mail size={20} />
                </div>
                <div className="coach-views__meta-block coach-views__meta-block--grow">
                  <p className="coach-views__meta-label">Email công việc</p>
                  <p className="coach-views__meta-value coach-views__meta-value--truncate">
                    {data.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="coach-views__full-width-card">
              <CardContent className="coach-views__card-content coach-views__card-content--split">
                <div className="coach-views__meta-stack">
                  <p className="coach-views__meta-label">
                    Vai trò trên hệ thống
                  </p>
                  <p className="coach-views__meta-value">
                    {data.role === "MANAGER"
                      ? "Quản lý (Manager)"
                      : "Huấn luyện viên (Coach)"}
                  </p>
                </div>
                <div className="coach-views__meta-stack coach-views__meta-stack--right">
                  <p className="coach-views__meta-label">Trạng thái nhân sự</p>
                  <Badge
                    variant={getStatusBadgeVariant(data.coachStatus)}
                    className={getStatusBadgeClass(data.coachStatus)}
                  >
                    {data.coachStatus}
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
      label: "Lớp phụ trách",
      icon: <Users size={16} />,
      content: (
        <div className="coach-views__tab-panel coach-views__tab-panel--tight">
          <div className="coach-views__section-head">
            <h3 className="coach-views__section-title">
              Danh sách lớp được phân công
            </h3>
            <Badge variant="outline" className="coach-views__count-badge">
              {data.assignments.length} lớp
            </Badge>
          </div>
          <div className="coach-views__assignment-grid">
            {data.assignments.map((assignment) => (
              <Card
                key={assignment.id}
                className="coach-views__assignment-card"
              >
                <div
                  className={`coach-views__assignment-line ${assignment.assignmentStatus === "Active" ? "coach-views__assignment-line--active" : "coach-views__assignment-line--inactive"}`}
                />
                <CardContent className="coach-views__assignment-content">
                  <div className="coach-views__assignment-head">
                    <h4 className="coach-views__assignment-title">
                      {assignment.classSchedule}
                    </h4>
                    <Badge
                      variant={getStatusBadgeVariant(
                        assignment.assignmentStatus,
                      )}
                      className={getStatusBadgeClass(
                        assignment.assignmentStatus,
                      )}
                    >
                      {assignment.assignmentStatus}
                    </Badge>
                  </div>
                  <div className="coach-views__assignment-date">
                    <Clock size={14} className="coach-views__clock-icon" />
                    <span>
                      Nhận lớp từ:{" "}
                      {format(new Date(assignment.assignedDate), "dd/MM/yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "timesheet",
      label: "Bảng chấm công",
      icon: <Clock size={16} />,
      content: (
        <div className="coach-views__tab-panel coach-views__tab-panel--tight">
          <div className="coach-views__table-head">
            <h3 className="coach-views__section-title">
              Lịch sử dạy học & Chấm công
            </h3>
            <select className="coach-views__month-select">
              <option>Tháng 5/2024</option>
              <option>Tháng 4/2024</option>
            </select>
          </div>

          <div className="coach-views__table-card">
            <div className="coach-views__table-scroll">
              <table className="coach-views__table">
                <thead className="coach-views__table-head-row">
                  <tr>
                    <th className="coach-views__th">Ngày làm việc</th>
                    <th className="coach-views__th">Giờ Check-in</th>
                    <th className="coach-views__th">Lớp đã dạy</th>
                    <th className="coach-views__th coach-views__th--right">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.timesheets.map((record) => (
                    <tr key={record.id} className="coach-views__tr">
                      <td className="coach-views__td coach-views__td--strong">
                        {format(new Date(record.workingDate), "dd/MM/yyyy")}
                      </td>
                      <td className="coach-views__td coach-views__td--mono">
                        <div className="coach-views__checkin-wrap">
                          <span className="coach-views__dot" />
                          {record.checkInTime}
                        </div>
                      </td>
                      <td className="coach-views__td">
                        {record.classSchedule}
                      </td>
                      <td className="coach-views__td coach-views__td--right">
                        <Badge
                          variant={getStatusBadgeVariant(record.status)}
                          className={getStatusBadgeClass(record.status)}
                        >
                          {record.status}
                        </Badge>
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
  ];

  return (
    <Tabs defaultValue="info" className="coach-views">
      <TabsList className="coach-views__tabs-list">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="coach-views__tab-trigger"
          >
            <span className="coach-views__tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="coach-views__tab-content"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
