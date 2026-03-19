import { create } from "zustand"
import axios from "axios"

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
      const res = await axios.get(`${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`)
      set({ expenses: Array.isArray(res.data) ? res.data : [] })
    } catch (err) {
      console.error(err)
    }

    set({ loading: false })
  },

  addExpense: async (API_URL) => {

    const state = get()

    const payload = {
      service: state.service,
      price: parseFloat(state.price),
      dueDate: state.dueDate,
      paymentMethod: state.paymentMethod,
      numberTimes: state.numberTimes,
      recurrence: state.recurrence
    }

    try {

      if (state.editId) {
        await axios.put(`${API_URL}/expenses/${state.editId}`, payload)
      } else {
        await axios.post(`${API_URL}/expenses`, payload)
      }

      await get().loadMonth(API_URL)
      get().resetForm()

    } catch (err) {
      console.error(err)
    }
  },

  removeExpense: async (API_URL, id) => {
    try {
      await axios.delete(`${API_URL}/expenses/${id}`)
      await get().loadMonth(API_URL)
    } catch (err) {
      console.error(err)
    }
  },

  startEdit: (exp) => set({
    service: exp.service,
    price: exp.amount.toString(),
    dueDate: new Date(exp.duedate).toISOString().split("T")[0],
    paymentMethod: exp.paymentmethod,
    numberTimes: exp.numbertimes,
    recurrence: exp.recurrence || "none",
    editId: exp.expense_id
  })

}))