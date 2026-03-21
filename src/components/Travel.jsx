import { useEffect, useState } from "react";
import api from "../services/api";

function Travel() {
  const [plans, setPlans] = useState([]);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [isShared, setIsShared] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [insights, setInsights] = useState(null);
  const [origin, setOrigin] = useState("Sao Paulo");
  const [itemDraft, setItemDraft] = useState({ category: "transport", title: "", estimated_cost: "" });

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

  const selectPlan = async (plan) => {
    setActivePlan(plan);
    const res = await api.get(`/features/travel/${plan.id}/insights`, { params: { origin } });
    setInsights(res.data);
  };

  const addPlanItem = async (e) => {
    e.preventDefault();
    if (!activePlan?.id || !itemDraft.title) return;
    await api.post(`/features/travel/${activePlan.id}/items`, {
      category: itemDraft.category,
      title: itemDraft.title,
      estimated_cost: Number(itemDraft.estimated_cost || 0)
    });
    await selectPlan(activePlan);
    setItemDraft({ category: "transport", title: "", estimated_cost: "" });
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
      <div style={{ margin: "10px 0" }}>
        <label>Origem para mapa/rota: </label>
        <input value={origin} onChange={(e) => setOrigin(e.target.value)} />
      </div>

      <ul>
        {plans.map((plan) => (
          <li key={plan.id}>
            {plan.title} - {plan.destination} {plan.is_shared ? "(Compartilhada)" : "(Individual)"}
            <button type="button" onClick={() => selectPlan(plan)} style={{ marginLeft: 8 }}>
              Abrir dashboard
            </button>
            <button
              type="button"
              onClick={async () => { await api.delete(`/features/travel/${plan.id}`); await loadPlans(); if (activePlan?.id === plan.id) { setActivePlan(null); setInsights(null); } }}
              style={{ marginLeft: 8 }}
            >
              Excluir
            </button>
          </li>
        ))}
      </ul>

      {activePlan && insights && (
        <section>
          <h3>Dashboard da viagem: {activePlan.title}</h3>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <article style={{ border: "1px solid #444", padding: 12, borderRadius: 8 }}>
              <h4>Card 1 - Transporte</h4>
              <p>Destino: {insights.destination}</p>
              <p>Origem: {origin}</p>
              <p>Ponte aérea / escalas: configure nos itens abaixo.</p>
            </article>
            <article style={{ border: "1px solid #444", padding: 12, borderRadius: 8 }}>
              <h4>Card 2 - Hospedagem</h4>
              <p>Adicione hotel/pousada e valor estimado nos itens.</p>
            </article>
            <article style={{ border: "1px solid #444", padding: 12, borderRadius: 8 }}>
              <h4>Card 3 - Passeios</h4>
              {insights.cards.activities.links.map((link) => (
                <p key={link}><a href={link} target="_blank" rel="noreferrer">Sugestões na internet</a></p>
              ))}
            </article>
            <article style={{ border: "1px solid #444", padding: 12, borderRadius: 8 }}>
              <h4>Card 4 - Alimentação</h4>
              {insights.cards.food.links.map((link) => (
                <p key={link}><a href={link} target="_blank" rel="noreferrer">Dicas e média de valores</a></p>
              ))}
            </article>
            <article style={{ border: "1px solid #444", padding: 12, borderRadius: 8 }}>
              <h4>Card 5 - Localização / Mapas</h4>
              {insights.cards.maps.links.map((link) => (
                <p key={link}><a href={link} target="_blank" rel="noreferrer">Abrir mapa</a></p>
              ))}
            </article>
          </div>

          <form onSubmit={addPlanItem} style={{ marginTop: 12 }}>
            <h4>Itens da viagem (ramificações)</h4>
            <select value={itemDraft.category} onChange={(e) => setItemDraft((prev) => ({ ...prev, category: e.target.value }))}>
              <option value="transport">Transporte</option>
              <option value="accommodation">Hospedagem</option>
              <option value="food">Alimentação</option>
              <option value="activity">Passeio</option>
            </select>
            <input
              value={itemDraft.title}
              onChange={(e) => setItemDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Descrição do item"
            />
            <input
              type="number"
              step="0.01"
              value={itemDraft.estimated_cost}
              onChange={(e) => setItemDraft((prev) => ({ ...prev, estimated_cost: e.target.value }))}
              placeholder="Valor estimado"
            />
            <button type="submit">Adicionar item</button>
          </form>
        </section>
      )}
    </div>
  );
}

export default Travel;