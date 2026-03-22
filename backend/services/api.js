// backend/services/api.js (se realmente precisar)
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000" // ou outra API externa
});

export default api;