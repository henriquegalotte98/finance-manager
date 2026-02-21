const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());




// Criar tabela se não existir
pool.query(`
  CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    service TEXT,
    price NUMERIC,
    dueDate DATE,
    paymentMethod TEXT,
    numberTimes INT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`);




// Conexão com PostgreSQL (use a connection string do Render ou Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // configure no Render
  ssl: { rejectUnauthorized: false }
});

// Criar tabela se não existir
pool.query(`
  CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    service TEXT,
    price NUMERIC,
    dueDate DATE,
    paymentMethod TEXT,
    numberTimes INT
  )
`);

// Criar gasto
app.post("/expenses", async (req, res) => {
  const { service, price, dueDate, paymentMethod, numberTimes } = req.body;
  const result = await pool.query(
    "INSERT INTO expenses (service, price, dueDate, paymentMethod, numberTimes) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [service, price, dueDate, paymentMethod, numberTimes]
  );
  res.status(201).json(result.rows[0]);
});


// Listar gastos
app.get("/expenses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM expenses ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar gastos" });
  }
});

// Atualizar gasto
app.put("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { service, price, dueDate, paymentMethod, numberTimes } = req.body;
    const result = await pool.query(
      "UPDATE expenses SET service=$1, price=$2, dueDate=$3, paymentMethod=$4, numberTimes=$5 WHERE id=$6 RETURNING *",
      [service, price, dueDate, paymentMethod, numberTimes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Gasto não encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar gasto" });
  }
});

// Remover gasto
app.delete("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM expenses WHERE id=$1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Gasto não encontrado" });
    }
    res.json({ message: "Gasto removido!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao remover gasto" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});