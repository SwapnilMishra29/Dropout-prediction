"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

type Risk = "LOW" | "MEDIUM" | "HIGH";

type Student = {
  student_id: number;
  final_score: number;
  risk_level: Risk;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<Risk | "ALL">("ALL");

  useEffect(() => {
    const stored = localStorage.getItem("csv_predictions");
    if (stored) setData(JSON.parse(stored));
  }, []);

  /* ---------------- FILTERED DATA ---------------- */
  const filteredData = useMemo(() => {
    return data.filter((d) => {
      const matchSearch = d.student_id
        .toString()
        .includes(search.trim());

      const matchRisk =
        riskFilter === "ALL" ? true : d.risk_level === riskFilter;

      return matchSearch && matchRisk;
    });
  }, [data, search, riskFilter]);

  /* ---------------- STATS ---------------- */
  const stats = useMemo(() => {
    return {
      LOW: data.filter((d) => d.risk_level === "LOW").length,
      MEDIUM: data.filter((d) => d.risk_level === "MEDIUM").length,
      HIGH: data.filter((d) => d.risk_level === "HIGH").length,
    };
  }, [data]);

  const chartData = [
    { name: "LOW", value: stats.LOW },
    { name: "MEDIUM", value: stats.MEDIUM },
    { name: "HIGH", value: stats.HIGH },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50">

      {/* ================= HEADER ================= */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              AI-driven student risk intelligence
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student ID..."
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            />

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="ALL">All Risk</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

          </div>
        </div>
      </div>

      {/* ================= CONTENT (ONLY SCROLLS HERE) ================= */}
      <div className="flex-1 overflow-y-auto">

        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

          {/* STATS */}
          <div className="grid md:grid-cols-3 gap-4">
            <Stat title="Low Risk" value={stats.LOW} color="text-green-600" />
            <Stat title="Medium Risk" value={stats.MEDIUM} color="text-yellow-600" />
            <Stat title="High Risk" value={stats.HIGH} color="text-red-600" />
          </div>

          {/* CHARTS */}
          <div className="grid lg:grid-cols-2 gap-5">

            <Card title="Risk Distribution">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Risk Share">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" outerRadius={90}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

          </div>

          {/* TABLE */}
          <Card title={`Students (${filteredData.length})`}>

            <div className="max-h-[420px] overflow-y-auto">

              <table className="w-full text-sm">

                <thead className="sticky top-0 bg-slate-100">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="text-left">Score</th>
                    <th className="text-left">Risk</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((s) => (
                    <tr key={s.student_id} className="border-b hover:bg-slate-50">
                      <td className="p-3">#{s.student_id}</td>
                      <td>{(s.final_score * 100).toFixed(0)}%</td>
                      <td className={riskColor(s.risk_level)}>
                        {s.risk_level}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

          </Card>

        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Card({ title, children }: any) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <h2 className="text-sm font-semibold mb-4 text-slate-700">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Stat({ title, value, color }: any) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function riskColor(level: Risk) {
  if (level === "HIGH") return "text-red-600 font-semibold";
  if (level === "MEDIUM") return "text-yellow-600 font-semibold";
  return "text-green-600 font-semibold";
}