"use client";

import { useState } from "react";
import useSWR from "swr";
import { Wallet, DollarSign, Award, CreditCard } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { financeAPI, studentsAPI, type FinanceRecord } from "@/lib/api";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

// ---------- Radix Select Components ----------
function Select({ ...props }: SelectPrimitive.SelectProps) {
  return <SelectPrimitive.Root {...props} />;
}

function SelectTrigger({ children, ...props }: SelectPrimitive.SelectTriggerProps) {
  return <SelectPrimitive.Trigger {...props}>{children}</SelectPrimitive.Trigger>;
}

function SelectValue(props: SelectPrimitive.SelectValueProps) {
  return <SelectPrimitive.Value {...props} />;
}

function SelectContent({ children, ...props }: SelectPrimitive.SelectContentProps) {
  return <SelectPrimitive.Content {...props}>{children}</SelectPrimitive.Content>;
}

function SelectItem({ children, ...props }: SelectPrimitive.SelectItemProps) {
  return <SelectPrimitive.Item {...props}>{children}</SelectPrimitive.Item>;
}

// ---------- Status Colors ----------
const statusColors: Record<string, string> = {
  Paid: "bg-green-50 text-green-600 border-green-200",
  Partial: "bg-amber-50 text-amber-600 border-amber-200",
  Overdue: "bg-red-50 text-red-600 border-red-200",
  Pending: "bg-gray-50 text-gray-500 border-gray-200",
};

// ---------- Finance Page ----------
export default function FinancePage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tuition_paid: "",
    tuition_due: "",
    scholarship_amount: "",
    payment_status: "Pending",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch students
  const { data: students } = useSWR("students", studentsAPI.getAll, { revalidateOnFocus: false });

  // Fetch finance records for selected student
  const { data: records, mutate: mutateRecords } = useSWR(
    selectedStudentId ? `finance-${selectedStudentId}` : null,
    () => (selectedStudentId ? financeAPI.getByStudentId(selectedStudentId) : []),
    { revalidateOnFocus: false }
  );

  // ---------- Form Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setIsSubmitting(true);
    try {
      await financeAPI.create({
        student_id: selectedStudentId,
        tuition_paid: parseFloat(formData.tuition_paid || "0"),
        tuition_due: parseFloat(formData.tuition_due || "0"),
        scholarship_amount: parseFloat(formData.scholarship_amount || "0"),
        payment_status: formData.payment_status,
      });

      mutateRecords(); // Refresh SWR
      setFormData({ tuition_paid: "", tuition_due: "", scholarship_amount: "", payment_status: "Pending" });
    } catch (error) {
      console.error("Error adding record:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Helpers ----------
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

  const getPaymentProgress = (paid: number, due: number) => {
    if (due === 0) return 100;
    return Math.min((paid / due) * 100, 100);
  };

  // ---------- JSX ----------
  return (
    <>
      <AppHeader title="Finance Records" subtitle="Manage student financial information" />
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Form Section */}
          <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up overflow-hidden">
            <CardHeader className="pb-4 bg-linear-to-br from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                Add Finance Record
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Select Student */}
                
<div className="space-y-2">
  <Label className="text-sm font-medium">Select Student</Label>
  <select
    value={selectedStudentId ?? ""}
    onChange={(e) => setSelectedStudentId(e.target.value)}
    className="h-10 w-full rounded-xl border-border/50 bg-secondary/30 px-3"
  >
    <option value="" disabled>
      Choose a student
    </option>
    {students?.map((student) => (
      <option key={student.id} value={student.id}>
        {student.name} (#{student.id})
      </option>
    ))}
  </select>
</div>

                {/* Tuition Paid / Due */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tuition_due">Tuition Due ($)</Label>
                    <Input
                      id="tuition_due"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.tuition_due}
                      onChange={(e) => setFormData({ ...formData, tuition_due: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tuition_paid">Tuition Paid ($)</Label>
                    <Input
                      id="tuition_paid"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.tuition_paid}
                      onChange={(e) => setFormData({ ...formData, tuition_paid: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Scholarship / Payment Status */}
                <div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="scholarship">Scholarship ($)</Label>
    <Input
      id="scholarship"
      type="number"
      min="0"
      step="0.01"
      value={formData.scholarship_amount}
      onChange={(e) =>
        setFormData({ ...formData, scholarship_amount: e.target.value })
      }
      placeholder="0.00"
    />
  </div>
  <div className="space-y-2">
    <Label htmlFor="payment_status">Payment Status</Label>
    <select
      id="payment_status"
      value={formData.payment_status}
      onChange={(e) =>
        setFormData({ ...formData, payment_status: e.target.value })
      }
      className="h-10 w-full rounded-xl border-border/50 bg-secondary/30 px-3"
    >
      <option value="Pending">Pending</option>
      <option value="Partial">Partial</option>
      <option value="Paid">Paid</option>
      <option value="Overdue">Overdue</option>
    </select>
  </div>
</div>


                <Button type="submit" disabled={!selectedStudentId || isSubmitting}>
                  {isSubmitting ? "Saving..." : "Add Record"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Records Display */}
          <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up overflow-hidden">
            <CardHeader className="pb-4 bg-linear-to-br from-chart-2/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10">
                  <Wallet className="h-4 w-4 text-chart-2" />
                </div>
                Finance History
                {selectedStudentId && <span className="ml-2 text-sm text-muted-foreground">Student #{selectedStudentId}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {!selectedStudentId ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="mx-auto h-8 w-8 mb-4" />
                  Select a student to view their finance records
                </div>
              ) : records && records.length > 0 ? (
                <div className="space-y-3">
                  {records.map((record) => {
                    const paid = record.tuition_paid ?? 0;
                    const due = record.tuition_due;
                    const progress = getPaymentProgress(paid, due);

                    return (
                      <div key={record.id} className="p-4 rounded-xl border bg-linear-to-br from-secondary/30 to-transparent">
                        <div className="flex justify-between mb-2">
                          <Badge className={cn("font-medium text-xs px-2.5 py-0.5", statusColors[record.payment_status ?? "Pending"])}>
                            {record.payment_status ?? "Pending"}
                          </Badge>
                          {record.scholarship_amount > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Award className="h-3 w-3 text-primary" />
                              {formatCurrency(record.scholarship_amount)}
                            </div>
                          )}
                        </div>
                        <div className="text-sm flex justify-between">
                          <span>Payment Progress</span>
                          <span>{formatCurrency(paid)} / {formatCurrency(due)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              record.payment_status === "Paid"
                                ? "bg-linear-to-r from-green-500 to-green-400"
                                : record.payment_status === "Overdue"
                                ? "bg-linear-to-r from-red-500 to-red-400"
                                : "bg-linear-to-r from-amber-500 to-amber-400"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {due > paid && (
                          <div className="flex justify-between text-xs font-semibold mt-1 border-t border-border/30 pt-1 text-destructive">
                            <span>Balance Due</span>
                            <span>{formatCurrency(due - paid)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="mx-auto h-8 w-8 mb-4" />
                  No finance records found for this student
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}