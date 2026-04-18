"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockTrendData = [
  { date: "Jan", high: 65, medium: 180, low: 850 },
  { date: "Feb", high: 72, medium: 195, low: 870 },
  { date: "Mar", high: 78, medium: 210, low: 890 },
  { date: "Apr", high: 82, medium: 220, low: 905 },
  { date: "May", high: 85, medium: 228, low: 915 },
  { date: "Jun", high: 89, medium: 234, low: 924 },
];

export function RiskTrendChart() {
  return (
    <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up overflow-hidden" style={{ animationDelay: "100ms" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Risk Trend Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[268px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "8px 12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="low"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#colorLow)"
                name="Low Risk"
              />
              <Area
                type="monotone"
                dataKey="medium"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#colorMedium)"
                name="Medium Risk"
              />
              <Area
                type="monotone"
                dataKey="high"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorHigh)"
                name="High Risk"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
