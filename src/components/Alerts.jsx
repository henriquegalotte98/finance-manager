import { useEffect, useState } from "react";
import  api  from "../services/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    console.log("Chamando: /dashboard/alerts");

    api
      .get("/dashboard/alerts")
      .then((res) => {
        setAlerts(res.data);
      })
      .catch((err) => {
        console.error("Erro ao buscar alerts:", err);
      });
  }, []);

  if (!Array.isArray(alerts)) return null;

  if (!alerts.length) {
    return <p>Nenhuma conta vencendo</p>;
  }

  return (
    <div>
      <h3>⚠ Contas vencendo</h3>
      <ul>
        {alerts.map((alert, i) => (
          <li key={i}>
            {alert.service} - R$ {alert.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}