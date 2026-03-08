import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ChartMonthly({ API_URL }) {

  const [data, setData] = useState(null);

  useEffect(() => {

    axios.get(`${API_URL}/dashboard/monthly`)
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

  }, [API_URL]);

  if (!data) return <p>Carregando gráfico...</p>;

  return <Bar data={data} />;
}