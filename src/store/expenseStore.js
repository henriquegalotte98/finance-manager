import { create } from "zustand"
import api from "../services/api"

export const useExpenseStore = create((set, get) => ({

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

  setField: (field, value) => set({ [field]: value }),

  resetForm: () => set({
    service: "",
    price: "",
    dueDate: "",
    paymentMethod: "credit_card",
    numberTimes: 1,
    recurrence: "none",
    editId: null
  }),

  loadMonth: async (API_URL) => {
    const { selectedMonth, selectedYear } = get()

    set({ loading: true })

    try {
      const res = await api.get(`${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`)
      set({ expenses: Array.isArray(res.data) ? res.data : [] })
    } catch (err) {
      console.error("Erro ao carregar mês:", err)
    }

    set({ loading: false })
  },

  addExpense: async (API_URL) => {

    const state = get()

    // ✅ VALIDAÇÃO
    if (!state.service || !state.price || !state.dueDate) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    const parsedPrice = parseFloat(state.price)

    if (isNaN(parsedPrice)) {
      alert("Preço inválido")
      return
    }

    const payload = {
      service: state.service,
      price: parsedPrice,
      dueDate: state.dueDate,
      paymentMethod: state.paymentMethod,
      numberTimes: state.numberTimes,
      recurrence: state.recurrence
    }

    console.log("📤 Enviando payload:", payload)

    try {

      set({ loading: true })

      if (state.editId) {
        await api.put(`${API_URL}/expenses/${state.editId}`, payload)
      } else {
        await api.post(`${API_URL}/expenses`, payload)
      }

      // ✅ AJUSTA O MÊS AUTOMATICAMENTE
      const date = new Date(state.dueDate)

      set({
        selectedMonth: date.getMonth() + 1,
        selectedYear: date.getFullYear()
      })

      // ✅ RECARREGA LISTA
      await get().loadMonth(API_URL)

      // ✅ LIMPA FORM
      get().resetForm()

    } catch (err) {
      console.error("Erro ao salvar despesa:", err)
      alert("Erro ao salvar despesa")
    }

    set({ loading: false })
  },

  removeExpense: async (API_URL, id) => {
    try {
      await api.delete(`${API_URL}/expenses/${id}`)
      await get().loadMonth(API_URL)
    } catch (err) {
      console.error("Erro ao remover:", err)
    }
  },

  startEdit: (exp) => set({
    service: exp.service,
    price: exp.amount?.toString() || "0",
    dueDate: new Date(exp.duedate).toISOString().split("T")[0],
    paymentMethod: exp.paymentmethod,
    numberTimes: exp.numbertimes,
    recurrence: exp.recurrence || "none",
    editId: exp.expense_id
  })

}))