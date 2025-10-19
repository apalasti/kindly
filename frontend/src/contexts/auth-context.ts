import { createContext } from "react";

export interface AuthUser {
  id: number;
  email: string;
  is_volunteer: boolean;
  first_name?: string;
  last_name?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isVolunteer: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
