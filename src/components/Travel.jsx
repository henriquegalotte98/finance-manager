import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Travel.css";

function Travel() {
  const [plans, setPlans] = useState([]);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [isShared, setIsShared] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [insights, setInsights] = useState(null);
  const [items, setItems] = useState([]);
  const [origin, setOrigin] = useState("Sao Paulo");
  const [itemDraft, setItemDraft] = useState({ category: "activity", title: "", estimated_cost: "", actual_cost: "", notes: "" });
  const [editingItemId, setEditingItemId] = useState(null);
  const [transportMode, setTransportMode] = useState("air");
  const [tripMonth, setTripMonth] = useState("");
  const [flexibleMonths, setFlexibleMonths] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [finalTransport, setFinalTransport] = useState({ itinerary: "", date: "", ticketPerPerson: "", ticketCouple: "" });
  const [finalAccommodation, setFinalAccommodation] = useState({ place: "", roomType: "", checkIn: "", checkOut: "", total: "", notes: "" });

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
    await api.post("/features/travel", { title, destination, is_shared: isShared });
    setTitle("");
    setDestination("");
    await loadPlans();
  };

  const selectPlan = async (plan) => {
    setActivePlan(plan);
    const [insightRes, itemsRes, finalRes] = await Promise.all([
      api.get(`/features/travel/${plan.id}/insights`, {
        params: { origin, mode: transportMode, tripMonth, flexibleMonths, checkIn, checkOut }
      }),
      api.get(`/features/travel/${plan.id}/items`),
      api.get(`/features/travel/${plan.id}/final-data`)
    ]);
    setInsights(insightRes.data);
    setItems(itemsRes.data || []);
    setFinalTransport(finalRes.data?.definitive_transport || { itinerary: "", date: "", ticketPerPerson: "", ticketCouple: "" });
    setFinalAccommodation(finalRes.data?.definitive_accommodation || { place: "", roomType: "", checkIn: "", checkOut: "", total: "", notes: "" });
  };

  const recalculate = async () => {
    if (!activePlan) return;
    await selectPlan(activePlan);
  };

  const addOrUpdatePlanItem = async (e) => {
    e.preventDefault();
    if (!activePlan?.id || !itemDraft.title) return;
    const payload = {
      category: itemDraft.category,
      title: itemDraft.title,
      estimated_cost: Number(itemDraft.estimated_cost || 0),
      actual_cost: Number(itemDraft.actual_cost || 0),
      notes: itemDraft.notes || null
    };
    if (editingItemId) {
      await api.put(`/features/travel/items/${editingItemId}`, payload);
    } else {
      await api.post(`/features/travel/${activePlan.id}/items`, payload);
    }
    setEditingItemId(null);
    setItemDraft({ category: "activity", title: "", estimated_cost: "", actual_cost: "", notes: "" });
    await selectPlan(activePlan);
  };

  const editItem = (item) => {
    setEditingItemId(item.id);
    setItemDraft({
      category: item.category,
      title: item.title,
      estimated_cost: item.estimated_cost ?? "",
      actual_cost: item.actual_cost ?? "",
      notes: item.notes || ""
    });
  };

  const deleteItem = async (itemId) => {
    await api.delete(`/features/travel/items/${itemId}`);
    await selectPlan(activePlan);
  };

  const saveFinalData = async () => {
    if (!activePlan?.id) return;
    await api.put(`/features/travel/${activePlan.id}/final-data`, {
      definitiveTransport: { ...finalTransport, mode: transportMode, origin, destination: insights?.destination || activePlan.destination },
      definitiveAccommodation: finalAccommodation
    });
  };

  const grouped = useMemo(() => ({
    activity: items.filter((i) => i.category === "activity"),
    food: items.filter((i) => i.category === "food")
  }), [items]);

  return (
    <div className="travel-page">
      <h2>Planejamento de Viagens Premium</h2>
      <form onSubmit={createPlan} className="travel-form">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome da viagem" />
        <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destino" />
        <label><input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} /> Compartilhar com cônjuge</label>
        <button type="submit">Criar viagem</button>
      </form>
      <div className="travel-form">
        <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origem" />
        <select value={transportMode} onChange={(e) => setTransportMode(e.target.value)}>
          <option value="air">Aéreo</option><option value="bus">Ônibus</option><option value="car">Carro</option>
        </select>
        <input type="month" value={tripMonth} onChange={(e) => setTripMonth(e.target.value)} />
        <input type="number" value={flexibleMonths} onChange={(e) => setFlexibleMonths(e.target.value)} placeholder="X meses flexíveis" />
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        {activePlan && <button type="button" onClick={recalculate}>Recalcular preços</button>}
      </div>
      <ul className="travel-plan-list">
        {plans.map((plan) => (
          <li key={plan.id}>
            {plan.title} - {plan.destination} {plan.is_shared ? "(Compartilhada)" : "(Individual)"}
            <button type="button" onClick={() => selectPlan(plan)}>Abrir dashboard</button>
            <button type="button" onClick={async () => { await api.delete(`/features/travel/${plan.id}`); await loadPlans(); }}>Excluir</button>
          </li>
        ))}
      </ul>

      {activePlan && insights && (
        <section>
          <div className="travel-grid">
            <article className="travel-card"><h4>Transporte</h4><p>Prévia por pessoa: R$ {Number(insights.transportPreview.estimatedPricePerPerson || 0).toFixed(2)}</p><p>Prévia casal: R$ {Number(insights.transportPreview.estimatedPriceCouple || 0).toFixed(2)}</p><input value={finalTransport.itinerary} onChange={(e) => setFinalTransport((p) => ({ ...p, itinerary: e.target.value }))} placeholder="Itinerário final" /><input type="date" value={finalTransport.date} onChange={(e) => setFinalTransport((p) => ({ ...p, date: e.target.value }))} /><input type="number" value={finalTransport.ticketPerPerson} onChange={(e) => setFinalTransport((p) => ({ ...p, ticketPerPerson: e.target.value }))} placeholder="Real por pessoa" /><input type="number" value={finalTransport.ticketCouple} onChange={(e) => setFinalTransport((p) => ({ ...p, ticketCouple: e.target.value }))} placeholder="Real casal" /><button type="button" onClick={saveFinalData}>Salvar dados finais</button></article>
            <article className="travel-card"><h4>Hospedagem</h4><p>Diária aproximada: R$ {Number(insights.accommodationPreview.estimatedNightly || 0).toFixed(2)}</p><p>Noites: {insights.accommodationPreview.nights}</p><p>Total aproximado: R$ {Number(insights.accommodationPreview.estimatedTotal || 0).toFixed(2)}</p><input value={finalAccommodation.place} onChange={(e) => setFinalAccommodation((p) => ({ ...p, place: e.target.value }))} placeholder="Hospedagem escolhida" /><input value={finalAccommodation.roomType} onChange={(e) => setFinalAccommodation((p) => ({ ...p, roomType: e.target.value }))} placeholder="Tipo de quarto" /><input type="date" value={finalAccommodation.checkIn} onChange={(e) => setFinalAccommodation((p) => ({ ...p, checkIn: e.target.value }))} /><input type="date" value={finalAccommodation.checkOut} onChange={(e) => setFinalAccommodation((p) => ({ ...p, checkOut: e.target.value }))} /><input type="number" value={finalAccommodation.total} onChange={(e) => setFinalAccommodation((p) => ({ ...p, total: e.target.value }))} placeholder="Valor final hospedagem" /><textarea value={finalAccommodation.notes} onChange={(e) => setFinalAccommodation((p) => ({ ...p, notes: e.target.value }))} placeholder="Observações" /><button type="button" onClick={saveFinalData}>Salvar dados finais</button></article>
            <article className="travel-card"><h4>Passeios</h4><img className="travel-photo" src={insights.media.activitiesPhoto} alt="Passeios" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/activities-fallback/1200/700"; }} /><ul>{insights.cards.activities.suggestions.map((s) => <li key={s}>{s}</li>)}</ul></article>
            <article className="travel-card"><h4>Alimentação</h4><img className="travel-photo" src={insights.media.foodPhoto} alt="Alimentação" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/food-fallback/1200/700"; }} /><ul>{insights.cards.food.suggestions.map((s) => <li key={s}>{s}</li>)}</ul></article>
            <article className="travel-card"><h4>Mapa</h4><iframe title="Mapa rota" src={`https://www.google.com/maps?q=${encodeURIComponent(`${origin} to ${insights.destination}`)}&output=embed`} className="travel-map" loading="lazy" /></article>
            <article className="travel-card"><h4>Fotos do destino</h4><img className="travel-photo" src={insights.media.destinationPhoto} alt="Destino" onError={(e) => { e.currentTarget.src = "https://picsum.photos/seed/destination-fallback/1200/700"; }} /></article>
          </div>

          <div className="travel-table-wrap">
            <h4>Tabela editável - Passeios/Alimentação</h4>
            <form onSubmit={addOrUpdatePlanItem} className="travel-form">
              <select value={itemDraft.category} onChange={(e) => setItemDraft((p) => ({ ...p, category: e.target.value }))}><option value="activity">Passeio</option><option value="food">Alimentação</option><option value="accommodation">Hospedagem</option><option value="transport">Transporte</option></select>
              <input value={itemDraft.title} onChange={(e) => setItemDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Descrição" />
              <input type="number" step="0.01" value={itemDraft.estimated_cost} onChange={(e) => setItemDraft((p) => ({ ...p, estimated_cost: e.target.value }))} placeholder="Estimado" />
              <input type="number" step="0.01" value={itemDraft.actual_cost} onChange={(e) => setItemDraft((p) => ({ ...p, actual_cost: e.target.value }))} placeholder="Real" />
              <input value={itemDraft.notes} onChange={(e) => setItemDraft((p) => ({ ...p, notes: e.target.value }))} placeholder="Obs" />
              <button type="submit">{editingItemId ? "Salvar edição" : "Adicionar item"}</button>
            </form>
            <table className="travel-table"><thead><tr><th>Categoria</th><th>Descrição</th><th>Estimado</th><th>Real</th><th>Obs</th><th>Ações</th></tr></thead><tbody>{items.map((row) => <tr key={row.id}><td>{row.category}</td><td>{row.title}</td><td>R$ {Number(row.estimated_cost || 0).toFixed(2)}</td><td>R$ {Number(row.actual_cost || 0).toFixed(2)}</td><td>{row.notes || "-"}</td><td><button type="button" onClick={() => editItem(row)}>Editar</button><button type="button" onClick={() => deleteItem(row.id)}>Excluir</button></td></tr>)}</tbody></table>
            <p>Totais: Passeios R$ {grouped.activity.reduce((acc, cur) => acc + Number(cur.actual_cost || cur.estimated_cost || 0), 0).toFixed(2)} | Alimentação R$ {grouped.food.reduce((acc, cur) => acc + Number(cur.actual_cost || cur.estimated_cost || 0), 0).toFixed(2)}</p>
          </div>
        </section>
      )}
    </div>
  );
}

export default Travel;