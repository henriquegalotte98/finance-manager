import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        email,
        password,
      });

      // Salva o userId e o token no localStorage
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("token", response.data.token);

      // Continua usando o AuthContext
      login(res.data.token, res.data.user);

      // Redireciona para o app
      navigate("/app");
    } catch (err) {
      console.error("Erro no login:", err);
    }
  };

  return (
    <div className="login-container">
      <h2>Entrar</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;