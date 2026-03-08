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

    for (let i = 0; i < numTimes; i++) {

      const vencimento = addMonths(dueDate, i);

      await pool.query(

        `INSERT INTO installments
        (expense_id, installment_number, amount, duedate)
        VALUES ($1,$2,$3,$4)`,

        [expense.id, i + 1, parcelaValor, vencimento]

      );

    }

    res.json(expense);

  }

  catch (err) {

    console.error(err);
    res.status(500).send("Erro ao adicionar despesa");

  }

});