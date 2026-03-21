import { useEffect, useState } from "react";
import api from "../services/api";

function Market() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/features/fx/dashboard")
      .then((res) => setRates(res.data.rates || []))
      .catch((err) => console.error("Erro ao carregar cotações:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Dashboard de Câmbio</h2>
      {loading && <p>Carregando cotações...</p>}
      {!loading && (
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {rates.map((item) => (
            <div key={item.code} style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
              <strong>{item.code}</strong>
              <p>1 USD = {item.perUsd ? Number(item.perUsd).toFixed(2) : "-"} {item.code}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Market;