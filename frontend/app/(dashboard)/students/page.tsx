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

  // 🔥 delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: students, error, isLoading, mutate } = useSWR(
    "/students",
    studentsAPI.getAll
  );

  // ---------------- EDIT ----------------
  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  // ---------------- DELETE CLICK ----------------
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  // ---------------- CONFIRM DELETE ----------------
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      // 🔥 Optimistic UI update (instant remove)
      mutate(
        (prev) => prev?.filter((s) => s.id !== deleteId),
        false
      );

      await studentsAPI.delete(deleteId);
    } catch (error) {
      console.error("Delete failed:", error);
      mutate(); // rollback if error
    } finally {
      setDeleteId(null);
    }
  };

  // ---------------- CANCEL DELETE ----------------
  const cancelDelete = () => {
    setDeleteId(null);
  };

  // ---------------- SAVE ----------------
  const handleSave = async (data: Omit<Student, "id">) => {
    try {
      const payload = {
        student_id: selectedStudent?.id || data.email,
        name: data.name,
        branch: data.department || "CSE",
        year: 2,
        semester: 4,
      };

      if (selectedStudent) {
        await studentsAPI.update(selectedStudent.id, payload);
      } else {
        await studentsAPI.create(payload);
      }

      mutate();
    } catch (error) {
      console.error("Save failed:", error);
    }

    setIsDialogOpen(false);
    setSelectedStudent(null);
  };

  // ---------------- LOADING ----------------
  if (isLoading) {
    return <div className="p-6">Loading students...</div>;
  }

  // ---------------- ERROR ----------------
  if (error) {
    return (
      <div className="p-6 text-red-500">
        Failed to load students. Check backend/API.
      </div>
    );
  }

  return (
    <>
      <AppHeader title="Students" subtitle="Manage student records" />

      <div className="flex-1 overflow-auto p-6">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {students?.length ?? 0} total students
          </p>

          <Button
            onClick={() => {
              setSelectedStudent(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* TABLE */}
        <StudentsTable
          students={students ?? []}
          onEdit={handleEdit}
          onDelete={handleDeleteClick} // 🔥 important change
        />

        {/* DIALOG */}
        <StudentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          student={selectedStudent}
          onSave={handleSave}
        />

        {/* ---------------- DELETE MODAL ---------------- */}
        {deleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[320px]">
              <h2 className="text-lg font-semibold">Delete Student?</h2>

              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={cancelDelete}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}