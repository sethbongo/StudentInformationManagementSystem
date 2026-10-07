import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role, LoginCredentials } from "../types/auth";
import { authService } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
  isAdmin: boolean;
  isRegistrar: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  canManageAcademics: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("sims_user_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("sims_auth_token");
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate existing session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const storedToken = localStorage.getItem("sims_auth_token");
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getMe();
        if (isMounted) {
          setUser(currentUser);
          localStorage.setItem("sims_user_profile", JSON.stringify(currentUser));
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("sims_auth_token");
          localStorage.removeItem("sims_user_profile");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuth();

    // Global listener for 401 unauthorized
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      localStorage.removeItem("sims_auth_token");
      localStorage.removeItem("sims_user_profile");
    };

    window.addEventListener("sims:unauthorized", handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener("sims:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authService.login(credentials);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("sims_auth_token", data.token);
      localStorage.setItem("sims_user_profile", JSON.stringify(data.user));
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("sims_auth_token");
      localStorage.removeItem("sims_user_profile");
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
      localStorage.setItem("sims_user_profile", JSON.stringify(currentUser));
    } catch {
      // ignore
    }
  };

  const hasRole = (roles: Role[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isAdmin = user?.role === "ADMINISTRATOR";
  const isRegistrar = user?.role === "REGISTRAR";
  const isInstructor = user?.role === "INSTRUCTOR";
  const isStudent = user?.role === "STUDENT";
  const canManageAcademics = isAdmin || isRegistrar;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        refreshUser,
        hasRole,
        isAdmin,
        isRegistrar,
        isInstructor,
        isStudent,
        canManageAcademics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
