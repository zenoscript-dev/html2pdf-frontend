import { authApi, type User } from '../html2pdfApi';

export interface SigninRequest {
  email: string;
  password: string;
}

export interface SigninResponseData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SigninResponse {
  success: boolean;
  message: string;
  data: SigninResponseData;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export const authKeys = {
  LOGIN: 'login',
  REFRESH: 'refresh',
  LOGOUT: 'logout',
  ME: 'me',
  FORGOT_PASSWORD: 'forgot-password',
  RESET_PASSWORD: 'reset-password',
  VERIFY_EMAIL: 'verify-email',
  RESEND_VERIFICATION: 'resend-verification',
}

export const authService = {
  /**
   * Sign in user with email and password
   */
  signin: async (email: string, password: string): Promise<SigninResponse> => {
    try {
      const response = await authApi.login(email, password);
      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return {
        success: true,
        message: 'Login successful',
        data: response,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Login failed';
      return {
        success: false,
        message: errorMessage,
        data: {} as SigninResponseData,
      };
    }
  },

  /**
   * Sign up new user
   */
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await authApi.signup(data.email, data.password);
    return response;
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<{ accessToken: string; expiresAt: number }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await authApi.refreshToken(refreshToken);
    return {
      accessToken: response.accessToken,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
  },

  /**
   * Sign out user
   */
  signout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      // Don't throw error for signout, just log it
      console.warn('Signout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await authApi.getProfile();
    return response;
  },

  /**
   * Forgot password request
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await authApi.forgotPassword(email);
    return response;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await authApi.resetPassword(token, newPassword);
    return response;
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await authApi.verifyEmail(token);
    return response;
  },

  /**
   * Resend email verification
   */
  resendVerification: async (): Promise<{ message: string }> => {
    // This would need to be implemented in the backend
    throw new Error('Resend verification not implemented');
  }
};
