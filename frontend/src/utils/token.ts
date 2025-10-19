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
  isTokenExpired: (token: string, options?: { bufferMs?: number }): boolean => {
    const payload = tokenManager.decodeToken(token);
    if (!payload || !payload.exp || typeof payload.exp !== "number") {
      return true;
    }
    const expirationTime = (payload.exp as number) * 1000; // ms
    const currentTime = Date.now();
    const bufferTime = options?.bufferMs ?? 0; // default no buffer
    return currentTime >= expirationTime - bufferTime;
  },

  /**
   * Get user data from token
   */
  getUserFromToken: (): {
    id: number;
    email: string;
    is_volunteer: boolean;
  } | null => {
    const token = tokenManager.getAccessToken();
    if (!token) return null;

    const payload = tokenManager.decodeToken(token);
    type JwtPayload = {
      id?: unknown;
      email?: unknown;
      is_volunteer?: unknown;
    };
    const p = (payload || {}) as JwtPayload;
    if (
      !payload ||
      typeof p.id !== "number" ||
      typeof p.email !== "string" ||
      typeof p.is_volunteer !== "boolean"
    ) {
      return null;
    }

    return {
      id: p.id as number,
      email: p.email as string,
      is_volunteer: p.is_volunteer as boolean,
    };
  },

  /**
   * Clear all authentication data
   */
  clearAuth: (): void => {
    tokenManager.removeAccessToken();
  },
};
