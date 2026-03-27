import { useEffect, useState } from "react";
import api from "../services/api";
import "./ChartMonthly.css";

function ChartMonthly() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Chamando: /dashboard/monthly");
        
        const response = await api.get("/dashboard/monthly");
        
        // Verificação crítica: garantir que seja array
        let data = [];
        if (response && response.data) {
          data = Array.isArray(response.data) ? response.data : [];
        }
        
        setMonthlyData(data);
        
      } catch (err) {
        console.error("Erro ao buscar dados mensais:", err);
        setError("Erro ao carregar gráfico");
        setMonthlyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  if (loading) {
    return (
      <div className="chart-container">
        <h3>📈 Gastos por Mês</h3>
        <div className="loading">Carregando dados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <h3>📈 Gastos por Mês</h3>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="chart-container">
        <h3>📈 Gastos por Mês</h3>
        <div className="no-data">Nenhum dado disponível</div>
      </div>
    );
  }

  // Calcular valor máximo para as barras
  const maxTotal = Math.max(...monthlyData.map(item => Number(item.total) || 0));

  return (
    <div className="chart-container">
      <h3>📈 Gastos por Mês</h3>
      
      <div className="monthly-chart">
        {monthlyData.map((item, index) => {
          const total = Number(item.total) || 0;
          const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
          
          return (
            <div key={index} className="chart-bar-container">
              <div className="chart-label">
                {item.month || `Mês ${index + 1}`}
              </div>
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar" 
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                >
                  <span className="chart-value">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChartMonthly;