"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { StudentsTable } from "@/components/students/students-table";
import { StudentDialog } from "@/components/students/student-dialog";
import { studentsAPI, type Student } from "@/lib/api";

export default function StudentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // 🔥 Fetch from backend
  const {
    data: students,
    error,
    isLoading,
    mutate,
  } = useSWR("/students", studentsAPI.getAll);

  // 🔹 Edit handler
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  // 🔹 Delete handler
  const handleDelete = async (id: string) => {
    try {
      await studentsAPI.delete(id);
      const updated = await studentsAPI.getAll();
      mutate(updated, false);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  // 🔹 Save (Create + Update)
 const handleSave = async (data: Omit<Student, "id">) => {
  try {
    // 🔥 Transform frontend → backend schema
    const payload = {
      student_id: data.email,   // ✅ use this // required
      name: data.name,
      branch: data.department || "CSE",  // map department → branch
      year: 2,                           // default (change later)
      semester: 4,                       // default (change later)
    };

    if (selectedStudent) {
      await studentsAPI.update(selectedStudent.id, payload);
    } else {
      await studentsAPI.create(payload);
    }

    const updated = await studentsAPI.getAll();
    mutate(updated, false);

  } catch (error) {
    console.error("Save failed:", error);
  }

  setIsDialogOpen(false);
  setSelectedStudent(null);
};

  // 🔹 Loading state
  if (isLoading) {
    return <div className="p-6">Loading students...</div>;
  }

  // 🔹 Error state
  if (error) {
    return (
      <div className="p-6 text-red-500">
        Failed to load students. Check backend/API.
      </div>
    );
  }

  return (
    <>
      <AppHeader
        title="Students"
        subtitle="Manage student records"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {students?.length ?? 0} total students
          </p>

          <Button
            onClick={() => {
              setSelectedStudent(null);
              setIsDialogOpen(true);
            }}
            className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        <StudentsTable
          students={students ?? []}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <StudentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          student={selectedStudent}
          onSave={handleSave}
        />
      </div>
    </>
  );
}