const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let expenses = []; // banco em memória (teste)

// rota para salvar gasto
app.post("/expenses", (req, res) => {
  const expense = req.body;
  expenses.push(expense);
  res.status(201).json({ message: "Gasto registrado!", expense });
});

// rota para listar gastos
app.get("/expenses", (req, res) => {
  res.json(expenses);
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});