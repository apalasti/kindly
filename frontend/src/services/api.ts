import axios from "axios";
import { tokenManager } from "../utils/token";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // TODO: When backend implements refresh tokens, attempt to refresh here
      // For now, just clear auth and redirect to login

      // Prevent infinite loops
      if (originalRequest._retry) {
        tokenManager.clearAuth();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Future refresh token logic will go here:
      // try {
      //   const newToken = await refreshAccessToken();
      //   tokenManager.setAccessToken(newToken);
      //   originalRequest.headers.Authorization = `Bearer ${newToken}`;
      //   originalRequest._retry = true;
      //   return api(originalRequest);
      // } catch (refreshError) {
      //   tokenManager.clearAuth();
      //   window.location.href = "/login";
      //   return Promise.reject(refreshError);
      // }

      tokenManager.clearAuth();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/**
 * Future function for refreshing access token
 * Will be implemented when backend adds refresh token support
 */
// async function refreshAccessToken(): Promise<string> {
//   const response = await axios.post(
//     `${API_BASE_URL}/auth/refresh`,
//     {},
//     { withCredentials: true }
//   );
//   return response.data.data.token;
// }
