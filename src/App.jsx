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
  const [editIndex, setEditIndex] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Buscar gastos ao carregar
  useEffect(() => {
    axios.get(`${API_URL}/expenses`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setExpenses(res.data);
        } else {
          console.error("Resposta inesperada da API:", res.data);
          setExpenses([]);
        }
      })
      .catch(err => console.error(err));
  }, [API_URL]);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  }

  const addExpense = () => {
    const newExpense = { service, price, dueDate, paymentMethod, numberTimes };

    if (editIndex !== null) {
      // Atualizar gasto existente
      axios.put(`${API_URL}/expenses/${editIndex}`, newExpense)
        .then(res => {
          const newExpenses = [...expenses];
          newExpenses[editIndex] = res.data; // objeto atualizado
          setExpenses(newExpenses);
          resetForm();
        })
        .catch(err => console.error(err));
    } else {
      // Adicionar novo gasto
      axios.post(`${API_URL}/expenses`, newExpense)
        .then(res => {
          setExpenses([...expenses, res.data]); // objeto do gasto
          resetForm();
        })
        .catch(err => console.error(err));
    }
  };

  const removeExpense = (index) => {
    axios.delete(`${API_URL}/expenses/${index}`)
      .then(() => {
        const newExpenses = expenses.filter((_, i) => i !== index);
        setExpenses(newExpenses);
      })
      .catch(err => console.error(err));
  };

  const startEditExpense = (index) => {
    const exp = expenses[index];
    setService(exp.service);
    setPrice(exp.price);
    setDueDate(exp.dueDate);
    setPaymentMethod(exp.paymentMethod);
    setNumberTimes(exp.numberTimes);
    setEditIndex(index);
  };

  const resetForm = () => {
    setService('');
    setPrice('');
    setDueDate('');
    setPaymentMethod('credit_card');
    setNumberTimes('1');
    setEditIndex(null);
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
                    <option key={i + 1} value={i + 1}>{i + 1}x</option>
                  ))}
                </select>
              )}

              <button className='btn_add' onClick={addExpense}>
                {editIndex !== null ? "Salvar edição" : "Adicionar"}
              </button>
              <button className='btn_remove' onClick={resetForm}>Cancelar</button>
            </div>

            <h3>📊 Lista de gastos</h3>
            <ul>
              {Array.isArray(expenses) && expenses.map((exp, i) => (
                <li key={i}>
                  Vencimento: {exp.dueDate} - Serviço: {exp.service} - R${exp.price} - {exp.paymentMethod} - {exp.numberTimes}x
                  <button onClick={() => startEditExpense(i)}>Editar</button>
                  <button onClick={() => removeExpense(i)}>Remover</button>
                  <div className='div_separate'></div>
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