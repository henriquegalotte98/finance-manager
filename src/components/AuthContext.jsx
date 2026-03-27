import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) {
          setUser(null);
          return;
        }

        const res = await api.get("/users/me");
        setUser(res.data);

      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        setUser(null);
        localStorage.removeItem("token");
        setToken(null);
      } finally {
        setLoading(false); // 🔥 ESSENCIAL
      }
    };

    fetchUser();
  }, [token]);

  const login = (token, user) => {
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ user, setUser, token, setToken, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);