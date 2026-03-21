import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Economias.css";

function Economias() {
  const [wallets, setWallets] = useState([]);
  const [name, setName] = useState("");
  const [shared, setShared] = useState(true);
  const [initialBalance, setInitialBalance] = useState(0);
  const [activeWalletId, setActiveWalletId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txAmount, setTxAmount] = useState("");
  const [txType, setTxType] = useState("deposit");
  const [txNotes, setTxNotes] = useState("");
  const [editingWalletId, setEditingWalletId] = useState(null);
  const [editWalletName, setEditWalletName] = useState("");
  const [editWalletShared, setEditWalletShared] = useState(false);

  const loadWallets = async () => {
    const res = await api.get("/features/savings");
    setWallets(res.data || []);
  };

  useEffect(() => {
    loadWallets().catch((err) => console.error("Erro ao buscar carteiras:", err));
  }, []);

  const loadTransactions = async (walletId) => {
    const res = await api.get(`/features/savings/${walletId}/tx`);
    setTransactions(res.data || []);
  };

  const activeWallet = useMemo(
    () => wallets.find((w) => w.id === activeWalletId) || null,
    [wallets, activeWalletId]
  );

  const onCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    await api.post("/features/savings", {
      name,
      is_shared: shared,
      initial_balance: Number(initialBalance || 0)
    });
    setName("");
    setInitialBalance(0);
    await loadWallets();
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!activeWalletId || !txAmount) return;
    await api.post(`/features/savings/${activeWalletId}/tx`, {
      amount: Number(txAmount),
      tx_type: txType,
      notes: txNotes
    });
    setTxAmount("");
    setTxNotes("");
    await loadWallets();
    await loadTransactions(activeWalletId);
  };

  const startEditWallet = (wallet) => {
    setEditingWalletId(wallet.id);
    setEditWalletName(wallet.name);
    setEditWalletShared(!!wallet.is_shared);
  };

  const saveWallet = async () => {
    if (!editingWalletId) return;
    await api.patch(`/features/savings/${editingWalletId}`, {
      name: editWalletName,
      is_shared: editWalletShared
    });
    setEditingWalletId(null);
    await loadWallets();
  };

  const deleteWallet = async (walletId) => {
    await api.delete(`/features/savings/${walletId}`);
    if (activeWalletId === walletId) {
      setActiveWalletId(null);
      setTransactions([]);
    }
    await loadWallets();
  };

  const totalSaved = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);

  return (
    <div className="eco-page">
      <header className="eco-hero">
        <div>
          <p className="eco-kicker">Metas e poupança</p>
          <h2>Economias</h2>
          <p className="eco-sub">Carteiras individuais ou compartilhadas com o casal — visual moderno, sem cara de extrato dos anos 90.</p>
        </div>
        <div className="eco-hero-stat">
          <span>Total em carteiras</span>
          <strong>R$ {totalSaved.toFixed(2)}</strong>
        </div>
      </header>

      <section className="eco-panel">
        <h3 className="eco-panel-title">Nova carteira</h3>
        <form onSubmit={onCreate} className="eco-form">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Moto S350, viagem Europa..."
            className="eco-input eco-input-grow"
          />
          <input
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="Saldo inicial"
            className="eco-input"
          />
          <label className="eco-toggle">
            <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} />
            <span>Compartilhada</span>
          </label>
          <button type="submit" className="eco-btn eco-btn-primary">
            Criar
          </button>
        </form>
      </section>

      <section className="eco-wallets">
        {wallets.map((wallet) => (
          <article
            key={wallet.id}
            className={`eco-wallet-card ${activeWalletId === wallet.id ? "active" : ""}`}
          >
            <div className="eco-wallet-top">
              <div>
                <h4>{wallet.name}</h4>
                <span className={wallet.is_shared ? "eco-tag eco-tag-shared" : "eco-tag"}>
                  {wallet.is_shared ? "Casal" : "Individual"}
                </span>
              </div>
              <p className="eco-balance">R$ {Number(wallet.balance).toFixed(2)}</p>
            </div>
            <div className="eco-wallet-actions">
              <button
                type="button"
                className="eco-btn eco-btn-ghost"
                onClick={() => {
                  setActiveWalletId(wallet.id);
                  loadTransactions(wallet.id);
                }}
              >
                Abrir extrato
              </button>
              <button type="button" className="eco-btn eco-btn-ghost" onClick={() => startEditWallet(wallet)}>
                Editar
              </button>
              <button type="button" className="eco-btn eco-btn-danger" onClick={() => deleteWallet(wallet.id)}>
                Excluir
              </button>
            </div>
          </article>
        ))}
        {wallets.length === 0 && <p className="eco-empty">Nenhuma carteira ainda — crie uma meta acima.</p>}
      </section>

      {editingWalletId && (
        <section className="eco-panel eco-edit">
          <h3 className="eco-panel-title">Editar carteira</h3>
          <div className="eco-form">
            <input value={editWalletName} onChange={(e) => setEditWalletName(e.target.value)} className="eco-input eco-input-grow" />
            <label className="eco-toggle">
              <input type="checkbox" checked={editWalletShared} onChange={(e) => setEditWalletShared(e.target.checked)} />
              <span>Compartilhada</span>
            </label>
            <button type="button" className="eco-btn eco-btn-primary" onClick={saveWallet}>
              Salvar
            </button>
          </div>
        </section>
      )}

      {activeWalletId && activeWallet && (
        <section className="eco-detail">
          <div className="eco-detail-head">
            <div>
              <p className="eco-kicker">Extrato</p>
              <h3>{activeWallet.name}</h3>
            </div>
            <div className="eco-detail-balance">
              <span>Saldo atual</span>
              <strong>R$ {Number(activeWallet.balance).toFixed(2)}</strong>
            </div>
          </div>

          <form onSubmit={addTransaction} className="eco-form eco-tx-form">
            <select value={txType} onChange={(e) => setTxType(e.target.value)} className="eco-input">
              <option value="deposit">Guardar</option>
              <option value="withdraw">Retirar</option>
            </select>
            <input
              type="number"
              step="0.01"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              placeholder="Valor"
              className="eco-input"
            />
            <input
              value={txNotes}
              onChange={(e) => setTxNotes(e.target.value)}
              placeholder="Observação"
              className="eco-input eco-input-grow"
            />
            <button type="submit" className="eco-btn eco-btn-primary">
              Lançar
            </button>
          </form>

          <div className="eco-table-wrap">
            <table className="eco-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Tipo</th>
                  <th>Obs</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className={tx.tx_type === "deposit" ? "eco-tx-in" : "eco-tx-out"}>
                      {tx.tx_type === "deposit" ? "+" : "−"} R$ {Number(tx.amount).toFixed(2)}
                    </td>
                    <td>{tx.tx_type === "deposit" ? "Guardado" : "Retirado"}</td>
                    <td>{tx.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default Economias;
