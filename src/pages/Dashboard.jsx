import { useEffect, useState } from "react";
import api from "../services/api";
import ChartMonthly from "../components/ChartMonthly";
import Alerts from "../components/Alerts";
import "./Dashboard.css";

function Dashboard() {
  const [monthTotal, setMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  useEffect(() => {
    let isMounted = true; // Prevenir memory leaks
    
    const fetchMonthTotal = async () => {
      try {
        if (!api) {
          throw new Error("API não configurada");
        }
        
        setLoading(true);
        setError(null);
        
        console.log("Chamando:", `/dashboard/month-total/${year}/${month}`);
        
        const response = await api.get(`/dashboard/month-total/${year}/${month}`);
        
        // Verificação segura
        if (isMounted) {
          const total = response?.data?.total;
          setMonthTotal(typeof total === 'number' ? total : 0);
        }
        
      } catch (err) {
        console.error("Erro ao buscar total:", err);
        if (isMounted) {
          setError("Erro ao carregar total do mês");
          setMonthTotal(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMonthTotal();
    
    return () => {
      isMounted = false;
    };
  }, [year, month]);

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return 'R$ 0,00';
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  return (
    <div className="dashboard">
      <h1>Dashboard Financeiro</h1>

      <div className="dashboard_cards">
        <div className="dashboard_card">
          <h3>Total do mês</h3>
          {loading ? (
            <div className="loading-spinner">Carregando...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <h2 className="total-value">{formatCurrency(monthTotal)}</h2>
          )}
        </div>
      </div>

      <div className="dashboard_grid">
        <div className="dashboard_card_wrapper">
          <ChartMonthly />
        </div>

        <div className="dashboard_card_wrapper">
          <Alerts />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;