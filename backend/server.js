import dotenv from "dotenv"
dotenv.config()
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";



import "./db.js";

import coupleRoutes from "./routes/couple.routes.js"
import { getUserCoupleId } from "./utils/getUserCouple.js"
import authRoutes from "./routes/auth.routes.js"
import expensesRoutes from "./routes/expenses.routes.js"
import express from "express"
import cors from "cors"
import pkg from "pg"
import bodyParser from "body-parser"
import { pool } from "./db.js"
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware/auth.js"
import featureRoutes, { ensureFeatureSchema } from "./routes/feature.routes.js";
const app = express();


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://finance-manager-chi-ashen.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use("/expenses", expensesRoutes);
app.use("/couple", coupleRoutes);
app.use("/auth", authRoutes);
app.use("/features", featureRoutes);

app.use(bodyParser.json());

app.get("/", (_req, res) => {
  res.status(200).send("ok");
});

app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Necessário para resolver o caminho absoluto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");
const publicApiBaseUrl = process.env.PUBLIC_API_BASE_URL || "https://finance-manager-irdb.onrender.com";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});



if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


// Servir a pasta uploads como estática
app.use("/uploads", express.static(uploadsDir));



console.log("DATABASE_URL =", process.env.DATABASE_URL)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.get("/users/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, a.caminho
       FROM users u
       LEFT JOIN arquivos a ON u.profile_image_id = a.id
       WHERE u.id=$1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = result.rows[0];
    if (user.caminho) {
      user.caminho = user.caminho.replace(/\\/g, "/");
      if (!user.caminho.startsWith("http")) {
        user.caminho = `${publicApiBaseUrl}/${user.caminho}`;
      }
    }

    res.json(user);
  } catch (err) {
    console.error("ERRO REAL:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, a.caminho
FROM users u
LEFT JOIN arquivos a ON u.profile_image_id = a.id
WHERE u.id=$1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Corrige as barras invertidas
    const user = result.rows[0];
    if (user.caminho) {
      user.caminho = user.caminho.replace(/\\/g, "/");
      if (!user.caminho.startsWith("http")) {
        user.caminho = `${publicApiBaseUrl}/${user.caminho}`;
      }
    }

    res.json(user);
  } catch (err) {
    console.error("ERRO REAL:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId não informado" });
    }

    console.log("Arquivo recebido:", req.file);
    console.log("UserId recebido:", userId);

    const oldImageResult = await pool.query(
      "SELECT profile_image_id FROM users WHERE id=$1",
      [userId]
    );
    const oldImageId = oldImageResult.rows[0]?.profile_image_id;

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "finance-manager/profile",
      resource_type: "image"
    });

    const result = await pool.query(
      "INSERT INTO arquivos (nome, caminho) VALUES ($1, $2) RETURNING id",
      [req.file.originalname, uploadResult.secure_url]
    );
    const novoArquivoId = result.rows[0].id;

    await pool.query("UPDATE users SET profile_image_id=$1 WHERE id=$2", [
      novoArquivoId,
      userId,
    ]);

    if (oldImageId) {
      await pool.query("DELETE FROM arquivos WHERE id=$1", [oldImageId]);
    }

    res.json({ success: true, novoArquivoId });
  } catch (err) {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);

    console.error("Erro no upload:", err);
    res.status(500).json({ error: "Erro no upload" });
  }
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
        e.price,
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
SELECT i.duedate, e.service
FROM installments i
JOIN expenses e ON e.id = i.expense_id
`
  )

  res.json(result.rows)

})
app.get("/dashboard/alerts", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.service, i.duedate, i.amount
      FROM installments i
      JOIN expenses e ON e.id = i.expense_id
      WHERE i.duedate BETWEEN NOW() AND NOW() + interval '7 days'
      ORDER BY i.duedate
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
        TO_CHAR(i.duedate,'Mon') as month,
        SUM(i.amount) as total
      FROM installments i
      GROUP BY TO_CHAR(i.duedate,'Mon')
      ORDER BY MIN(i.duedate)
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});


ensureFeatureSchema().catch((err) => {
  console.error("Erro ao preparar schema de features:", err);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


app.put("/users/:id/profile-image", async (req, res) => {
  const { id } = req.params;
  const { imageId } = req.body; // id da tabela arquivos

  try {
    await pool.query(
      "UPDATE users SET profile_image_id=$1 WHERE id=$2",
      [imageId, id]
    );
    res.json({ message: "Foto de perfil atualizada!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar foto de perfil");
  }
});