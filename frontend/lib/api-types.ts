// Student Risk Assessment Types
export interface RiskAssessment {
  id: string;
  studentId: string;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  assessmentDate: string;
  lastUpdated: string;
  riskFactors: string[];
}

// Student Types
export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentDate: string;
  grade: string;
  major: string;
  gpa: number;
  attendanceRate: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  lastAssessmentDate: string;
  status: 'Active' | 'At-Risk' | 'Intervention' | 'Success';
}

// Attendance Record
export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
  courseId: string;
  courseName: string;
}

// Academic Performance
export interface AcademicPerformance {
  id: string;
  studentId: string;
  semester: string;
  gpa: number;
  coursesEnrolled: number;
  coursesCompleted: number;
  failingCourses: number;
  trend: 'Improving' | 'Stable' | 'Declining';
  lastUpdated: string;
}

// Engagement Metrics
export interface EngagementMetrics {
  id: string;
  studentId: string;
  libraryVisits: number;
  tutoringSessions: number;
  labHours: number;
  onlineCourseCompletion: number;
  forumParticipation: number;
  lastInteractionDate: string;
}

// Intervention Record
export interface InterventionRecord {
  id: string;
  studentId: string;
  type: 'Academic Support' | 'Counseling' | 'Financial Aid' | 'Mentorship' | 'Other';
  date: string;
  description: string;
  assignedTo: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  followUpDate: string | null;
}

// Alert
export interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  type: 'Attendance' | 'Academic' | 'Engagement' | 'Behavioral' | 'Financial';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  createdDate: string;
  status: 'Active' | 'Resolved' | 'Acknowledged';
  actionRequired: boolean;
}

// Analytics Data
export interface AnalyticsData {
  totalStudents: number;
  atRiskStudents: number;
  interventionInProgress: number;
  successRate: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  trendData: Array<{
    date: string;
    riskScore: number;
    interventions: number;
  }>;
}

// Bulk Upload Data
export interface BulkUploadData {
  fileName: string;
  uploadDate: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: Array<{
    rowNumber: number;
    error: string;
  }>;
}

// Settings
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  defaultRiskThreshold: number;
  autoAssessmentFrequency: 'Daily' | 'Weekly' | 'Monthly';
  language: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
