"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Student } from "@/lib/api";

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSave: (data: Omit<Student, "id">) => void;
}

const departments = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Engineering",
  "Biology",
  "Chemistry",
  "Business",
  "Arts",
];

export function StudentDialog({
  open,
  onOpenChange,
  student,
  onSave,
}: StudentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    enrollment_date: "",
    status: "Active",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        department: student.department ?? "",
        enrollment_date: student.enrollment_date ?? "",
        status: student.status ?? "Active",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        department: "",
        enrollment_date: "",
        status: "Active",
      });
    }
  }, [student, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl border-border/50 shadow-xl p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/5 to-transparent p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {student ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter student name"
                required
                className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-card transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email address"
                required
                className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-card transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-foreground">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl border-border/50 bg-secondary/30">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50 shadow-lg">
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept} className="rounded-lg">
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-foreground">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl border-border/50 bg-secondary/30">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50 shadow-lg">
                    <SelectItem value="Active" className="rounded-lg">Active</SelectItem>
                    <SelectItem value="At Risk" className="rounded-lg">At Risk</SelectItem>
                    <SelectItem value="Inactive" className="rounded-lg">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollment_date" className="text-sm font-medium text-foreground">Enrollment Date</Label>
              <Input
                id="enrollment_date"
                type="date"
                value={formData.enrollment_date}
                onChange={(e) =>
                  setFormData({ ...formData, enrollment_date: e.target.value })
                }
                className="h-10 rounded-xl border-border/50 bg-secondary/30 focus:bg-card transition-colors"
              />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border/30 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border/50 hover:bg-secondary/80 transition-all"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {student ? "Save Changes" : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
