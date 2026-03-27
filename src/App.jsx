import { AuthProvider } from "./components/AuthContext.jsx";
import AppRoutes from "./AppRoutes";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;


//teste