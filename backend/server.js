const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let expenses = [];

// Criar gasto
app.post("/expenses", (req, res) => {
  const expense = req.body;
  expenses.push(expense);
  res.status(201).json(expense); // retorna só o objeto
});

// Listar gastos
app.get("/expenses", (req, res) => {
  res.json(expenses); // sempre um array
});

// Atualizar gasto
app.put("/expenses/:id", (req, res) => {
  const { id } = req.params;
  const updatedExpense = req.body;

  if (!expenses[id]) {
    return res.status(404).json({ message: "Gasto não encontrado" });
  }

  expenses[id] = updatedExpense;
  res.json(updatedExpense); // retorna o objeto atualizado
});

// Remover gasto
app.delete("/expenses/:id", (req, res) => {
  const { id } = req.params;

  if (!expenses[id]) {
    return res.status(404).json({ message: "Gasto não encontrado" });
  }

  expenses.splice(id, 1);
  res.json({ message: "Gasto removido!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});