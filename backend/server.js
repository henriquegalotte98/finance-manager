const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}


function generateDate(baseDate, recurrence, index) {

  let d = new Date(baseDate);

  if (recurrence === "monthly") {
    d.setMonth(d.getMonth() + index);
  }

  else if (recurrence === "weekly") {
    d.setDate(d.getDate() + (7 * index));
  }

  else if (recurrence === "yearly") {
    d.setFullYear(d.getFullYear() + index);
  }

  else {
    d = new Date(addMonths(baseDate, index));
  }

  return d.toISOString().split("T")[0];
}


function totalInstallments(numTimes, recurrence){

  if (recurrence === "monthly") return 12;
  if (recurrence === "weekly") return 52;
  if (recurrence === "yearly") return 5;

  return numTimes;

}


app.post("/expenses", async (req, res) => {
  try {

    const { service, price, paymentMethod, recurrence, dueDate } = req.body;

    const startDate = new Date(dueDate);

    let repetitions = 1;

    if (recurrence === "monthly") repetitions = 12;
    if (recurrence === "weekly") repetitions = 52;
    if (recurrence === "yearly") repetitions = 5;

    const created = [];

    for (let i = 0; i < repetitions; i++) {

      const newDate = new Date(startDate);

      if (recurrence === "monthly") {
        newDate.setMonth(startDate.getMonth() + i);
      }

      if (recurrence === "weekly") {
        newDate.setDate(startDate.getDate() + (i * 7));
      }

      if (recurrence === "yearly") {
        newDate.setFullYear(startDate.getFullYear() + i);
      }

      const result = await pool.query(
        `INSERT INTO expenses 
        (service, price, paymentmethod, duedate, recurrence)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *`,
        [service, price, paymentMethod, newDate, recurrence]
      );

      created.push(result.rows[0]);
    }

    res.json(created);

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao adicionar despesa");
  }
});


app.put("/expenses/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const {
      service,
      price,
      paymentMethod,
      numberTimes,
      dueDate,
      recurrence
    } = req.body;

    const numTimes = parseInt(numberTimes);

    await pool.query(

      `UPDATE expenses
      SET service=$1, price=$2, paymentmethod=$3, numbertimes=$4, recurrence=$5
      WHERE id=$6`,

      [service, price, paymentMethod, numTimes, recurrence, id]

    );


    await pool.query(
      "DELETE FROM installments WHERE expense_id=$1",
      [id]
    );


    const parcelaValor = price / numTimes;

    const total = totalInstallments(numTimes, recurrence);


    for (let i = 0; i < total; i++) {

      const vencimento = generateDate(dueDate, recurrence, i);

      await pool.query(

        `INSERT INTO installments
        (expense_id, installment_number, amount, duedate)
        VALUES ($1,$2,$3,$4)`,

        [id, i + 1, parcelaValor, vencimento]

      );

    }

    res.json({ message: "Despesa atualizada" });

  }

  catch (err) {

    console.error(err);
    res.status(500).send("Erro ao atualizar despesa");

  }

});


app.get("/expenses/month/:year/:month", async (req, res) => {

  try {

    const { year, month } = req.params;

    const result = await pool.query(

      `SELECT i.*, e.service, e.paymentmethod, e.numbertimes, e.recurrence
       FROM installments i
       JOIN expenses e ON e.id = i.expense_id
       WHERE EXTRACT(YEAR FROM i.duedate) = $1
       AND EXTRACT(MONTH FROM i.duedate) = $2
       ORDER BY i.duedate`,

      [year, month]

    );

    res.json(result.rows);

  }

  catch (err) {

    console.error(err);
    res.status(500).send("Erro ao buscar parcelas");

  }

});


app.delete("/expenses/:id", async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query("DELETE FROM expenses WHERE id=$1", [id]);

    res.json({ message: "Removido" });

  }

  catch (err) {

    console.error(err);
    res.status(500).send("Erro ao remover");

  }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Servidor rodando na porta ${PORT}`);

});