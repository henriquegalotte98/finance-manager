import { useEffect, useState } from "react";
import api from "../services/api";
import "./Alerts.css";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAlerts = async () => {
      try {
        if (!api) {
          throw new Error("API não configurada");
        }
        
        setLoading(true);
        setError(null);
        
        console.log("Chamando: /dashboard/alerts");
        
        const response = await api.get("/dashboard/alerts");
        
        // Verificação EXTREMA de segurança
        let data = [];
        
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            data = response.data;
          } else if (typeof response.data === 'object') {
            // Se for um objeto, tenta converter
            data = Object.values(response.data).filter(item => item !== null);
          }
        }
        
        // Garantir que cada item tem as propriedades necessárias
        data = data.map(item => ({
          service: item?.service || "Serviço não informado",
          amount: typeof item?.amount === 'number' ? item.amount : 0,
          duedate: item?.duedate || new Date().toISOString()
        }));
        
        if (isMounted) {
          setAlerts(data);
        }
        
      } catch (err) {
        console.error("Erro ao buscar alertas:", err);
        if (isMounted) {
          setError("Erro ao carregar alertas");
          setAlerts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAlerts();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Data não disponível";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      return date.toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  // Renderização segura
  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">Carregando alertas...</div>
      );
    }

    if (error) {
      return (
        <div className="error">{error}</div>
      );
    }

    if (!alerts || alerts.length === 0) {
      return (
        <div className="no-alerts">
          ✅ Nenhum vencimento nos próximos 7 dias
        </div>
      );
    }

    return (
      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div key={`alert-${index}`} className="alert-item">
            <div className="alert-service">
              <strong>{alert.service || "Serviço não informado"}</strong>
            </div>
            <div className="alert-amount">
              {formatCurrency(alert.amount || 0)}
            </div>
            <div className="alert-date">
              Vence: {formatDate(alert.duedate)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="alerts-container">
      <h3>⚠️ Alertas de Vencimento</h3>
      {renderContent()}
    </div>
  );
}

export default Alerts;