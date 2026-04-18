"use client";

import useSWR from "swr";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardAPI } from "@/lib/api";

const COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
};

export function RiskDistributionChart() {
  const { data, isLoading, error } = useSWR("dashboard", dashboardAPI.get, {
    revalidateOnFocus: false,
  });

  // ✅ Loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Loading chart...</p>
      </Card>
    );
  }

  // ❌ Error state
  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-red-500">Failed to load data</p>
      </Card>
    );
  }

  const chartData = [
    {
      name: "High Risk",
      value: data?.high_risk_count ?? 0,
      color: COLORS.HIGH,
    },
    {
      name: "Medium Risk",
      value: data?.medium_risk_count ?? 0,
      color: COLORS.MEDIUM,
    },
    {
      name: "Low Risk",
      value: data?.low_risk_count ?? 0,
      color: COLORS.LOW,
    },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Risk Distribution
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-8">
          
          {/* ✅ Chart */}
          <div className="h-[200px] w-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [`${value} students`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* ✅ Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground">
                {total}
              </span>
              <span className="text-xs text-muted-foreground">
                Total
              </span>
            </div>
          </div>

          {/* ✅ Legend + Bars */}
          <div className="flex-1 space-y-4">
            {chartData.map((item) => {
              const percentage =
                total === 0
                  ? 0
                  : ((item.value / total) * 100).toFixed(1);

              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-sm font-semibold">
                      {item.value}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}