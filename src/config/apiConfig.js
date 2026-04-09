// src/config/apiConfig.js
const getApiUrl = () => {
  // Prioridade 1: Variável de ambiente
  if (import.meta.env.VITE_API_URL) {
    console.log('Usando VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Prioridade 2: URL do backend baseado no ambiente
  const hostname = window.location.hostname;
  
  // Se estiver em produção na Vercel
  if (hostname.includes('vercel.app')) {
    // Seu backend deve estar em outro domínio
    // Substitua pela URL real do seu backend
    return 'https://finance-manager-api.vercel.app'; // Altere para URL do seu backend
  }
  
  // Prioridade 3: Localhost
  return 'http://localhost:3000';
};


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('API URL configurada:', API_URL);
export default API_URL;