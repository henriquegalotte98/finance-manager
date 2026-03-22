import { h1 } from "framer-motion/client";


function ListaTarefa() {
    const [coupleInfo, setCoupleInfo] = useState({ couple: null, members: [] });
    const [livingTogether, setLivingTogether] = useState(false);
    const [lists, setLists] = useState([]);
    const [newListTitle, setNewListTitle] = useState("");
    const [newListType, setNewListType] = useState("shopping");
    const [activeListId, setActiveListId] = useState(null);
    const [listItems, setListItems] = useState([]);
    const [newItem, setNewItem] = useState({ title: "", quantity: 1, target_price: "", external_link: "" });
    const [editingItemId, setEditingItemId] = useState(null);
    const [myTodos, setMyTodos] = useState([]);
    const [spouseTodos, setSpouseTodos] = useState([]);
    const [todoDraft, setTodoDraft] = useState({ title: "", details: "", due_date: "" });
    const [editingTodoId, setEditingTodoId] = useState(null);
    const [todoTab, setTodoTab] = useState("mine");
    const [feedback, setFeedback] = useState("");

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
        try {
            await api.post("/features/lists", { title: newListTitle, type: newListType });
            setNewListTitle("");
            setFeedback("Lista criada com sucesso.");
            await loadAll();
        } catch (err) {
            setFeedback(err?.response?.data?.error || "Não foi possível criar a lista.");
        }
    };

    const loadItems = async (listId) => {
        const res = await api.get(`/features/lists/${listId}/items`);
        setListItems(res.data || []);
    };

    const selectList = async (listId) => {
        setActiveListId(listId);
        await loadItems(listId);
    };

    const createOrUpdateItem = async (e) => {
        e.preventDefault();
        if (!activeListId || !newItem.title) return;
        if (editingItemId) {
            await api.put(`/features/lists/items/${editingItemId}`, {
                title: newItem.title,
                quantity: Number(newItem.quantity || 1),
                target_price: newItem.target_price ? Number(newItem.target_price) : null,
                external_link: newItem.external_link || null
            });
        } else {
            await api.post(`/features/lists/${activeListId}/items`, {
                title: newItem.title,
                quantity: Number(newItem.quantity || 1),
                target_price: newItem.target_price ? Number(newItem.target_price) : null,
                external_link: newItem.external_link || null
            });
        }
        setEditingItemId(null);
        setNewItem({ title: "", quantity: 1, target_price: "", external_link: "" });
        await loadItems(activeListId);
    };

    const editItem = (item) => {
        setEditingItemId(item.id);
        setNewItem({
            title: item.title || "",
            quantity: item.quantity || 1,
            target_price: item.target_price || "",
            external_link: item.external_link || ""
        });
    };

    const setItemStatus = async (itemId, status) => {
        await api.patch(`/features/lists/items/${itemId}/status`, { status });
        await loadItems(activeListId);
    };

    const deleteItem = async (itemId) => {
        await api.delete(`/features/lists/items/${itemId}`);
        await loadItems(activeListId);
    };

    const finalizeList = async (listId) => {
        await api.patch(`/features/lists/${listId}`, { status: "finished" });
        await loadAll();
    };

    const createTodo = async (e) => {
        e.preventDefault();
        if (!todoDraft.title) return;
        if (editingTodoId) {
            await api.patch(`/features/todos/${editingTodoId}`, todoDraft);
        } else {
            await api.post("/features/todos", todoDraft);
        }
        setTodoDraft({ title: "", details: "", due_date: "" });
        setEditingTodoId(null);
        setFeedback("Tarefa salva.");
        await loadAll();
    };

    const editTodo = (todo) => {
        setEditingTodoId(todo.id);
        setTodoDraft({
            title: todo.title || "",
            details: todo.details || "",
            due_date: todo.due_date ? String(todo.due_date).slice(0, 10) : ""
        });
    };

    const updateTodoStatus = async (todo, done) => {
        await api.patch(`/features/todos/${todo.id}`, { status: done ? "done" : "todo" });
        await loadAll();
    };

    const deleteTodo = async (todoId) => {
        await api.delete(`/features/todos/${todoId}`);
        await loadAll();
    };


    return (
        <div>
            <h1>Teste</h1>


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
                        <li key={l.id}>
                            <button type="button" onClick={() => selectList(l.id)}>{l.title}</button> ({l.type}) [{l.status}]
                            {l.status !== "finished" && (
                                <button type="button" onClick={() => finalizeList(l.id)} style={{ marginLeft: 8 }}>
                                    Finalizar lista
                                </button>
                            )}
                        </li>
                    ))}
                </ul>

                {activeListId && (
                    <div>
                        <h4>Itens da lista</h4>
                        <form onSubmit={createOrUpdateItem}>
                            <input
                                value={newItem.title}
                                onChange={(e) => setNewItem((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="Produto"
                            />
                            <input
                                type="number"
                                value={newItem.quantity}
                                onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: e.target.value }))}
                                placeholder="Qtd"
                            />
                            <input
                                type="number"
                                step="0.01"
                                value={newItem.target_price}
                                onChange={(e) => setNewItem((prev) => ({ ...prev, target_price: e.target.value }))}
                                placeholder="Preco"
                            />
                            <input
                                value={newItem.external_link}
                                onChange={(e) => setNewItem((prev) => ({ ...prev, external_link: e.target.value }))}
                                placeholder="Link do produto"
                            />
                            <button type="submit">{editingItemId ? "Salvar edição" : "Adicionar item"}</button>
                        </form>

                        <ul>
                            {listItems.map((item) => (
                                <li key={item.id}>
                                    {item.quantity}un - {item.title} - {item.status}
                                    {item.target_price ? ` - R$ ${Number(item.target_price).toFixed(2)}` : ""}
                                    {item.external_link ? <a href={item.external_link} target="_blank" rel="noreferrer"> link </a> : null}
                                    <button type="button" onClick={() => editItem(item)}>Editar</button>
                                    <button type="button" onClick={() => deleteItem(item.id)}>Excluir</button>
                                    <button type="button" onClick={() => setItemStatus(item.id, "in_cart")}>No carrinho</button>
                                    <button type="button" onClick={() => setItemStatus(item.id, "bought")}>Comprado</button>
                                    <button type="button" onClick={() => setItemStatus(item.id, "pending")}>Pendente</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            <section>
                <h3>To-Do</h3>
                <div>
                    <button type="button" onClick={() => setTodoTab("mine")}>Minhas tarefas</button>
                    <button type="button" onClick={() => setTodoTab("spouse")}>Tarefas da cônjuge</button>
                </div>
                <form onSubmit={createTodo}>
                    <input
                        value={todoDraft.title}
                        onChange={(e) => setTodoDraft((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Nova tarefa"
                    />
                    <input
                        value={todoDraft.details}
                        onChange={(e) => setTodoDraft((prev) => ({ ...prev, details: e.target.value }))}
                        placeholder="Detalhes"
                    />
                    <input
                        type="date"
                        value={todoDraft.due_date}
                        onChange={(e) => setTodoDraft((prev) => ({ ...prev, due_date: e.target.value }))}
                    />
                    <button type="submit">{editingTodoId ? "Salvar edição" : "Adicionar"}</button>
                </form>
                {todoTab === "mine" ? (
                    <>
                        <p>Minhas tarefas:</p>
                        <ul>
                            {myTodos.map((t) => (
                                <li key={t.id}>
                                    {t.title} - {t.status}
                                    <button type="button" onClick={() => editTodo(t)}>Editar</button>
                                    <button type="button" onClick={() => deleteTodo(t.id)}>Excluir</button>
                                    <button type="button" onClick={() => updateTodoStatus(t, true)}>Marcar feito</button>
                                    <button type="button" onClick={() => updateTodoStatus(t, false)}>Marcar não feito</button>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <>
                        <p>Tarefas da cônjuge:</p>
                        <ul>{spouseTodos.map((t) => <li key={t.id}>{t.title} - {t.status}</li>)}</ul>
                    </>
                )}
            </section>
        </div >

    );
}