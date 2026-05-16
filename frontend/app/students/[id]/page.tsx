'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import RiskBadge from '@/components/RiskBadge';
import StatCard from '@/components/StatCard';
import { studentAPI, academicAPI, financeAPI, predictionAPI, alertAPI } from '@/lib/api-client';
import { useNotification } from '@/lib/notification-context';
import { 
  Mail, 
  Phone, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Bell, 
  GraduationCap,
  DollarSign,
  AlertTriangle,
  Loader2,
  Plus,
  RefreshCw
} from 'lucide-react';

interface StudentData {
  _id: string;
  student_id: string;
  name: string;
  email: string;
  phone?: string;
  program: string;
  current_semester: number;
  enrollment_year: number;
  status: string;
  department?: string;
}

interface AcademicRecord {
  _id: string;
  semester: number;
  academic_year: string;
  attendance_percentage: number;
  test1_marks: number;
  test2_marks: number;
  average_marks?: number;
}

interface FinanceRecord {
  _id: string;
  semester: number;
  academic_year: string;
  total_fees: number;
  fees_paid: boolean;
  amount_paid: number;
  pending_amount: number;
}

interface PredictionData {
  final_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  features_used: {
    attendance_percentage: number;
    average_marks: number;
    marks_trend: number;
    attendance_flag: number;
    fee_flag: number;
    low_marks_flag: number;
    performance_ratio: number;
  };
  timestamp: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<StudentData | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAcademicForm, setShowAcademicForm] = useState(false);
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (studentId) {
      fetchAllData();
    }
  }, [studentId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching student data for ID:', studentId);
      
      // Fetch student data
      const studentRes = await studentAPI.getById(studentId);
      console.log('Student response:', studentRes);
      
      // Extract student data from response
      const studentData = studentRes.data?.data || studentRes.data;
      setStudent(studentData);
      
      // Fetch academic records
      try {
        const academicRes = await academicAPI.getByStudent(studentId);
        console.log('Academic response:', academicRes);
        const academics = academicRes.data?.data || academicRes.data || [];
        const academicsWithAvg = academics.map((record: AcademicRecord) => ({
          ...record,
          average_marks: (record.test1_marks + record.test2_marks) / 2
        }));
        setAcademicRecords(academicsWithAvg);
      } catch (e: any) {
        console.log('No academic records:', e.message);
        setAcademicRecords([]);
      }
      
      // Fetch finance records
      try {
        const financeRes = await financeAPI.getByStudent(studentId);
        console.log('Finance response:', financeRes);
        const finances = financeRes.data?.data || financeRes.data || [];
        setFinanceRecords(finances);
      } catch (e: any) {
        console.log('No finance records:', e.message);
        setFinanceRecords([]);
      }
      
      // Fetch prediction
      try {
        const predRes = await predictionAPI.getByStudent(studentId);
        console.log('Prediction response:', predRes);
        const predData = predRes.data?.data || predRes.data;
        setPrediction(predData);
      } catch (e: any) {
        console.log('No prediction:', e.message);
        setPrediction(null);
      }
      
      // Fetch alerts
      try {
        const alertsRes = await alertAPI.getByStudent(studentId);
        const alertsData = alertsRes.data?.data || alertsRes.data || [];
        setAlerts(alertsData);
      } catch (e: any) {
        console.log('No alerts:', e.message);
        setAlerts([]);
      }
      
    } catch (error: any) {
      console.error('Error fetching student data:', error);
      setError(error.message || 'Failed to load student data');
      showError('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    showSuccess('Data refreshed');
  };

  const getRiskBadgeLevel = (level?: string) => {
    if (level === 'HIGH') return 'High';
    if (level === 'MEDIUM') return 'Medium';
    if (level === 'LOW') return 'Low';
    return 'Medium';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </main>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 lg:ml-64 flex flex-col items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Student Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'Unable to load student data'}</p>
            <button
              onClick={() => window.location.href = '/students'}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Back to Students
            </button>
          </div>
        </main>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'academic', label: 'Academic Records', icon: BookOpen },
    { id: 'finance', label: 'Finance Records', icon: DollarSign },
    { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
    { id: 'alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <main className="flex-1 lg:ml-64">
        <Header title={student.name || 'Student Details'} />

        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Student Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {student.name}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    {student.email}
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      {student.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <GraduationCap className="w-4 h-4" />
                    ID: {student.student_id}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Enrolled: {student.enrollment_year}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">RISK LEVEL</p>
                  {prediction ? (
                    <RiskBadge level={getRiskBadgeLevel(prediction.risk_level)} showScore score={prediction.final_score * 100} />
                  ) : (
                    <p className="text-sm text-gray-500">No prediction yet. Add academic records first.</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">STATUS</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    student.status === 'Active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {student.status || 'Active'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">PROGRAM</p>
                  <p className="text-sm text-gray-900 dark:text-white">{student.program || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">CURRENT SEMESTER</p>
                  <p className="text-sm text-gray-900 dark:text-white">Semester {student.current_semester || 1}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="Current Semester" value={student.current_semester || 1} icon={BookOpen} color="blue" />
                    <StatCard title="Academic Records" value={academicRecords.length} icon={GraduationCap} color="green" />
                    <StatCard title="Active Alerts" value={alerts.filter((a: any) => !a.is_resolved).length} icon={Bell} color="red" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Academic Records</h3>
                    {academicRecords.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No academic records found</p>
                        <button
                          onClick={() => setActiveTab('academic')}
                          className="mt-2 text-sm text-blue-500 hover:text-blue-600"
                        >
                          Add Academic Record →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {academicRecords.slice(0, 3).map(record => (
                          <div key={record._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Semester {record.semester}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{record.academic_year}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600 dark:text-gray-300">Attendance: {record.attendance_percentage}%</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">Avg Marks: {record.average_marks?.toFixed(1)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Academic Records Tab */}
              {activeTab === 'academic' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Records</h3>
                    <button
                      onClick={() => setShowAcademicForm(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      Add Record
                    </button>
                  </div>
                  
                  {academicRecords.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No academic records found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add a record to see academic history</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left">Semester</th>
                            <th className="px-4 py-2 text-left">Year</th>
                            <th className="px-4 py-2 text-left">Attendance</th>
                            <th className="px-4 py-2 text-left">Test 1</th>
                            <th className="px-4 py-2 text-left">Test 2</th>
                            <th className="px-4 py-2 text-left">Average</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {academicRecords.map(record => (
                            <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-2">{record.semester}</td>
                              <td className="px-4 py-2">{record.academic_year}</td>
                              <td className="px-4 py-2">{record.attendance_percentage}%</td>
                              <td className="px-4 py-2">{record.test1_marks}</td>
                              <td className="px-4 py-2">{record.test2_marks}</td>
                              <td className="px-4 py-2 font-medium">{record.average_marks?.toFixed(1)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Finance Records Tab */}
              {activeTab === 'finance' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Finance Records</h3>
                    <button
                      onClick={() => setShowFinanceForm(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      Add Record
                    </button>
                  </div>
                  
                  {financeRecords.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No finance records found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add a record to see payment history</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left">Semester</th>
                            <th className="px-4 py-2 text-left">Year</th>
                            <th className="px-4 py-2 text-left">Total Fees</th>
                            <th className="px-4 py-2 text-left">Paid</th>
                            <th className="px-4 py-2 text-left">Pending</th>
                            <th className="px-4 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {financeRecords.map(record => (
                            <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-2">{record.semester}</td>
                              <td className="px-4 py-2">{record.academic_year}</td>
                              <td className="px-4 py-2">₹{record.total_fees?.toLocaleString() || 0}</td>
                              <td className="px-4 py-2">₹{record.amount_paid?.toLocaleString() || 0}</td>
                              <td className="px-4 py-2">₹{record.pending_amount?.toLocaleString() || 0}</td>
                              <td className="px-4 py-2">
                                {record.fees_paid ? (
                                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Paid</span>
                                ) : (
                                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Pending</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Risk Analysis Tab */}
              {activeTab === 'risk' && (
                <div>
                  {prediction ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                          {(prediction.final_score * 100).toFixed(1)}%
                        </div>
                        <RiskBadge level={getRiskBadgeLevel(prediction.risk_level)} size="lg" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Last updated: {new Date(prediction.timestamp).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Factors</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Attendance</span>
                              <span>{prediction.features_used?.attendance_percentage || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${prediction.features_used?.attendance_percentage || 0}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Average Marks</span>
                              <span>{prediction.features_used?.average_marks?.toFixed(1) || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${prediction.features_used?.average_marks || 0}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Performance Ratio</span>
                              <span>
  {Math.min(
    (prediction.features_used?.performance_ratio || 0) * 100,
    100
  ).toFixed(0)}
  %
</span>
                            </div>
                            <div
  className="bg-yellow-500 h-2 rounded-full"
  style={{
    width: `${Math.min(
      (prediction.features_used?.performance_ratio || 0) * 100,
      100
    )}%`,
  }}
/>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No risk prediction available</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add academic records to generate a prediction</p>
                    </div>
                  )}
                </div>
              )}

              {/* Alerts Tab */}
              {activeTab === 'alerts' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alert History</h3>
                  {alerts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No alerts found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">All clear! No alerts for this student.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {alerts.map(alert => (
                        <div key={alert._id} className={`p-4 rounded-lg border ${
                          alert.is_resolved 
                            ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{alert.alert_type || 'Alert'}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                {new Date(alert.created_at).toLocaleString()}
                              </p>
                            </div>
                            {alert.is_resolved ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Resolved</span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Active</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Academic Record Modal - Simplified */}
      {showAcademicForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Add Academic Record</h2>
              <button onClick={() => setShowAcademicForm(false)} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              try {
                await academicAPI.create({
                  student_id: studentId,
                  semester: parseInt(formData.get('semester') as string),
                  academic_year: formData.get('academic_year'),
                  attendance_percentage: parseInt(formData.get('attendance_percentage') as string),
                  test1_marks: parseInt(formData.get('test1_marks') as string),
                  test2_marks: parseInt(formData.get('test2_marks') as string),
                });
                showSuccess('Academic record added');
                fetchAllData();
                setShowAcademicForm(false);
              } catch (err) {
                showError('Failed to add record');
              }
            }} className="p-4 space-y-4">
              <input name="semester" type="number" placeholder="Semester" required className="w-full p-2 border rounded" />
              <input name="academic_year" type="text" placeholder="Academic Year (e.g., 2024-2025)" required className="w-full p-2 border rounded" />
              <input name="attendance_percentage" type="number" placeholder="Attendance %" required className="w-full p-2 border rounded" />
              <input name="test1_marks" type="number" placeholder="Test 1 Marks" required className="w-full p-2 border rounded" />
              <input name="test2_marks" type="number" placeholder="Test 2 Marks" required className="w-full p-2 border rounded" />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                <button type="button" onClick={() => setShowAcademicForm(false)} className="flex-1 px-4 py-2 border rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Finance Record Modal - Simplified */}
      {showFinanceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Add Finance Record</h2>
              <button onClick={() => setShowFinanceForm(false)} className="text-gray-500">✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              const totalFees = parseInt(formData.get('total_fees') as string);
              const amountPaid = parseInt(formData.get('amount_paid') as string);
              try {
                await financeAPI.create({
                  student_id: studentId,
                  semester: parseInt(formData.get('semester') as string),
                  academic_year: formData.get('academic_year'),
                  total_fees: totalFees,
                  amount_paid: amountPaid,
                  fees_paid: amountPaid >= totalFees,
                  pending_amount: totalFees - amountPaid,
                });
                showSuccess('Finance record added');
                fetchAllData();
                setShowFinanceForm(false);
              } catch (err) {
                showError('Failed to add record');
              }
            }} className="p-4 space-y-4">
              <input name="semester" type="number" placeholder="Semester" required className="w-full p-2 border rounded" />
              <input name="academic_year" type="text" placeholder="Academic Year" required className="w-full p-2 border rounded" />
              <input name="total_fees" type="number" placeholder="Total Fees" required className="w-full p-2 border rounded" />
              <input name="amount_paid" type="number" placeholder="Amount Paid" required className="w-full p-2 border rounded" />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                <button type="button" onClick={() => setShowFinanceForm(false)} className="flex-1 px-4 py-2 border rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}