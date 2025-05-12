
import { createContext, useState, useContext, useEffect, ReactNode } from "react";

export type UserRole = "client" | "partner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  description?: string;
  businessType?: string;
  hours?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    // This is a mock implementation - would connect to backend in a real app
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser: User = {
        id: `user-${Math.floor(Math.random() * 10000)}`,
        name: email.split('@')[0],
        email,
        role
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Login failed", error);
      throw new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    // This is a mock implementation
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      const mockUser: User = {
        id: `user-${Math.floor(Math.random() * 10000)}`,
        name,
        email,
        role
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } catch (error) {
      console.error("Registration failed", error);
      throw new Error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updatedUser: User) => {
    // This is a mock implementation
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update failed", error);
      throw new Error("Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
