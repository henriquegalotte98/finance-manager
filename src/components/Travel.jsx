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
  const [itemDraft, setItemDraft] = useState({
    category: "activity",
    title: "",
    estimated_cost: "",
    actual_cost: "",
    notes: ""
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [transportMode, setTransportMode] = useState("air");
  const [tripMonth, setTripMonth] = useState("");
  const [flexibleMonths, setFlexibleMonths] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [finalTransport, setFinalTransport] = useState({
    itinerary: "",
    date: "",
    ticketPerPerson: "",
    ticketCouple: ""
  });
  const [finalAccommodation, setFinalAccommodation] = useState({
    place: "",
    roomType: "",
    checkIn: "",
    checkOut: "",
    total: "",
    notes: ""
  });
  const [expandedCard, setExpandedCard] = useState("transport");
  const [savedToast, setSavedToast] = useState(false);

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
    setFinalTransport(
      finalRes.data?.definitive_transport || {
        itinerary: "",
        date: "",
        ticketPerPerson: "",
        ticketCouple: ""
      }
    );
    setFinalAccommodation(
      finalRes.data?.definitive_accommodation || {
        place: "",
        roomType: "",
        checkIn: "",
        checkOut: "",
        total: "",
        notes: ""
      }
    );
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
      definitiveTransport: {
        ...finalTransport,
        mode: transportMode,
        origin,
        destination: insights?.destination || activePlan.destination
      },
      definitiveAccommodation: finalAccommodation
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const grouped = useMemo(
    () => ({
      activity: items.filter((i) => i.category === "activity"),
      food: items.filter((i) => i.category === "food")
    }),
    [items]
  );

  const accent = insights?.theme?.accent || "#6366f1";
  const themeLabel = insights?.theme?.label || "";

  const toggleCard = (id) => {
    setExpandedCard((prev) => (prev === id ? "" : id));
  };

  return (
    <div className="travel-page" style={{ "--travel-accent": accent }}>
      <header className="travel-hero">
        <div className="travel-hero-text">
          <p className="travel-kicker">Planejador de viagens</p>
          <h2>Viagens com cara de destino</h2>
          <p className="travel-sub">
            Fotos, dicas de comida e passeios mudam conforme você digita o destino — ex.: Pará (tacacá, peixe) ou Itália (massas, queijos).
          </p>
        </div>
        {activePlan && insights && (
          <div className="travel-hero-badge">
            <span className="travel-theme-pill">{themeLabel || insights.destination}</span>
            {activePlan.is_shared && <span className="travel-shared-pill">Compartilhada com o casal</span>}
          </div>
        )}
      </header>

      <section className="travel-panel">
        <h3 className="travel-panel-title">Nova viagem</h3>
        <form onSubmit={createPlan} className="travel-form travel-form-grid">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nome da viagem" className="travel-input" />
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Destino (ex.: Belém, Pará ou Roma, Itália)"
            className="travel-input travel-input-wide"
          />
          <label className="travel-toggle">
            <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} />
            <span>Compartilhar com cônjuge</span>
          </label>
          <button type="submit" className="travel-btn travel-btn-primary">
            Criar viagem
          </button>
        </form>
      </section>

      <section className="travel-panel">
        <h3 className="travel-panel-title">Parâmetros da pesquisa</h3>
        <div className="travel-form travel-form-grid">
          <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origem" className="travel-input" />
          <select value={transportMode} onChange={(e) => setTransportMode(e.target.value)} className="travel-input">
            <option value="air">Aéreo</option>
            <option value="bus">Ônibus</option>
            <option value="car">Carro</option>
          </select>
          <input type="month" value={tripMonth} onChange={(e) => setTripMonth(e.target.value)} className="travel-input" />
          <input
            type="number"
            value={flexibleMonths}
            onChange={(e) => setFlexibleMonths(e.target.value)}
            placeholder="Flexível em até X meses"
            className="travel-input"
          />
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="travel-input" />
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="travel-input" />
          {activePlan && (
            <button type="button" className="travel-btn travel-btn-accent" onClick={recalculate}>
              Recalcular preços
            </button>
          )}
        </div>
      </section>

      <ul className="travel-plan-list">
        {plans.map((plan) => (
          <li key={plan.id} className={activePlan?.id === plan.id ? "travel-plan-item active" : "travel-plan-item"}>
            <div className="travel-plan-main">
              <strong>{plan.title}</strong>
              <span className="travel-plan-dest">{plan.destination}</span>
              {plan.is_shared ? <span className="travel-mini-tag">Casal</span> : <span className="travel-mini-tag muted">Só eu</span>}
            </div>
            <div className="travel-plan-actions">
              <button type="button" className="travel-btn travel-btn-ghost" onClick={() => selectPlan(plan)}>
                Abrir painel
              </button>
              <button
                type="button"
                className="travel-btn travel-btn-danger"
                onClick={async () => {
                  await api.delete(`/features/travel/${plan.id}`);
                  await loadPlans();
                  if (activePlan?.id === plan.id) {
                    setActivePlan(null);
                    setInsights(null);
                    setItems([]);
                  }
                }}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      {savedToast && <div className="travel-toast">Dados finais salvos no servidor.</div>}

      {activePlan && insights && (
        <section className="travel-dashboard">
          <div className="travel-dashboard-head">
            <h3>{activePlan.title}</h3>
            <p className="travel-dashboard-sub">
              Tema detectado: <strong>{themeLabel}</strong> — imagens e listas seguem esse perfil.
            </p>
          </div>

          <div className="travel-grid">
            <article
              className={`travel-card travel-card-interactive ${expandedCard === "transport" ? "open" : ""}`}
              data-accent
            >
              <button type="button" className="travel-card-header" onClick={() => toggleCard("transport")}>
                <span className="travel-card-icon">✈</span>
                <div>
                  <h4>Transporte</h4>
                  <p className="travel-card-hint">Prévia + valores que você fechar</p>
                </div>
                <span className="travel-chevron">{expandedCard === "transport" ? "−" : "+"}</span>
              </button>
              {expandedCard === "transport" && (
                <div className="travel-card-body">
                  <div className="travel-metric-row">
                    <div className="travel-metric">
                      <span>Por pessoa</span>
                      <strong>R$ {Number(insights.transportPreview.estimatedPricePerPerson || 0).toFixed(2)}</strong>
                    </div>
                    <div className="travel-metric">
                      <span>Casal</span>
                      <strong>R$ {Number(insights.transportPreview.estimatedPriceCouple || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                  <label className="travel-field">
                    Itinerário / escalas
                    <input
                      value={finalTransport.itinerary}
                      onChange={(e) => setFinalTransport((p) => ({ ...p, itinerary: e.target.value }))}
                      placeholder="Ex.: GRU → FOR → BEL"
                    />
                  </label>
                  <label className="travel-field">
                    Data da viagem
                    <input type="date" value={finalTransport.date} onChange={(e) => setFinalTransport((p) => ({ ...p, date: e.target.value }))} />
                  </label>
                  <div className="travel-two">
                    <label className="travel-field">
                      Real (pessoa)
                      <input
                        type="number"
                        value={finalTransport.ticketPerPerson}
                        onChange={(e) => setFinalTransport((p) => ({ ...p, ticketPerPerson: e.target.value }))}
                        placeholder="0,00"
                      />
                    </label>
                    <label className="travel-field">
                      Real (casal)
                      <input
                        type="number"
                        value={finalTransport.ticketCouple}
                        onChange={(e) => setFinalTransport((p) => ({ ...p, ticketCouple: e.target.value }))}
                        placeholder="0,00"
                      />
                    </label>
                  </div>
                  <button type="button" className="travel-btn travel-btn-primary" onClick={saveFinalData}>
                    Salvar transporte definitivo
                  </button>
                </div>
              )}
            </article>

            <article className={`travel-card travel-card-interactive ${expandedCard === "stay" ? "open" : ""}`}>
              <button type="button" className="travel-card-header" onClick={() => toggleCard("stay")}>
                <span className="travel-card-icon">🏨</span>
                <div>
                  <h4>Hospedagem</h4>
                  <p className="travel-card-hint">Estimativa + reserva final</p>
                </div>
                <span className="travel-chevron">{expandedCard === "stay" ? "−" : "+"}</span>
              </button>
              {expandedCard === "stay" && (
                <div className="travel-card-body">
                  <div className="travel-metric-row">
                    <div className="travel-metric">
                      <span>Diária (aprox.)</span>
                      <strong>R$ {Number(insights.accommodationPreview.estimatedNightly || 0).toFixed(2)}</strong>
                    </div>
                    <div className="travel-metric">
                      <span>Noites</span>
                      <strong>{insights.accommodationPreview.nights}</strong>
                    </div>
                    <div className="travel-metric">
                      <span>Total aprox.</span>
                      <strong>R$ {Number(insights.accommodationPreview.estimatedTotal || 0).toFixed(2)}</strong>
                    </div>
                  </div>
                  <label className="travel-field">
                    Onde ficar
                    <input
                      value={finalAccommodation.place}
                      onChange={(e) => setFinalAccommodation((p) => ({ ...p, place: e.target.value }))}
                      placeholder="Hotel / pousada / Airbnb"
                    />
                  </label>
                  <label className="travel-field">
                    Tipo de quarto
                    <input
                      value={finalAccommodation.roomType}
                      onChange={(e) => setFinalAccommodation((p) => ({ ...p, roomType: e.target.value }))}
                      placeholder="Ex.: suíte, standard"
                    />
                  </label>
                  <div className="travel-two">
                    <label className="travel-field">
                      Check-in
                      <input
                        type="date"
                        value={finalAccommodation.checkIn}
                        onChange={(e) => setFinalAccommodation((p) => ({ ...p, checkIn: e.target.value }))}
                      />
                    </label>
                    <label className="travel-field">
                      Check-out
                      <input
                        type="date"
                        value={finalAccommodation.checkOut}
                        onChange={(e) => setFinalAccommodation((p) => ({ ...p, checkOut: e.target.value }))}
                      />
                    </label>
                  </div>
                  <label className="travel-field">
                    Valor fechado (R$)
                    <input
                      type="number"
                      value={finalAccommodation.total}
                      onChange={(e) => setFinalAccommodation((p) => ({ ...p, total: e.target.value }))}
                      placeholder="0,00"
                    />
                  </label>
                  <label className="travel-field">
                    Observações
                    <textarea
                      value={finalAccommodation.notes}
                      onChange={(e) => setFinalAccommodation((p) => ({ ...p, notes: e.target.value }))}
                      rows={2}
                      placeholder="Política de cancelamento, café da manhã..."
                    />
                  </label>
                  <button type="button" className="travel-btn travel-btn-primary" onClick={saveFinalData}>
                    Salvar hospedagem definitiva
                  </button>
                  <div className="travel-links">
                    {insights.cards.accommodation.links.map((link) => (
                      <a key={link} href={link} target="_blank" rel="noreferrer">
                        Pesquisar hospedagem ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <article className={`travel-card travel-card-media ${expandedCard === "food" ? "open" : ""}`}>
              <button type="button" className="travel-card-header" onClick={() => toggleCard("food")}>
                <span className="travel-card-icon">🍽</span>
                <div>
                  <h4>Comida típica do destino</h4>
                  <p className="travel-card-hint">Sugestões e foto no clima regional</p>
                </div>
                <span className="travel-chevron">{expandedCard === "food" ? "−" : "+"}</span>
              </button>
              {expandedCard === "food" && (
                <div className="travel-card-body">
                  <div className="travel-img-frame">
                    <img
                      className="travel-photo"
                      src={insights.media.foodPhoto}
                      alt={`Comidas típicas em ${insights.destination}`}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/food-${encodeURIComponent(insights.destination)}/1200/700`;
                      }}
                    />
                    <div className="travel-img-caption">Imagem temática: {themeLabel || insights.destination}</div>
                  </div>
                  <ul className="travel-bullet-list">
                    {insights.cards.food.suggestions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <div className="travel-links">
                    {insights.cards.food.links.map((link) => (
                      <a key={link} href={link} target="_blank" rel="noreferrer">
                        Buscar restaurantes e pratos ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <article className={`travel-card travel-card-media ${expandedCard === "act" ? "open" : ""}`}>
              <button type="button" className="travel-card-header" onClick={() => toggleCard("act")}>
                <span className="travel-card-icon">🧭</span>
                <div>
                  <h4>Passeios e experiências</h4>
                  <p className="travel-card-hint">Roteiros alinhados ao lugar</p>
                </div>
                <span className="travel-chevron">{expandedCard === "act" ? "−" : "+"}</span>
              </button>
              {expandedCard === "act" && (
                <div className="travel-card-body">
                  <div className="travel-img-frame">
                    <img
                      className="travel-photo"
                      src={insights.media.activitiesPhoto}
                      alt={`Passeios em ${insights.destination}`}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/act-${encodeURIComponent(insights.destination)}/1200/700`;
                      }}
                    />
                  </div>
                  <ul className="travel-bullet-list">
                    {insights.cards.activities.suggestions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <div className="travel-links">
                    {insights.cards.activities.links.map((link) => (
                      <a key={link} href={link} target="_blank" rel="noreferrer">
                        Ideias e roteiros na web ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <article className={`travel-card travel-card-media ${expandedCard === "dest" ? "open" : ""}`}>
              <button type="button" className="travel-card-header" onClick={() => toggleCard("dest")}>
                <span className="travel-card-icon">📷</span>
                <div>
                  <h4>Cartão-postal</h4>
                  <p className="travel-card-hint">Paisagem / cidade no estilo do destino</p>
                </div>
                <span className="travel-chevron">{expandedCard === "dest" ? "−" : "+"}</span>
              </button>
              {expandedCard === "dest" && (
                <div className="travel-card-body">
                  <div className="travel-img-frame">
                    <img
                      className="travel-photo"
                      src={insights.media.destinationPhoto}
                      alt={insights.destination}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/seed/dest-${encodeURIComponent(insights.destination)}/1200/700`;
                      }}
                    />
                  </div>
                </div>
              )}
            </article>

            <article className={`travel-card travel-card-map ${expandedCard === "map" ? "open" : ""}`}>
              <button type="button" className="travel-card-header" onClick={() => toggleCard("map")}>
                <span className="travel-card-icon">🗺</span>
                <div>
                  <h4>Mapa da rota</h4>
                  <p className="travel-card-hint">{origin} → {insights.destination}</p>
                </div>
                <span className="travel-chevron">{expandedCard === "map" ? "−" : "+"}</span>
              </button>
              {expandedCard === "map" && (
                <div className="travel-card-body">
                  <iframe
                    title="Mapa rota"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${origin} to ${insights.destination}`)}&output=embed`}
                    className="travel-map"
                    loading="lazy"
                  />
                  <a className="travel-map-link" href={insights.cards.maps.links[0]} target="_blank" rel="noreferrer">
                    Abrir rota completa no Google Maps ↗
                  </a>
                </div>
              )}
            </article>
          </div>

          <div className="travel-table-section">
            <div className="travel-table-head">
              <h4>Orçamento detalhado</h4>
              <p>Linhas editáveis — passeios, comida, hospedagem extra, transporte avulso.</p>
            </div>
            <form onSubmit={addOrUpdatePlanItem} className="travel-form travel-form-grid">
              <select
                value={itemDraft.category}
                onChange={(e) => setItemDraft((p) => ({ ...p, category: e.target.value }))}
                className="travel-input"
              >
                <option value="activity">Passeio</option>
                <option value="food">Alimentação</option>
                <option value="accommodation">Hospedagem</option>
                <option value="transport">Transporte</option>
              </select>
              <input
                value={itemDraft.title}
                onChange={(e) => setItemDraft((p) => ({ ...p, title: e.target.value }))}
                placeholder="Descrição"
                className="travel-input"
              />
              <input
                type="number"
                step="0.01"
                value={itemDraft.estimated_cost}
                onChange={(e) => setItemDraft((p) => ({ ...p, estimated_cost: e.target.value }))}
                placeholder="Estimado"
                className="travel-input"
              />
              <input
                type="number"
                step="0.01"
                value={itemDraft.actual_cost}
                onChange={(e) => setItemDraft((p) => ({ ...p, actual_cost: e.target.value }))}
                placeholder="Real"
                className="travel-input"
              />
              <input
                value={itemDraft.notes}
                onChange={(e) => setItemDraft((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Observação"
                className="travel-input travel-input-wide"
              />
              <button type="submit" className="travel-btn travel-btn-primary">
                {editingItemId ? "Salvar linha" : "Adicionar linha"}
              </button>
            </form>

            <div className="travel-table-scroll">
              <table className="travel-table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Descrição</th>
                    <th>Estimado</th>
                    <th>Real</th>
                    <th>Obs</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row.id}>
                      <td><span className="travel-cat">{row.category}</span></td>
                      <td>{row.title}</td>
                      <td>R$ {Number(row.estimated_cost || 0).toFixed(2)}</td>
                      <td>R$ {Number(row.actual_cost || 0).toFixed(2)}</td>
                      <td>{row.notes || "—"}</td>
                      <td className="travel-table-actions">
                        <button type="button" className="travel-btn travel-btn-ghost" onClick={() => editItem(row)}>
                          Editar
                        </button>
                        <button type="button" className="travel-btn travel-btn-danger" onClick={() => deleteItem(row.id)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="travel-totals">
              <div>
                <span>Passeios</span>
                <strong>
                  R${" "}
                  {grouped.activity.reduce((acc, cur) => acc + Number(cur.actual_cost || cur.estimated_cost || 0), 0).toFixed(2)}
                </strong>
              </div>
              <div>
                <span>Alimentação</span>
                <strong>
                  R${" "}
                  {grouped.food.reduce((acc, cur) => acc + Number(cur.actual_cost || cur.estimated_cost || 0), 0).toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Travel;
