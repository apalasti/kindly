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
  paramsSerializer: {
    indexes: null,
  },
});

// --- Refresh token coordination state ---
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;

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
  const newToken = response.data?.token as string | undefined;
  if (!newToken) {
    throw new Error("No access token returned by refresh endpoint");
  }
  tokenManager.setAccessToken(newToken);
  scheduleProactiveRefresh(newToken);
  return newToken;
}

function scheduleProactiveRefresh(token: string) {
  // Clear any existing timer
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }

  // Check if token is expired or will expire soon
  const payload = tokenManager.decodeToken(token);
  if (!payload || !payload.exp || typeof payload.exp !== "number") {
    return;
  }

  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const timeUntilExpiry = expirationTime - currentTime;

  // Refresh 1 minute before expiry (or immediately if less than 1 minute left)
  const refreshBuffer = 60 * 1000; // 1 minute in milliseconds
  const timeUntilRefresh = Math.max(0, timeUntilExpiry - refreshBuffer);

  proactiveRefreshTimer = setTimeout(async () => {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        await refreshAccessToken();
        isRefreshing = false;
      }
    } catch (error) {
      isRefreshing = false;
      console.error("Proactive token refresh failed:", error);
      // Don't redirect here - let the next API call handle it
    }
  }, timeUntilRefresh);
}

// Export function to initialize proactive refresh on app load
export function initializeTokenRefresh() {
  const token = tokenManager.getAccessToken();
  if (token && !tokenManager.isTokenExpired(token)) {
    scheduleProactiveRefresh(token);
  }
}

// Export function to stop proactive refresh (e.g., on logout)
export function stopTokenRefresh() {
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer);
    proactiveRefreshTimer = null;
  }
}

function setAuthHeader(cfg: RetryableAxiosRequestConfig, token: string) {
  if (!cfg.headers) cfg.headers = {};
  (cfg.headers as Record<string, string>).Authorization = `Bearer ${token}`;
}

// Request interceptor to add auth token and check expiration
api.interceptors.request.use(
  async (config) => {
    // Skip auth endpoints entirely
    const reqUrl: string = (config?.url as string) || "";
    const isAuthEndpoint =
      reqUrl.includes("/auth/login") ||
      reqUrl.includes("/auth/register") ||
      reqUrl.includes("/auth/refresh") ||
      reqUrl.includes("/auth/logout");

    if (isAuthEndpoint) {
      return config;
    }

    const token = tokenManager.getAccessToken();
    if (token) {
      // Check if token is expired or will expire very soon (within 30 seconds)
      if (tokenManager.isTokenExpired(token, { bufferMs: 30000 })) {
        // Token is expired or about to expire, refresh it before making the request
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            (
              config.headers as Record<string, string>
            ).Authorization = `Bearer ${newToken}`;
          } catch (error) {
            isRefreshing = false;
            throw error;
          }
        }
      } else {
        (
          config.headers as Record<string, string>
        ).Authorization = `Bearer ${token}`;
      }
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
    const originalRequest: RetryableAxiosRequestConfig = (error.config ||
      {}) as RetryableAxiosRequestConfig;

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
