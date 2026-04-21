'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import DataTable from '@/components/DataTable';
import { studentAPI, predictionAPI, alertAPI } from '@/lib/api-client';
import { useNotification } from '@/lib/notification-context';
import { Users, AlertTriangle, TrendingUp, Bell, Loader2 } from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    highRisk: 0,
    avgRiskScore: 0,
    activeAlerts: 0,
  });
  const { showError } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch students
      const studentsRes = await studentAPI.getAll();
      const studentsData = studentsRes.data || [];
      setStudents(studentsData);
      
      // Fetch predictions for each student
      let highRisk = 0;
      let totalRiskScore = 0;
      let studentsWithRisk = 0;
      
      for (const student of studentsData) {
        try {
          const predRes = await predictionAPI.getByStudent(student._id);
          const prediction = predRes.data;
          if (prediction && prediction.risk_level) {
            if (prediction.risk_level === 'HIGH') highRisk++;
            totalRiskScore += prediction.final_score || 0;
            studentsWithRisk++;
          }
        } catch (e) {
          // No prediction yet
        }
      }
      
      const avgRiskScore = studentsWithRisk > 0 ? totalRiskScore / studentsWithRisk : 0;
      
      // Fetch alerts
      const alertsRes = await alertAPI.getAll();
      const alerts = alertsRes.data || [];
      const activeAlerts = alerts.filter((a: any) => !a.is_resolved).length;
      
      setStats({
        totalStudents: studentsData.length,
        highRisk: highRisk,
        avgRiskScore: avgRiskScore,
        activeAlerts: activeAlerts,
      });
      
    } catch (error) {
      console.error('Dashboard error:', error);
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'Low Risk', value: stats.totalStudents - stats.highRisk, color: '#10B981' },
    { name: 'High Risk', value: stats.highRisk, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const trendData = [
    { month: 'Jan', riskScore: 0.42 },
    { month: 'Feb', riskScore: 0.45 },
    { month: 'Mar', riskScore: 0.48 },
    { month: 'Apr', riskScore: 0.44 },
    { month: 'May', riskScore: 0.41 },
    { month: 'Jun', riskScore: 0.39 },
  ];

  const studentColumns = [
    { key: 'student_id', label: 'Student ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'program', label: 'Program', sortable: true },
    { 
      key: 'risk_level', 
      label: 'Risk Level', 
      render: () => <RiskBadge level="Medium" size="sm" />
    },
  ];

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

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <main className="flex-1 lg:ml-64">
        <Header title="Dashboard" />

        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="blue" />
            <StatCard title="High Risk Students" value={stats.highRisk} icon={AlertTriangle} color="red" />
            <StatCard title="Avg Risk Score" value={`${(stats.avgRiskScore * 100).toFixed(1)}%`} icon={TrendingUp} color="yellow" />
            <StatCard title="Active Alerts" value={stats.activeAlerts} icon={Bell} color="green" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="riskScore" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Students</h3>
            </div>
            <DataTable columns={studentColumns} data={students.slice(0, 5)} />
          </div>
        </div>
      </main>
    </div>
  );
}