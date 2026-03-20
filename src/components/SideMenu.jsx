import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./SideMenu.css";


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
                  <img
                    src={`http://localhost:3000/${user.caminho}`}
                    alt="Foto de perfil"
                    className="profile-pic"
                  />
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