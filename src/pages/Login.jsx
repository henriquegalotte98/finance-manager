import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import api from "../services/api";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // salva token
      localStorage.setItem("token", response.data.token);

      // salva userId
      localStorage.setItem("userId", response.data.user.id);

      // atualiza contexto
      login(response.data.token, response.data.user);

      // redireciona
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
      <div className="register-link">
        Não tem uma conta? <Link to="/register">Cadastre-se</Link>
      </div>

    </div>

  );
}

export default Login;