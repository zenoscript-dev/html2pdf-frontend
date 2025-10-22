// import { AuthContext, type AuthContextType } from '@/contexts/auth-context';
import axiosInstance from '@/core/api/axiosInstance';
import type {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import {
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode
} from 'react';

type AuthProviderProps = {
  children: ReactNode;
};

import { createContext, useContext } from 'react';

import type { User } from '@/services/html2pdfApi';

export type AuthContextType = {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }: AuthProviderProps) => {
  
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Fetch current user on initial load for protected routes
  useEffect(() => {
    const fetchMe = async () => {
      try {
        // Get current path
        const currentPath = window.location.pathname;
        
        // Import and check if current route is protected
        const { isProtectedRoute } = await import('@/core/config/routes');
        
        // Only fetch user data if on a protected route
        if (isProtectedRoute(currentPath)) {
          const response = await axiosInstance.get<User>('/auth/profile');
          setUser(response.data);
          // Token should already be set from localStorage or previous session
          const storedToken = localStorage.getItem('accessToken');
          if (storedToken) {
            setToken(storedToken);
          }
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (error: unknown) {
        console.error('Failed to fetch user profile:', error);
        setToken(null);
        setUser(null);
        // Clear any stored tokens on error
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    };

    fetchMe();
  }, []);

  // Inject token in every request
  useLayoutEffect(() => {
    const authInterceptor = axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (!config.headers._retry && token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(authInterceptor);
    };
  }, [token]);

  // Auto-refresh token on 403 unauthorized error
  useLayoutEffect(() => {
    const refreshInterceptor = axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (
          error.response?.status === 401 &&
          (error.response?.data as { message?: string })?.message === 'Unauthorized' &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            const response = await axiosInstance.get<{ accessToken: string }>('/refreshToken');
            setToken(response.data.accessToken);

            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${response.data.accessToken}`
            };

            return axiosInstance(originalRequest);
          } catch (refreshError) {
            setToken(null);
            return Promise.reject(refreshError);
          }
        }
        else {
          if(error.response?.status === 500) {
            window.location.href = '/internal-server-error';
          }
          if(error.response?.status === 401) {
            window.location.href = '/unauthorized';
          }
          if(error.response?.status === 403) {
            window.location.href = '/forbidden';
          }
          if(error.response?.status === 503) {
            window.location.href = '/maintenance';
          }
        //   if(error.response?.status === 404) {
        //     window.location.href = '/not-found';
        //   }
      }


        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(refreshInterceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
