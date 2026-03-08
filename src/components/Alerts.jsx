import { useEffect, useState } from "react";
import axios from "axios";

export default function Alerts({ API_URL }) {

    const [alerts, setAlerts] = useState([]);

    useEffect(() => {

        app.get("/dashboard/alerts", async (req, res) => {

            try {

                const result = await pool.query(`
      SELECT 
      e.service,
      i.duedate,
      i.amount
      FROM installments i
      JOIN expenses e ON e.id = i.expense_id
      WHERE i.duedate >= CURRENT_DATE
      AND i.duedate <= CURRENT_DATE + INTERVAL '7 days'
      ORDER BY i.duedate
    `);

                res.json(result.rows);

            } catch (err) {

                console.error("Erro alerts:", err);
                res.json([]);

            }

        });

    }, [API_URL]);

    if (!alerts.length) {
        return <p>Nenhuma conta vencendo</p>;
    }

    return (

        <div>

            <h3>⚠ Contas vencendo</h3>

            {alerts.map((a, i) => (

                <div key={i}>
                    {a.service} - R$ {a.amount} - {new Date(a.duedate).toLocaleDateString("pt-BR")}
                </div>

            ))}

        </div>

    );
}