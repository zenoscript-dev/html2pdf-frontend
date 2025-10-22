import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6700/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Key management
let currentApiKey: string | null = null;

export const setApiKey = (apiKey: string) => {
  currentApiKey = apiKey;
};

export const clearApiKey = () => {
  currentApiKey = null;
};

// Request interceptor to add auth token and API key
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add X-API-Key header if API key is set
    if (currentApiKey) {
      config.headers['X-API-Key'] = currentApiKey;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  plan: {
    id: string;
    name: string;
    dailyRequestLimit: number;
    monthlyRequestLimit: number;
    maxFileSizeMB: number;
    maxPagesPerPdf: number;
    price: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string; // Only prefix shown (e.g., "pdf_live_1234...")
  type: 'LIVE' | 'TEST';
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
  // Full key is NEVER returned after creation
}

export interface CreateApiKeyRequest {
  name: string;
  type: 'LIVE' | 'TEST';
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string; // Full key only returned ONCE during creation
  keyPrefix: string;
  type: 'LIVE' | 'TEST';
  isActive: boolean;
  createdAt: string;
}

export interface UsageRecord {
  id: string;
  endpoint: string;
  method: string;
  status: 'SUCCESS' | 'FAILED';
  statusCode: number;
  fileSizeBytes: number;
  pagesGenerated: number;
  processingTimeMs: number;
  createdAt: string;
  apiKey: {
    name: string;
    type: string;
  };
}

export interface UsageStatistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalFileSize: number;
  totalPages: number;
  averageProcessingTime: number;
  dailyUsage: Array<{
    date: string;
    requests: number;
    successRate: number;
  }>;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  dailyRequestLimit: number;
  monthlyRequestLimit: number;
  maxFileSizeMB: number;
  maxPagesPerPdf: number;
  maxConcurrentJobs: number;
  webhooksEnabled: boolean;
  priorityProcessing: boolean;
  customWatermark: boolean;
  apiAccess: boolean;
  sandboxEnabled: boolean;
  isActive: boolean;
  isDefault: boolean;
}

export interface PdfOptions {
  format?: string;
  orientation?: 'portrait' | 'landscape';
  margin?: string;
  scale?: number;
  displayHeaderFooter?: boolean;
  printBackground?: boolean;
}

export interface QuotaStatus {
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  remainingDaily: number;
  remainingMonthly: number;
  resetTime: string;
}

// Auth API
export const authApi = {
  signup: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/signup', { email, password });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },
};

// API Keys API
export const apiKeysApi = {
  getAll: async (): Promise<ApiKey[]> => {
    const response = await apiClient.get('/api-keys');
    return response.data;
  },

  create: async (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
    const response = await apiClient.post('/api-keys', data);
    return response.data;
  },

  getById: async (id: string): Promise<ApiKey> => {
    const response = await apiClient.get(`/api-keys/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateApiKeyRequest & { isActive: boolean }>) => {
    const response = await apiClient.patch(`/api-keys/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api-keys/${id}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await apiClient.get('/api-keys/statistics');
    return response.data;
  },
};

// Usage API
export const usageApi = {
  getUserUsage: async (startDate?: string, endDate?: string): Promise<UsageRecord[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/usage?${params.toString()}`);
    return response.data;
  },

  getUserStatistics: async (startDate?: string, endDate?: string): Promise<UsageStatistics> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/usage/statistics?${params.toString()}`);
    return response.data;
  },

  getUserSummary: async (period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<UsageStatistics> => {
    const response = await apiClient.get(`/usage/summary?period=${period}`);
    return response.data;
  },

  getApiKeyUsage: async (apiKeyId: string): Promise<UsageRecord[]> => {
    const response = await apiClient.get(`/usage/api-key/${apiKeyId}`);
    return response.data;
  },
};

// Plans API
export const plansApi = {
  getAll: async (includeInactive = false): Promise<Plan[]> => {
    const response = await apiClient.get(`/plans?includeInactive=${includeInactive}`);
    return response.data;
  },

  getById: async (id: string): Promise<Plan> => {
    const response = await apiClient.get(`/plans/${id}`);
    return response.data;
  },

  upgradePlan: async (planId: string) => {
    const response = await apiClient.post(`/plans/upgrade/${planId}`);
    return response.data;
  },
};

// PDF API
export const pdfApi = {
  getQuotaStatus: async (): Promise<QuotaStatus> => {
    const response = await apiClient.get('/pdf/quota');
    return response.data;
  },

  // PDF generation methods - API key sent via X-API-Key header
  generateFromHtml: async (html: string, options?: PdfOptions) => {
    const response = await apiClient.post('/pdf/generate-from-html', 
      { html, options },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  generateFromUrl: async (url: string, options?: PdfOptions) => {
    const response = await apiClient.post('/pdf/generate-from-url',
      { url, options },
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  generateFromHtmlFile: async (file: File, options?: PdfOptions) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await apiClient.post('/pdf/generate-from-html-file',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      }
    );
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getAllUsers: async (page = 1, limit = 50) => {
    const response = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getUserById: async (userId: string) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  deactivateUser: async (userId: string) => {
    const response = await apiClient.patch(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  activateUser: async (userId: string) => {
    const response = await apiClient.patch(`/admin/users/${userId}/activate`);
    return response.data;
  },

  changeUserPlan: async (userId: string, planId: string) => {
    const response = await apiClient.patch(`/admin/users/${userId}/plan/${planId}`);
    return response.data;
  },

  promoteToAdmin: async (userId: string) => {
    const response = await apiClient.patch(`/admin/users/${userId}/promote`);
    return response.data;
  },

  demoteFromAdmin: async (userId: string) => {
    const response = await apiClient.patch(`/admin/users/${userId}/demote`);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getSystemOverview: async () => {
    const response = await apiClient.get('/admin/analytics/overview');
    return response.data;
  },

  getDetailedStatistics: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/admin/analytics/statistics?${params.toString()}`);
    return response.data;
  },

  getUserGrowth: async (days = 30) => {
    const response = await apiClient.get(`/admin/analytics/user-growth?days=${days}`);
    return response.data;
  },

  getPlanDistribution: async () => {
    const response = await apiClient.get('/admin/analytics/plan-distribution');
    return response.data;
  },
};

export default apiClient;
