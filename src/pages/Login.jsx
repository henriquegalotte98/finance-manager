import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import api from "../services/api";
import duofinanceLogo from '../assets/duofinance-logo.png';
import passwordLogo from '../assets/password.svg';
import "../pages/Login.css";
import DarkModeToggle from '../components/DarkModeToggle';
import { style } from "framer-motion/client";
//src\assets\duofinance-logo.png
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
  //Animação da logo e login
  const [showDiv1, setShowDiv1] = useState(false);
  const [hideDiv2, setHideDiv2] = useState(false);

  const handleAnimationEnd = () => {
    // Quando a animação da div2 terminar, mostra a div1
    setShowDiv1(true);
    setHideDiv2(true);
  };

  return (

    <div className="init_screen" >

      <div style={{ display: showDiv1 ? "flex" : "none" }} className="login-container">
        <div className="card_login">
          <h2>Entrar</h2>
          <form onSubmit={handleLogin}>
            <div>

              {/* ------------Input EMAIL----------- */}
              <div className="input__container">

                <div className="div_email">
                  <button className="input__button__shadow">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="#000000"
                      width="20px"
                      height="20px"
                    >
                      <path d="M0 0h24v24H0z" fill="none"></path>
                      <path
                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      ></path>
                    </svg>
                  </button>
                  <input
                    type="email"
                    value={email}
                    name="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input__search"
                    placeholder="Digite seu E-mail"
                  />
                </div>






                <div className="div_password">
                  <button className="input__button__shadow">
                    <img src={passwordLogo} style={{ width: "25px" }} alt="" />
                  </button>
                  <input
                    type="password"
                    value={password}
                    name="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input__search"
                    placeholder="Digite sua senha"
                  />
                </div>
              </div>

            </div>

            <button type="submit" className="btn_submit">Login</button>

          </form>

        </div>

        <div className="register-link">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </div>
        <div style={{marginTop:"20px"}}>
          
          <DarkModeToggle />
          
        </div>



      </div>


      <div className="div_logo" style={{ display: hideDiv2 ? "none" : "flex" }} >
        <img className="logo_login" src={duofinanceLogo} onAnimationEnd={handleAnimationEnd} alt="" />

      </div>


    </div>
  );
}

export default Login;