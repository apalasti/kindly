import { createContext } from "react";

export interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_volunteer: boolean;
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
