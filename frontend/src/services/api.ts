import axios, { type AxiosRequestConfig } from "axios";
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

// --- Refresh token coordination state ---
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

type RetryableAxiosRequestConfig = AxiosRequestConfig & { _retry?: boolean };

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string> {
  // Uses HttpOnly refresh token cookie (sent via withCredentials)
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );
  const newToken = response.data?.data?.token as string | undefined;
  if (!newToken) {
    throw new Error("No access token returned by refresh endpoint");
  }
  tokenManager.setAccessToken(newToken);
  return newToken;
}

function setAuthHeader(cfg: RetryableAxiosRequestConfig, token: string) {
  if (!cfg.headers) cfg.headers = {};
  (cfg.headers as Record<string, string>).Authorization = `Bearer ${token}`;
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      // Prepend bearer token to outgoing requests
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
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
  const originalRequest: RetryableAxiosRequestConfig = (error.config || {}) as RetryableAxiosRequestConfig;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Avoid trying to refresh for auth endpoints themselves
      const reqUrl: string = originalRequest?.url || "";
      const isAuthEndpoint =
        reqUrl.includes("/auth/login") ||
        reqUrl.includes("/auth/register") ||
        reqUrl.includes("/auth/refresh") ||
        reqUrl.includes("/auth/logout");

      if (isAuthEndpoint) {
        // If auth endpoints return 401, just reject
        return Promise.reject(error);
      }

      // Prevent infinite retry loops
      if (originalRequest._retry) {
        tokenManager.clearAuth();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            try {
              setAuthHeader(originalRequest, token);
              originalRequest._retry = true;
              resolve(api(originalRequest));
            } catch (e) {
              reject(e);
            }
          });
        });
      }

      // Start refresh flow
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newToken);

        // Retry the original request with new token
        setAuthHeader(originalRequest, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        tokenManager.clearAuth();
        // Redirect to login on refresh failure
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Future function for refreshing access token
 * Will be implemented when backend adds refresh token support
 */
// Kept above as an actual implementation
