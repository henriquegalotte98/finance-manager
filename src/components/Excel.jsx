import { useEffect } from "react"
import { useExpenseStore } from "../store/expenseStore"
import "./Excel.css";

function Excel({ activeApp }) {

  const API_URL = import.meta.env.VITE_API_URL

  const {
    service,
    price,
    dueDate,
    paymentMethod,
    numberTimes,
    recurrence,
    editId,
    loading,
    expenses,
    selectedMonth,
    selectedYear,
    setField,
    resetForm,
    loadMonth,
    addExpense,
    removeExpense,
    startEdit
  } = useExpenseStore()

  useEffect(() => {
    if (!API_URL || !selectedMonth || !selectedYear) return;

    loadMonth(API_URL);
  }, [selectedMonth, selectedYear, API_URL]);
  const formatCurrency = (value) =>
    Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })
  return (
    <div id="excel" className="excel">


      <div className="month_filter">
        <h3>Filtrar por Mês</h3>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

          <select
            className="eco-input"
            value={selectedMonth}
            onChange={(e) => setField("selectedMonth", parseInt(e.target.value))}
          >
            {[...Array(12)].map((_, i) => {
              const monthDate = new Date(selectedYear, i, 1)
              const monthName = monthDate.toLocaleDateString("pt-BR", { month: "long" })
              return (
                <option key={i + 1} value={i + 1}>
                  {monthName}
                </option>
              )
            })}
          </select>

          <select
            className="eco-input"

            value={selectedYear}
            onChange={(e) => setField("selectedYear", parseInt(e.target.value))}
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - 2 + i
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            })}
          </select>

        </div>
      </div>

      <div className="expenses_panel">

        <input
          className="eco-input"

          type="text"
          placeholder="Conta ou serviço"
          value={service}
          onChange={(e) => setField("service", e.target.value)}
        />

        <input
          className="eco-input"

          type="number"
          placeholder="Preço"
          value={price}
          onChange={(e) => setField("price", e.target.value)}
        />

        <input
          className="eco-input"

          type="date"
          value={dueDate}
          onChange={(e) => setField("dueDate", e.target.value)}
        />

        <select
          className="eco-input"

          value={paymentMethod}
          onChange={(e) => setField("paymentMethod", e.target.value)}
        >
          <option value="credit_card">Cartão de Crédito</option>
          <option value="debit_card">Cartão de Débito</option>
          <option value="bank_transfer">Transferência Bancária</option>
          <option value="cash">Dinheiro</option>
          <option value="credit_store">Crediário</option>
        </select>

        {(paymentMethod === "credit_card" || paymentMethod === "credit_store") && (
          <select
            className="eco-input"

            value={numberTimes}
            onChange={(e) => setField("numberTimes", parseInt(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}x
              </option>
            ))}
          </select>
        )}

        <select
          className="eco-input"

          value={recurrence}
          onChange={(e) => setField("recurrence", e.target.value)}
        >
          <option value="none">Sem recorrência</option>
          <option value="monthly">Mensal</option>
          <option value="weekly">Semanal</option>
          <option value="yearly">Anual</option>
        </select>

        <button
          onClick={() => addExpense(API_URL)}
          className="eco-btn eco-btn-primary"
          disabled={loading}
        >
          {loading ? "Salvando..." : editId ? "Salvar edição" : "Adicionar"}
        </button>

        <button className="eco-btn eco-btn-danger" onClick={resetForm}>
          Cancelar
        </button>

      </div>

      <h3>📊 Lista de gastos</h3>
      <div className="expenses_wrapper">
        <table className="expenses_table">
          <thead>
            <tr className="expenses_body">
              <th className="th_first">Serviço</th>
              <th>Valor da Parcela</th>
              <th>Forma de Pagamento</th>
              <th>Vencimento</th>
              <th className="th_last">Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr >
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  ⏳ Carregando despesas...
                </td>
              </tr>
            ) : !expenses || expenses.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  Nenhum gasto neste mês
                </td>
              </tr>
            ) : (
              (expenses || []).map((exp) => (
                <tr className="expenses_body line_bottom" key={exp.id}>
                  <td className="label_service">{exp.service} <div className="eco-tag-installments eco-tag-shared-installments">{exp.installment_number} de {exp.numbertimes}</div> </td>
                  <td>{formatCurrency(exp.amount)}</td>
                  <td>{exp.paymentmethod}</td>

                  <td>{new Date(exp.duedate).toLocaleDateString("pt-BR")}</td>
                  <td>
                    <button onClick={() => startEdit(exp)}>✏️</button>
                    <button onClick={() => removeExpense(API_URL, exp.expense_id)}>❌</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  )
}

export default Excel