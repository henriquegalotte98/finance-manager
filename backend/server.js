const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


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
    d.setMonth(d.getMonth() + index);
  }

  return d;
}


function totalInstallments(numTimes, recurrence) {

  if (recurrence === "monthly") return 12;
  if (recurrence === "weekly") return 52;
  if (recurrence === "yearly") return 5;

  return numTimes;

}



app.post("/expenses", async (req, res) => {

  try {

    const {
      service,
      price,
      paymentMethod,
      numberTimes,
      dueDate,
      recurrence
    } = req.body;

    const numTimes = parseInt(numberTimes || 1);

    const expense = await pool.query(
      `INSERT INTO expenses
      (service, price, paymentmethod, numbertimes, duedate, recurrence)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [service, price, paymentMethod, numTimes, dueDate, recurrence]
    );

    const expenseId = expense.rows[0].id;

    const parcelaValor = price / numTimes;

    const total = totalInstallments(numTimes, recurrence);

    for (let i = 0; i < total; i++) {

      const vencimento = generateDate(dueDate, recurrence, i);

      await pool.query(

        `INSERT INTO installments
        (expense_id, installment_number, amount, duedate)
        VALUES ($1,$2,$3,$4)`,

        [expenseId, i + 1, parcelaValor, vencimento]

      );

    }

    res.json({ message: "Despesa criada" });

  }

  catch (err) {

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
      SET service=$1, price=$2, paymentmethod=$3, numbertimes=$4, duedate=$5, recurrence=$6
      WHERE id=$7`,

      [service, price, paymentMethod, numTimes, dueDate, recurrence, id]

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

      `SELECT 
        i.id,
        i.installment_number,
        i.amount,
        i.duedate,
        e.service,
        e.paymentmethod,
        e.numbertimes,
        e.recurrence,
        e.id as expense_id
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

    await pool.query("DELETE FROM installments WHERE expense_id=$1", [id]);

    await pool.query("DELETE FROM expenses WHERE id=$1", [id]);

    res.json({ message: "Removido" });

  }

  catch (err) {

    console.error(err);
    res.status(500).send("Erro ao remover");

  }

});


const PORT = process.env.PORT || 3000;


app.get("/dashboard/month-total/:year/:month", async (req, res) => {

  const { year, month } = req.params

  const result = await pool.query(
    `
SELECT SUM(amount) as total
FROM installments
WHERE EXTRACT(YEAR FROM duedate)=$1
AND EXTRACT(MONTH FROM duedate)=$2
`,
    [year, month]
  )

  res.json(result.rows[0])

})

app.get("/dashboard/calendar", async (req, res) => {

  const result = await pool.query(
    `
SELECT duedate, service, amount
FROM installments i
JOIN expenses e ON e.id=i.expense_id
`
  )

  res.json(result.rows)

})
app.get("/dashboard/alerts", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT service, duedate, amount
      FROM installments i
      JOIN expenses e ON e.id=i.expense_id
      WHERE duedate BETWEEN NOW() AND NOW() + interval '7 days'
      ORDER BY duedate
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);
    res.json([]);

  }

});

app.get("/dashboard/monthly", async (req, res) => {

  try {

    const result = await pool.query(`
      SELECT 
      TO_CHAR(duedate,'Mon') as month,
      SUM(amount) as total
      FROM installments
      GROUP BY month
      ORDER BY MIN(duedate)
    `);

    res.json(result.rows);

  } catch (err) {

    console.error(err);
    res.json([]);

  }

});


app.listen(PORT, () => {

  console.log(`Servidor rodando na porta ${PORT}`);

});
