import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogoIcon, HomeIcon, PlanilhaIcon, EconomiasIcon, DolarIcon, ViagensIcon, ConfigIcon } from './components/icons/Icons.jsx';

function App() {

  const [service, setService] = useState('');
  const [price, setPrice] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [numberTimes, setNumberTimes] = useState('1');
  const [recurrence, setRecurrence] = useState('none');
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_URL = import.meta.env.VITE_API_URL;

  const [activeApp, setActiveApp] = useState('home');
  const showApp = (appName) => setActiveApp(appName);


  useEffect(() => {
    reloadMonth();
  }, [selectedMonth, selectedYear]);


  const reloadMonth = () => {

    setLoading(true);

    axios.get(`${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`)
      .then(res => {

        if (Array.isArray(res.data)) {
          setExpenses(res.data);
        } else {
          setExpenses([]);
        }

      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

  };


  const addExpense = () => {

    const newExpense = {
      service,
      price: parseFloat(price),
      dueDate,
      paymentMethod,
      numberTimes: parseInt(numberTimes),
      recurrence
    };

    if (editId !== null) {

      axios.put(`${API_URL}/expenses/${editId}`, newExpense)
        .then(() => {
          reloadMonth();
          resetForm();
        })
        .catch(err => console.error(err));

    }

    else {

      axios.post(`${API_URL}/expenses`, newExpense)
        .then(() => {
          reloadMonth();
          resetForm();
        })
        .catch(err => console.error(err));

    }

  };


  const removeExpense = (id) => {

    axios.delete(`${API_URL}/expenses/${id}`)
      .then(() => reloadMonth())
      .catch(err => console.error(err));

  };


  const startEditExpense = (exp) => {

    setService(exp.service);

    setPrice(exp.amount.toString());

    const formattedDate = new Date(exp.duedate).toISOString().split('T')[0];
    setDueDate(formattedDate);

    setPaymentMethod(exp.paymentmethod);

    setNumberTimes(exp.numbertimes);

    setRecurrence(exp.recurrence || "none");

    setEditId(exp.expense_id);

  };


  const resetForm = () => {

    setService('');
    setPrice('');
    setDueDate('');
    setPaymentMethod('credit_card');
    setNumberTimes('1');
    setRecurrence('none');
    setEditId(null);

  };


  return (

    <div className='app_container'>

      {/* MENU LATERAL */}

      <div className='side_menu_container'>

        <div className='side_header'>

          <div className='logo' onClick={() => showApp('home')}>
            <li>{LogoIcon}</li>
            <div className='app_name'>
              <p>Finanças</p>
            </div>
          </div>

          <div className='user_info'>

            <div>
              <img
                src="https://api.dicebear.com/9.x/avataaars/svg?seed=Kimberly"
                alt="avatar"
                className='user_avatar'
              />
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
            <li onClick={() => showApp('home')}>{HomeIcon}</li>
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


      {/* APP */}

      <div className='app'>

        <div id="home" className='home' style={{ display: activeApp === 'home' ? 'block' : 'none' }}>
          <h1>Bem-vindo ao seu app de finanças pessoais!</h1>
          <p>Use a barra lateral para navegar entre os aplicativos.</p>
        </div>


        <div id="excel" className='excel' style={{ display: activeApp === 'excel' ? 'block' : 'none' }}>


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

                  return (
                    <option key={i + 1} value={i + 1}>
                      {monthName}
                    </option>
                  );

                })}

              </select>


              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >

                {[...Array(5)].map((_, i) => {

                  const year = new Date().getFullYear() - 2 + i;

                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );

                })}

              </select>

            </div>

          </div>


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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />


            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>

              <option value="credit_card">Cartão de Crédito</option>
              <option value="debit_card">Cartão de Débito</option>
              <option value="bank_transfer">Transferência Bancária</option>
              <option value="cash">Dinheiro</option>
              <option value="credit_store">Crediário</option>

            </select>


            {(paymentMethod === 'credit_card' || paymentMethod === 'credit_store') && (

              <select value={numberTimes} onChange={(e) => setNumberTimes(e.target.value)}>

                {[...Array(12)].map((_, i) => (

                  <option key={i + 1} value={i + 1}>
                    {i + 1}x
                  </option>

                ))}

              </select>

            )}


            <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>

              <option value="none">Sem recorrência</option>
              <option value="monthly">Mensal</option>
              <option value="weekly">Semanal</option>
              <option value="yearly">Anual</option>

            </select>


            <button onClick={addExpense}>
              {editId !== null ? "Salvar edição" : "Adicionar"}
            </button>

            <button onClick={resetForm}>
              Cancelar
            </button>

          </div>


          <h3>📊 Lista de gastos</h3>


          <table className="expenses_table">

            <thead>

              <tr>

                <th className='th_first'>Serviço</th>
                <th>Valor da Parcela</th>
                <th>Forma de Pagamento</th>
                <th>Parcela</th>
                <th>Vencimento</th>
                <th className='th_last'>Ações</th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    ⏳ Carregando despesas...
                  </td>
                </tr>

              ) : expenses.length === 0 ? (

                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    Nenhum gasto neste mês
                  </td>
                </tr>

              ) : (

                expenses.map((exp) => (

                  <tr key={exp.id}>

                    <td>{exp.service}</td>

                    <td>R$ {exp.amount}</td>

                    <td>{exp.paymentmethod}</td>

                    <td>{exp.installment_number} de {exp.numbertimes}</td>

                    <td>{new Date(exp.duedate).toLocaleDateString('pt-BR')}</td>

                    <td>

                      <button onClick={() => startEditExpense(exp)}>✏️</button>

                      <button onClick={() => removeExpense(exp.expense_id)}>❌</button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  )

}

export default App