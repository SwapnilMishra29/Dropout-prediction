import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = 'https://dropout-prediction-kl17.onrender.com/api';

console.log('🔌 API Base URL:', API_BASE_URL);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`📥 ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        if (error.code === 'ECONNREFUSED') {
          console.error('❌ Backend not running on', API_BASE_URL);
        } else {
          console.error('API Error:', error.response?.data || error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // ===== Students =====
  async getStudents(params?: any) {
    try {
      const response = await this.client.get('/students', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch students:', error);
      return { success: true, data: [] };
    }
  }

  async getStudentById(id: string) {
    const response = await this.client.get(`/students/${id}`);
    return response.data;
  }

  async createStudent(data: any) {
    const response = await this.client.post('/students', data);
    return response.data;
  }

  async updateStudent(id: string, data: any) {
    const response = await this.client.put(`/students/${id}`, data);
    return response.data;
  }

  async deleteStudent(id: string) {
    const response = await this.client.delete(`/students/${id}`);
    return response.data;
  }

  async getStudentRiskSummary(id: string) {
    try {
      const response = await this.client.get(`/students/risk-summary/${id}`);
      return response.data;
    } catch {
      return { success: true, data: null };
    }
  }

  // ===== Academic Records =====
  async getAcademicRecords(studentId: string) {
    try {
      const response = await this.client.get(`/academic/student/${studentId}`);
      return response.data;
    } catch {
      return { success: true, data: [] };
    }
  }

  async createAcademicRecord(data: any) {
    const response = await this.client.post('/academic', data);
    return response.data;
  }

  async updateAcademicRecord(id: string, data: any) {
    const response = await this.client.put(`/academic/${id}`, data);
    return response.data;
  }

  async deleteAcademicRecord(id: string) {
    const response = await this.client.delete(`/academic/${id}`);
    return response.data;
  }

  async getAcademicSummary(studentId: string) {
    try {
      const response = await this.client.get(`/academic/summary/${studentId}`);
      return response.data;
    } catch {
      return { success: true, data: null };
    }
  }

  // ===== Finance Records =====
  async getFinanceRecords(studentId: string) {
    try {
      const response = await this.client.get(`/finance/student/${studentId}`);
      return response.data;
    } catch {
      return { success: true, data: [] };
    }
  }

  async getLatestFinance(studentId: string) {
    try {
      const response = await this.client.get(`/finance/latest/${studentId}`);
      return response.data;
    } catch {
      return { success: true, data: { fees_paid: true } };
    }
  }

  async createFinanceRecord(data: any) {
    const response = await this.client.post('/finance', data);
    return response.data;
  }

  async updateFinanceRecord(id: string, data: any) {
    const response = await this.client.put(`/finance/${id}`, data);
    return response.data;
  }

  async deleteFinanceRecord(id: string) {
    const response = await this.client.delete(`/finance/${id}`);
    return response.data;
  }

  // ===== Predictions =====
  async getPrediction(studentId: string) {
    try {
      const response = await this.client.get(`/predictions/${studentId}`);
      return response.data;
    } catch {
      return { success: true, data: null };
    }
  }

  async getPredictionHistory(studentId: string, limit: number = 10) {
    try {
      const response = await this.client.get(`/predictions/history/${studentId}`, { params: { limit } });
      return response.data;
    } catch {
      return { success: true, data: [] };
    }
  }

  async getPredictionStatistics() {
    try {
      const response = await this.client.get('/predictions/statistics/all');
      return response.data;
    } catch {
      return { success: true, data: { high_risk: 0, medium_risk: 0, low_risk: 0 } };
    }
  }

  // ===== Alerts =====
  async getAlerts(params?: any) {
    try {
      const response = await this.client.get('/alerts', { params });
      return response.data;
    } catch {
      return { success: true, data: [] };
    }
  }

  async getStudentAlerts(studentId: string) {
    try {
      const response = await this.client.get(`/alerts/student/${studentId}`);
      return response.data;
    } catch {
      return { success: true, data: [] };
    }
  }

  async resolveAlert(id: string, data?: any) {
    const response = await this.client.put(`/alerts/${id}/resolve`, data || { resolution_notes: 'Resolved via dashboard' });
    return response.data;
  }

  async getAlertStatistics() {
    try {
      const response = await this.client.get('/alerts/statistics');
      return response.data;
    } catch {
      return { success: true, data: { total: 0, unresolved: 0 } };
    }
  }

  // ===== Upload Methods =====
  async uploadStudents(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/upload/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async uploadAcademic(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/upload/academic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async uploadFinance(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/upload/finance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async batchPredict(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post('/upload/predict', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getUploadTemplates() {
    const response = await this.client.get('/upload/templates');
    return response.data;
  }
}

// Export singleton
export const apiClient = new ApiClient();

// Student API
export const studentAPI = {
  getAll: (params?: any) => apiClient.getStudents(params),
  getById: (id: string) => apiClient.getStudentById(id),
  create: (data: any) => apiClient.createStudent(data),
  update: (id: string, data: any) => apiClient.updateStudent(id, data),
  delete: (id: string) => apiClient.deleteStudent(id),
  getRiskSummary: (id: string) => apiClient.getStudentRiskSummary(id),
};

// Academic API
export const academicAPI = {
  getByStudent: (studentId: string) => apiClient.getAcademicRecords(studentId),
  create: (data: any) => apiClient.createAcademicRecord(data),
  update: (id: string, data: any) => apiClient.updateAcademicRecord(id, data),
  delete: (id: string) => apiClient.deleteAcademicRecord(id),
  getSummary: (studentId: string) => apiClient.getAcademicSummary(studentId),
};

// Finance API
export const financeAPI = {
  getByStudent: (studentId: string) => apiClient.getFinanceRecords(studentId),
  getLatest: (studentId: string) => apiClient.getLatestFinance(studentId),
  create: (data: any) => apiClient.createFinanceRecord(data),
  update: (id: string, data: any) => apiClient.updateFinanceRecord(id, data),
  delete: (id: string) => apiClient.deleteFinanceRecord(id),
};

// Prediction API
export const predictionAPI = {
  getByStudent: (studentId: string) => apiClient.getPrediction(studentId),
  getHistory: (studentId: string, limit?: number) => apiClient.getPredictionHistory(studentId, limit),
  getStatistics: () => apiClient.getPredictionStatistics(),
};

// Alert API
export const alertAPI = {
  getAll: (params?: any) => apiClient.getAlerts(params),
  getByStudent: (studentId: string) => apiClient.getStudentAlerts(studentId),
  resolve: (id: string, data?: any) => apiClient.resolveAlert(id, data),
  getStatistics: () => apiClient.getAlertStatistics(),
};

// Upload API - ADD THIS
export const uploadAPI = {
  uploadStudents: (file: File) => apiClient.uploadStudents(file),
  uploadAcademic: (file: File) => apiClient.uploadAcademic(file),
  uploadFinance: (file: File) => apiClient.uploadFinance(file),
  batchPredict: (file: File) => apiClient.batchPredict(file),
  getTemplates: () => apiClient.getUploadTemplates(),
};

export default apiClient;