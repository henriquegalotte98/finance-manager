import { AuthProvider } from "./components/AuthContext.jsx";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./AppRoutes";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="layout">
        <Sidebar />

        <main className="layout-content">
          {/* Temporário: adicione isso para debug */}
          {import.meta.env.DEV && <ApiTester />}
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;