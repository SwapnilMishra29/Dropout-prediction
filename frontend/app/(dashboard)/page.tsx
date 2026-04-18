"use client";

import { AppHeader } from "@/components/app-header";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RiskDistributionChart } from "@/components/dashboard/risk-distribution-chart";
import { RecentPredictions } from "@/components/dashboard/recent-predictions";
import { RiskTrendChart } from "@/components/dashboard/risk-trend-chart";

export default function DashboardPage() {
  return (
    <>
      <AppHeader
        title="Dashboard"
        subtitle="Overview of student dropout predictions"
      />
      <div className="flex-1 overflow-auto p-6">
        <DashboardStats />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <RiskDistributionChart />
          <RiskTrendChart />
        </div>
        <div className="mt-6">
          <RecentPredictions />
        </div>
      </div>
    </>
  );
}
