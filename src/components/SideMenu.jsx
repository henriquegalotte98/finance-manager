import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./SideMenu.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";




function SideMenu() {
  const { user } = useAuth(); // pega user do contexto
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
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
                {item.label === "profile" && user && user.caminho && !imageFailed ? (
                  <div className="profile_section"> 
                    <img alt="Foto de perfil"
                      className="profile_avatar" src={user?.caminho} onError={() => setImageFailed(true)} />
                    <span className="profile_name">
    {user?.name}
  </span>
                  </div>

                ) : (
                  item.label === "profile" ? "👤 Perfil" : item.label
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