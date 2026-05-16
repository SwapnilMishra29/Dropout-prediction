'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import { StatCardSkeletonGrid, ChartSkeleton } from '@/components/skeletons';
import { studentAPI, predictionAPI } from '@/lib/api-client';
import { Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    avgRiskScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const studentsRes = await studentAPI.getAll();
      const students = studentsRes.data || [];
      
      // Fetch all predictions in parallel
      const predictions = await Promise.allSettled(
        students.map(student =>
          predictionAPI.getByStudent(student._id)
            .then(res => res?.data)
            .catch(() => null)
        )
      );

      let highRisk = 0, mediumRisk = 0, lowRisk = 0;
      let totalScore = 0;
      let withPredictions = 0;
      
      predictions.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.risk_level) {
          const pred = result.value;
          if (pred.risk_level === 'HIGH') highRisk++;
          if (pred.risk_level === 'MEDIUM') mediumRisk++;
          if (pred.risk_level === 'LOW') lowRisk++;
          totalScore += pred.final_score || 0;
          withPredictions++;
        }
      });
      
      setStats({
        totalStudents: students.length,
        highRisk,
        mediumRisk,
        lowRisk,
        avgRiskScore: withPredictions > 0 ? totalScore / withPredictions : 0,
      });
      
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: 'High Risk', value: stats.highRisk, color: '#EF4444' },
    { name: 'Medium Risk', value: stats.mediumRisk, color: '#F59E0B' },
    { name: 'Low Risk', value: stats.lowRisk, color: '#10B981' },
  ].filter(item => item.value > 0);

  const barData = [
    { name: 'High Risk', count: stats.highRisk },
    { name: 'Medium Risk', count: stats.mediumRisk },
    { name: 'Low Risk', count: stats.lowRisk },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <Header title="Analytics" />
          <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <StatCardSkeletonGrid />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <main className="flex-1 lg:ml-64">
        <Header title="Analytics" />

        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="blue" />
            <StatCard title="High Risk" value={stats.highRisk} icon={AlertTriangle} color="red" />
            <StatCard title="Medium Risk" value={stats.mediumRisk} icon={TrendingUp} color="yellow" />
            <StatCard title="Low Risk" value={stats.lowRisk} icon={TrendingDown} color="green" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Risk Summary</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}