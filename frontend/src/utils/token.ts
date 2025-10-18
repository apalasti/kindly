/**
 * Token Management Utility
 *
 * Implements hybrid token storage approach:
 * - Access tokens: localStorage (for now, will support in-memory when refresh tokens are added)
 * - Refresh tokens: Will be stored in HttpOnly cookies (backend implementation pending)
 */

const ACCESS_TOKEN_KEY = "access_token";

export const tokenManager = {
  /**
   * Get the current access token
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Store the access token
   */
  setAccessToken: (token: string): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Remove the access token
   */
  removeAccessToken: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Decode JWT token to get payload (without verification)
   * Used for checking expiration and extracting user data
   */
  decodeToken: (token: string): Record<string, unknown> | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (token: string): boolean => {
    const payload = tokenManager.decodeToken(token);
    if (!payload || !payload.exp || typeof payload.exp !== "number") {
      return true;
    }

    // Check if token expires in less than 5 minutes (buffer for refresh)
    const expirationTime = (payload.exp as number) * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes

    return currentTime >= expirationTime - bufferTime;
  },

  /**
   * Get user data from token
   */
  getUserFromToken: (): {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    is_volunteer: boolean;
  } | null => {
    const token = tokenManager.getAccessToken();
    if (!token) return null;

    const payload = tokenManager.decodeToken(token);
    if (
      !payload ||
      typeof payload.id !== "number" ||
      typeof payload.first_name !== "string" ||
      typeof payload.last_name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.is_volunteer !== "boolean"
    ) {
      return null;
    }

    return {
      id: payload.id as number,
      first_name: payload.first_name as string,
      last_name: payload.last_name as string,
      email: payload.email as string,
      is_volunteer: payload.is_volunteer as boolean,
    };
  },

  /**
   * Clear all authentication data
   */
  clearAuth: (): void => {
    tokenManager.removeAccessToken();
    // When refresh tokens are implemented, they'll be cleared via API call
    // which will remove the HttpOnly cookie
  },
};
