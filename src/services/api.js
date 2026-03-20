import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { api } from "../services/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function ChartMonthly() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/monthly")
      .then(res => {
        if (!Array.isArray(res.data)) {
          console.warn("Resposta inesperada:", res.data);
          setData(null);
          return;
        }

        const labels = res.data.map(i => i.month);
        const values = res.data.map(i => i.total);

        setData({
          labels,
          datasets: [
            {
              label: "Gastos por mês",
              data: values
            }
          ]
        });
      })
      .catch(err => {
        console.error(err);
        setData(null);
      });
  }, []);

  if (!data) return <p>Carregando gráfico...</p>;

  return <Bar data={data} />;
}