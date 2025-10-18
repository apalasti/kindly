import { useState, useEffect, type ReactNode } from "react";
import { tokenManager } from "../utils/token";
import { setAuthContextUpdater } from "../services/auth.service";
import {
  AuthContext,
  type AuthContextType,
  type AuthUser,
} from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Initialize user from token on mount
  useEffect(() => {
    const tokenUser = tokenManager.getUserFromToken();
    if (tokenUser) {
      setUser({
        id: tokenUser.id,
        first_name: tokenUser.first_name,
        last_name: tokenUser.last_name,
        email: tokenUser.email,
        is_volunteer: tokenUser.is_volunteer,
      });
    }

    // Register the context updater with auth service
    setAuthContextUpdater(setUser);

    // Cleanup on unmount
    return () => {
      setAuthContextUpdater(null);
    };
  }, []);

  const logout = () => {
    setUser(null);
    tokenManager.clearAuth();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isVolunteer: user?.is_volunteer ?? false,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
