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
  const [currentPage, setCurrentPage] = useState(1);
  const { showSuccess, showError } = useNotification();
  const ITEMS_PER_PAGE = 10;

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
      setCurrentPage(1);
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
    { id: 'predict' as const, label: 'Batch Prediction', description: 'Upload CSV for bulk dropout prediction', color: 'purple' },
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
                Upload CSV files to add multiple records or run batch predictions
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

            {/* Results with Sorting */}
            {result && (
              <div className={`rounded-lg p-6 ${
                result.error 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              }`}>
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {result.error ? (
                      <XCircle className="w-6 h-6 text-red-500" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {result.error ? 'Upload Failed' : 'Upload Successful'}
                    </h3>
                  </div>
                  
                  {/* Sort Controls - Only show for predictions */}
                  {!result.error && result.data?.predictions && Array.isArray(result.data.predictions) && result.data.predictions.length > 0 && (
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => {
                          const sortBy = e.target.value;
                          if (!sortBy || !result.data.predictions) return;
                          
                          const sortedPredictions = [...result.data.predictions];
                          
                          try {
                            if (sortBy === 'risk_high') {
                              const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                              sortedPredictions.sort((a, b) => {
                                const riskA = riskOrder[a.risk_level as keyof typeof riskOrder] || 0;
                                const riskB = riskOrder[b.risk_level as keyof typeof riskOrder] || 0;
                                return riskB - riskA;
                              });
                            } else if (sortBy === 'risk_low') {
                              const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                              sortedPredictions.sort((a, b) => {
                                const riskA = riskOrder[a.risk_level as keyof typeof riskOrder] || 0;
                                const riskB = riskOrder[b.risk_level as keyof typeof riskOrder] || 0;
                                return riskA - riskB;
                              });
                            } else if (sortBy === 'score_high') {
                              sortedPredictions.sort((a, b) => (b.final_score || 0) - (a.final_score || 0));
                            } else if (sortBy === 'score_low') {
                              sortedPredictions.sort((a, b) => (a.final_score || 0) - (b.final_score || 0));
                            } else if (sortBy === 'student_az') {
                              sortedPredictions.sort((a, b) => (a.student_id || '').localeCompare(b.student_id || ''));
                            } else if (sortBy === 'student_za') {
                              sortedPredictions.sort((a, b) => (b.student_id || '').localeCompare(a.student_id || ''));
                            }
                            
                            setResult({
                              ...result,
                              data: {
                                ...result.data,
                                predictions: sortedPredictions
                              }
                            });
                          } catch (error) {
                            console.error('Sorting error:', error);
                          }
                        }}
                        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                      >
                        <option value="">Sort by...</option>
                        <option value="risk_high">⚠️ Risk Level (High to Low)</option>
                        <option value="risk_low">✅ Risk Level (Low to High)</option>
                        <option value="score_high">📊 Risk Score (High to Low)</option>
                        <option value="score_low">📊 Risk Score (Low to High)</option>
                        <option value="student_az">🔤 Student ID (A to Z)</option>
                        <option value="student_za">🔤 Student ID (Z to A)</option>
                      </select>
                      
                      {/* Quick sort buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            if (!result.data?.predictions) return;
                            const sorted = [...result.data.predictions];
                            const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                            sorted.sort((a, b) => {
                              const riskA = riskOrder[a.risk_level as keyof typeof riskOrder] || 0;
                              const riskB = riskOrder[b.risk_level as keyof typeof riskOrder] || 0;
                              return riskB - riskA;
                            });
                            setResult({
                              ...result,
                              data: { ...result.data, predictions: sorted }
                            });
                          }}
                          className="px-2 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Show High Risk First"
                        >
                          🔴 High First
                        </button>
                        <button
                          onClick={() => {
                            if (!result.data?.predictions) return;
                            const sorted = [...result.data.predictions];
                            sorted.sort((a, b) => (b.final_score || 0) - (a.final_score || 0));
                            setResult({
                              ...result,
                              data: { ...result.data, predictions: sorted }
                            });
                          }}
                          className="px-2 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          title="Sort by Score"
                        >
                          📊 Score
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {result.error ? (
                  <p className="text-red-600 dark:text-red-400">{result.error}</p>
                ) : (
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    {/* Summary Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center shadow-sm">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Records</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {result.data?.total || result.total || result.successful?.length || 0}
                        </p>
                      </div>
                      {result.data?.successful !== undefined && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center shadow-sm">
                          <p className="text-xs text-green-600 dark:text-green-400">✅ Successful</p>
                          <p className="text-lg font-bold text-green-700 dark:text-green-300">{result.data.successful}</p>
                        </div>
                      )}
                      {result.data?.failed !== undefined && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center shadow-sm">
                          <p className="text-xs text-red-600 dark:text-red-400">❌ Failed</p>
                          <p className="text-lg font-bold text-red-700 dark:text-red-300">{result.data.failed}</p>
                        </div>
                      )}
                      {result.data?.duplicates !== undefined && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 text-center shadow-sm">
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">⚠️ Duplicates</p>
                          <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{result.data.duplicates}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Predictions Display */}
                    {result.data?.predictions && Array.isArray(result.data.predictions) && result.data.predictions.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            📋 Predictions ({result.data.predictions.length} students):
                          </p>
                          <div className="flex gap-2">
                            <span className="inline-flex items-center gap-1 text-xs">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              <span className="text-gray-600 dark:text-gray-400">High Risk</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs">
                              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                              <span className="text-gray-600 dark:text-gray-400">Medium Risk</span>
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>
                              <span className="text-gray-600 dark:text-gray-400">Low Risk</span>
                            </span>
                          </div>
                        </div>
                        
                        {/* Risk Summary Bar */}
                        {result.data.predictions.length > 0 && (
                          <div className="flex h-2 rounded-full overflow-hidden mb-4">
                            <div 
                              className="bg-red-500 transition-all duration-300"
                              style={{ width: `${(result.data.predictions.filter((p: any) => p.risk_level === 'HIGH').length / result.data.predictions.length) * 100}%` }}
                            />
                            <div 
                              className="bg-yellow-500 transition-all duration-300"
                              style={{ width: `${(result.data.predictions.filter((p: any) => p.risk_level === 'MEDIUM').length / result.data.predictions.length) * 100}%` }}
                            />
                            <div 
                              className="bg-green-500 transition-all duration-300"
                              style={{ width: `${(result.data.predictions.filter((p: any) => p.risk_level === 'LOW').length / result.data.predictions.length) * 100}%` }}
                            />
                          </div>
                        )}
                        
                        {/* Predictions List with Pagination */}
                        {(() => {
                          const totalPages = Math.ceil(result.data.predictions.length / ITEMS_PER_PAGE);
                          const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
                          const endIdx = startIdx + ITEMS_PER_PAGE;
                          const paginatedPredictions = result.data.predictions.slice(startIdx, endIdx);
                          
                          return (
                            <>
                              <div className="space-y-1 max-h-60 overflow-y-auto">
                                {paginatedPredictions.map((pred: any, idx: number) => (
                                  <div key={idx} className="text-xs border-b border-gray-200 dark:border-gray-700 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors px-2 rounded">
                                    <div className="flex items-center justify-between">
                                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                                        {pred.student_id}
                                      </span>
                                      <span className={`font-semibold px-2 py-0.5 rounded-full ${
                                        pred.risk_level === 'HIGH' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                        pred.risk_level === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 
                                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      }`}>
                                        {pred.risk_level}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-gray-500 dark:text-gray-400">Risk Score:</span>
                                      <div className="flex items-center gap-2">
                                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                          <div 
                                            className={`h-1.5 rounded-full transition-all ${
                                              pred.final_score >= 70 ? 'bg-green-500' :
                                              pred.final_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${pred.final_score}%` }}
                                          />
                                        </div>
                                        <span className={`font-semibold ${
                                          pred.final_score >= 70 ? 'text-green-600 dark:text-green-400' :
                                          pred.final_score >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                          {pred.final_score}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Pagination Controls */}
                              {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Page {currentPage} of {totalPages} • Showing {paginatedPredictions.length} of {result.data.predictions.length} results
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                      disabled={currentPage === 1}
                                      className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    >
                                      ← Previous
                                    </button>
                                    <div className="flex gap-1">
                                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                          key={page}
                                          onClick={() => setCurrentPage(page)}
                                          className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                                            currentPage === page
                                              ? 'bg-indigo-500 text-white'
                                              : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                          }`}
                                        >
                                          {page}
                                        </button>
                                      ))}
                                    </div>
                                    <button
                                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                      disabled={currentPage === totalPages}
                                      className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    >
                                      Next →
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
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
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    📌 Note: fees_paid should be 'true' or 'false'
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}