import { createContext, useContext, useState, useEffect } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("flyrai_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("flyrai_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.post("/auth/login", { email, password });
    localStorage.setItem("flyrai_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, accountType, name) => {
    const data = await api.post("/auth/register", { email, password, accountType, name });
    localStorage.setItem("flyrai_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("flyrai_token");
    setUser(null);
  };

  const refreshUser = async () => {
    const data = await api.get("/auth/me");
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
