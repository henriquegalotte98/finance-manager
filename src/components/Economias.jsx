import { useEffect, useState } from "react";
import api from "../services/api";

function Economias() {
  const [wallets, setWallets] = useState([]);
  const [name, setName] = useState("");
  const [shared, setShared] = useState(true);
  const [initialBalance, setInitialBalance] = useState(0);

  const loadWallets = async () => {
    const res = await api.get("/features/savings");
    setWallets(res.data || []);
  };

  useEffect(() => {
    loadWallets().catch((err) => console.error("Erro ao buscar carteiras:", err));
  }, []);

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
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Economias;