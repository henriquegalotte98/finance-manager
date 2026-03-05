import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogoIcon, HomeIcon, PlanilhaIcon, EconomiasIcon, DolarIcon, ViagensIcon, ConfigIcon } from './components/icons/Icons.jsx';

function App() {
  // ---------------- ESTADOS ---------------- //
  const [service, setService] = useState('');
  const [price, setPrice] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [numberTimes, setNumberTimes] = useState('1');
  const [editId, setEditId] = useState(null);

  const [expenses, setExpenses] = useState([]); // lista de parcelas do mês

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_URL = import.meta.env.VITE_API_URL;

  const [activeApp, setActiveApp] = useState('home'); // controle de navegação lateral

  const showApp = (appName) => setActiveApp(appName);

  // ---------------- FUNÇÕES ---------------- //

  // Buscar parcelas do mês
  useEffect(() => {
    axios.get(`${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setExpenses(res.data);
        } else {
          console.error("Resposta inesperada da API:", res.data);
          setExpenses([]);
        }
      })
      .catch(err => console.error(err));
  }, [API_URL, selectedMonth, selectedYear]);

  const handlePaymentMethodChange = (event) => setPaymentMethod(event.target.value);

  // Adicionar ou editar despesa
  const addExpense = () => {
    const newExpense = { service, price, dueDate, paymentMethod, numberTimes };

    if (editId !== null) {
      axios.put(`${API_URL}/expenses/${editId}`, newExpense)
        .then(() => reloadMonth())
        .catch(err => console.error(err));
    } else {
      axios.post(`${API_URL}/expenses`, newExpense)
        .then(() => reloadMonth())
        .catch(err => console.error(err));
    }
  };

  // Recarregar parcelas do mês
  const reloadMonth = () => {
    axios.get(`${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setExpenses(res.data);
        }
        resetForm();
      })
      .catch(err => console.error(err));
  };

  // Remover despesa
  const removeExpense = (id) => {
    axios.delete(`${API_URL}/expenses/${id}`)
      .then(() => reloadMonth())
      .catch(err => console.error(err));
  };

  // Preparar edição
  const startEditExpense = (exp) => {
    setService(exp.service);
    setPrice(exp.amount * exp.numberTimes); // valor total da compra
    setDueDate(exp.dueDate);
    setPaymentMethod(exp.paymentMethod);
    setNumberTimes(exp.numberTimes);
    setEditId(exp.expense_id); // id da compra principal
  };

  // Resetar formulário
  const resetForm = () => {
    setService('');
    setPrice('');
    setDueDate('');
    setPaymentMethod('credit_card');
    setNumberTimes('1');
    setEditId(null);
  };

  // ---------------- RENDERIZAÇÃO ---------------- //
  return (
    <div className='app_container'>
      {/* Menu lateral */}
      <div className='side_menu_container'>
        <div className='side_header'>
          <div className='logo' onClick={() => showApp('home')}>
            <li onClick={() => showApp('home')}>{LogoIcon}</li>
            <div className='app_name'>
              <p>Finanças</p>
            </div>
          </div>
          <div className='user_info'>
            <div>
              <img
                src="https://api.dicebear.com/9.x/avataaars/svg?seed=Kimberly"
                alt="avatar" className='user_avatar' />
              <p>Henrique</p>
            </div>
            <div className='div_btn_logout'>
              <button className='btn_logout'>Sair</button>
              <li>{ConfigIcon}</li>
            </div>
          </div>
        </div>
        <div className='side_menu'>
          <menu>
            <li onClick={() => showApp('home')} >{HomeIcon}</li>
            <li onClick={() => showApp('excel')}>{PlanilhaIcon}</li>
            <li onClick={() => showApp('economias')}>{EconomiasIcon}</li>
            <li onClick={() => showApp('dolar')}>{DolarIcon}</li>
            <li onClick={() => showApp('viagens')}>{ViagensIcon}</li>
          </menu>
          <div className='subtitle_icons'>
            <p onClick={() => showApp('home')}>Início</p>
            <p onClick={() => showApp('excel')}>Planilha</p>
            <p onClick={() => showApp('economias')}>Economias</p>
            <p onClick={() => showApp('dolar')}>Dólar</p>
            <p onClick={() => showApp('viagens')}>Viagens</p>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className='app'>

        {/* Tela Home */}
        <div id="home" className='home' style={{ display: activeApp === 'home' ? 'block' : 'none' }}>
          <h1>Bem-vindo ao seu app de finanças pessoais!</h1>
          <p>Use a barra lateral para navegar entre os aplicativos.</p>
        </div>

        {/* Tela Excel (Planilha de gastos) */}
        <div id="excel" className='excel' style={{ display: activeApp === 'excel' ? 'block' : 'none' }}>
          {/* Filtro de mês */}
          <div className='month_filter'>
            <h3>Filtrar por Mês</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {[...Array(12)].map((_, i) => {
                  const monthDate = new Date(selectedYear, i, 1);
                  const monthName = monthDate.toLocaleDateString('pt-BR', { month: 'long' });
                  return <option key={i + 1} value={i + 1}>{monthName}</option>;
                })}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          {/* Formulário de cadastro */}
          <div>
            <input type="text" placeholder='Conta ou serviço' value={service} onChange={(e) => setService(e.target.value)} />
            <input type="number" placeholder='Preço' value={price} onChange={(e) => setPrice(e.target.value)} />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

            <select value={paymentMethod} onChange={handlePaymentMethodChange}>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="debit_card">Cartão de Débito</option>
              <option value="bank_transfer">Transferência Bancária</option>
              <option value="cash">Dinheiro</option>
              <option value="credit_store">Crediário</option>
            </select>

            {(paymentMethod === 'credit_card' || paymentMethod === 'credit_store') && (
              <select value={numberTimes} onChange={(e) => setNumberTimes(e.target.value)}>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}x</option>
                ))}
              </select>
            )}

            <button onClick={addExpense}>{editId !== null ? "Salvar edição" : "Adicionar"}</button>
            <button onClick={resetForm}>Cancelar</button>
          </div>

          {/* Lista de gastos */}
          <h3>📊 Lista de gastos</h3>
          <table className="expenses_table">
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Valor da Parcela</th>
                <th>Forma de Pagamento</th>
                <th>Parcela</th>
                <th>Vencimento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.service}</td>
                  <td>R${exp.amount}</td>
                  <td>{exp.paymentmethod}</td>
                  <td>{exp.installment_number} de {exp.numbertimes}</td>
                  <td>{new Date(exp.duedate).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <button onClick={() => startEditExpense(exp)} title="Editar">✏️</button>
                    <button onClick={() => removeExpense(exp.expense_id)} title="Remover">❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tela Economias */}
        <div id="economias" className='economias' style={{ display: activeApp === 'economias' ? 'block' : 'none' }}>
          <h2>App de Economias</h2>
          <p>Aqui você poderá registrar suas economias futuras.</p>
        </div>

        {/* Tela Dólar */}
        <div id="dolar" className='dolar' style={{ display: activeApp === 'dolar' ? 'block' : 'none' }}>
          <h2>App de Dólar</h2>
          <p>Acompanhe a cotação do dólar e registre compras internacionais.</p>
        </div>

        {/* Tela Viagens */}
        <div id="viagens" className='viagens' style={{ display: activeApp === 'viagens' ? 'block' : 'none' }}>
          <h2>App de Viagens</h2>
          <p>Planeje suas viagens e registre os gastos relacionados.</p>
        </div>

      </div>
    </div>
  )
}

export default App;