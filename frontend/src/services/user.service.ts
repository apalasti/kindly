import { api } from "./api";
import type { User } from "../types";

// ============================================
// MOCK MODE - Set to false when backend is ready
// ============================================
const USE_MOCK = true;

// Mock delay to simulate network request
const mockDelay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  date_of_birth?: string;
  about_me?: string;
}

export const userService = {
  // Get public user profile by ID
  getUserProfile: async (userId: number): Promise<UserResponse> => {
    // ============================================
    // MOCK RESPONSE - Remove this block when backend is ready
    // ============================================
    if (USE_MOCK) {
      await mockDelay(500);

      // Simulate different users
      const mockUsers: Record<number, User> = {
        1: {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          date_of_birth: "1990-01-01",
          about_me: "I'm here to help and make a difference in my community!",
          is_volunteer: true,
          avg_rating: 4.5,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: new Date().toISOString(),
        },
        2: {
          id: 2,
          first_name: "Jane",
          last_name: "Smith",
          email: "jane@example.com",
          date_of_birth: "1985-05-15",
          about_me: "Looking for help with daily tasks and errands.",
          is_volunteer: false,
          avg_rating: 4.8,
          created_at: "2024-01-15T00:00:00.000Z",
          updated_at: new Date().toISOString(),
        },
      };

      const user = mockUsers[userId] || {
        id: userId,
        first_name: `User ${userId}`,
        last_name: "Unknown",
        email: `user${userId}@example.com`,
        date_of_birth: "1995-06-20",
        about_me: "This is a mock user profile.",
        is_volunteer: userId % 2 === 0,
        avg_rating: 4.0 + Math.random(),
        created_at: "2024-02-01T00:00:00.000Z",
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        data: user,
      };
    }
    // ============================================
    // END MOCK RESPONSE
    // ============================================

    const response = await api.get<UserResponse>(`/common/users/${userId}`);
    return response.data;
  },

  // Get current user's own profile
  getCurrentUserProfile: async (): Promise<UserResponse> => {
    // ============================================
    // MOCK RESPONSE - Remove this block when backend is ready
    // ============================================
    if (USE_MOCK) {
      await mockDelay(500);

      // Get mock user ID from localStorage or default to 1
      const mockUserId = parseInt(localStorage.getItem("mock_user_id") || "1");

      return {
        success: true,
        data: {
          id: mockUserId,
          first_name: "Current",
          last_name: "User",
          email: "current@example.com",
          date_of_birth: "1990-01-01",
          about_me: "This is my profile that I can edit.",
          is_volunteer: true,
          avg_rating: 4.5,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: new Date().toISOString(),
        },
      };
    }
    // ============================================
    // END MOCK RESPONSE
    // ============================================

    const response = await api.get<UserResponse>("/common/profile");
    return response.data;
  },

  // Update current user's profile
  updateProfile: async (data: UpdateProfileData): Promise<UserResponse> => {
    // ============================================
    // MOCK RESPONSE - Remove this block when backend is ready
    // ============================================
    if (USE_MOCK) {
      await mockDelay(800);

      return {
        success: true,
        data: {
          id: 1,
          first_name: data.first_name || "Updated",
          last_name: data.last_name || "User",
          email: data.email || "updated@example.com",
          date_of_birth: data.date_of_birth || "1990-01-01",
          about_me: data.about_me || "Updated profile description",
          is_volunteer: true,
          avg_rating: 4.5,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: new Date().toISOString(),
        },
        message: "Profile updated successfully",
      };
    }
    // ============================================
    // END MOCK RESPONSE
    // ============================================

    const response = await api.put<UserResponse>("/common/profile", data);
    return response.data;
  },
};
