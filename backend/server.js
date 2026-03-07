// Importação das bibliotecas necessárias
const express = require("express");   // Framework para criar servidor HTTP
const cors = require("cors");         // Permite requisições de outros domínios (ex: front-end separado)
const bodyParser = require("body-parser"); // Facilita leitura de JSON no corpo das requisições
const { Pool } = require("pg");       // Cliente para PostgreSQL

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexão com PostgreSQL (Render/Supabase)
// DATABASE_URL deve estar configurada nas variáveis de ambiente
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Função auxiliar para adicionar meses a uma data
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0]; // retorna no formato YYYY-MM-DD
}

// ---------------- ROTAS ---------------- //

// Criar uma nova despesa e gerar parcelas
app.post("/expenses", async (req, res) => {
  try {
    const { service, price, paymentMethod, numberTimes, dueDate } = req.body;
    const numTimes = parseInt(numberTimes, 10);

    // 1. Inserir a compra principal na tabela expenses
    const result = await pool.query(
      "INSERT INTO expenses (service, price, paymentMethod, numberTimes) VALUES ($1,$2,$3,$4) RETURNING *",
      [service, price, paymentMethod, numTimes]
    );
    const expense = result.rows[0];

    // 2. Gerar parcelas na tabela installments
    const parcelaValor = price / numTimes;
    for (let i = 0; i < numTimes; i++) {
      const vencimento = addMonths(dueDate, i);
      await pool.query(
        "INSERT INTO installments (expense_id, installment_number, amount, dueDate) VALUES ($1,$2,$3,$4)",
        [expense.id, i + 1, parcelaValor, vencimento]
      );
    }

    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao adicionar despesa");
  }
});

// Listar todas as despesas cadastradas
app.get("/expenses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM expenses ORDER BY created_at ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar despesas");
  }
});

// Listar parcelas de um mês específico
app.get("/expenses/month/:year/:month", async (req, res) => {
  try {
    const { year, month } = req.params;
    const result = await pool.query(
      `SELECT i.*, e.service, e.paymentMethod
       FROM installments i
       JOIN expenses e ON e.id = i.expense_id
       WHERE EXTRACT(YEAR FROM i.dueDate) = $1
         AND EXTRACT(MONTH FROM i.dueDate) = $2
       ORDER BY i.dueDate`,
      [year, month]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro SQL:", err.message); // <-- mostra o erro real
    res.status(500).send("Erro ao buscar parcelas do mês");
  }

});

// Atualizar uma despesa (remove parcelas antigas e recria)
app.put("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { service, price, paymentMethod, numberTimes, dueDate } = req.body;
    const numTimes = parseInt(numberTimes, 10);

    // Atualizar dados da compra principal
    const result = await pool.query(
      "UPDATE expenses SET service=$1, price=$2, paymentMethod=$3, numberTimes=$4 WHERE id=$5 RETURNING *",
      [service, price, paymentMethod, numTimes, id]
    );
    const expense = result.rows[0];

    // Deletar parcelas antigas
    await pool.query("DELETE FROM installments WHERE expense_id=$1", [id]);

    // Recriar parcelas
    const parcelaValor = price / numTimes;
    for (let i = 0; i < numTimes; i++) {
      const vencimento = addMonths(dueDate, i);
      await pool.query(
        "INSERT INTO installments (expense_id, installment_number, amount, dueDate) VALUES ($1,$2,$3,$4)",
        [id, i + 1, parcelaValor, vencimento]
      );
    }

    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar gasto" });
  }
});

// Remover uma despesa (e suas parcelas)
app.delete("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM expenses WHERE id=$1", [id]);
    res.json({ message: "Gasto removido!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover gasto" });
  }
});

// Inicializar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});