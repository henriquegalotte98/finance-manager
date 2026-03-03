const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());





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
    numberTimes INT,
    created_at TIMESTAMP DEFAULT NOW(),
    parent_id INT REFERENCES expenses(id) ON DELETE CASCADE,
    installment_number INT DEFAULT 1,
    installment_month DATE
  )
`);



// Função auxiliar para formatar expense
const formatExpense = (exp) => ({
  id: exp.id,
  service: exp.service,
  price: exp.price,
  dueDate: exp.duedate
    ? new Date(exp.duedate).toLocaleDateString("pt-BR")
    : null,
  paymentMethod: exp.paymentmethod,
  numberTimes: exp.numbertimes,
  created_at: exp.created_at
    ? new Date(exp.created_at).toLocaleString("pt-BR")
    : null,
  parent_id: exp.parent_id,
  installment_number: exp.installment_number,
  installment_month: exp.installment_month
});

// Criar gasto
app.post("/expenses", async (req, res) => {
  try {
    const { service, price, dueDate, paymentMethod, numberTimes } = req.body;
    const numTimes = parseInt(numberTimes, 10);

    // Inserir a conta principal
    const result = await pool.query(
      "INSERT INTO expenses (service, price, dueDate, paymentMethod, numberTimes, installment_number, installment_month) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [service, price, dueDate, paymentMethod, numTimes, 1, dueDate]
    );

    const mainExp = result.rows[0];
    const mainId = mainExp.id;

    // Se houver múltiplas parcelas, criar as parcelas dos meses subsequentes
    if (numTimes > 1) {
      const dueDateObj = new Date(dueDate);
      
      for (let i = 2; i <= numTimes; i++) {
        const nextMonth = new Date(dueDateObj);
        nextMonth.setMonth(nextMonth.getMonth() + (i - 1));
        
        const nextDueDateStr = nextMonth.toISOString().split('T')[0];
        
        await pool.query(
          "INSERT INTO expenses (service, price, dueDate, paymentMethod, numberTimes, parent_id, installment_number, installment_month) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
          [service, price, nextDueDateStr, paymentMethod, numTimes, mainId, i, nextDueDateStr]
        );
      }
    }

    res.json(formatExpense(mainExp));
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao adicionar despesa");
  }
});


// Listar gastos
app.get("/expenses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM expenses ORDER BY dueDate ASC");
    const formatted = result.rows.map(formatExpense);
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar despesas");
  }
});

// Listar gastos filtrados por mês
app.get("/expenses/month/:year/:month", async (req, res) => {
  try {
    const { year, month } = req.params;
    const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
    const endOfMonth = new Date(year, month, 0).toISOString().split('T')[0];
    
    const result = await pool.query(
      "SELECT * FROM expenses WHERE dueDate >= $1 AND dueDate <= $2 ORDER BY dueDate ASC",
      [startOfMonth, endOfMonth]
    );
    
    const formatted = result.rows.map(formatExpense);
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar despesas do mês");
  }
});

// Atualizar gasto
app.put("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { service, price, dueDate, paymentMethod, numberTimes } = req.body;
    const numTimes = parseInt(numberTimes, 10);
    
    // Buscar a despesa original
    const originalResult = await pool.query(
      "SELECT * FROM expenses WHERE id = $1",
      [id]
    );
    
    if (originalResult.rows.length === 0) {
      return res.status(404).json({ message: "Gasto não encontrado" });
    }
    
    const originalExp = originalResult.rows[0];
    
    // Se era a parcela 1 (conta principal), deletar todas as parcelas relacionadas
    if (originalExp.installment_number === 1 || !originalExp.parent_id) {
      await pool.query(
        "DELETE FROM expenses WHERE parent_id = $1 OR (id = $1 AND parent_id IS NULL)",
        [id]
      );
    }
    
    // Atualizar a conta principal
    const result = await pool.query(
      "UPDATE expenses SET service=$1, price=$2, dueDate=$3, paymentMethod=$4, numberTimes=$5, installment_month=$6 WHERE id=$7 RETURNING *",
      [service, price, dueDate, paymentMethod, numTimes, dueDate, id]
    );
    
    const updatedExp = result.rows[0];
    
    // Recriar as parcelas se numberTimes > 1
    if (numTimes > 1) {
      const dueDateObj = new Date(dueDate);
      
      for (let i = 2; i <= numTimes; i++) {
        const nextMonth = new Date(dueDateObj);
        nextMonth.setMonth(nextMonth.getMonth() + (i - 1));
        
        const nextDueDateStr = nextMonth.toISOString().split('T')[0];
        
        await pool.query(
          "INSERT INTO expenses (service, price, dueDate, paymentMethod, numberTimes, parent_id, installment_number, installment_month) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
          [service, price, nextDueDateStr, paymentMethod, numTimes, id, i, nextDueDateStr]
        );
      }
    }
    
    res.json(formatExpense(updatedExp));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar gasto" });
  }
});

// Remover gasto
app.delete("/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Se for a conta principal, deletar todas as parcelas
    await pool.query(
      "DELETE FROM expenses WHERE id = $1 OR parent_id = $1",
      [id]
    );
    
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