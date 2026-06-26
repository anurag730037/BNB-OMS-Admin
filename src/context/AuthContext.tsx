import { createContext, useContext, useState } from "react";

type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState<string | null>(localStorage.getItem("adminToken"));

  const login = (token: string) => {
    setToken(token);
    localStorage.setItem("adminToken", token);
  }

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  }



  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}