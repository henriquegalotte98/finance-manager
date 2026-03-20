import { useEffect, useState } from "react";
import { api } from "../services/api";
import ChartMonthly from "../components/ChartMonthly";
import Alerts from "../components/Alerts";
import CalendarBills from "../components/CalendarBills";

function Dashboard() {
  const [monthTotal, setMonthTotal] = useState(0);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      console.error("Usuário não está logado");
      return;
    }

    console.log("Chamando:", `/dashboard/month-total/${userId}/${year}/${month}`);

    api
      .get(`/dashboard/month-total/${userId}/${year}/${month}`)
      .then((res) => {
        setMonthTotal(res.data.total || 0);
      })
      .catch((err) => {
        console.error("Erro ao buscar total:", err);
      });
  }, [year, month]);

  return (
    <div className="dashboard">
      <h1>Dashboard Financeiro</h1>

      <div className="dashboard_cards">
        <div className="dashboard_card">
          <h3>Total do mês</h3>
          <h2>R$ {monthTotal}</h2>
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