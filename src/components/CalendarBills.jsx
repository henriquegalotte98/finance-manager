import { useEffect, useState } from "react";
import api from "../services/api";
import "./CalendarBills.css";

function CalendarBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchBills = async () => {
      try {
        setLoading(true);
        const response = await api.get("/expenses/month/2026/3");
        
        let data = [];
        if (response && response.data && Array.isArray(response.data)) {
          data = response.data;
        }
        
        if (isMounted) {
          setBills(data);
        }
      } catch (err) {
        console.error("Erro ao buscar contas:", err);
        if (isMounted) {
          setError("Erro ao carregar calendário");
          setBills([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchBills();
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div>Carregando calendário...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!bills || bills.length === 0) return <div>Nenhuma conta para este mês</div>;

  return (
    <div className="calendar-bills">
      <h3>📅 Calendário de Contas</h3>
      {/* Seu conteúdo do calendário aqui */}
    </div>
  );
}

export default CalendarBills;