"use client";

import { useState } from "react";
import useSWR from "swr";
import { GraduationCap, BookOpen } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { academicAPI, studentsAPI, type Student } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AcademicPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    attendance_percentage: "",
    marks: "",
    subjects: "",
  });

  // Fetch all students for the dropdown
  const { data: students } = useSWR("students", studentsAPI.getAll);

  // Fetch academic records ONLY when an ID is selected
  const { data: records, mutate } = useSWR(
    selectedStudentId ? `academic-${selectedStudentId}` : null,
    () => academicAPI.getByStudentId(selectedStudentId!)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setIsSubmitting(true);

    try {
      const payload = {
        student_id: selectedStudentId,
        attendance_percentage: Number(formData.attendance_percentage),
        marks: formData.marks.split(",").map(m => Number(m.trim())).filter(m => !isNaN(m)),
        subjects: formData.subjects.split(",").map(s => s.trim()).filter(s => s.length > 0),
      };

      await academicAPI.create(payload);
      await mutate(); // Refresh list
      setFormData({ attendance_percentage: "", marks: "", subjects: "" });
    } catch (error) {
      console.error("Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="Academic Records" subtitle="Manage student data" />
      <div className="p-6 grid lg:grid-cols-2 gap-6">
        {/* FORM SECTION */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Add Record
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Select Student</Label>
                <Select value={selectedStudentId ?? ""} onValueChange={setSelectedStudentId}>
                  <SelectTrigger><SelectValue placeholder="Choose student" /></SelectTrigger>
                  <SelectContent>
                    {students?.map((s: Student) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Attendance (%)</Label>
                <Input type="number" value={formData.attendance_percentage} 
                  onChange={(e) => setFormData({ ...formData, attendance_percentage: e.target.value })} />
              </div>
              <div>
                <Label>Marks (comma separated)</Label>
                <Input placeholder="80, 70, 90" value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: e.target.value })} />
              </div>
              <div>
                <Label>Subjects (comma separated)</Label>
                <Input placeholder="Math, Science" value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })} />
              </div>
              <Button disabled={isSubmitting || !selectedStudentId} className="w-full">
                {isSubmitting ? "Saving..." : "Add Record"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* DISPLAY SECTION */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedStudentId ? (
              <p className="text-muted-foreground text-center py-10">Select a student to view records</p>
            ) : records && records.length > 0 ? (
              <div className="space-y-3">
                {records.map((r: any, idx: number) => (
                  <div key={r.id || idx} className="p-4 border rounded-lg bg-slate-50/50">
                    <p><strong>Attendance:</strong> {r.attendance_percentage}%</p>
                    <p><strong>Marks:</strong> {Array.isArray(r.marks) ? r.marks.join(", ") : "None"}</p>
                    <p><strong>Subjects:</strong> {Array.isArray(r.subjects) ? r.subjects.join(", ") : "None"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-10">No records found for this student.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}