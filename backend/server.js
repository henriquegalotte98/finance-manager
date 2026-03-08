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


app.post("/expenses", async (req, res) => {

  try {

    const groupId = uuidv4();

    const {
      service,
      price,
      paymentMethod,
      numberTimes,
      dueDate,
      recurrence
    } = req.body;

    const numTimes = parseInt(numberTimes);

    const result = await pool.query(

      `INSERT INTO expenses
      (service, price, paymentmethod, numbertimes, recurrence, expense_group_id)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,

      [service, price, paymentMethod, numTimes, recurrence, groupId]

    );

    const expense = result.rows[0];

    const parcelaValor = price / numTimes;

    let totalInstallments = numTimes;

    if (recurrence === "monthly") totalInstallments = 12;
    if (recurrence === "weekly") totalInstallments = 52;
    if (recurrence === "yearly") totalInstallments = 5;


    for (let i = 0; i < totalInstallments; i++) {

      let vencimento = new Date(dueDate);

      if (recurrence === "monthly") vencimento.setMonth(vencimento.getMonth() + i);

      else if (recurrence === "weekly") vencimento.setDate(vencimento.getDate() + (7 * i));

      else if (recurrence === "yearly") vencimento.setFullYear(vencimento.getFullYear() + i);

      else vencimento = new Date(addMonths(dueDate, i));


      const formattedDate = new Date(vencimento).toISOString().split("T")[0];


      await pool.query(

        `INSERT INTO installments
        (expense_id, installment_number, amount, duedate)
        VALUES ($1,$2,$3,$4)`,

        [expense.id, i + 1, parcelaValor, formattedDate]

      );

    }

    res.json(expense);

  }

  catch (err) {

    console.error(err);
    res.status(500).send("Erro ao adicionar despesa");

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