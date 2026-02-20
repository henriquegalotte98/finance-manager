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

  // Buscar gastos ao carregar
  useEffect(() => {
    axios.get("http://localhost:3000/expenses")
      .then(res => setExpenses(res.data))
      .catch(err => console.error(err));
  }, []);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  }

  const addExpense = () => {
    const newExpense = {
      service,
      price,
      dueDate,
      paymentMethod,
      numberTimes
    };

    axios.post("http://localhost:3000/expenses", newExpense)
      .then(res => {
        setExpenses([...expenses, res.data.expense]);
        // limpar campos
        setService('');
        setPrice('');
        setDueDate('');
        setPaymentMethod('credit_card');
        setNumberTimes('1');
      })
      .catch(err => console.error(err));
  };

  return (
    <div className='app_container'>
      <div className='side_menu_container'>
        <div className='side_header'>
          <div className='logo'>
            <li>{LogoIcon}</li>
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
            <li>{HomeIcon}</li>
            <li>{PlanilhaIcon}</li>
            <li>{EconomiasIcon}</li>
            <li>{DolarIcon}</li>
            <li>{ViagensIcon}</li>
          </menu>
          <div className='subtitle_icons'>
            <p>Início</p>
            <p>Planilha</p>
            <p>Economias</p>
            <p>Dólar</p>
            <p>Viagens</p>
          </div>
        </div>
      </div>

      <div className='app'>
        <div className='excel'>
          <div className='excel_header'>
            <search>
              <input type="text" placeholder='Pesquisar...' className='search_input' />
            </search>
            <button type="submit">Pesquisar</button>
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
                    <option key={i+1} value={i+1}>{i+1}x</option>
                  ))}
                </select>
              )}

              <button className='btn_add' onClick={addExpense}>Adicionar</button>
              <button className='btn_remove'>Remover</button>
              <button className='btn_edit'>Editar</button>
              <button className='btn_export'>Exportar</button>
            </div>

            <h3>📊 Lista de gastos</h3>
            <ul>
              {expenses.map((exp, i) => (
                <li key={i}>
                  {exp.service} - R${exp.price} - {exp.paymentMethod} - {exp.numberTimes}x - {exp.dueDate}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App