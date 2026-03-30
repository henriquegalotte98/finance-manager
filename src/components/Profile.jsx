import { useEffect, useState } from "react";
import ImportFile from "./ImportFile";
import LogoutButton from "./LogoutButton";
import api from "../services/api";
import { useAuth } from '../components/AuthContext';
import DarkModeToggle from "./DarkModeToggle";
import "./Profile.css"

function Profile() {
  const { user } = useAuth(); // Pegando o usuário do contexto de autenticação
  const [feedback, setFeedback] = useState("");
  const [coupleInfo, setCoupleInfo] = useState({ couple: null, members: [] });
  const [livingTogether, setLivingTogether] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    if (!user?.id) {
      setFeedback("Usuário não identificado. Faça login novamente.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/couple/create", { userId: user.id });
      setInviteCode(res.data.inviteCode);
      setFeedback("Casal criado! Compartilhe o código com seu parceiro.");
      loadAll();
    } catch (err) {
      console.error("Erro ao criar casal:", err);
      setFeedback(err.response?.data?.error || "Erro ao criar casal.");
    } finally {
      setIsLoading(false);
    }
  };

  // Entrar no casal
  const joinCouple = async () => {
    if (!user?.id) {
      setFeedback("Usuário não identificado. Faça login novamente.");
      return;
    }

    if (!joinCode.trim()) {
      setFeedback("Digite o código de convite.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/couple/join", {
        userId: user.id,  // CORRIGIDO: agora usa user.id em vez de currentUserId
        code: joinCode.trim()
      });
      setFeedback("Você entrou no casal com sucesso!");
      setJoinCode(""); // Limpa o campo após entrar
      loadAll();
    } catch (err) {
      console.error("Erro ao entrar no casal:", err);
      setFeedback(err.response?.data?.error || "Erro ao entrar no casal. Verifique o código e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle morar junto - VERSÃO CORRIGIDA
  const onToggleLiving = async (event) => {
    if (!coupleInfo.couple) {
      setFeedback("Você precisa estar em um casal primeiro.");
      return;
    }

    const newValue = event.target.checked; // Declare a variável aqui

    try {
      setLivingTogether(newValue);
      await api.post("/features/couple/living-together", { livingTogether: newValue });
      setFeedback("Opção 'Morar junto' atualizada!");
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      setFeedback("Erro ao atualizar opção 'Morar junto'.");
      setLivingTogether(!newValue); // Reverte em caso de erro
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>

      {feedback && (
        <p style={{
          padding: "10px",
          backgroundColor: feedback.includes("Erro") ? "#ffebee" : "#e8f5e9",
          color: feedback.includes("Erro") ? "#c62828" : "#2e7d32",
          borderRadius: "4px",
          marginBottom: "20px"
        }}>
          {feedback}
        </p>
      )}

      <div className="profile-panel">
      <h2>Perfil</h2>
        <ImportFile />
        <LogoutButton />
      </div>
      
      <section style={{ marginTop: "20px" }} className="profile-panel">
        <h3>Recursos do Casal</h3>
        <p>
          <strong>Membros:</strong> {coupleInfo.members.length > 0
            ? coupleInfo.members.map((m) => m.name).join(", ")
            : "Sem casal no momento"}
        </p>

        {!coupleInfo.couple ? (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <button
                onClick={createCouple}
                disabled={isLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? "Criando..." : "Criar casal"}
              </button>
              {inviteCode && (
                <p style={{ marginTop: "10px", padding: "10px", backgroundColor: "#e3f2fd", borderRadius: "4px" }}>
                  <strong>Código de convite:</strong> {inviteCode}
                  <br />
                  <small>Compartilhe este código com seu parceiro(a)</small>
                </p>
              )}
            </div>

            <div>
              <h4>Já tem um código?</h4>
              <input
                type="text"
                placeholder="Digite o código para entrar"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                disabled={isLoading}
                style={{
                  padding: "8px",
                  width: "100%",
                  marginBottom: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px"
                }}
              />
              <button
                onClick={joinCouple}
                disabled={isLoading || !joinCode.trim()}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: (isLoading || !joinCode.trim()) ? "not-allowed" : "pointer",
                  opacity: (isLoading || !joinCode.trim()) ? 0.6 : 1
                }}
              >
                {isLoading ? "Entrando..." : "Entrar no casal"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={livingTogether}
                onChange={onToggleLiving}
              />
              Morar junto (gastos compartilhados)
            </label>

            <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
              <strong>Status do casal:</strong> Conectado
              {coupleInfo.members.length === 2 && (
                <p style={{ marginTop: "5px", fontSize: "14px", color: "#666" }}>
                  ✓ Ambos os membros estão conectados
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Profile;