import { useEffect, useState } from "react";
import axios from "axios";

export default function Alerts({ API_URL }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId"); // recupera do login

    if (!userId) {
      console.error("userId não definido");
      return;
    }

    axios
      .get(`${API_URL}/${userId}/dashboard/alerts`)
      .then(res => {
        setAlerts(res.data);
      })
      .catch(err => {
        console.error("Erro ao buscar alerts:", err);
      });
  }, [API_URL]);

  if (!alerts.length) {
    return <p>Nenhuma conta vencendo</p>;
  }
  if (!Array.isArray(alerts)) {
    return null;
  }

  return (
    <div>
      <h3>⚠ Contas vencendo</h3>
      <ul>
        {alerts.map((alert, i) => (
          <li key={i}>{alert.message}</li>
        ))}
      </ul>
    </div>
  );
}