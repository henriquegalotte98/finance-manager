import { useEffect, useState } from "react";
import api from "../services/api";

function Travel() {
  const [plans, setPlans] = useState([]);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [isShared, setIsShared] = useState(true);

  const loadPlans = async () => {
    const res = await api.get("/features/travel");
    setPlans(res.data || []);
  };

  useEffect(() => {
    loadPlans().catch((err) => console.error("Erro ao buscar viagens:", err));
  }, []);

  const createPlan = async (e) => {
    e.preventDefault();
    if (!title || !destination) return;
    await api.post("/features/travel", {
      title,
      destination,
      is_shared: isShared
    });
    setTitle("");
    setDestination("");
    await loadPlans();
  };

  return (
    <div>
      <h2>Planejamento de Viagens</h2>
      <form onSubmit={createPlan}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome da viagem" />
        <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destino" />
        <label style={{ marginLeft: 8 }}>
          <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} />
          Compartilhar com cônjuge
        </label>
        <button type="submit">Criar viagem</button>
      </form>

      <ul>
        {plans.map((plan) => (
          <li key={plan.id}>
            {plan.title} - {plan.destination} {plan.is_shared ? "(Compartilhada)" : "(Individual)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Travel;