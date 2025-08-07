import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if access token exists in localStorage
    const token = localStorage.getItem("dojo_access_token");
    setIsAuthenticated(!!token);
  }, []);

  const login = () => {
    // Set access token
    localStorage.setItem("dojo_access_token", "authenticated_" + Date.now());
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Remove access token
    localStorage.removeItem("dojo_access_token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};