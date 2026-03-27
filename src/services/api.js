import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log para debug (remova em produção)
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("Erro no interceptor de requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    // Log para debug (remova em produção)
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Tratamento específico para erro 401 (não autorizado)
    if (error.response?.status === 401) {
      console.warn("Token expirado ou inválido. Redirecionando para login...");
      localStorage.removeItem("token");
      
      // Redirecionar para login se não estiver já na página de login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    // Tratamento para erro 500 (erro interno do servidor)
    if (error.response?.status === 500) {
      console.error("Erro interno do servidor:", error.response.data);
    }
    
    // Tratamento para erro de timeout
    if (error.code === "ECONNABORTED") {
      console.error("Timeout na requisição");
    }
    
    // Tratamento para erro de rede
    if (!error.response) {
      console.error("Erro de rede. Verifique sua conexão.");
    }
    
    return Promise.reject(error);
  }
);

export default api;