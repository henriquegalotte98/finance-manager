import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

import "./db.js";
import { pool } from "./db.js";

import coupleRoutes from "./routes/couple.routes.js";
import authRoutes from "./routes/auth.routes.js";
import expensesRoutes from "./routes/expenses.routes.js";
import featureRoutes, { ensureFeatureSchema } from "./routes/feature.routes.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();

console.log("ENV CHECK:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING"
});

// ================= CORS =================
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://finance-manager-chi-ashen.vercel.app",
    "https://finance-manager-tpzb.vercel.app"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});


// ================= MIDDLEWARE =================
app.use(express.json());
app.use(bodyParser.json());


// ================= ROUTES =================
app.use("/expenses", expensesRoutes);
app.use("/couple", coupleRoutes);
app.use("/auth", authRoutes);
app.use("/features", featureRoutes);


// ================= HEALTH =================
app.get("/", (_req, res) => res.send("ok"));
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));


// ================= CLOUDINARY =================
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Cloudinary não configurado!");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// ================= MULTER =================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});


// ================= USER =================
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

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ================= UPLOAD =================
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("REQ.FILE:", req.file);
    console.log("REQ.BODY:", req.body);

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId não informado" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error("Cloudinary não configurado");
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "finance-manager/profile",
          resource_type: "image"
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary error:", error);
            return reject(error);
          }
          resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    console.log("CLOUDINARY RESULT:", uploadResult);

    const result = await pool.query(
      "INSERT INTO arquivos (nome, caminho) VALUES ($1, $2) RETURNING id",
      [req.file.originalname, uploadResult.secure_url]
    );

    const novoArquivoId = result.rows[0].id;

    await pool.query(
      "UPDATE users SET profile_image_id=$1 WHERE id=$2",
      [novoArquivoId, userId]
    );

    res.json({ success: true, novoArquivoId });

  } catch (err) {
    console.error("ERRO REAL UPLOAD:", err);
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});


// ================= EXPENSES =================
function generateDate(baseDate, recurrence, index) {
  let d = new Date(baseDate);

  if (recurrence === "monthly") d.setMonth(d.getMonth() + index);
  else if (recurrence === "weekly") d.setDate(d.getDate() + 7 * index);
  else if (recurrence === "yearly") d.setFullYear(d.getFullYear() + index);

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
    const { service, price, paymentMethod, numberTimes, dueDate, recurrence } = req.body;

    const numTimes = parseInt(numberTimes || 1);

    const expense = await pool.query(
      `INSERT INTO expenses (service, price, paymentmethod, numbertimes, duedate, recurrence)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [service, price, paymentMethod, numTimes, dueDate, recurrence]
    );

    const expenseId = expense.rows[0].id;
    const parcelaValor = price / numTimes;
    const total = totalInstallments(numTimes, recurrence);

    for (let i = 0; i < total; i++) {
      const vencimento = generateDate(dueDate, recurrence, i);

      await pool.query(
        `INSERT INTO installments (expense_id, installment_number, amount, duedate)
         VALUES ($1,$2,$3,$4)`,
        [expenseId, i + 1, parcelaValor, vencimento]
      );
    }

    res.json({ message: "Despesa criada" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao adicionar despesa");
  }
});


// ================= DASHBOARD =================
app.get("/dashboard/month-total/:year/:month", async (req, res) => {
  const { year, month } = req.params;

  const result = await pool.query(
    `SELECT SUM(amount) as total
     FROM installments
     WHERE EXTRACT(YEAR FROM duedate)=$1
     AND EXTRACT(MONTH FROM duedate)=$2`,
    [year, month]
  );

  res.json(result.rows[0]);
});

app.get("/dashboard/alerts", async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.service, i.duedate, i.amount
      FROM installments i
      JOIN expenses e ON e.id = i.expense_id
      WHERE i.duedate BETWEEN NOW() AND NOW() + interval '7 days'
      ORDER BY i.duedate
    `);

    res.json(result.rows);
  } catch {
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


// ================= INIT =================
ensureFeatureSchema().catch(console.error);


// ================= EXPORT =================
export default app;


// ================= LOCAL =================
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
  });
}