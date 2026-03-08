import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogoIcon, HomeIcon, PlanilhaIcon, EconomiasIcon, DolarIcon, ViagensIcon, ConfigIcon } from './components/icons/Icons.jsx';

function App() {

  const API_URL = import.meta.env.VITE_API_URL;

  // ---------------- ESTADOS ---------------- //

  const [service,setService]=useState('')
  const [price,setPrice]=useState('')
  const [dueDate,setDueDate]=useState('')
  const [paymentMethod,setPaymentMethod]=useState('credit_card')
  const [numberTimes,setNumberTimes]=useState(1)
  const [recurrence,setRecurrence]=useState('none')
  const [editId,setEditId]=useState(null)

  const [expenses,setExpenses]=useState([])
  const [summary,setSummary]=useState({})
  const [forecast,setForecast]=useState([])

  const [selectedMonth,setSelectedMonth]=useState(new Date().getMonth()+1)
  const [selectedYear,setSelectedYear]=useState(new Date().getFullYear())

  const [activeApp,setActiveApp]=useState('home')

  const showApp=(app)=>setActiveApp(app)

  // ---------------- API ---------------- //

  const loadMonth=()=>{

    axios.get(`${API_URL}/expenses/month/${selectedYear}/${selectedMonth}`)
      .then(res=>setExpenses(res.data))
      .catch(err=>console.error(err))

    axios.get(`${API_URL}/expenses/summary/${selectedYear}/${selectedMonth}`)
      .then(res=>setSummary(res.data))
      .catch(err=>console.error(err))

    axios.get(`${API_URL}/expenses/forecast`)
      .then(res=>setForecast(res.data))
      .catch(err=>console.error(err))
  }

  useEffect(()=>{
    loadMonth()
  },[selectedMonth,selectedYear])

  // ---------------- CRUD ---------------- //

  const addExpense=()=>{

    const newExpense={
      service,
      price,
      dueDate,
      paymentMethod,
      numberTimes,
      recurrence
    }

    if(editId!==null){

      axios.put(`${API_URL}/expenses/${editId}`,newExpense)
        .then(()=>loadMonth())

    }else{

      axios.post(`${API_URL}/expenses`,newExpense)
        .then(()=>loadMonth())

    }

    resetForm()
  }

  const removeExpense=(id)=>{

    axios.delete(`${API_URL}/expenses/${id}`)
      .then(()=>loadMonth())
  }

  const startEditExpense=(exp)=>{

    setService(exp.service)
    setPrice(exp.amount*exp.numbertimes)

    const formattedDate=new Date(exp.duedate).toISOString().split('T')[0]
    setDueDate(formattedDate)

    setPaymentMethod(exp.paymentmethod)
    setNumberTimes(exp.numbertimes)
    setEditId(exp.expense_id)
  }

  const resetForm=()=>{
    setService('')
    setPrice('')
    setDueDate('')
    setPaymentMethod('credit_card')
    setNumberTimes(1)
    setRecurrence('none')
    setEditId(null)
  }

  // ---------------- RENDER ---------------- //

  return(

  <div className="app_container">

{/* SIDEBAR */}

<div className="side_menu_container">

<div className="side_header">

<div className="logo" onClick={()=>showApp('home')}>
<li>{LogoIcon}</li>
<div className="app_name"><p>Finanças</p></div>
</div>

<div className="user_info">
<img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Henrique" className="user_avatar"/>
<p>Henrique</p>
</div>

</div>

<div className="side_menu">

<menu>
<li onClick={()=>showApp('home')}>{HomeIcon}</li>
<li onClick={()=>showApp('excel')}>{PlanilhaIcon}</li>
<li onClick={()=>showApp('economias')}>{EconomiasIcon}</li>
<li onClick={()=>showApp('dolar')}>{DolarIcon}</li>
<li onClick={()=>showApp('viagens')}>{ViagensIcon}</li>
</menu>

</div>

</div>

{/* APP */}

<div className="app">

{/* HOME */}

{activeApp==="home"&&(

<div>

<h1>Dashboard Financeiro</h1>

<div className="dashboard">

<div className="card">
<h3>Total do mês</h3>
<p>R$ {summary.total||0}</p>
</div>

<div className="card">
<h3>Cartão</h3>
<p>R$ {summary.credit||0}</p>
</div>

<div className="card">
<h3>Débito</h3>
<p>R$ {summary.debit||0}</p>
</div>

</div>

<h2>Previsão de Gastos</h2>

<table className="forecast_table">

<thead>
<tr>
<th>Mês</th>
<th>Total</th>
</tr>
</thead>

<tbody>

{forecast.map((f,i)=>{

const date=new Date(f.month)

return(
<tr key={i}>
<td>{date.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</td>
<td>R$ {f.total}</td>
</tr>
)

})}

</tbody>

</table>

</div>

)}

{/* PLANILHA */}

{activeApp==="excel"&&(

<div>

<h2>Controle de Gastos</h2>

<div className="month_filter">

<select
value={selectedMonth}
onChange={(e)=>setSelectedMonth(parseInt(e.target.value))}
>

{[...Array(12)].map((_,i)=>{

const monthDate=new Date(selectedYear,i,1)
const monthName=monthDate.toLocaleDateString('pt-BR',{month:'long'})

return<option key={i+1} value={i+1}>{monthName}</option>

})}

</select>

<select
value={selectedYear}
onChange={(e)=>setSelectedYear(parseInt(e.target.value))}
>

{[...Array(5)].map((_,i)=>{

const year=new Date().getFullYear()-2+i

return<option key={year} value={year}>{year}</option>

})}

</select>

</div>

{/* FORM */}

<div className="expense_form">

<input
placeholder="Serviço"
value={service}
onChange={(e)=>setService(e.target.value)}
/>

<input
type="number"
placeholder="Valor"
value={price}
onChange={(e)=>setPrice(e.target.value)}
/>

<input
type="date"
value={dueDate}
onChange={(e)=>setDueDate(e.target.value)}
/>

<select value={paymentMethod} onChange={(e)=>setPaymentMethod(e.target.value)}>

<option value="credit_card">Cartão Crédito</option>
<option value="debit_card">Cartão Débito</option>
<option value="cash">Dinheiro</option>

</select>

<select value={numberTimes} onChange={(e)=>setNumberTimes(e.target.value)}>

{[...Array(12)].map((_,i)=>(

<option key={i+1} value={i+1}>{i+1}x</option>

))}

</select>

<select value={recurrence} onChange={(e)=>setRecurrence(e.target.value)}>

<option value="none">Sem recorrência</option>
<option value="monthly">Mensal</option>
<option value="weekly">Semanal</option>
<option value="yearly">Anual</option>

</select>

<button onClick={addExpense}>
{editId?"Salvar":"Adicionar"}
</button>

<button onClick={resetForm}>Cancelar</button>

</div>

{/* TABELA */}

<table className="expenses_table">

<thead>

<tr>
<th>Serviço</th>
<th>Valor</th>
<th>Pagamento</th>
<th>Parcela</th>
<th>Vencimento</th>
<th>Ações</th>
</tr>

</thead>

<tbody>

{expenses.map(exp=>(

<tr key={exp.expense_id}>

<td>{exp.service}</td>
<td>R$ {exp.amount}</td>
<td>{exp.paymentmethod}</td>
<td>{exp.installment_number}/{exp.numbertimes}</td>
<td>{new Date(exp.duedate).toLocaleDateString('pt-BR')}</td>

<td>

<button onClick={()=>startEditExpense(exp)}>✏️</button>

<button onClick={()=>removeExpense(exp.expense_id)}>❌</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

)}

</div>

</div>

)

}

export default App