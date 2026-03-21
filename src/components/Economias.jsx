import { useEffect, useState } from "react";
import api from "../services/api";

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

  return (
    <div>
      <h2>Economias (individual e compartilhada)</h2>
      <form onSubmit={onCreate}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da carteira" />
        <input
          type="number"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          placeholder="Saldo inicial"
        />
        <label style={{ marginLeft: 8 }}>
          <input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} />
          Compartilhada
        </label>
        <button type="submit">Criar</button>
      </form>

      <ul>
        {wallets.map((wallet) => (
          <li key={wallet.id}>
            {wallet.name} - R$ {Number(wallet.balance).toFixed(2)} {wallet.is_shared ? "(Casal)" : "(Individual)"}
            <button type="button" onClick={() => { setActiveWalletId(wallet.id); loadTransactions(wallet.id); }} style={{ marginLeft: 8 }}>
              Ver tabela
            </button>
            <button type="button" onClick={() => startEditWallet(wallet)} style={{ marginLeft: 8 }}>
              Editar
            </button>
            <button type="button" onClick={() => deleteWallet(wallet.id)} style={{ marginLeft: 8 }}>
              Excluir
            </button>
          </li>
        ))}
      </ul>

      {editingWalletId && (
        <section>
          <h3>Editar carteira</h3>
          <input value={editWalletName} onChange={(e) => setEditWalletName(e.target.value)} />
          <label style={{ marginLeft: 8 }}>
            <input type="checkbox" checked={editWalletShared} onChange={(e) => setEditWalletShared(e.target.checked)} />
            Compartilhada
          </label>
          <button type="button" onClick={saveWallet}>Salvar</button>
        </section>
      )}

      {activeWalletId && (
        <section>
          <h3>Tabela da economia</h3>
          <form onSubmit={addTransaction}>
            <select value={txType} onChange={(e) => setTxType(e.target.value)}>
              <option value="deposit">Guardar</option>
              <option value="withdraw">Retirar</option>
            </select>
            <input type="number" step="0.01" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} placeholder="Valor" />
            <input value={txNotes} onChange={(e) => setTxNotes(e.target.value)} placeholder="Observação" />
            <button type="submit">Lançar</button>
          </form>
          <table border="1" cellPadding="6" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Valor separado</th>
                <th>Tipo</th>
                <th>Obs</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.created_at).toLocaleDateString("pt-BR")}</td>
                  <td>R$ {Number(tx.amount).toFixed(2)}</td>
                  <td>{tx.tx_type === "deposit" ? "Guardado" : "Retirado"}</td>
                  <td>{tx.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Valor total atual: R$ {Number(wallets.find((w) => w.id === activeWalletId)?.balance || 0).toFixed(2)}
          </p>
        </section>
      )}
    </div>
  );
}

export default Economias;