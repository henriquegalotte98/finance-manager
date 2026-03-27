import { create } from "zustand"
import api from "../services/api"

export const useExpenseStore = create((set, get) => ({
  // ... outros estados

  addExpense: async (API_URL) => {
    const {
      service,
      price,
      dueDate,
      paymentMethod,
      numberTimes,
      recurrence,
      editId,
      resetForm,
      loadMonth,
      selectedMonth,
      selectedYear
    } = get();

    set({ loading: true });

    try {
      const expenseData = {
        service,
        price: parseFloat(price),
        paymentMethod,
        numberTimes: parseInt(numberTimes),
        dueDate,
        recurrence: recurrence || "none"
      };

      let url = `${API_URL}/expenses`;
      let method = "POST";

      if (editId) {
        url = `${API_URL}/expenses/${editId}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar despesa");
      }

      // Resetar o formulário
      resetForm();

      // Recarregar as despesas do mês atual
      await get().loadMonth(API_URL);

    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      alert("Erro ao salvar despesa: " + error.message);
    } finally {
      set({ loading: false });
    }
  },

  loadMonth: async (API_URL) => {
    const { selectedYear, selectedMonth } = get();

    set({ loading: true });

    try {
      const response = await fetch(
        `${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar despesas");
      }

      const data = await response.json();
      set({ expenses: Array.isArray(response.data) ? response.data : [] });

    } catch (error) {
      console.error("Erro ao carregar mês:", error);
      set({ expenses: [] });
    } finally {
      set({ loading: false });
    }
  },

  removeExpense: async (API_URL, expenseId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta despesa e todas as suas parcelas?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar despesa");
      }

      // Recarregar as despesas do mês atual
      await get().loadMonth(API_URL);

    } catch (error) {
      console.error("Erro ao deletar:", error);
      alert("Erro ao deletar despesa: " + error.message);
    }
  }
}));