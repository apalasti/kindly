import { api } from "./api";
import axios from "axios";
import { tokenManager } from "../utils/token";
import type { AuthResponse, RegisterRequest, LoginRequest } from "../types";

// Callback to update auth context - will be set by AuthContext
let updateAuthContext:
  | ((
      user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        is_volunteer: boolean;
      } | null
    ) => void)
  | null = null;

export const setAuthContextUpdater = (updater: typeof updateAuthContext) => {
  updateAuthContext = updater;
};

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);

      if (response.data.success && response.data.data.token) {
        tokenManager.setAccessToken(response.data.data.token);
      }

      // Update auth context if available
      if (updateAuthContext) {
        const user = response.data.data.user;
        updateAuthContext({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          is_volunteer: user.is_volunteer,
        });
      }

      return response.data;
    } catch (err: unknown) {
      throw new Error(extractApiError(err));
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", data);

      if (response.data.success && response.data.data.token) {
        tokenManager.setAccessToken(response.data.data.token);
      }

      // Update auth context if available
      if (updateAuthContext) {
        const user = response.data.data.user;
        updateAuthContext({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          is_volunteer: user.is_volunteer,
        });
      }

      return response.data;
    } catch (err: unknown) {
      throw new Error(extractApiError(err));
    }
  },

  logout: async (): Promise<void> => {
    // Best-effort server-side logout to clear HttpOnly refresh cookie
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore network/server errors during logout
    }

    // Update auth context and clear local token regardless of server response
    if (updateAuthContext) {
      updateAuthContext(null);
    }
    tokenManager.clearAuth();
  },

  getToken: (): string | null => {
    return tokenManager.getAccessToken();
  },

  isAuthenticated: (): boolean => {
    return tokenManager.isAuthenticated();
  },
};

type ApiErrorShape = {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ field?: string | string[]; message?: string }>;
  };
  message?: string;
};

function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as ApiErrorShape | undefined;
    const apiMessage = data?.error?.message || data?.message;
    const details = data?.error?.details;

    if (Array.isArray(details) && details.length > 0) {
      const rendered = details
        .slice(0, 3)
        .map((d) => {
          const fieldRaw = d?.field;
          const field = Array.isArray(fieldRaw)
            ? fieldRaw.join(".")
            : fieldRaw ?? "";
          const fieldStr = String(field).trim();
          return [fieldStr, d?.message].filter(Boolean).join(": ");
        })
        .join("; ");
      const suffix = details.length > 3 ? "…" : "";
      return `${apiMessage || "Invalid request"}: ${rendered}${suffix}`;
    }

    if (status === 401 && apiMessage) {
      return apiMessage; // e.g., "Invalid email or password"
    }
    if (status === 0 || err.code === "ERR_NETWORK") {
      return "Network error. Please check your connection and try again.";
    }
    return apiMessage || err.message || "Request failed. Please try again.";
  }
  return err instanceof Error
    ? err.message
    : "Request failed. Please try again.";
}
