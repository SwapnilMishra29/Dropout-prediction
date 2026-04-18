"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Sparkles,
} from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { predictionAPI, studentsAPI, Prediction } from "@/lib/api";

const riskConfig = {
  HIGH: { color: "bg-red-100 text-red-600", icon: AlertTriangle },
  MEDIUM: { color: "bg-yellow-100 text-yellow-600", icon: AlertCircle },
  LOW: { color: "bg-green-100 text-green-600", icon: CheckCircle },
};

export default function PredictionsPage() {
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const { data: students } = useSWR("students", studentsAPI.getAll);
  const { data: predictions, mutate } = useSWR(
    "predictions",
    predictionAPI.getAll
  );

  const handlePredict = async () => {
    if (!selectedStudentId) return;

    setLoading(true);
    try {
      const res = await predictionAPI.predict(selectedStudentId);
      setResult(res);
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = useMemo(() => {
    if (!predictions) return [];
    const start = (page - 1) * ITEMS_PER_PAGE;
    return predictions.slice(start, start + ITEMS_PER_PAGE);
  }, [predictions, page]);

  const totalPages = predictions
    ? Math.ceil(predictions.length / ITEMS_PER_PAGE)
    : 1;

  return (
    <>
      <AppHeader title="Predictions" subtitle="AI Risk Analysis" />

      <div className="p-6 space-y-6">
        {/* 🔥 TOP SECTION (2 COLUMN LAYOUT) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT → RUN PREDICTION */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <Sparkles className="w-4 h-4" /> Run Prediction
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>

                <SelectContent>
                  {students?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handlePredict}
                disabled={!selectedStudentId || loading}
                className="w-full"
              >
                {loading ? "Predicting..." : "Run Prediction"}
              </Button>
            </CardContent>
          </Card>

          {/* RIGHT → RESULT DISPLAY 🔥 */}
          <Card className="shadow-lg flex items-center justify-center">
            <CardContent className="w-full">
              {!result ? (
                <p className="text-center text-muted-foreground text-sm">
                  No prediction yet
                </p>
              ) : (
                (() => {
                  const config = riskConfig[result.risk_level];
                  const Icon = config.icon;
                  const score = (result.final_score * 100).toFixed(0);

                  return (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-center">
                        {result.student_name}
                      </h3>

                      {/* PROGRESS BAR */}
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            result.risk_level === "HIGH"
                              ? "bg-red-500"
                              : result.risk_level === "MEDIUM"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>

                      <p className="text-center text-sm text-gray-500">
                        Risk Score: {score}%
                      </p>

                      {/* RISK BADGE RIGHT STYLE */}
                      <div className="flex justify-center">
                        <Badge
                          className={`flex items-center gap-1 px-3 py-1 ${config.color}`}
                        >
                          <Icon className="w-4 h-4" />
                          {result.risk_level}
                        </Badge>
                      </div>
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </div>

        {/* 🔥 PREDICTIONS LIST */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Predictions</CardTitle>
          </CardHeader>

          <CardContent>
            {/* SCROLL FIX */}
            <div className="h-[350px] overflow-y-auto pr-2 space-y-3">
              {paginatedData.map((p) => {
                const config = riskConfig[p.risk_level];
                const Icon = config.icon;
                const score = (p.final_score * 100).toFixed(0);

                return (
                  <div
                    key={p.student_id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {p.student_name}
                      </p>

                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            p.risk_level === "HIGH"
                              ? "bg-red-500"
                              : p.risk_level === "MEDIUM"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Risk Score: {score}%
                      </p>
                    </div>

                    <div className="ml-4">
                      <Badge className={`flex items-center gap-1 ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {p.risk_level}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION (NOW ALWAYS VISIBLE) */}
            <div className="flex justify-between items-center mt-4 border-t pt-3">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </Button>

              <span className="text-sm">
                Page {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}