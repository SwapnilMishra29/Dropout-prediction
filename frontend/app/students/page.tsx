'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import RiskBadge from '@/components/RiskBadge';
import { studentAPI, predictionAPI } from '@/lib/api-client';
import { useNotification } from '@/lib/notification-context';
import { Search, Plus, Eye, Trash2, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useNotification();

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching students from API...');
      
      const response = await studentAPI.getAll();
      console.log('API Response:', response);
      
      // Handle different response structures
      const studentsData = response.data?.data || response.data || [];
      console.log('Students data:', studentsData);
      
      // Fetch predictions for each student
      const studentsWithRisk = await Promise.all(
        studentsData.map(async (student: any) => {
          try {
            const predRes = await predictionAPI.getByStudent(student._id);
            const prediction = predRes?.data?.data || predRes?.data;
            return {
              ...student,
              risk_level: prediction?.risk_level,
              risk_score: prediction?.final_score,
            };
          } catch (e) {
            return { ...student, risk_level: undefined, risk_score: undefined };
          }
        })
      );
      
      setStudents(studentsWithRisk);
      setFilteredStudents(studentsWithRisk);
      
    } catch (error: any) {
      console.error('Error fetching students:', error);
      showError(error.response?.data?.error || 'Failed to load students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Refresh when page gets focus
  useEffect(() => {
    const handleFocus = () => {
      fetchStudents();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchStudents]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await studentAPI.delete(id);
        showSuccess('Student deleted successfully');
        fetchStudents(); // Refresh the list
      } catch (error) {
        showError('Failed to delete student');
      }
    }
  };

  // Filter students based on search
  useEffect(() => {
    if (search) {
      const filtered = students.filter(student =>
        student.name?.toLowerCase().includes(search.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(search.toLowerCase()) ||
        student.email?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [search, students]);

  const getRiskBadgeLevel = (level?: string) => {
    if (level === 'HIGH') return 'High';
    if (level === 'MEDIUM') return 'Medium';
    if (level === 'LOW') return 'Low';
    return 'Medium';
  };

  if (loading && !refreshing) {
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
        <Header title="Students" />

        <div className="p-4 md:p-6 lg:p-8">
          {/* Header with Add Button and Refresh */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {filteredStudents.length} students found
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href="/students/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">No students found</div>
                <Link href="/students/new" className="text-blue-500 hover:text-blue-600">
                  Add your first student →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Student</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 hidden md:table-cell">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 hidden lg:table-cell">Program</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Semester</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Risk Level</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">{student.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{student.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                          {student.student_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                          {student.program}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          Semester {student.current_semester}
                        </td>
                        <td className="px-6 py-4">
                          <RiskBadge level={getRiskBadgeLevel(student.risk_level)} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/students/${student._id}`}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(student._id, student.name)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}