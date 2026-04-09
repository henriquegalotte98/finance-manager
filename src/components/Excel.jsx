import React, { useEffect } from 'react';
import { useExpenseStore } from '../store/expenseStore.js';
import ExpenseForm from './ExpenseForm';
import MonthNavigator from './MonthNavigator';

const Excel = () => {
  const { 
    expenses, 
    startEdit, 
    removeExpense, 
    selectedMonth, 
    selectedYear,
    loadMonth,
    loading
  } = useExpenseStore();

  // Carregar despesas quando o componente montar
  useEffect(() => {
    console.log("📅 Carregando despesas iniciais...");
    loadMonth();
  }, []); // Array vazio = executa apenas uma vez ao montar

  // Recarregar quando mudar o mês/ano (já é feito pelo setMonth, mas garantia extra)
  useEffect(() => {
    loadMonth();
  }, [selectedMonth, selectedYear]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getMonthName = (month) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const calculateTotal = () => {
    return expenses.reduce((total, expense) => {
      const amount = parseFloat(expense.amount || expense.price || 0);
      return total + amount;
    }, 0);
  };

  const total = calculateTotal();

  if (loading && expenses.length === 0) {
    return (
      <div className="excel-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando despesas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="excel-container">
      {/* Cabeçalho com mês e total */}
      <div className="excel-header">
        <div className="month-title">
          <MonthNavigator />
          <p className="total-despesas">
            Total do mês: <strong>{formatPrice(total)}</strong>
          </p>
        </div>
      </div>

      {/* Formulário de adicionar/editar */}
      <ExpenseForm />

      {/* Tabela de despesas */}
      {!expenses || expenses.length === 0 ? (
        <div className="no-expenses">
          <p>📝 Nenhuma despesa encontrada para {getMonthName(selectedMonth)} {selectedYear}.</p>
          <p>Clique em "Adicionar Despesa" para começar!</p>
        </div>
      ) : (
        <div className="expenses-table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Parcela</th>
                <th>Valor</th>
                <th>Pagamento</th>
                <th>Vencimento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="service-cell">{expense.service}</td>
                  <td>
                    {expense.installment_number && expense.total_installments 
                      ? `${expense.installment_number} de ${expense.total_installments}`
                      : '1 de 1'}
                  </td>
                  <td className="price-cell">{formatPrice(expense.amount || expense.price)}</td>
                  <td>
                    {expense.paymentMethod === 'credit_card' && '💳 Cartão Crédito'}
                    {expense.paymentMethod === 'debit_card' && '💳 Cartão Débito'}
                    {expense.paymentMethod === 'bank_transfer' && '🏦 Transferência'}
                    {expense.paymentMethod === 'cash' && '💰 Dinheiro'}
                    {expense.paymentMethod === 'pix' && '📱 PIX'}
                    {!expense.paymentMethod && '💳 Cartão Crédito'}
                  </td>
                  <td>{formatDate(expense.duedate || expense.dueDate)}</td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => startEdit(expense)}
                      className="edit-btn"
                      title="Editar despesa"
                      disabled={loading}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => removeExpense(expense.id)}
                      className="delete-btn"
                      title="Excluir despesa"
                      disabled={loading}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td colSpan="2" className="total-label">
                  <strong>TOTAL</strong>
                </td>
                <td className="total-value">
                  <strong>{formatPrice(total)}</strong>
                </td>
                <td colSpan="3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};

export default Excel;