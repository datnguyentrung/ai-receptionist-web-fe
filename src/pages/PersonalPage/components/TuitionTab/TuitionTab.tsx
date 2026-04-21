import './TuitionTab.scss';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateDMYHM } from "@/utils/format";

export default function TuitionTab() {
  return(
    <div className="student-views__tab-panel student-views__tab-panel--tight">
          <h3 className="student-views__section-title student-views__section-title--with-gap">
            Lịch sử đóng học phí
          </h3>
          <div className="student-views__tuition-grid">
            {tuition.length === 0 ? (
              <Card className="student-views__tuition-card">
                <CardContent className="student-views__tuition-content">
                  Chưa có dữ liệu học phí.
                </CardContent>
              </Card>
            ) : (
              tuition.map((record) => (
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
                         {formatDateDMYHM(record.createdAt)}
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
               ))
             )}
           </div>
         </div>
  )
}
