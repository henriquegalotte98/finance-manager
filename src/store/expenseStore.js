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
  expenses: [],
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),

  // ================= ACTIONS =================

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

  startEdit: (expense) => {
    console.log("Editando despesa:", expense);

    let formattedDueDate = "";
    const rawDate = expense.duedate || expense.dueDate;
    if (rawDate) {
      formattedDueDate = rawDate.split('T')[0];
    }

    // Mapear paymentmethod do backend para paymentMethod do frontend
    let paymentMethodValue = expense.paymentmethod || expense.paymentMethod;

    // Garantir que o valor seja um dos aceitos pelo frontend
    const validPaymentMethods = ['credit_card', 'debit_card', 'bank_transfer', 'pix', 'cash'];
    if (!validPaymentMethods.includes(paymentMethodValue)) {
      paymentMethodValue = 'credit_card'; // valor padrão
    }

    set({
      service: expense.service || "",
      price: expense.amount ? expense.amount.toString() : expense.price?.toString() || "",
      dueDate: formattedDueDate,
      paymentMethod: paymentMethodValue, // Usar o valor correto
      numberTimes: expense.numberTimes || 1,
      recurrence: expense.recurrence || "none",
      editId: expense.id
    });

    console.log("Estado após startEdit:", {
      service: expense.service,
      price: expense.amount || expense.price,
      paymentMethod: paymentMethodValue,
      editId: expense.id
    });
  },

  cancelEdit: () => {
    console.log("Cancelando edicao");
    set({
      editId: null,
      service: "",
      price: "",
      dueDate: "",
      paymentMethod: "credit_card",
      numberTimes: 1,
      recurrence: "none"
    });
  },

  // Função para mudar o mês e recarregar
  // No expenseStore.js, adicione ou corrija esta função:

  setMonth: (year, month) => {
    console.log(`📅 Mudando para ${month}/${year}`);
    set({ selectedYear: year, selectedMonth: month });
    // Recarrega automaticamente as despesas do novo mês
    get().loadMonth();
  },

  addExpense: async () => {
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
      if (!service || !price || !dueDate) {
        alert("Preencha todos os campos obrigatorios");
        set({ loading: false });
        return;
      }

      const originalPrice = parseFloat(price.toString().replace(',', '.'));

      if (isNaN(originalPrice)) {
        alert("Preco invalido");
        set({ loading: false });
        return;
      }

      console.log("=== DADOS ANTES DE ENVIAR ===");
      console.log("Servico:", service);
      console.log("Preco original:", originalPrice);
      console.log("Metodo pagamento:", paymentMethod);
      console.log("Numero de vezes:", numberTimes);
      console.log("Recorrencia:", recurrence);
      console.log("EditId:", editId);

      // CASO 1: EDITAR despesa existente
      if (editId) {
        await api.put(`/expenses/${editId}`, {
          service,
          price: originalPrice,
          paymentMethod,
          dueDate,
          recurrence: recurrence
        });
        alert("Despesa atualizada com sucesso!");

        // Recarregar a lista após editar
        await get().loadMonth();
        get().resetForm();
        set({ loading: false });
        return;
      }

      // CASO 2: PARCELAMENTO (Apenas para cartao de credito com mais de 1 parcela)
      else if (paymentMethod === 'credit_card' && numberTimes > 1) {
        const installmentValue = originalPrice / numberTimes;
        const startDate = new Date(dueDate);

        console.log(`💳 Parcelamento: ${numberTimes}x de R$ ${installmentValue.toFixed(2)}`);

        let successCount = 0;

        for (let i = 0; i < numberTimes; i++) {
          const currentDate = new Date(startDate);
          currentDate.setMonth(startDate.getMonth() + i);

          const formattedDate = currentDate.toISOString().split('T')[0];

          try {
            await api.post('/expenses', {
              service,
              price: installmentValue,
              paymentMethod: 'credit_card',
              dueDate: formattedDate,
              recurrence: 'none'
            });
            successCount++;
            console.log(`✅ Parcela ${i + 1}/${numberTimes} criada: ${formattedDate} - R$ ${installmentValue.toFixed(2)}`);
          } catch (error) {
            console.error(`❌ Erro na parcela ${i + 1}:`, error);
          }
        }

        alert(`${successCount} de ${numberTimes} parcelas criadas com sucesso!`);

        // Recarregar a lista após criar parcelas
        await get().loadMonth();
        get().resetForm();
        set({ loading: false });
        return;
      }

      // CASO 3: RECORRENCIA (Assinatura mensal, semanal ou anual)
      // CASO 3: RECORRENCIA (Assinatura mensal, semanal ou anual)
      else if (recurrence !== 'none') {
        const startDate = new Date(dueDate);
        const numberOfOccurrences = 12; // Criar para os próximos 12 meses

        let recurrenceText = "";
        let intervalFunction = null;

        if (recurrence === 'weekly') {
          recurrenceText = "semanal";
          intervalFunction = (date, i) => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() + (i * 7));
            return newDate;
          };
        } else if (recurrence === 'monthly') {
          recurrenceText = "mensal";
          intervalFunction = (date, i) => {
            const newDate = new Date(date);
            newDate.setMonth(date.getMonth() + i);
            return newDate;
          };
        } else if (recurrence === 'yearly') {
          recurrenceText = "anual";
          intervalFunction = (date, i) => {
            const newDate = new Date(date);
            newDate.setFullYear(date.getFullYear() + i);
            return newDate;
          };
        }

        console.log(`🔄 Recorrencia ${recurrenceText}: criando ${numberOfOccurrences} ocorrencias`);
        console.log(`💰 Valor por ocorrencia: R$ ${originalPrice.toFixed(2)}`); // Valor não dividido!

        let successCount = 0;

        for (let i = 0; i < numberOfOccurrences; i++) {
          const currentDate = intervalFunction(startDate, i);
          const formattedDate = currentDate.toISOString().split('T')[0];

          try {
            // Enviar o valor ORIGINAL, não dividido
            await api.post('/expenses', {
              service,
              price: originalPrice, // Valor original, não dividido!
              paymentMethod,
              dueDate: formattedDate,
              recurrence: recurrence,
              numberTimes: 1 // Cada ocorrência é individual
            });
            successCount++;
            console.log(`✅ Ocorrencia ${i + 1}: ${formattedDate} - R$ ${originalPrice.toFixed(2)}`);
          } catch (error) {
            console.error(`❌ Erro na ocorrencia ${i + 1}:`, error);
          }
        }

        alert(`${successCount} ocorrencias ${recurrenceText} criadas com sucesso!`);

        // Recarregar a lista após criar recorrências
        await get().loadMonth();
        get().resetForm();
        set({ loading: false });
        return;
      }

      // CASO 4: Despesa UNICA
      else {
        await api.post('/expenses', {
          service,
          price: originalPrice,
          paymentMethod,
          dueDate,
          recurrence: 'none'
        });
        alert("Despesa criada com sucesso!");

        // Recarregar a lista após criar
        await get().loadMonth();
        get().resetForm();
        set({ loading: false });
        return;
      }

    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      alert("Erro ao salvar despesa: " + (error.response?.data?.error || error.message));
      set({ loading: false });
    }
  },

  loadMonth: async () => {
    const { selectedYear, selectedMonth } = get();

    if (!selectedYear || !selectedMonth) {
      console.log("⚠️ Mês ou ano não selecionado");
      return;
    }

    console.log(`📥 Carregando despesas de ${selectedYear}/${selectedMonth}...`);
    set({ loading: true });

    try {
      const response = await api.get(`/expenses/month/${selectedYear}/${selectedMonth}`);
      const data = response.data;
      console.log(`✅ DADOS CARREGADOS: ${data.length} despesas encontradas`);
      set({ expenses: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("❌ Erro ao carregar mes:", error);
      set({ expenses: [] });
    } finally {
      set({ loading: false });
    }
  },

  removeExpense: async (expenseId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      return;
    }

    set({ loading: true });

    try {
      console.log("🗑️ Deletando despesa ID:", expenseId);
      await api.delete(`/expenses/${expenseId}`);
      alert("Despesa removida com sucesso!");
      await get().loadMonth();
    } catch (error) {
      console.error("❌ Erro ao deletar:", error);
      alert("Erro ao deletar despesa: " + (error.response?.data?.error || error.message));
    } finally {
      set({ loading: false });
    }
  }
}));