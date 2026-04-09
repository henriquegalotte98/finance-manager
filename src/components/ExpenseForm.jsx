import React from 'react';
import { useExpenseStore } from '../store/expenseStore';

const ExpenseForm = () => {
  const {
    service,
    price,
    dueDate,
    paymentMethod,
    numberTimes,
    recurrence,
    editId,
    loading,
    setField,
    addExpense,
    cancelEdit
  } = useExpenseStore();

  const showInstallments = paymentMethod === 'credit_card';
  const showRecurrence = paymentMethod !== 'credit_card';

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense();
  };

  const getInstallmentPrice = () => {
    const priceValue = parseFloat(price.toString().replace(',', '.'));
    if (isNaN(priceValue)) return 0;
    return (priceValue / numberTimes).toFixed(2);
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h3>{editId ? 'Editar Despesa' : 'Nova Despesa'}</h3>
      
      <div className="form-group">
        <label>Serviço/Despesa *</label>
        <input
          type="text"
          placeholder="Ex: Netflix, Spotify, Aluguel..."
          value={service}
          onChange={(e) => setField("service", e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Valor (R$) *</label>
        <input
          type="number"
          step="0.01"
          placeholder="0,00"
          value={price}
          onChange={(e) => setField("price", e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Data de Vencimento *</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setField("dueDate", e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Método de Pagamento</label>
        <select
          value={paymentMethod}
          onChange={(e) => {
            setField("paymentMethod", e.target.value);
            if (e.target.value !== 'credit_card') {
              setField("numberTimes", 1);
            }
          }}
        >
          <option value="credit_card">💳 Cartão de Crédito</option>
          <option value="debit_card">💳 Cartão de Débito</option>
          <option value="bank_transfer">🏦 Transferência Bancária</option>
          <option value="pix">📱 PIX</option>
          <option value="cash">💰 Dinheiro</option>
        </select>
      </div>

      {/* Parcelamento - Apenas para cartão de crédito */}
      {showInstallments && (
        <div className="form-group installment-section">
          <label>Parcelamento</label>
          <select
            value={numberTimes}
            onChange={(e) => setField("numberTimes", parseInt(e.target.value))}
          >
            <option value="1">À vista (1x)</option>
            <option value="2">2x sem juros</option>
            <option value="3">3x sem juros</option>
            <option value="4">4x sem juros</option>
            <option value="5">5x sem juros</option>
            <option value="6">6x sem juros</option>
            <option value="7">7x sem juros</option>
            <option value="8">8x sem juros</option>
            <option value="9">9x sem juros</option>
            <option value="10">10x sem juros</option>
            <option value="11">11x sem juros</option>
            <option value="12">12x sem juros</option>
          </select>
          
          {numberTimes > 1 && (
            <div className="info-box">
              💳 <strong>{numberTimes}x de R$ {getInstallmentPrice()}</strong>
              <br />
              <small>Total: R$ {parseFloat(price).toFixed(2) || '0,00'}</small>
            </div>
          )}
        </div>
      )}

      {/* Recorrência - Para outros métodos de pagamento */}
      {showRecurrence && (
        <div className="form-group recurrence-section">
          <label>Recorrência (Assinatura)</label>
          <select
            value={recurrence}
            onChange={(e) => setField("recurrence", e.target.value)}
          >
            <option value="none">Sem recorrência (despesa única)</option>
            <option value="weekly">🔄 Semanal - repete toda semana</option>
            <option value="monthly">🔄 Mensal - repete todo mês</option>
            <option value="yearly">🔄 Anual - repete todo ano</option>
          </select>
          
          {recurrence !== 'none' && (
            <div className="info-box">
              🔄 Esta despesa se repetirá 
              <strong>
                {recurrence === 'weekly' && ' toda semana'}
                {recurrence === 'monthly' && ' todo mês'}
                {recurrence === 'yearly' && ' todo ano'}
              </strong>
              <br />
              <small>Serão criadas 12 ocorrências futuras</small>
            </div>
          )}
        </div>
      )}

      <div className="form-actions">
        {editId && (
          <button type="button" onClick={cancelEdit} className="cancel-btn">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Salvando...' : (editId ? 'Atualizar' : 'Adicionar')}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;