import { create } from "zustand";
import api from "../services/api";

export const useExpenseStore = create((set, get) => ({
  // ================= STATE =================
  service: "",
  price: "",
  dueDate: "",
  paymentMethod: "credit_card",
  numberTimes: 1,
  recurrence: "none",
  editId: null,

  loading: false,

  // 🔥 CORREÇÃO CRÍTICA
  expenses: [],

  // 🔥 CORREÇÃO CRÍTICA
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),

  // ================= ACTIONS =================

  // 🔥 ESSENCIAL (corrige erro Q is not a function)
  setField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value
    })),

  resetForm: () =>
    set({
      service: "",
      price: "",
      dueDate: "",
      paymentMethod: "credit_card",
      numberTimes: 1,
      recurrence: "none",
      editId: null
    }),

  // ================= ADD / EDIT =================
  addExpense: async (API_URL) => {
    const {
      service,
      price,
      dueDate,
      paymentMethod,
      numberTimes,
      recurrence,
      editId
    } = get();

    set({ loading: true });

    try {
      const expenseData = {
        service,
        price: parseFloat(price),
        paymentMethod,
        numberTimes: parseInt(numberTimes) || 1,
        dueDate,
        recurrence: recurrence || "none"
      };

      let url = `${API_URL}/expenses`;
      let method = "POST";

      if (editId) {
        url = `${API_URL}/expenses/${editId}`;
        method = "PUT";
      }

      console.log("ENVIANDO:", {
        service,
        price,
        paymentMethod,
        numberTimes,
        dueDate,
        recurrence
      });

      if (!service || !price || !dueDate) {
        alert("Preencha todos os campos obrigatórios");
        return;
      }

      if (isNaN(parseFloat(price))) {
        alert("Preço inválido");
        return;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("ERRO BACKEND:", errorText);
        throw new Error(errorText);
      }
      console.log("SALVO COM SUCESSO");
      get().resetForm();

      await get().loadMonth(API_URL);

    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      alert("Erro ao salvar despesa: " + error.message);
    } finally {
      set({ loading: false });
    }
  },

  // ================= LOAD MONTH =================
  loadMonth: async (API_URL) => {
    const { selectedYear, selectedMonth } = get();
    console.log("LOAD MONTH RESPONSE:", data);
    // 🔥 BLOQUEIA chamada inválida
    if (!API_URL || !selectedYear || !selectedMonth) return;

    set({ loading: true });

    try {
      const response = await fetch(
        `${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar despesas");
      }

      const data = await response.json();

      // 🔥 CORREÇÃO CRÍTICA (antes estava errado)
      set({ expenses: Array.isArray(data) ? data : [] });

    } catch (error) {
      console.error("Erro ao carregar mês:", error);

      set({ expenses: [] });
    } finally {
      set({ loading: false });
    }
  },

  // ================= DELETE =================
  removeExpense: async (API_URL, expenseId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta despesa e todas as suas parcelas?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar despesa");
      }

      await get().loadMonth(API_URL);

    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar despesa: " + error.message);
    }
  }
}));