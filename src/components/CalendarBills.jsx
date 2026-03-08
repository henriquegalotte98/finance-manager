import Calendar from "react-calendar"
import { useEffect,useState } from "react"
import axios from "axios"

export default function CalendarBills({API_URL}){

const [bills,setBills] = useState([])

useEffect(()=>{

axios.get(`${API_URL}/dashboard/calendar`)
.then(res=> setBills(res.data))

},[])

function tileContent({date}){

const dayBills = bills.filter(b=>{

return new Date(b.duedate).toDateString() === date.toDateString()

})

if(dayBills.length === 0) return null

return <span style={{color:"red"}}>●</span>

}

return <Calendar tileContent={tileContent}/>

}