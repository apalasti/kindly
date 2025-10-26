import { api } from "./api";
import { handleApiError } from "../utils/error";
import type { User } from "../types";

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
  getUserProfile: async (userId: number): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>(`/common/users/${userId}`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  getCurrentUserProfile: async (): Promise<UserResponse> => {
    try {
      const response = await api.get<UserResponse>("/common/profile");
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserResponse> => {
    try {
      const response = await api.put<UserResponse>("/common/profile", data);
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },
};
