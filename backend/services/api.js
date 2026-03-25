import axios from "axios";

// Usar a URL do backend que vamos deployar no Vercel
const API_URL = import.meta.env.VITE_API_URL || "https://seu-backend.vercel.app";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;