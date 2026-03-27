import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

function PrivateLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}

export default PrivateLayout;