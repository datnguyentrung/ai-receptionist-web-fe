import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "./TabViews.scss";

import type { NavigationItem } from "@/app/navigation/path";
import { COACH_TABS, STUDENT_TABS } from "@/app/navigation/path";
import type { CoachDetail, StudentDetail } from "@/types";
import { useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

type TabViewsProps =
  | { userType: "student"; userInfo: StudentDetail }
  | { userType: "coach"; userInfo: CoachDetail };

export type OutletContextType = {
  user: StudentDetail | CoachDetail;
  canViewCoach: boolean;
  canViewManagerSenior: boolean;
};

type TabItem = NavigationItem & { id: string; to: string };

function isActiveTab(pathname: string, tab: TabItem) {
  if (tab.id === "profile") {
    return pathname === tab.to;
  }

  return pathname === tab.to || pathname.startsWith(`${tab.to}/`);
}

export function TabViews({
  userInfo,
  userType,
  canViewCoach,
  canViewManagerSenior,
}: TabViewsProps & { canViewCoach: boolean; canViewManagerSenior: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const tabsListRef = useRef<HTMLDivElement | null>(null);
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const tabs =
    userType === "student"
      ? (STUDENT_TABS({ studentCode: userInfo.studentCode }) as TabItem[])
      : (COACH_TABS({ coachCode: userInfo.staffCode }) as TabItem[]);

  const activeTabId =
    tabs.find((tab) => isActiveTab(location.pathname, tab))?.id || tabs[0].id;

  const handleTabChange = (value: string) => {
    const selectedTab = tabs.find((tab) => tab.id === value);
    if (selectedTab?.to) {
      navigate(selectedTab.to);
    }
  };

  useLayoutEffect(() => {
    const tabsList = tabsListRef.current;
    const activeTrigger = activeTriggerRef.current;

    if (!tabsList || !activeTrigger) return;

    if (activeTabId === "profile") {
      tabsList.scrollLeft = 0;
      const frameId = window.requestAnimationFrame(() => {
        tabsList.scrollLeft = 0;
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    activeTrigger.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeTabId]);

  return (
    <Tabs value={activeTabId} onValueChange={handleTabChange} className="views">
      <TabsList
        ref={tabsListRef}
        className="views__tabs-list"
        aria-label={userType === "student" ? "Student profile views" : "Coach profile views"}
        data-tab-count={tabs.length}
        data-user-type={userType}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTabId === tab.id;

          return (
            <TabsTrigger
              key={tab.id}
              ref={isActive ? activeTriggerRef : undefined}
              value={tab.id}
              className={`views__tab-trigger ${isActive ? "active" : "inactive"}`}
              title={tab.label}
            >
              <span className="views__tab-icon">
                <Icon />
              </span>
              <span className="views__tab-label">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

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
