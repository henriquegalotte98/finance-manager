import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">Finance</h2>

      <nav className="sidebar-nav">
        <NavLink to="/app" end className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/app/importfile" className="sidebar-link">
          Importar
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
          Perfil
        </NavLink>
      </nav>
    </aside>
  );
}