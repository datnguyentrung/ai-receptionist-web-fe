import { useState } from "react";
import EntranceExam from "./components/EntranceExam/EntranceExam";
import SelectViewExam, {
  type ExamViewKey,
} from "./components/SelectViewExam/SelectViewExam";
import "./ExaminationManagement.scss";

export default function ExaminationManagement() {
  const [activeTab, setActiveTab] = useState<ExamViewKey>("entrance");

  const renderContent = () => {
    if (activeTab === "entrance") {
      return <EntranceExam />;
    }

    return (
      <div className="examination-management-placeholder">
        <h2>Tính năng đang được phát triển</h2>
        <p>
          Chế độ này chưa được thiết kế ở giai đoạn hiện tại. Vui lòng chọn
          "Kiểm tra đầu vào" để xem dữ liệu tổng hợp.
        </p>
      </div>
    );
  };

  return (
    <div className="examination-management-page">
      <header className="examination-management-header">
        <h1>Quản lý Khảo thí</h1>
        {/* <p>Quản lý Khảo thí</p> */}
      </header>

      <SelectViewExam activeTab={activeTab} onTabChange={setActiveTab} />

      {renderContent()}
    </div>
  );
}
