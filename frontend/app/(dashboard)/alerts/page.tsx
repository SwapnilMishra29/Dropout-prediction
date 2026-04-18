"use client";

import useSWR from "swr";
import { AlertTriangle, Clock, User, Bell } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { alertsAPI, type Alert } from "@/lib/api";
import { cn } from "@/lib/utils";

const mockAlerts: Alert[] = [
  {
    id: 1,
    student_id: 1,
    student_name: "John Doe",
    risk_level: "HIGH",
    message: "Student has missed 3 consecutive classes and GPA has dropped below 2.0",
    created_at: "2024-03-15T10:30:00Z",
  },
  {
    id: 2,
    student_id: 4,
    student_name: "Alice Brown",
    risk_level: "HIGH",
    message: "Outstanding tuition balance and declining attendance rate",
    created_at: "2024-03-14T14:45:00Z",
  },
  {
    id: 3,
    student_id: 2,
    student_name: "Jane Smith",
    risk_level: "MEDIUM",
    message: "Attendance rate dropped to 75% this semester",
    created_at: "2024-03-13T09:15:00Z",
  },
  {
    id: 4,
    student_id: 5,
    student_name: "Charlie Wilson",
    risk_level: "MEDIUM",
    message: "Partial tuition payment and missed assignment deadlines",
    created_at: "2024-03-12T16:20:00Z",
  },
  {
    id: 5,
    student_id: 6,
    student_name: "Diana Ross",
    risk_level: "HIGH",
    message: "Failed midterm exam and requested leave of absence",
    created_at: "2024-03-11T11:00:00Z",
  },
];

const riskColors: Record<string, string> = {
  HIGH: "bg-red-50 text-red-600 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-600 border-amber-200",
  LOW: "bg-green-50 text-green-600 border-green-200",
};

const riskBorderColors: Record<string, string> = {
  HIGH: "border-l-red-500",
  MEDIUM: "border-l-amber-500",
  LOW: "border-l-green-500",
};

export default function AlertsPage() {
  const { data: alerts } = useSWR("alerts", alertsAPI.getAll, {
    fallbackData: mockAlerts,
    revalidateOnFocus: false,
  });

  const highRiskCount = alerts?.filter((a) => a.risk_level === "HIGH").length ?? 0;
  const mediumRiskCount = alerts?.filter((a) => a.risk_level === "MEDIUM").length ?? 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <AppHeader
        title="Alerts"
        subtitle="High-risk student notifications"
      />
      <div className="flex-1 overflow-auto p-6">
        {/* Summary Cards */}
        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up overflow-hidden">
            <CardContent className="p-6 bg-gradient-to-br from-red-50 to-transparent">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                  <p className="text-3xl font-bold text-foreground">{highRiskCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up overflow-hidden" style={{ animationDelay: "50ms" }}>
            <CardContent className="p-6 bg-gradient-to-br from-amber-50 to-transparent">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
                  <p className="text-3xl font-bold text-foreground">{mediumRiskCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up sm:col-span-2 lg:col-span-1 overflow-hidden" style={{ animationDelay: "100ms" }}>
            <CardContent className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                  <p className="text-3xl font-bold text-foreground">{alerts?.length ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up overflow-hidden" style={{ animationDelay: "150ms" }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {alerts?.map((alert, index) => (
                <div
                  key={alert.id}
                  className={cn(
                    "group rounded-xl border border-border/50 bg-gradient-to-r from-secondary/20 to-transparent p-4 border-l-4 hover:shadow-sm transition-all duration-200 animate-fade-in",
                    riskBorderColors[alert.risk_level]
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-semibold text-primary">
                          {alert.student_name.charAt(0)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {alert.student_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            #{alert.student_id}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("font-medium text-xs px-2 py-0.5", riskColors[alert.risk_level])}
                        >
                          {alert.risk_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-11">
                        {alert.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 pl-11 sm:pl-0">
                      <Clock className="h-3 w-3" />
                      {formatDate(alert.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
