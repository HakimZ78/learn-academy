"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AdminContextType {
  isAuthenticated: boolean;
  isEditMode: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  toggleEditMode: () => void;
  setEditMode: (enabled: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Simple password - in production, you'd want something more secure
const ADMIN_PASSWORD = "learnacademy2025"; // Change this to your preferred password

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Check for existing auth on load
  useEffect(() => {
    const authStatus = localStorage.getItem("learn-academy-admin-auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem("learn-academy-admin-auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsEditMode(false);
    localStorage.removeItem("learn-academy-admin-auth");
  };

  const toggleEditMode = () => {
    if (isAuthenticated) {
      setIsEditMode((prev) => !prev);
    }
  };

  const setEditMode = (enabled: boolean) => {
    if (isAuthenticated) {
      setIsEditMode(enabled);
    }
  };

  const value = {
    isAuthenticated,
    isEditMode,
    login,
    logout,
    toggleEditMode,
    setEditMode,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
