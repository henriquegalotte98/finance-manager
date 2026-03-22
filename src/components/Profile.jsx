import { useEffect, useState } from "react";
import ImportFile from "./ImportFile";
import LogoutButton from "./LogoutButton";
import api from "../services/api";

function Profile() {
  const [feedback, setFeedback] = useState("");
  const [coupleInfo, setCoupleInfo] = useState({ couple: null, members: [] });
  const [livingTogether, setLivingTogether] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const loadAll = async () => {
    try {
      const coupleRes = await api.get("/features/couple/me");
      setCoupleInfo(coupleRes.data);
      setLivingTogether(!!coupleRes.data?.couple?.living_together);
    } catch (err) {
      console.error("Erro ao carregar perfil casal:", err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Criar casal
  const createCouple = async () => {
    try {
      const userId = localStorage.getItem("userId"); // ou do contexto

      const res = await api.post("/couple/create"); // substitua pelo ID real do usuário logado
      setInviteCode(res.data.inviteCode);
      setFeedback("Casal criado! Compartilhe o código com seu parceiro.");
      loadAll();
    } catch (err) {
      console.error(err);
      setFeedback("Erro ao criar casal.");
    }
  };

  // Entrar no casal
  const joinCouple = async () => {
    try {
      await api.post("/couple/join", { userId: currentUserId, code: joinCode });
      setFeedback("Você entrou no casal!");
      loadAll();
    } catch (err) {
      console.error(err);
      setFeedback("Erro ao entrar no casal.");
    }
  };

  // Toggle morar junto
  const onToggleLiving = async (event) => {
    try {
      const newValue = event.target.checked;
      setLivingTogether(newValue);
      await api.post("/features/couple/living-together", { livingTogether: newValue });
      setFeedback("Opção 'Morar junto' atualizada!");
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      setFeedback("Erro ao atualizar opção 'Morar junto'.");
    }
  };

  return (
    <div>
      <h2>Perfil e Recursos do Casal</h2>
      {feedback && <p>{feedback}</p>}
      <ImportFile />
      <LogoutButton />

      <section>
        <h3>Casal</h3>
        <p>
          Membros: {coupleInfo.members.map((m) => m.name).join(", ") || "Sem casal no momento"}
        </p>

        {!coupleInfo.couple ? (
          <div>
            <button onClick={createCouple}>Criar casal</button>
            {inviteCode && <p>Convide seu parceiro com este código: {inviteCode}</p>}

            <input
              type="text"
              placeholder="Digite o código para entrar"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button onClick={joinCouple}>Entrar no casal</button>
          </div>
        ) : (
          <label>
            <input type="checkbox" checked={livingTogether} onChange={onToggleLiving} />
            Morar junto (gastos compartilhados)
          </label>
        )}
      </section>
    </div>
  );
}

export default Profile;