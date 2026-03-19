import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

export default function Login() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const API_URL = import.meta.env.VITE_API_URL

  const handleLogin = async () => {

  console.log("CLICOU LOGIN 🔥")

  try {

    const res = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    })

    console.log("RESPOSTA:", res.data)

    localStorage.setItem("token", res.data.token)

    console.log("TOKEN SALVO")

    navigate("/app")

  } catch (err) {
    console.log("ERRO LOGIN:", err)
    alert("Erro no login")
  }

}
  return (
    <div>
      <input placeholder="email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="senha" type="password" onChange={e => setPassword(e.target.value)} />

      <button onClick={handleLogin}>
        Entrar
      </button>
    </div>
  )

}