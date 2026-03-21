import { useEffect, useState } from "react";
import ImportFile from "./ImportFile";
import LogoutButton from "./LogoutButton";
import api from "../services/api";

function Profile() {
  const [coupleInfo, setCoupleInfo] = useState({ couple: null, members: [] });
  const [livingTogether, setLivingTogether] = useState(false);
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListType, setNewListType] = useState("shopping");
  const [myTodos, setMyTodos] = useState([]);
  const [spouseTodos, setSpouseTodos] = useState([]);
  const [todoTitle, setTodoTitle] = useState("");

  const loadAll = async () => {
    const [coupleRes, listsRes, myTodosRes, spouseTodosRes] = await Promise.all([
      api.get("/features/couple/me"),
      api.get("/features/lists"),
      api.get("/features/todos/me"),
      api.get("/features/todos/spouse")
    ]);
    setCoupleInfo(coupleRes.data);
    setLivingTogether(!!coupleRes.data?.couple?.living_together);
    setLists(listsRes.data || []);
    setMyTodos(myTodosRes.data || []);
    setSpouseTodos(spouseTodosRes.data || []);
  };

  useEffect(() => {
    loadAll().catch((err) => console.error("Erro ao carregar perfil casal:", err));
  }, []);

  const onToggleLiving = async () => {
    await api.post("/features/couple/living-together", { livingTogether: !livingTogether });
    setLivingTogether(!livingTogether);
  };

  const createList = async (e) => {
    e.preventDefault();
    if (!newListTitle) return;
    await api.post("/features/lists", { title: newListTitle, type: newListType });
    setNewListTitle("");
    await loadAll();
  };

  const createTodo = async (e) => {
    e.preventDefault();
    if (!todoTitle) return;
    await api.post("/features/todos", { title: todoTitle });
    setTodoTitle("");
    await loadAll();
  };

  return (
    <div>
      <h2>Perfil e Recursos do Casal</h2>
      <ImportFile />
      <LogoutButton />

      <section>
        <h3>Casal</h3>
        <p>Membros: {coupleInfo.members.map((m) => m.name).join(", ") || "Sem casal no momento"}</p>
        <label>
          <input type="checkbox" checked={livingTogether} onChange={onToggleLiving} />
          Morar junto (gastos compartilhados)
        </label>
      </section>

      <section>
        <h3>Listas Compartilhadas</h3>
        <form onSubmit={createList}>
          <select value={newListType} onChange={(e) => setNewListType(e.target.value)}>
            <option value="shopping">Compras</option>
            <option value="wishlist">Desejos</option>
          </select>
          <input value={newListTitle} onChange={(e) => setNewListTitle(e.target.value)} placeholder="Nome da lista" />
          <button type="submit">Criar lista</button>
        </form>
        <ul>
          {lists.map((l) => (
            <li key={l.id}>{l.title} ({l.type})</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>To-Do</h3>
        <form onSubmit={createTodo}>
          <input value={todoTitle} onChange={(e) => setTodoTitle(e.target.value)} placeholder="Nova tarefa" />
          <button type="submit">Adicionar</button>
        </form>
        <p>Minhas tarefas:</p>
        <ul>{myTodos.map((t) => <li key={t.id}>{t.title} - {t.status}</li>)}</ul>
        <p>Tarefas da cônjuge:</p>
        <ul>{spouseTodos.map((t) => <li key={t.id}>{t.title} - {t.status}</li>)}</ul>
      </section>
    </div>
  );
}

export default Profile;