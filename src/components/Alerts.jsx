import { useEffect, useState } from "react";
import axios from "axios";

export default function Alerts({ API_URL }) {

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {

    axios.get(`${API_URL}/dashboard/alerts`)
      .then(res => {

        if (Array.isArray(res.data)) {
          setAlerts(res.data);
        } else {
          setAlerts([]);
        }

      })
      .catch(err => {
        console.error(err);
        setAlerts([]);
      });

  }, [API_URL]);

  if (!alerts.length) {
    return <p>Nenhuma conta vencendo</p>;
  }

  return (

    <div>

      <h3>⚠ Contas vencendo</h3>

      {alerts.map((a, i) => (

        <div key={i}>
          {a.service} - R$ {a.amount} - {new Date(a.duedate).toLocaleDateString("pt-BR")}
        </div>

      ))}

    </div>

  );
}