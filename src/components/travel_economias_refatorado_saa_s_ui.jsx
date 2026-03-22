// 🔥 SaaS Premium UI (Stripe / Notion inspired)
// Travel + Economias com UX avançada

import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./SaaS.css";

export default function SaaSApp() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [travelRes, ecoRes] = await Promise.all([
          api.get("/features/travel"),
          api.get("/features/savings")
        ]);
        setPlans(travelRes.data || []);
        setWallets(ecoRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSaved = useMemo(
    () => wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0),
    [wallets]
  );

  if (loading) {
    return (
      <div className="saas-loading">
        <div className="saas-skeleton hero" />
        <div className="saas-skeleton card" />
        <div className="saas-skeleton card" />
      </div>
    );
  }

  if (error) {
    return <div className="saas-error">{error}</div>;
  }

  return (
    <div className="saas-page">
      <header className="saas-hero">
        <div>
          <p className="saas-kicker">Dashboard</p>
          <h1>Controle financeiro inteligente</h1>
          <p className="saas-sub">Visual limpo, rápido e com sensação premium.</p>
        </div>
        <div className="saas-stat">
          <span>Total economizado</span>
          <strong>R$ {totalSaved.toFixed(2)}</strong>
        </div>
      </header>

      <section className="saas-grid">
        <div className="saas-card">
          <h3>Viagens</h3>
          <p>{plans.length} planejamentos</p>
        </div>

        <div className="saas-card">
          <h3>Carteiras</h3>
          <p>{wallets.length} ativas</p>
        </div>
      </section>

      <section className="saas-list">
        <h2>Atividades recentes</h2>
        {[...plans, ...wallets].slice(0, 5).map((item, i) => (
          <div key={i} className="saas-list-item">
            <span>{item.title || item.name}</span>
            <small>Atualizado recentemente</small>
          </div>
        ))}
      </section>
    </div>
  );
}

