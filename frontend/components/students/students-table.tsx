"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { type Student } from "@/lib/api";
import { cn } from "@/lib/utils";

interface StudentsTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student_id: string) => void;
}

const statusColors: Record<string, string> = {
  Active: "bg-green-50 text-green-600 border-green-200",
  "At Risk": "bg-red-50 text-red-600 border-red-200",
  Inactive: "bg-gray-50 text-gray-500 border-gray-200",
};

export function StudentsTable({
  students,
  onEdit,
  onDelete,
}: StudentsTableProps) {
  // 🔹 Handle empty state (IMPORTANT)
  if (!students || students.length === 0) {
    return (
      <Card className="border-border/50 shadow-card">
        <CardContent className="p-6 text-center text-muted-foreground">
          No students found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-card overflow-hidden animate-slide-up">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Enrolled
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {students.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-all duration-150 animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* 🔹 Student Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold text-primary">
                        {student.name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {student.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{student.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 🔹 Email */}
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {student.email ?? "-"}
                  </td>

                  {/* 🔹 Department */}
                  <td className="px-6 py-4 text-sm text-foreground">
                    {student.department ?? "-"}
                  </td>

                  {/* 🔹 Enrollment Date */}
                  <td className="px-6 py-4 text-sm text-foreground">
                    {student.enrollment_date
                      ? new Date(student.enrollment_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </td>

                  {/* 🔹 Status */}
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-medium text-xs px-2.5 py-0.5",
                        statusColors[student.status ?? "Active"]
                      )}
                    >
                      {student.status ?? "Active"}
                    </Badge>
                  </td>

                  {/* 🔹 Actions */}
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-muted transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        className="w-40 shadow-lg border-border/50 rounded-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit(student)}
                          className="cursor-pointer rounded-lg"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onDelete(student.id)}
                          className="cursor-pointer text-destructive focus:text-destructive rounded-lg"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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