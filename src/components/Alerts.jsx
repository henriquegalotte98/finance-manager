import { useEffect, useState } from "react";
import api from "../services/api";
import "./Alerts.css";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Chamando: /dashboard/alerts");
        
        const response = await api.get("/dashboard/alerts");
        
        // Garantir que alerts seja um array
        const data = response.data;
        setAlerts(Array.isArray(data) ? data : []);
        
      } catch (err) {
        console.error("Erro ao buscar alertas:", err);
        setError("Erro ao carregar alertas");
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (loading) {
    return (
      <div className="alerts-container">
        <h3>⚠️ Alertas</h3>
        <div className="loading">Carregando alertas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alerts-container">
        <h3>⚠️ Alertas</h3>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="alerts-container">
      <h3>⚠️ Alertas</h3>
      
      {alerts.length === 0 ? (
        <div className="no-alerts">
          ✅ Nenhum vencimento nos próximos 7 dias
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert, index) => (
            <div key={index} className="alert-item">
              <div className="alert-service">{alert.service}</div>
              <div className="alert-amount">{formatCurrency(alert.amount)}</div>
              <div className="alert-date">Vence: {formatDate(alert.duedate)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Alerts;