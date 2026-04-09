import React from 'react';
import { useExpenseStore } from '../store/expenseStore';

const MonthNavigator = () => {
  // Pegar as funções e estados do store
  const selectedYear = useExpenseStore((state) => state.selectedYear);
  const selectedMonth = useExpenseStore((state) => state.selectedMonth);
  const setMonth = useExpenseStore((state) => state.setMonth);
  const loading = useExpenseStore((state) => state.loading);

  console.log("MonthNavigator renderizado - Mês atual:", selectedMonth, selectedYear);

  const goToPreviousMonth = () => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear = selectedYear - 1;
    }
    
    console.log(`◀️ Botão clicado - Indo para: ${newMonth}/${newYear}`);
    setMonth(newYear, newMonth);
  };

  const goToNextMonth = () => {
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear = selectedYear + 1;
    }
    
    console.log(`▶️ Botão clicado - Indo para: ${newMonth}/${newYear}`);
    setMonth(newYear, newMonth);
  };

  const getMonthName = (month) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  return (
    <div className="month-navigator">
      <button 
        onClick={goToPreviousMonth} 
        className="nav-btn"
        disabled={loading}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        ◀
      </button>
      <div className="current-month">
        {getMonthName(selectedMonth)} {selectedYear}
      </div>
      <button 
        onClick={goToNextMonth} 
        className="nav-btn"
        disabled={loading}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        ▶
      </button>
    </div>
  );
};

export default MonthNavigator;