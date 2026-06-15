import { AuthContext } from "./authContext";
import { jwtDecode } from "jwt-decode";
import type { User } from "../types";
import { useState, useEffect, type ReactNode } from "react";
import { loginUser, registerUser } from "../api";

const decodeToken = (token: string): User => {
  const decoded = jwtDecode<{ id: string; username?: string; email: string }>(
    token,
  );
  return {
    id: decoded.id,
    username: decoded.username || "",
    email: decoded.email,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const user = (() => {
    try {
      return token ? decodeToken(token) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await loginUser({ email, password });
    setToken(response.token);
  };

  const logout = () => {
    setToken(null);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    const response = await registerUser({
      username: username,
      email: email,
      password: password,
    });
    setToken(response.token);
  };

  const updateToken = (newToken: string) => {
    setToken(newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        isAuthenticated: !!token,
        updateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
