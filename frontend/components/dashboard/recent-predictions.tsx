"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { predictionAPI, type Prediction } from "@/lib/api";
import { cn } from "@/lib/utils";

const mockPredictions: Prediction[] = [
  { student_id: 1, student_name: "John Doe", final_score: 0.85, risk_level: "HIGH" },
  { student_id: 2, student_name: "Jane Smith", final_score: 0.45, risk_level: "MEDIUM" },
  { student_id: 3, student_name: "Bob Johnson", final_score: 0.15, risk_level: "LOW" },
  { student_id: 4, student_name: "Alice Brown", final_score: 0.72, risk_level: "HIGH" },
  { student_id: 5, student_name: "Charlie Wilson", final_score: 0.38, risk_level: "MEDIUM" },
];

const riskColors = {
  HIGH: "bg-red-50 text-red-600 border-red-200",
  MEDIUM: "bg-amber-50 text-amber-600 border-amber-200",
  LOW: "bg-green-50 text-green-600 border-green-200",
};

const riskBarColors = {
  HIGH: "bg-gradient-to-r from-red-500 to-red-400",
  MEDIUM: "bg-gradient-to-r from-amber-500 to-amber-400",
  LOW: "bg-gradient-to-r from-green-500 to-green-400",
};

export function RecentPredictions() {
  const { data } = useSWR("predictions", predictionAPI.getAll, {
    fallbackData: mockPredictions,
    revalidateOnFocus: false,
  });

  const predictions = data?.slice(0, 5) ?? [];

  return (
    <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up overflow-hidden" style={{ animationDelay: "200ms" }}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Recent Predictions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((prediction, index) => (
                <tr
                  key={prediction.student_id}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary">
                        {(prediction.student_name ?? `S${prediction.student_id}`).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {prediction.student_name ?? `Student ${prediction.student_id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">ID: #{prediction.student_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", riskBarColors[prediction.risk_level])}
                          style={{ width: `${prediction.final_score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground min-w-[45px]">
                        {(prediction.final_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium text-xs px-2.5 py-0.5",
                        riskColors[prediction.risk_level]
                      )}
                    >
                      {prediction.risk_level}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
