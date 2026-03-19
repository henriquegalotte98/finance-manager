import { useEffect, useState } from "react";
import axios from "axios";
import ChartMonthly from "../components/ChartMonthly";
import Alerts from "../components/Alerts";
import CalendarBills from "../components/CalendarBills";

function Dashboard({ API_URL }) {

  const [monthTotal, setMonthTotal] = useState(0);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  useEffect(() => {

    axios
      .get(`${API_URL}/dashboard/month-total/${year}/${month}`)
      .then((res) => {
        setMonthTotal(res.data.total || 0);
      })
      .catch((err) => console.error(err));

  }, []);

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
        <ChartMonthly API_URL={API_URL} />
      </div>

      <div className="dashboard_card">
        <Alerts API_URL={API_URL} />
      </div>

    </div>

  </div>

);
}

export default Dashboard;