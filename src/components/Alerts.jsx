import { useEffect, useState } from "react";
import axios from "axios";

export default function Alerts({ API_URL }) {

    const [alerts, setAlerts] = useState([]);

    useEffect(() => {

        axios.get(`${API_URL}/dashboard/alerts`)
            .then(res => {
                setAlerts(res.data);
            })
            .catch(err => {
                console.error("Erro ao buscar alerts:", err);
            });

    }, [API_URL]);

    if (!alerts.length) {
        return <p>Nenhuma conta vencendo</p>;
    }
    if (!Array.isArray(alerts)) {
        return null
    }

    
    return (

        <div>

            <h3>⚠ Contas vencendo</h3>



        </div>

    );
}