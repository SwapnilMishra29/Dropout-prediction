"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  Bell,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Brain,
  Clock,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { alertsAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

/* -----------------------------
   SAFE HIGH RISK CHECK
------------------------------ */
const isHighRisk = (type?: string) =>
  (type || "").toLowerCase().includes("high");

/* -----------------------------
   SAFE GROUPING (PRODUCTION SAFE)
------------------------------ */
const groupByStudent = (alerts: any[] = []) => {
  const map = new Map();

  for (const a of alerts) {
    if (!a) continue;

    const student = a.student_id;

    const id =
      student && typeof student === "object"
        ? student._id
        : student;

    if (!id) continue;

    const safeStudent =
      student && typeof student === "object"
        ? student
        : {
            _id: id,
            name: "Deleted Student",
            student_id: "N/A",
          };

    if (!map.has(id)) {
      map.set(id, {
        student: safeStudent,
        alerts: [],
      });
    }

    map.get(id).alerts.push(a);
  }

  return Array.from(map.values()).filter(
    (g) => Array.isArray(g.alerts) && g.alerts.length > 0
  );
};

/* -----------------------------
   AI INSIGHT ENGINE
------------------------------ */
const getAIInsight = (alerts: any[] = []) => {
  const reasons: string[] = [];

  if (alerts.some((a) => a.message?.includes("attendance"))) {
    reasons.push("Low attendance pattern detected");
  }

  if (alerts.some((a) => a.message?.includes("fees"))) {
    reasons.push("Financial irregularities detected");
  }

  if (alerts.length > 2) {
    reasons.push("Repeated risk signals over time");
  }

  return reasons.length
    ? reasons
    : ["Multiple risk indicators detected"];
};

export default function AlertsPage() {
  const { data: alerts } = useSWR("alerts", alertsAPI.getAll, {
    revalidateOnFocus: false,
  });

  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);

  /* -----------------------------
     FILTER HIGH RISK ONLY
  ------------------------------ */
  const highRiskAlerts = useMemo(() => {
    return (alerts || []).filter(
      (a) => a?.student_id && isHighRisk(a.alert_type)
    );
  }, [alerts]);

  /* -----------------------------
     GROUP DATA
  ------------------------------ */
  const grouped = useMemo(
    () => groupByStudent(highRiskAlerts),
    [highRiskAlerts]
  );

  /* -----------------------------
     AUTO EXPAND FIRST
  ------------------------------ */
  useEffect(() => {
    if (grouped.length && !expanded) {
      setExpanded(grouped[0].student._id);
    }
  }, [grouped, expanded]);

  return (
    <>
      <AppHeader
        title="Alert Command Center"
        subtitle="Real-time high-risk monitoring system"
      />

      <div className="flex h-[calc(100vh-80px)] overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-[70%] border-r overflow-y-auto">

          <div className="p-3 flex items-center justify-between border-b bg-muted/30">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Bell className="h-4 w-4 text-red-500 animate-pulse" />
              High Risk Students
            </div>

            <span className="text-xs text-muted-foreground">
              {grouped.length} students
            </span>
          </div>

          <div className="space-y-[2px]">

            {grouped.map((group) => {
              const isOpen = expanded === group.student._id;

              return (
                <div key={group.student._id} className="border-b">

                  {/* HEADER */}
                  <div
                    className={cn(
                      "flex items-center justify-between px-3 py-2 cursor-pointer",
                      "hover:bg-muted/40 transition"
                    )}
                    onClick={() =>
                      setExpanded(isOpen ? null : group.student._id)
                    }
                  >
                    <div className="flex items-center gap-3">

                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}

                      <div>
                        <div className="text-sm font-medium">
                          {group.student.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          #{group.student.student_id}
                        </div>
                      </div>

                    </div>

                    <Badge className="bg-red-500/10 text-red-500">
                      {group.alerts.length} alerts
                    </Badge>

                  </div>

                  {/* ALERT LIST */}
                  {isOpen && (
                    <div className="bg-muted/20">

                      {(group.alerts ?? []).map((a: any) => (
                        <div
                          key={a._id ?? `${group.student._id}-${a.created_at}`}
                          className={cn(
                            "px-10 py-2 text-xs border-l-2 border-red-500",
                            "hover:bg-muted/50 cursor-pointer"
                          )}
                          onMouseEnter={() => setSelected(a)}
                        >
                          <div className="flex justify-between">
                            <span>{a.message}</span>

                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {a.created_at
                                ? new Date(a.created_at).toLocaleTimeString()
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      ))}

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[30%] p-3 space-y-3">

          {/* DETAILS */}
          <Card className="h-[40%]">
            <CardContent className="p-3 space-y-2">

              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="text-red-500 h-4 w-4" />
                Alert Details
              </div>

              {selected ? (
                <>
                  <div className="text-sm font-medium">
                    {selected?.student_id?.name ?? "Deleted Student"}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {selected.message}
                  </div>

                  <div className="text-xs">
                    Type: {selected.alert_type}
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Hover on alert to preview details
                </div>
              )}

            </CardContent>
          </Card>

          {/* AI INSIGHT */}
          <Card className="h-[60%]">
            <CardContent className="p-3 space-y-2">

              <div className="flex items-center gap-2 text-sm font-medium">
                <Brain className="text-purple-500 h-4 w-4" />
                AI Insight
              </div>

              {selected ? (
                <ul className="text-xs space-y-2">
                  {getAIInsight([selected]).map((r, i) => (
                    <li key={i} className="p-2 bg-muted/30 rounded">
                      • {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Select an alert to generate AI insight
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}