"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, X } from "lucide-react";

type FileType = "attendance" | "marks" | "fees";

export default function UploadPage() {
  const router = useRouter();

  const [files, setFiles] = useState<{
    attendance: File | null;
    marks: File | null;
    fees: File | null;
  }>({
    attendance: null,
    marks: null,
    fees: null,
  });

  const [dragType, setDragType] = useState<FileType | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Handle file select
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: FileType
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  // ✅ Drag handlers
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, type: FileType) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file) return;

      setFiles((prev) => ({
        ...prev,
        [type]: file,
      }));
      setDragType(null);
    },
    []
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, type: FileType) => {
    e.preventDefault();
    setDragType(type);
  };

  const handleDragLeave = () => setDragType(null);

  // ✅ Upload
  const handleUpload = async () => {
    if (!files.attendance || !files.marks || !files.fees) {
      alert("Please upload all 3 CSV files");
      return;
    }

    try {
      setLoading(true);

      const res = await uploadAPI.uploadCSV({
        attendance: files.attendance,
        marks: files.marks,
        fees: files.fees,
      });

      // ✅ Save for analytics page
      localStorage.setItem("csv_predictions", JSON.stringify(res.data));

      // ✅ Redirect
      router.push("/upload/analytics");

    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      <h1 className="text-2xl font-semibold text-foreground">
        Upload Student CSV Data
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload Required Files</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <UploadBox
            label="Attendance CSV"
            file={files.attendance}
            onChange={(e) => handleFileChange(e, "attendance")}
            onDrop={(e) => handleDrop(e, "attendance")}
            onDragOver={(e) => handleDragOver(e, "attendance")}
            onDragLeave={handleDragLeave}
            active={dragType === "attendance"}
            remove={() => setFiles((p) => ({ ...p, attendance: null }))}
          />

          <UploadBox
            label="Marks CSV"
            file={files.marks}
            onChange={(e) => handleFileChange(e, "marks")}
            onDrop={(e) => handleDrop(e, "marks")}
            onDragOver={(e) => handleDragOver(e, "marks")}
            onDragLeave={handleDragLeave}
            active={dragType === "marks"}
            remove={() => setFiles((p) => ({ ...p, marks: null }))}
          />

          <UploadBox
            label="Fees CSV"
            file={files.fees}
            onChange={(e) => handleFileChange(e, "fees")}
            onDrop={(e) => handleDrop(e, "fees")}
            onDragOver={(e) => handleDragOver(e, "fees")}
            onDragLeave={handleDragLeave}
            active={dragType === "fees"}
            remove={() => setFiles((p) => ({ ...p, fees: null }))}
          />

          <Button
            onClick={handleUpload}
            disabled={loading}
            className="w-full h-11 text-base"
          >
            {loading ? "Processing..." : "Upload & Analyze"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}

// ✅ Upload Box Component
type UploadBoxProps = {
  label: string;
  file: File | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  active: boolean;
  remove: () => void;
};

function UploadBox({
  label,
  file,
  onChange,
  onDrop,
  onDragOver,
  onDragLeave,
  active,
  remove,
}: UploadBoxProps) {
  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`border-2 border-dashed rounded-xl p-5 text-center transition ${
        active ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input
        type="file"
        accept=".csv"
        onChange={onChange}
        className="hidden"
        id={label}
      />

      {!file ? (
        <label htmlFor={label} className="cursor-pointer flex flex-col items-center gap-2">
          <UploadCloud className="w-8 h-8 text-gray-500" />
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xs text-gray-400">Click or Drag CSV</p>
        </label>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-sm">{file.name}</span>
          </div>
          <button onClick={remove}>
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}