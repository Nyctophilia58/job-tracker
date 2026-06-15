import { createContext } from "react";
import type { User } from "../types";

// Define the AuthContextType interface
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  isAuthenticated: boolean;
  updateToken: (token: string) => void;
}

// Create the AuthContext with a default value of null
export const AuthContext = createContext<AuthContextType | null>(null);
