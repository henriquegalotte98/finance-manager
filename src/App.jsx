import './App.css'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { LogoIcon, HomeIcon, PlanilhaIcon, EconomiasIcon, DolarIcon, ViagensIcon, ConfigIcon } from './components/icons/Icons.jsx'

/**
 * App component
 * @param {Object} props - Props object
 * @returns {ReactElement} - JSX element
 */
function App() {
  /**
   * States para armazenar valores de inputs
   */
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [numberTimes, setNumberTimes] = useState('1');
  const [service, setService] = useState('');
  const [price, setPrice] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null); // agora guardamos o id do banco

  /**
   * Estados para filtro de mês
   */
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_URL = import.meta.env.VITE_API_URL;

  /**
   * Estado para controlar qual app está aberto
   */
  const [activeApp, setActiveApp] = useState('home');

  /**
   * Função para mostrar qual app está aberto
   * @param {String} appName - Nome do app a ser aberto
   */
  /**
   * Função para mostrar qual app está aberto
   * @param {String} appName - Nome do app a ser aberto
   * @example showApp('home') // Mostra o app "home"
   */
  /**
   * Função para mostrar qual app está aberto
   * @param {String} appName - Nome do app a ser aberto
   * @example showApp('home') // Mostra o app "home"
   * @returns {void} - Nenhum valor de retorno
   */
  /**
   * Função para mostrar qual app está aberto
   * @param {String} appName - Nome do app a ser aberto
   * @example showApp('home') // Mostra o app "home"
   * @returns {void} - Nenhum valor de retorno
   */
  const showApp = (appName) => {
    // Altera o estado para mostrar o app com o nome especificado
    setActiveApp(appName);
  };

  /**
   * Docstring para a função showApp
   * @memberof App
   * @function showApp
   * @param {String} appName - Nome do app a ser aberto
   * @example
   * showApp('home') // Mostra o app "home"
   * @returns {void} - Nenhum valor de retorno
   * @description
   * Função para mostrar qual app está aberto.
   * Altera o estado para mostrar o app com o nome especificado.
   */

  /**
   * Função para buscar gastos do mês ao carregar ou mudar mês
   */
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

  /**
   * Função para tratar mudanças em select de forma de pagamento
   * @param {Event} event - Evento de mudanças em select
   */
  /**
   * Função para tratar mudanças em select de forma de pagamento
   * @param {Event} event - Evento de mudanças em select
   * @example <select onChange={handlePaymentMethodChange}>
   *   <option value="credit_card">Cartão de Crédito</option>
   *   <option value="debit_card">Cartão de Débito</option>
   *   <option value="cash">Dinheiro</option>
   * </select>
   */
  /**
   * Função para tratar mudanças em select de forma de pagamento
   * @param {Event} event - Evento de mudanças em select
   * @example <select onChange={handlePaymentMethodChange}>
   *   <option value="credit_card">Cartão de Crédito</option>
   *   <option value="debit_card">Cartão de Débito</option>
   *   <option value="cash">Dinheiro</option>
   * </select>
   */
  /**
   * Docstring para a função handlePaymentMethodChange
   * @memberof App
   * @function handlePaymentMethodChange
   * @param {Event} event - Evento de mudanças em select
   * @example
   * <select onChange={handlePaymentMethodChange}>
   *   <option value="credit_card">Cartão de Crédito</option>
   *   <option value="debit_card">Cartão de Débito</option>
   *   <option value="cash">Dinheiro</option>
   * </select>
   * @returns {void} - Nenhum valor de retorno
   * @description
   * Função para tratar mudanças em select de forma de pagamento.
   * Atualizar estado com o valor selecionado.
   */
  const handlePaymentMethodChange = (event) => {
    // Atualizar estado com o valor selecionado
    setPaymentMethod(event.target.value);
  };

  /**
   * Função para adicionar novo gasto
   */
  /**
   * Função para adicionar novo gasto ou atualizar um gasto existente
   *
   * Se o estado `editId` for diferente de `null`, atualizar o gasto com o ID
   * especificado. Caso contrário, adicionar um novo gasto com os dados do estado
   * `newExpense`.
   *
   * Após adicionar ou atualizar o gasto, recarregar a lista de despesas do mês atual
   * com a API e atualizar o estado `expenses` com a lista de despesas.
   */
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
              // Resetar o formulário e o estado `editId`
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
              // Resetar o formulário e o estado `editId`
              resetForm();
            })
            .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
    }

  /**
   * Função para remover um gasto
   * @param {Number} id - ID do gasto a ser removido
   */
  /**
   * Função para remover um gasto
   * @param {Number} id - ID do gasto a ser removido
   * @returns {Promise<void>} - Promise com resultado da remoção
   */
  /**
   * Função para remover um gasto
   * @param {Number} id - ID do gasto a ser removido
   * @returns {Promise<void>} - Promise com resultado da remoção
   */
  /**
   * Função para remover um gasto
   * @param {Number} id - ID do gasto a ser removido
   * @returns {Promise<void>} - Promise com resultado da remoção
   */
  /**
   * Função para remover um gasto
   * @memberof App
   * @function removeExpense
   * @param {Number} id - ID do gasto a ser removido
   * @returns {Promise<void>} - Promise com resultado da remoção
   * @description
   * Função para remover um gasto.
   * Ela irá realizar uma requisição DELETE para remover o gasto.
   * Após remover o gasto, ela irá recarregar as despesas do mês atual com a API e atualizar
   * o estado `expenses` com a lista de despesas.
   */
  /**
   * Função para remover um gasto
   * @param {Number} id - ID do gasto a ser removido
   * @returns {Promise<void>} - Promise com resultado da remoção
   * @description
   * Função para remover um gasto.
   * Ela irá realizar uma requisição DELETE para remover o gasto.
   * Após remover o gasto, ela irá recarregar as despesas do mês atual com a API e atualizar
   * o estado `expenses` com a lista de despesas.
   */
  const removeExpense = (id) => {
    // Realizar requisição DELETE para remover o gasto
    return axios.delete(`${API_URL}/expenses/${id}`)
      .then(() => {
        // Recarregar despesas do mês
        return axios.get(`${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`);
      })
      .then(res => {
        if (Array.isArray(res.data)) {
          // Atualizar estado com as despesas do mês
          setExpenses(res.data);
        }
      })
      .catch(err => console.error(err));
  };

  /**
   * Docstring para a função removeExpense
   * @memberof App
   * @function removeExpense
   * @param {Number} id - ID do gasto a ser removido
   * @returns {Promise<void>} - Promise com resultado da remoção
   * @description
   * Função para remover um gasto.
   * Ela irá realizar uma requisição DELETE para remover o gasto.
   * Após remover o gasto, ela irá recarregar as despesas do mês atual com a API e atualizar
   * o estado `expenses` com a lista de despesas.
   */

  /**
   * Função para iniciar edição de um gasto
   * @param {Object} exp - Gasto a ser editado
   */
  /**
   * Função para iniciar edição de um gasto
   * @param {Object} exp - Gasto a ser editado
   * @returns {void} - Nenhum valor de retorno
   */
  /**
   * Função para iniciar edição de um gasto.
   * Esta função é chamada quando o usuário clica em um gasto para editá-lo.
   * Ela irá preencher os campos do formulário com os valores do gasto.
   * Além disso, ela irá armazenar o ID do gasto no estado `editId`.
   * @param {Object} exp - Gasto a ser editado
   * @returns {void} - Nenhum valor de retorno
   */
  /**
   * Função para iniciar edição de um gasto
   * Esta função é chamada quando o usuário clica em um gasto para editá-lo.
   * Ela irá preencher os campos do formulário com os valores do gasto.
   * Além disso, ela irá armazenar o ID do gasto no estado `editId`.
   * @param {Object} exp - Gasto a ser editado
   * @returns {void} - Nenhum valor de retorno
   */
  /**
   * Função para iniciar edição de um gasto
   * @param {Object} exp - Gasto a ser editado
   * @returns {void} - Nenhum valor de retorno
   * @description
   * Função para iniciar edição de um gasto.
   * Esta função é chamada quando o usuário clica em um gasto para editá-lo.
   * Ela irá preencher os campos do formulário com os valores do gasto.
   * Além disso, ela irá armazenar o ID do gasto no estado `editId`.
   */
  const startEditExpense = (exp) => {
    // Preencher os campos do formulário com os valores do gasto
    setService(exp.service); // Preencher o campo service com o valor do gasto
    setPrice(exp.price); // Preencher o campo price com o valor do gasto
    setDueDate(exp.dueDate); // Preencher o campo dueDate com o valor do gasto
    setPaymentMethod(exp.paymentMethod); // Preencher o campo paymentMethod com o valor do gasto
    setNumberTimes(exp.numberTimes); // Preencher o campo numberTimes com o valor do gasto
    // Guardar o ID do gasto no estado `editId`
    setEditId(exp.id); // Guardar o ID do gasto no estado `editId`

  /**
   * Função para resetar os campos do formulário
   */
  /**
   * Função para resetar os campos do formulário
   * Esta função é chamada quando o usuário deseja cancelar a edição de um gasto
   * ou quando ele deseja adicionar um novo gasto.
   * Ela irá resetar os campos do formulário com os valores padrão.
   * @returns {void} - Nenhum valor de retorno
   */
  const resetForm = () => {
    // Resetar o campo service com o valor padrão (vazio)
    setService('');
    // Resetar o campo price com o valor padrão (vazio)
    setPrice('');
    // Resetar o campo dueDate com o valor padrão (vazio)
    setDueDate('');
    // Resetar o campo paymentMethod com o valor padrão (credit_card)
    setPaymentMethod('credit_card');
    // Resetar o campo numberTimes com o valor padrão (1)
    setNumberTimes('1');
    // Resetar o estado editId com o valor padrão (null)
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
                      <td>{exp.installment_number || 1}/{exp.numberTimes}x</td>
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