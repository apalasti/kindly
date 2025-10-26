import axios from "axios";
import type { ApiError } from "../types/api.types";

export function handleApiError(error: unknown): string {
  // Log error details for debugging
  console.error("API Error:", error);

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;

    if (data?.error?.message) {
      return data.error.message;
    }

    return error.message || "Request failed. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
