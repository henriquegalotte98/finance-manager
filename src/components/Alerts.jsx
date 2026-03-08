import { useEffect,useState } from "react"
import axios from "axios"

export default function Alerts({API_URL}){

const [alerts,setAlerts] = useState([])

useEffect(()=>{

axios.get(`${API_URL}/dashboard/alerts`)
.then(res=> setAlerts(res.data))

},[])

if(alerts.length===0) return null

return(

<div className="alerts">

<h3>⚠ Contas vencendo</h3>

{alerts.map((a,i)=>(
<div key={i}>
{a.service} - R$ {a.amount} - {new Date(a.duedate).toLocaleDateString()}
</div>
))}

</div>

)

}