import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./SideMenu.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const { logout } = useAuth();
const navigate = useNavigate();

function SideMenu() {
  const { user } = useAuth(); // pega user do contexto

  const menuItems = [
    { path: "/app/profile", label: "profile" },
    { path: "/app", label: "🏠 Início" },
    { path: "/app/excel", label: "📊 Planilha" },
    { path: "/app/market", label: "💵 Dólar" },
    { path: "/app/economias", label: "💰 Economias" },
    { path: "/app/travel", label: "✈️ Viagens" },
  ];

  return (
    <div className="side_menu">
      <nav>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path}>
                {item.label === "profile" && user && user.caminho ? (
                  <img alt="Foto de perfil"
                    className="profile-pic" src={`${import.meta.env.VITE_API_URL}/${user.caminho}`} />
                  
                ) : (
                  item.label
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default SideMenu;