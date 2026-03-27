import { useEffect, useState } from "react";
import api from "../services/api";
import "./ChartMonthly.css";

function ChartMonthly() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchMonthlyData = async () => {
      try {
        if (!api) {
          throw new Error("API não configurada");
        }
        
        setLoading(true);
        setError(null);
        
        console.log("Chamando: /dashboard/monthly");
        
        const response = await api.get("/dashboard/monthly");
        
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
          month: item?.month || "Mês",
          total: typeof item?.total === 'number' ? item.total : 0
        }));
        
        if (isMounted) {
          setMonthlyData(data);
        }
        
      } catch (err) {
        console.error("Erro ao buscar dados mensais:", err);
        if (isMounted) {
          setError("Erro ao carregar gráfico");
          setMonthlyData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMonthlyData();
    
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

  // Renderização segura
  const renderChart = () => {
    if (loading) {
      return (
        <div className="loading">Carregando dados...</div>
      );
    }

    if (error) {
      return (
        <div className="error">{error}</div>
      );
    }

    if (!monthlyData || monthlyData.length === 0) {
      return (
        <div className="no-data">Nenhum dado disponível</div>
      );
    }

    // Calcular valor máximo para as barras
    const maxTotal = Math.max(...monthlyData.map(item => item.total || 0), 0.01);

    return (
      <div className="monthly-chart">
        {monthlyData.map((item, index) => {
          const total = Number(item.total) || 0;
          const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
          
          return (
            <div key={`chart-${index}`} className="chart-bar-container">
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
    );
  };

  return (
    <div className="chart-container">
      <h3>📈 Gastos por Mês</h3>
      {renderChart()}
    </div>
  );
}

export default ChartMonthly;