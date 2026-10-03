import React, { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("dm_user");
    const token = localStorage.getItem("dm_token");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("dm_user");
        localStorage.removeItem("dm_token");
      }
    }
    setLoading(false);
  }, []);

  const persist = (data) => {
    localStorage.setItem("dm_token", data.token);
    localStorage.setItem("dm_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const { data } = await API.post("/auth/signin", {
      email: email.trim().toLowerCase(),
      password,
    });
    return persist(data);
  };

  const register = async (payload) => {
    const { data } = await API.post("/auth/register", {
      ...payload,
      email: payload.email.trim().toLowerCase(),
    });
    return persist(data);
  };

  const logout = () => {
    localStorage.removeItem("dm_token");
    localStorage.removeItem("dm_user");
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}