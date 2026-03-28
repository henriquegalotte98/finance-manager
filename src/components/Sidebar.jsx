import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { useAuth } from "./AuthContext";
import duofinanceLogo from '../assets/duofinance-logo.png';

export default function Sidebar() {
  const { user } = useAuth(); // pega user do contexto


  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo"><img src={duofinanceLogo} alt="" /></h2>

      <nav className="sidebar-nav">
        <NavLink to="/app" end className="sidebar-link">
          Dashboard
        </NavLink>


        <NavLink to="/app/excel" className="sidebar-link">
          Excel
        </NavLink>

        <NavLink to="/app/market" className="sidebar-link">
          Mercado
        </NavLink>

        <NavLink to="/app/economias" className="sidebar-link">
          Economias
        </NavLink>

        <NavLink to="/app/travel" className="sidebar-link">
          Viagens
        </NavLink>

        <NavLink to="/app/profile" className="sidebar-link">
          <div className="profile_section">
            <img alt="Foto de perfil"
              className="profile_avatar" src={user?.caminho} onError={() => setImageFailed(true)} />
            <span className="profile_name">
              {user?.name}
            </span>
          </div>
          
        </NavLink>
      </nav>
    </aside>
  );
}