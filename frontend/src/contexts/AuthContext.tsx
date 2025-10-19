import { useState, useEffect, type ReactNode } from "react";
import { tokenManager } from "../utils/token";
import { setAuthContextUpdater } from "../services/auth.service";
import { userService } from "../services/user.service";
import {
  AuthContext,
  type AuthContextType,
  type AuthUser,
} from "./auth-context";

export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: AuthUser | null;
}) => {
  const [user, setUser] = useState<AuthUser | null>(initialUser ?? null);

  // Initialize user from token on mount and fetch profile
  useEffect(() => {
    // Register the context updater with auth service first
    setAuthContextUpdater(setUser);

    const initializeUser = async () => {
      // Only fetch profile if we have a token but no initial user data
      if (!initialUser || (initialUser && !initialUser.first_name)) {
        const tokenUser = tokenManager.getUserFromToken();
        if (tokenUser) {
          try {
            const response = await userService.getCurrentUserProfile();
            if (response.success) {
              setUser({
                id: response.data.id,
                email: response.data.email,
                is_volunteer: response.data.is_volunteer,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
              });
            }
          } catch (error) {
            console.error("Failed to fetch user profile:", error);
            // Fallback to basic user info from token if profile fetch fails
            setUser({
              id: tokenUser.id,
              email: tokenUser.email,
              is_volunteer: tokenUser.is_volunteer,
            });
          }
        }
      }
    };

    initializeUser();

    // Cleanup on unmount
    return () => {
      setAuthContextUpdater(null);
    };
  }, [initialUser]);

  const logout = () => {
    setUser(null);
    tokenManager.clearAuth();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isVolunteer: !!user && user.is_volunteer,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
