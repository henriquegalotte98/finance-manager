const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");



const app = express();
app.use(cors());
app.use(bodyParser.json());

let expenses = [];

app.post("/expenses", (req, res) => {
  const expense = req.body;
  expenses.push(expense);
  res.status(201).json({ message: "Gasto registrado!", expense });
});

app.get("/expenses", (req, res) => {
  res.json(expenses);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

