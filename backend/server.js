// ---------------- IMPORTS ----------------

const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const { Pool } = require("pg")
const { v4: uuidv4 } = require("uuid")

const app = express()

app.use(cors())
app.use(bodyParser.json())

// ---------------- DATABASE ----------------

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// ---------------- HELPERS ----------------

function addMonths(date, months) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split("T")[0]
}

function addWeeks(date, weeks) {
  const d = new Date(date)
  d.setDate(d.getDate() + (7 * weeks))
  return d.toISOString().split("T")[0]
}

function addYears(date, years) {
  const d = new Date(date)
  d.setFullYear(d.getFullYear() + years)
  return d.toISOString().split("T")[0]
}

// ---------------- CREATE EXPENSE ----------------

app.post("/expenses", async (req, res) => {

  try {

    const groupId = uuidv4()

    const {
      service,
      price,
      paymentMethod,
      numberTimes,
      dueDate,
      recurrence
    } = req.body

    const numTimes = parseInt(numberTimes, 10)

    let recurrenceTimes = 1

    if (recurrence === "weekly") recurrenceTimes = 52
    if (recurrence === "monthly") recurrenceTimes = 12
    if (recurrence === "yearly") recurrenceTimes = 5

    for (let r = 0; r < recurrenceTimes; r++) {

      let recurrenceDate = dueDate

      if (recurrence === "weekly") recurrenceDate = addWeeks(dueDate, r)
      if (recurrence === "monthly") recurrenceDate = addMonths(dueDate, r)
      if (recurrence === "yearly") recurrenceDate = addYears(dueDate, r)

      // criar expense principal

      const result = await pool.query(
        `INSERT INTO expenses
        (service, price, paymentMethod, numberTimes, recurrence, expense_group_id)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *`,
        [service, price, paymentMethod, numTimes, recurrence, groupId]
      )

      const expense = result.rows[0]

      const parcelaValor = price / numTimes

      for (let i = 0; i < numTimes; i++) {

        const vencimento = addMonths(recurrenceDate, i)

        await pool.query(
          `INSERT INTO installments
          (expense_id, installment_number, amount, dueDate)
          VALUES ($1,$2,$3,$4)`,
          [expense.id, i + 1, parcelaValor, vencimento]
        )

      }

    }

    res.json({ message: "Despesa criada com sucesso" })

  } catch (err) {

    console.error(err)
    res.status(500).send("Erro ao adicionar despesa")

  }

})

// ---------------- LIST ALL EXPENSES ----------------

app.get("/expenses", async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM expenses ORDER BY created_at ASC"
    )

    res.json(result.rows)

  } catch (err) {

    console.error(err)
    res.status(500).send("Erro ao buscar despesas")

  }

})

// ---------------- LIST MONTH EXPENSES ----------------

app.get("/expenses/month/:year/:month", async (req, res) => {

  try {

    const { year, month } = req.params

    const result = await pool.query(
      `SELECT 
        i.*, 
        e.service, 
        e.paymentMethod, 
        e.numberTimes,
        e.expense_group_id
      FROM installments i
      JOIN expenses e ON e.id = i.expense_id
      WHERE EXTRACT(YEAR FROM i.dueDate) = $1
      AND EXTRACT(MONTH FROM i.dueDate) = $2
      ORDER BY i.dueDate`,
      [year, month]
    )

    res.json(result.rows)

  } catch (err) {

    console.error(err)
    res.status(500).send("Erro ao buscar parcelas")

  }

})

// ---------------- MONTH SUMMARY ----------------

app.get("/expenses/summary/:year/:month", async (req, res) => {

  try {

    const { year, month } = req.params

    const result = await pool.query(
      `SELECT
        SUM(amount) AS total,
        SUM(CASE WHEN paymentmethod='credit_card' THEN amount ELSE 0 END) AS credit,
        SUM(CASE WHEN paymentmethod='debit_card' THEN amount ELSE 0 END) AS debit
      FROM installments i
      JOIN expenses e ON e.id = i.expense_id
      WHERE EXTRACT(MONTH FROM i.dueDate) = $1
      AND EXTRACT(YEAR FROM i.dueDate) = $2`,
      [month, year]
    )

    res.json(result.rows[0])

  } catch (err) {

    console.error(err)
    res.status(500).send("Erro ao gerar resumo")

  }

})

// ---------------- FORECAST ----------------

app.get("/expenses/forecast", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT
        DATE_TRUNC('month', dueDate) AS month,
        SUM(amount) AS total
      FROM installments
      WHERE dueDate >= CURRENT_DATE
      GROUP BY month
      ORDER BY month
      LIMIT 6`
    )

    res.json(result.rows)

  } catch (err) {

    console.error(err)
    res.status(500).send("Erro previsão")

  }

})

// ---------------- SUBSCRIPTIONS DETECTION ----------------

app.get("/expenses/subscriptions", async (req, res) => {

  try {

    const result = await pool.query(
      `SELECT service, COUNT(*) AS total
      FROM expenses
      GROUP BY service
      HAVING COUNT(*) >= 3
      ORDER BY total DESC`
    )

    res.json(result.rows)

  } catch (err) {

    console.error(err)
    res.status(500).send("Erro detectar assinaturas")

  }

})

// ---------------- UPDATE EXPENSE ----------------

app.put("/expenses/:id", async (req, res) => {

  try {

    const { id } = req.params

    const {
      service,
      price,
      paymentMethod,
      numberTimes,
      dueDate
    } = req.body

    const numTimes = parseInt(numberTimes, 10)

    const result = await pool.query(
      `UPDATE expenses
      SET service=$1, price=$2, paymentMethod=$3, numberTimes=$4
      WHERE id=$5
      RETURNING *`,
      [service, price, paymentMethod, numTimes, id]
    )

    await pool.query(
      "DELETE FROM installments WHERE expense_id=$1",
      [id]
    )

    const parcelaValor = price / numTimes

    for (let i = 0; i < numTimes; i++) {

      const vencimento = addMonths(dueDate, i)

      await pool.query(
        `INSERT INTO installments
        (expense_id, installment_number, amount, dueDate)
        VALUES ($1,$2,$3,$4)`,
        [id, i + 1, parcelaValor, vencimento]
      )

    }

    res.json(result.rows[0])

  } catch (err) {

    console.error(err)
    res.status(500).send("Erro atualizar gasto")

  }

})

// ---------------- DELETE EXPENSE ----------------

app.delete("/expenses/:id", async (req, res) => {

  try {

    const { id } = req.params

    await pool.query(
      "DELETE FROM expenses WHERE id=$1",
      [id]
    )

    res.json({ message: "Gasto removido" })

  } catch (err) {

    console.error(err)
    res.status(500).send("Erro remover")

  }

})

// ---------------- SERVER ----------------

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT)
})