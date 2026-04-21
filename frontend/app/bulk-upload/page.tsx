'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { uploadAPI } from '@/lib/api-client';
import { useNotification } from '@/lib/notification-context';
import { Upload, Download, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function BulkUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'students' | 'academic' | 'finance' | 'predict'>('students');
  const [result, setResult] = useState<any>(null);
  const { showSuccess, showError } = useNotification();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      let response;
      switch (uploadType) {
        case 'students':
          response = await uploadAPI.uploadStudents(file);
          break;
        case 'academic':
          response = await uploadAPI.uploadAcademic(file);
          break;
        case 'finance':
          response = await uploadAPI.uploadFinance(file);
          break;
        case 'predict':
          response = await uploadAPI.batchPredict(file);
          break;
      }
      
      setResult(response);
      showSuccess(`${uploadType} data uploaded successfully!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      showError(error.response?.data?.error || 'Upload failed');
      setResult({ error: error.response?.data?.error || 'Upload failed' });
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const downloadTemplate = async (type: string) => {
    try {
      const response = await uploadAPI.getTemplates();
      const templates = response?.data?.data || response?.data;
      
      let columns: string[] = [];
      let sampleData: any[] = [];
      
      // Get template based on type
      if (type === 'students' && templates?.students) {
        columns = templates.students.columns || [];
        sampleData = templates.students.sample || [];
      } else if (type === 'academic' && templates?.academic) {
        columns = templates.academic.columns || [];
        sampleData = templates.academic.sample || [];
      } else if (type === 'finance' && templates?.finance) {
        columns = templates.finance.columns || [];
        sampleData = templates.finance.sample || [];
      } else if (type === 'predict' && templates?.prediction_batch) {
        columns = templates.prediction_batch.columns || [];
        sampleData = templates.prediction_batch.sample || [];
      } else {
        // Fallback templates if API doesn't return
        const fallbackTemplates: Record<string, { columns: string[]; sample: any[] }> = {
          students: {
            columns: ['student_id', 'name', 'email', 'phone', 'program', 'enrollment_year', 'current_semester'],
            sample: [{
              student_id: 'STU001',
              name: 'John Doe',
              email: 'john@example.com',
              phone: '1234567890',
              program: 'Computer Science',
              enrollment_year: '2024',
              current_semester: '1'
            }]
          },
          academic: {
            columns: ['student_id', 'semester', 'academic_year', 'attendance_percentage', 'test1_marks', 'test2_marks'],
            sample: [{
              student_id: 'STU001',
              semester: '1',
              academic_year: '2024-2025',
              attendance_percentage: '85',
              test1_marks: '75',
              test2_marks: '80'
            }]
          },
          finance: {
            columns: ['student_id', 'semester', 'academic_year', 'total_fees', 'amount_paid'],
            sample: [{
              student_id: 'STU001',
              semester: '1',
              academic_year: '2024-2025',
              total_fees: '50000',
              amount_paid: '25000'
            }]
          },
          predict: {
            columns: ['student_id', 'attendance_percentage', 'test1_marks', 'test2_marks', 'fees_paid'],
            sample: [{
              student_id: 'STU001',
              attendance_percentage: '75',
              test1_marks: '70',
              test2_marks: '75',
              fees_paid: 'true'
            }]
          }
        };
        columns = fallbackTemplates[type]?.columns || [];
        sampleData = fallbackTemplates[type]?.sample || [];
      }
      
      if (columns.length === 0) {
        showError('No template available for this upload type');
        return;
      }
      
      // Create CSV content
      let csvContent = columns.join(',') + '\n';
      
      if (sampleData.length > 0) {
        sampleData.forEach((row: any) => {
          const rowValues = columns.map(col => {
            const value = row[col];
            // Handle values that might contain commas
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          });
          csvContent += rowValues.join(',') + '\n';
        });
      }
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_template.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSuccess(`${type} template downloaded`);
    } catch (error) {
      console.error('Template download error:', error);
      showError('Failed to download template');
    }
  };

  const uploadTypes = [
    { id: 'students' as const, label: 'Students Data', description: 'Upload student information CSV', color: 'blue' },
    { id: 'academic' as const, label: 'Academic Records', description: 'Upload marks and attendance CSV', color: 'green' },
    { id: 'finance' as const, label: 'Finance Records', description: 'Upload fee payment CSV', color: 'yellow' },
    { id: 'predict' as const, label: 'Batch Prediction', description: 'Upload student IDs for bulk prediction', color: 'purple' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <main className="flex-1 lg:ml-64">
        <Header title="Bulk Upload" />

        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Data Upload</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Upload CSV files to add multiple records at once
              </p>
            </div>

            {/* Upload Type Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {uploadTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setUploadType(type.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    uploadType === type.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <FileText className={`w-8 h-8 mx-auto mb-2 ${
                    uploadType === type.id ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{type.label}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.description}</p>
                </button>
              ))}
            </div>

            {/* Upload Area */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Upload {uploadTypes.find(t => t.id === uploadType)?.label} CSV
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Choose a CSV file with the correct format
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <div className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 cursor-pointer">
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      {uploading ? 'Uploading...' : 'Select CSV File'}
                    </div>
                  </label>
                  
                  <button
                    onClick={() => downloadTemplate(uploadType)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {result && (
              <div className={`rounded-lg p-6 ${
                result.error 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.error ? (
                    <XCircle className="w-6 h-6 text-red-500" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {result.error ? 'Upload Failed' : 'Upload Successful'}
                  </h3>
                </div>
                
                {result.error ? (
                  <p className="text-red-600 dark:text-red-400">{result.error}</p>
                ) : (
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>✅ Total records: {result.data?.total || result.total || result.successful?.length || 0}</p>
                    {result.data?.successful !== undefined && <p>✅ Successful: {result.data.successful}</p>}
                    {result.data?.failed !== undefined && <p>❌ Failed: {result.data.failed}</p>}
                    {result.data?.duplicates !== undefined && <p>⚠️ Duplicates: {result.data.duplicates}</p>}
                    
                    {result.data?.predictions && (
                      <div className="mt-4">
                        <p className="font-semibold mb-2">Predictions:</p>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {result.data.predictions.slice(0, 10).map((pred: any, idx: number) => (
                            <div key={idx} className="text-xs border-b border-gray-200 dark:border-gray-700 py-1">
                              {pred.student_id}: <span className={`font-semibold ${
                                pred.risk_level === 'HIGH' ? 'text-red-600' :
                                pred.risk_level === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                              }`}>{pred.risk_level}</span> ({pred.final_score})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">CSV Format Instructions</h3>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p className="font-medium mb-1">Students CSV columns:</p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded block overflow-x-auto">
                    student_id,name,email,phone,program,enrollment_year,current_semester
                  </code>
                </div>
                <div>
                  <p className="font-medium mb-1">Academic Records CSV columns:</p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded block overflow-x-auto">
                    student_id,semester,academic_year,attendance_percentage,test1_marks,test2_marks
                  </code>
                </div>
                <div>
                  <p className="font-medium mb-1">Finance Records CSV columns:</p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded block overflow-x-auto">
                    student_id,semester,academic_year,total_fees,amount_paid
                  </code>
                </div>
                <div>
                  <p className="font-medium mb-1">Batch Prediction CSV columns:</p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded block overflow-x-auto">
                    student_id,attendance_percentage,test1_marks,test2_marks,fees_paid
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}