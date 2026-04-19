const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Student types
export interface Student {
  id: string;
  name: string;
  email: string;
  enrollment_date?: string;
  department?: string;
  status?: string;
}

// Academic record types
export interface AcademicRecord {
  id: number;
  student_id: string;
  semester: string;
  gpa: number;
  credits: number;
  attendance_rate: number;
}

// Finance record types
export interface FinanceRecord {
  id: number;
  student_id: string;
  tuition_paid: number;
  tuition_due: number;
  scholarship_amount: number;
  payment_status: string;
}

// Prediction types
export interface Prediction {
  student_id: string;
  student_name?: string;
  final_score: number;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
}

// Dashboard types
export interface DashboardData {
  total_students: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  recent_predictions: Prediction[];
  risk_trend?: { date: string; high: number; medium: number; low: number }[];
}

// Alert types
export interface Alert {
  id: number;
  student_id: number;
  student_name: string;
  risk_level: string;
  message: string;
  created_at: string;
}

// Students API
// Students API (FIXED FOR YOUR BACKEND)
export const studentsAPI = {
  getAll: async (): Promise<Student[]> => {
    const data = await fetchAPI<any[]>("/students");

    return data.map((s) => ({
      id: s.student_id, // business ID (OK as primary key in your system)
      name: s.name,
      email: "",
      department: s.branch,
      enrollment_date: "",
      status: "Active",
    }));
  },

  getByStudentId: async (studentId: string) => {
    const data = await fetchAPI<any[]>(`/academic/${studentId}`);

    return data.map((r) => ({
      id: r._id,
      student_id: r.student_id,
      attendance_percentage: r.attendance_percentage,
      marks: r.marks || [],
      subjects: r.subjects || [],
    }));
  },

  create: (data: any) =>
    fetchAPI("/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (studentId: string, data: any) =>
    fetchAPI(`/students/${studentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (studentId: string) =>
    fetchAPI(`/students/${studentId}`, {
      method: "DELETE",
    }),
};

// Academic API
export const academicAPI = {
  getByStudentId: async (studentId: string) => {
    const data = await fetchAPI<any[]>(`/academic/${studentId}`);

    return data.map((r) => ({
      id: r._id,
      student_id: r.student_id,
      attendance_percentage: r.attendance_percentage,
      marks: r.marks || [],
      subjects: r.subjects || [],
    }));
  },

  create: (data: any) =>
    fetchAPI("/academic", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
// Finance API
// Finance API
export const financeAPI = {
  // Get all finance records for a student
  getByStudentId: async (studentId: string): Promise<FinanceRecord[]> => {
    const data = await fetchAPI<any[]>(`/finance/${studentId}`);

    // Map backend fields to frontend FinanceRecord type
    return data.map((r) => ({
      id: r._id,
      student_id: r.student_id,
      tuition_paid: r.fee_paid ? 1 : 0,          // boolean → number for frontend
      tuition_due: r.pending_amount ?? 0,        // pending_amount → tuition_due
      scholarship_amount: r.scholarship_amount ?? 0,
      payment_status: r.payment_status ?? (r.pending_amount > 0 ? "Partial" : "Paid"),
    }));
  },

  // Create new finance record (map frontend → backend fields)
  create: async (data: Omit<FinanceRecord, "id">): Promise<FinanceRecord> => {
    // Map frontend fields to backend schema
    const payload = {
      student_id: data.student_id,
        fee_paid: data.tuition_paid > 0, // true if tuition_paid > 0
        pending_amount: data.tuition_due,
        scholarship_amount: data.scholarship_amount,
        payment_status: data.payment_status,
    };

    return fetchAPI<FinanceRecord>("/finance", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};


// Prediction API
export const predictionAPI = {
  getAll: async (): Promise<Prediction[]> => {
    const data = await fetchAPI<any[]>("/risks");

    return data
      .filter((item) => item.student_id !== null) // 🔥 IMPORTANT
      .map((item) => ({
        student_id: item.student_id.student_id,
        student_name: item.student_id.name,
        final_score: item.final_score,
        risk_level: item.risk_level,
      }));
  },

  predict: async (studentId: string): Promise<Prediction> => {
    const data = await fetchAPI<any>(`/risks/predict/${studentId}`);

    return {
      student_id: data.student_id.student_id,
      student_name: data.student_id.name,
      final_score: data.final_score,
      risk_level: data.risk_level,
    };
  },
};

// Dashboard API
export const dashboardAPI = {
  get: () => fetchAPI<DashboardData>("/dashboard/summary"),
};

// Alerts API
export const alertsAPI = {
  getAll: async (): Promise<any[]> => {
    const data = await fetchAPI<any[]>("/alerts");

    return (data || [])
      .filter((a) => a) // remove null alerts
      .map((a) => ({
        id: a._id,
        
        // keep FULL object (IMPORTANT FIX)
        student_id: a.student_id || null,

        student_name: a.student_id?.name || "Deleted Student",
        student_code: a.student_id?.student_id || "N/A",

        alert_type: a.alert_type,
        message: a.message,
        created_at: a.created_at,
      }));
  },
};

// Upload API
export const uploadAPI = {
  uploadCSV: async (files: {
    attendance: File;
    marks: File;
    fees: File;
  }) => {
    const formData = new FormData();

    formData.append("attendance", files.attendance);
    formData.append("marks", files.marks);
    formData.append("fees", files.fees);

    const response = await fetch(`${BASE_URL}/upload/csv`, {
      method: "POST",
      body: formData, // ❗ DO NOT set Content-Type manually
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errText}`);
    }

    return response.json();
  },
};

