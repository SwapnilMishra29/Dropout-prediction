"use client";

import useSWR from "swr";
import {
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { dashboardAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

export function DashboardStats() {
  const { data, isLoading, error } = useSWR(
    "dashboard",
    dashboardAPI.get
  );

  // ✅ HANDLE LOADING STATE
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden border-border/50 shadow-card">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-8 w-16 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ✅ HANDLE ERROR STATE
  if (error || !data) {
    return (
      <p className="text-red-500 text-sm">
        Failed to load dashboard data
      </p>
    );
  }

  // ✅ REAL DATA FROM API
  const stats = [
    {
      title: "Total Students",
      value: data.total_students,
      icon: Users,
      trend: "+12%",
      trendUp: true,
      gradient: "from-primary/10 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "High Risk",
      value: data.high_risk_count,
      icon: AlertTriangle,
      trend: "-3%",
      trendUp: false,
      gradient: "from-destructive/10 to-destructive/5",
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
    {
      title: "Medium Risk",
      value: data.medium_risk_count,
      icon: AlertCircle,
      trend: "+5%",
      trendUp: true,
      gradient: "from-warning/10 to-warning/5",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    {
      title: "Low Risk",
      value: data.low_risk_count,
      icon: CheckCircle,
      trend: "+8%",
      trendUp: true,
      gradient: "from-success/10 to-success/5",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className={cn(
            "group overflow-hidden border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300",
            "hover:-translate-y-0.5"
          )}
        >
          <CardContent className={cn("p-6 bg-gradient-to-br", stat.gradient)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {stat.value?.toLocaleString() || 0}
                </p>

                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp
                    className={cn(
                      "h-3 w-3",
                      stat.trendUp
                        ? "text-success"
                        : "text-destructive rotate-180"
                    )}
                  />

                  <span
                    className={cn(
                      "text-xs font-medium",
                      stat.trendUp ? "text-success" : "text-destructive"
                    )}
                  >
                    {stat.trend}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    vs last month
                  </span>
                </div>
              </div>

              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                  stat.iconBg
                )}
              >
                <stat.icon className={cn("h-6 w-6", stat.iconColor)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}