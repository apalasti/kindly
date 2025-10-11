import { api } from "./api";
import type { AuthResponse, RegisterRequest, LoginRequest } from "../types";

// ============================================
// MOCK MODE - Set to false when backend is ready
// ============================================
const USE_MOCK = true;

// Mock delay to simulate network request
const mockDelay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // ============================================
    // MOCK RESPONSE - Remove this block when backend is ready
    // ============================================
    if (USE_MOCK) {
      await mockDelay(800);

      const mockResponse: AuthResponse = {
        success: true,
        data: {
          user: {
            id: 1,
            name: data.name,
            email: data.email,
            date_of_birth: data.date_of_birth,
            about_me: data.about_me,
            is_volunteer: data.is_volunteer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          token: "mock_jwt_token_" + Math.random().toString(36).substring(7),
        },
        message: "Registration successful! Welcome to Kindly!",
      };

      localStorage.setItem("auth_token", mockResponse.data.token);
      return mockResponse;
    }
    // ============================================
    // END MOCK RESPONSE
    // ============================================

    const response = await api.post<AuthResponse>("/auth/register", data);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("auth_token", response.data.data.token);
    }
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("auth_token", response.data.data.token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("auth_token");
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token");
  },
};
