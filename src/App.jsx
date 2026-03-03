import './App.css'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { LogoIcon, HomeIcon, PlanilhaIcon, EconomiasIcon, DolarIcon, ViagensIcon, ConfigIcon } from './components/icons/Icons.jsx'

function App() {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [numberTimes, setNumberTimes] = useState('1');
  const [service, setService] = useState('');
  const [price, setPrice] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null); // agora guardamos o id do banco

  // Estados para filtro de mês
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_URL = import.meta.env.VITE_API_URL;

  // controlar qual app está aberto usando state em vez de manipular o DOM
  const [activeApp, setActiveApp] = useState('home');

  const showApp = (appName) => {
    setActiveApp(appName);
  };


  // Buscar gastos do mês ao carregar ou mudar mês
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

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  }

  const addExpense = () => {
    const newExpense = { service, price, dueDate, paymentMethod, numberTimes };

    if (editId !== null) {
      // Atualizar gasto existente
      axios.put(`${API_URL}/expenses/${editId}`, newExpense)
        .then(res => {
          // Recarregar despesas do mês
          axios.get(`${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`)
            .then(res => {
              if (Array.isArray(res.data)) {
                setExpenses(res.data);
              }
              resetForm();
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    } else {
      // Adicionar novo gasto
      axios.post(`${API_URL}/expenses`, newExpense)
        .then(res => {
          // Recarregar despesas do mês
          axios.get(`${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`)
            .then(res => {
              if (Array.isArray(res.data)) {
                setExpenses(res.data);
              }
              resetForm();
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    }
  };

  const removeExpense = (id) => {
    axios.delete(`${API_URL}/expenses/${id}`)
      .then(() => {
        // Recarregar despesas do mês
        axios.get(`${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`)
          .then(res => {
            if (Array.isArray(res.data)) {
              setExpenses(res.data);
            }
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  };

  const startEditExpense = (exp) => {
    setService(exp.service);
    setPrice(exp.price);
    setDueDate(exp.dueDate);
    setPaymentMethod(exp.paymentMethod);
    setNumberTimes(exp.numberTimes);
    setEditId(exp.id); // guardamos o id do banco
  };

  const resetForm = () => {
    setService('');
    setPrice('');
    setDueDate('');
    setPaymentMethod('credit_card');
    setNumberTimes('1');
    setEditId(null);
  };

  return (
    <div className='app_container'>
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

      <div className='app'>

        <div id="home" className='home' style={{ display: activeApp === 'home' ? 'block' : 'none' }}>
          <h1>Bem-vindo ao seu app de finanças pessoais!</h1>
          <p>Use a barra lateral para navegar entre os aplicativos.</p>
        </div>

        <div id="excel" className='excel' style={{ display: activeApp === 'excel' ? 'block' : 'none' }}>
          <div className='excel_header'>
            <search>
              <input type="text" placeholder='Pesquisar...' className='search_input' />
            </search>
            <button type="submit">Pesquisar</button>
          </div>

          {/* Filtro de Mês */}
          <div className='month_filter' style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
            <h3>Filtrar por Mês</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                style={{ padding: '8px', borderRadius: '4px' }}
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
                style={{ padding: '8px', borderRadius: '4px' }}
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          <div>
            <div>
              <input
                type="text"
                placeholder='Conta ou serviço'
                value={service}
                onChange={(e) => setService(e.target.value)}
              />
              <input
                type="number"
                placeholder='Preço'
                style={{ width: '100px' }}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <input
                type="date"
                placeholder='Data do vencimento'
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <select
                name="payment_method"
                id="payment_method"
                className='payment_method'
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="bank_transfer">Transferência Bancária</option>
                <option value="cash">Dinheiro</option>
                <option value="credit_store">Crediário</option>
              </select>

              {(paymentMethod === 'credit_card' || paymentMethod === 'credit_store') && (
                <select
                  name="number_times"
                  id="number_times"
                  className='number_times'
                  value={numberTimes}
                  onChange={(e) => setNumberTimes(e.target.value)}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}x</option>
                  ))}
                </select>
              )}

              <button className='btn_add' onClick={addExpense}>
                {editId !== null ? "Salvar edição" : "Adicionar"}
              </button>
              <button className='btn_remove' onClick={resetForm}>Cancelar</button>
            </div>

            <h3>📊 Lista de gastos</h3>
            <table className="expenses_table">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Preço</th>
                  <th>Forma de Pagamento</th>
                  <th>Parcelas</th>
                  <th>Vencimento</th>
                  <th>Registrado em</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => {
                  // Mostrar apenas parcelas principais (parent_id === null)
                  if (exp.parent_id) return null;
                  
                  return (
                    <tr key={exp.id}>
                      <td>{exp.service}</td>
                      <td>R${exp.price}</td>
                      <td>{exp.paymentMethod}</td>
                      <td>{exp.installment_number || 1} de {exp.numberTimes}</td>
                      <td>{exp.dueDate}</td>
                      <td>{exp.created_at || "-"}</td>
                      <td>
                        <button onClick={() => startEditExpense(exp)} title="Editar">✏️</button>
                        <button onClick={() => removeExpense(exp.id)} title="Remover">❌</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

          </div>
        </div>



        <div id="economias" className='economias' style={{ display: activeApp === 'economias' ? 'block' : 'none' }}>
          <h2>App de Economias</h2>
        </div>

        <div id="dolar" className='dolar' style={{ display: activeApp === 'dolar' ? 'block' : 'none' }}>
          <h2>App de Dólar</h2>
        </div>

        <div id="viagens" className='viagens' style={{ display: activeApp === 'viagens' ? 'block' : 'none' }}>
          <h2>App de Viagens</h2>
        </div>





      </div>
    </div>
  )
}

export default App