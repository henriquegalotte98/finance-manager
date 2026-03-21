import { createContext, useContext, useState, useEffect } from "react";
import  api  from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // 🔥 CARREGAR USUÁRIO AUTOMATICAMENTE
  useEffect(() => {
    if (token) {
      api.get("/users/me")
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error("Erro ao carregar usuário:", err);
          setUser(null);
        });
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);