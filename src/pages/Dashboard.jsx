import { useEffect, useState } from "react";
import api from "../services/api";
import ChartMonthly from "../components/ChartMonthly";
import Alerts from "../components/Alerts";
import CalendarBills from "../components/CalendarBills";
import "./Dashboard.css"; // Adicione se tiver CSS

function Dashboard() {
  const [monthTotal, setMonthTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  useEffect(() => {
    const fetchMonthTotal = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Chamando:", `/dashboard/month-total/${year}/${month}`);
        
        const response = await api.get(`/dashboard/month-total/${year}/${month}`);
        
        // Garantir que o total seja um número
        const total = response.data?.total ?? 0;
        setMonthTotal(total);
        
      } catch (err) {
        console.error("Erro ao buscar total:", err);
        setError("Erro ao carregar total do mês");
        setMonthTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthTotal();
  }, [year, month]);

  const formatCurrency = (value) => {
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
        <div className="dashboard_card">
          <ChartMonthly />
        </div>

        <div className="dashboard_card">
          <Alerts />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;