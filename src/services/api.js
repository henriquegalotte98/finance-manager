import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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
    if (import.meta.env.DEV) {
      console.log(`📥 ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expirado ou inválido. Redirecionando para login...");
      localStorage.removeItem("token");
      
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    if (error.response?.status === 500) {
      console.error("Erro interno do servidor:", error.response.data);
    }
    
    if (error.code === "ECONNABORTED") {
      console.error("Timeout na requisicao");
    }
    
    if (!error.response) {
      console.error("Erro de rede. Verifique sua conexão.");
    }
    
    return Promise.reject(error);
  }
);

// Funcao auxiliar para formatar preco
export const formatPrice = (price) => {
  if (!price) return 0;
  const stringPrice = price.toString();
  const normalizedPrice = stringPrice.replace(',', '.');
  return parseFloat(normalizedPrice);
};

// Funcao auxiliar para formatar data
export const formatDateForAPI = (dateString) => {
  if (!dateString) return "";
  try {
    return dateString.split('T')[0];
  } catch {
    return dateString;
  }
};

// Cria uma despesa unica
export const createExpense = async (expenseData) => {
  try {
    const response = await api.post('/expenses', {
      service: expenseData.service,
      price: formatPrice(expenseData.price),
      paymentMethod: expenseData.paymentMethod,
      dueDate: formatDateForAPI(expenseData.dueDate),
      recurrence: expenseData.recurrence || "none"
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    throw error;
  }
};

// Atualiza uma despesa existente
export const updateExpense = async (id, expenseData) => {
  try {
    const response = await api.put(`/expenses/${id}`, {
      service: expenseData.service,
      price: formatPrice(expenseData.price),
      paymentMethod: expenseData.paymentMethod,
      dueDate: formatDateForAPI(expenseData.dueDate),
      recurrence: expenseData.recurrence || "none"
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error);
    throw error;
  }
};

// Carrega despesas de um mes especifico
export const loadExpensesByMonth = async (year, month) => {
  try {
    const response = await api.get(`/expenses/month/${year}/${month}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao carregar despesas do mes:", error);
    throw error;
  }
};

// Remove uma despesa
export const deleteExpense = async (id) => {
  try {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao deletar despesa:", error);
    throw error;
  }
};

export default api;