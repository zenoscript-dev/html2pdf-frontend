import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api/v1',
    withCredentials: true, // Enable cookies for refresh tokens
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 90000, // Increased to 90 seconds for PDF conversions
});

// Response interceptor for better error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            
            // Try to extract error message from response
            let errorMessage = 'An error occurred';
            
            if (data instanceof Blob) {
                // If error response is blob, convert to text
                return data.text().then((text) => {
                    try {
                        const jsonError = JSON.parse(text);
                        errorMessage = jsonError.message || errorMessage;
                    } catch {
                        errorMessage = text || errorMessage;
                    }
                    throw new Error(errorMessage);
                });
            } else if (typeof data === 'object' && data !== null) {
                errorMessage = (data as { message?: string }).message || errorMessage;
            } else if (typeof data === 'string') {
                errorMessage = data;
            }

            // Customize error messages based on status
            switch (status) {
                case 400:
                    throw new Error(errorMessage || 'Invalid request');
                case 404:
                    throw new Error('Resource not found');
                case 429:
                    throw new Error('Too many requests. Please try again later.');
                case 500:
                    throw new Error('Server error. Please try again later.');
                default:
                    throw new Error(errorMessage);
            }
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('Cannot connect to server. Please check if the backend is running.');
        } else {
            // Something else happened
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
);

export default axiosInstance;