import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "./TabViews.scss";

import { COACH_TABS, STUDENT_TABS } from "@/config/constants/path";
import type { CoachDetail, StudentDetail } from "@/types";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

type TabViewsProps =
  | { userType: "student"; userInfo: StudentDetail }
  | { userType: "coach"; userInfo: CoachDetail };

export type OutletContextType = {
  user: StudentDetail | CoachDetail;
  canViewCoach: boolean;
  canViewManagerSenior: boolean;
};

export function TabViews({
  userInfo,
  userType,
  canViewCoach,
  canViewManagerSenior,
}: TabViewsProps & { canViewCoach: boolean; canViewManagerSenior: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs =
    userType === "student"
      ? STUDENT_TABS({ studentCode: userInfo.studentCode })
      : COACH_TABS({ coachCode: userInfo.staffCode });

  // 1. Xác định tab đang active dựa trên URL hiện tại
  // Tìm tab có linkTo khớp hoàn toàn với URL. Nếu không tìm thấy, mặc định là tab đầu tiên.
  const activeTabId =
    tabs.find((tab) => location.pathname === tab.linkTo)?.id || tabs[0].id;

  // 2. Xử lý chuyển URL khi click vào TabTrigger
  const handleTabChange = (value: string) => {
    const selectedTab = tabs.find((tab) => tab.id === value);
    if (selectedTab) {
      navigate(selectedTab.linkTo); // Cập nhật URL thay vì đổi state nội bộ
    }
  };
  return (
    <Tabs value={activeTabId} onValueChange={handleTabChange} className="views">
      {/* --- GIỮ NGUYÊN 100% CẤU TRÚC CHUẨN CỦA BẠN --- */}
      <TabsList className="views__tabs-list" style={{ width: "100%" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`views__tab-trigger ${location.pathname === tab.linkTo ? "active" : "inactive"}`}
              style={{ flex: "0 0 auto" }}
            >
              <span className="views__tab-icon">
                <Icon />
              </span>
              <span>{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* MẸO Ở ĐÂY:
        Dùng đúng 1 thẻ TabsContent bọc lấy Outlet.
        Gán value={activeTabId} để nó luôn hiển thị (vì khớp với value của Tabs cha).
        Giữ nguyên className "views__tab-content" để ăn CSS cũ.
      */}
      <TabsContent value={activeTabId} className="views__tab-content">
        <Outlet
          context={{
            user: userInfo,
            canViewCoach: canViewCoach,
            canViewManagerSenior: canViewManagerSenior,
          }}
        />
      </TabsContent>
    </Tabs>
  );
}
