import { useEffect, useState } from "react";
import api from "../services/api";

function ApiTester() {
  const [status, setStatus] = useState("testando...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log("Testando API...");
        const response = await api.get("/healthz");
        console.log("Resposta da API:", response);
        setStatus("API OK: " + JSON.stringify(response.data));
      } catch (err) {
        console.error("Erro ao testar API:", err);
        setError(err.message);
        setStatus("Erro na API");
      }
    };
    
    testApi();
  }, []);

  return (
    <div style={{ padding: "10px", margin: "10px", background: "#f0f0f0" }}>
      <h4>Status da API:</h4>
      <p>URL: {import.meta.env.VITE_API_URL || "não configurada"}</p>
      <p>Status: {status}</p>
      {error && <p style={{ color: "red" }}>Erro: {error}</p>}
    </div>
  );
}

export default ApiTester;