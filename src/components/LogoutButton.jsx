import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return <button onClick={() => {
    logout();
    navigate("/login");
  }}>
    Sair
  </button>;
}

export default LogoutButton;