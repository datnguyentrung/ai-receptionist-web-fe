import { useState } from "react";
import {
  AttendanceWeeklyChart,
  AttentionSection,
  CoachTimesheetSummary,
  DashboardFilters,
  DashboardFootnote,
  DashboardHeader,
  DashboardKpiGrid,
  DashboardSkeleton,
  DashboardStateMessage,
  PartialDataNotice,
  PriorityAlerts,
  PwaFilterSheet,
  RecentPaymentsSection,
  StudentGrowthChart,
  SupportingSections,
  TodayOperationsSection,
} from "./components/DashboardComponents";
import { useDashboard } from "./hooks/useDashboard";
import styles from "./Dashboard.module.scss";

export function Dashboard() {
  const dashboard = useDashboard();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  if (dashboard.isLoading && !dashboard.data) {
    return <DashboardSkeleton />;
  }

  if (dashboard.isError && !dashboard.data) {
    return (
      <div className={styles.dashboard}>
        <DashboardStateMessage
          type="error"
          onRetry={() => {
            void dashboard.refetch();
          }}
        />
      </div>
    );
  }

  const data = dashboard.data;

  if (!data) {
    return (
      <div className={styles.dashboard}>
        <DashboardStateMessage type="empty" />
      </div>
    );
  }

  const hasAnySectionData =
    data.kpis.length > 0 ||
    data.attentionStudents.length > 0 ||
    data.todaySessions.length > 0 ||
    data.recentPayments.length > 0;

  const hasFilterResults =
    data.kpis.length > 0 ||
    data.attentionStudents.length > 0 ||
    data.todaySessions.length > 0 ||
    data.recentPayments.length > 0 ||
    data.filters.branchId === "ALL";

  if (!hasAnySectionData) {
    return (
      <div className={styles.dashboard}>
        <DashboardHeader data={data} onOpenFilters={() => setFilterSheetOpen(true)} />
        <DashboardStateMessage type="empty" />
        <PwaFilterSheet
          open={filterSheetOpen}
          filters={dashboard.filters}
          scope={dashboard.scope}
          onClose={() => setFilterSheetOpen(false)}
          onBranchChange={dashboard.setBranchId}
          onPeriodChange={dashboard.setPeriod}
          onCompareChange={dashboard.setComparePrevious}
          onReset={dashboard.resetFilters}
        />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <DashboardHeader data={data} onOpenFilters={() => setFilterSheetOpen(true)} />
      <DashboardFilters
        filters={dashboard.filters}
        scope={dashboard.scope}
        onBranchChange={dashboard.setBranchId}
        onPeriodChange={dashboard.setPeriod}
        onCompareChange={dashboard.setComparePrevious}
        onRefresh={() => {
          void dashboard.refetch();
        }}
      />
      <PartialDataNotice data={data} />
      {!hasFilterResults ? <DashboardStateMessage type="filter-empty" /> : null}
      <PriorityAlerts data={data} />
      <DashboardKpiGrid kpis={data.kpis} />
      <div className={styles.mainGrid}>
        <StudentGrowthChart data={data} />
        <AttendanceWeeklyChart data={data} />
      </div>
      <AttentionSection students={data.attentionStudents} />
      <div className={styles.operationsGrid}>
        <TodayOperationsSection data={data} />
        <CoachTimesheetSummary items={data.coachTimesheet} />
      </div>
      <RecentPaymentsSection payments={data.recentPayments} />
      <SupportingSections data={data} />
      <DashboardFootnote data={data} />
      <PwaFilterSheet
        open={filterSheetOpen}
        filters={dashboard.filters}
        scope={dashboard.scope}
        onClose={() => setFilterSheetOpen(false)}
        onBranchChange={dashboard.setBranchId}
        onPeriodChange={dashboard.setPeriod}
        onCompareChange={dashboard.setComparePrevious}
        onReset={dashboard.resetFilters}
      />
    </div>
  );
}
