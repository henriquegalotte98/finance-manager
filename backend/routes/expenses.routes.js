import express from "express"
import { pool } from "../db.js"

const router = express.Router()

/*router.post("/", async (req, res) => {

  const { service, price } = req.body

  try {

    await pool.query(
      "INSERT INTO expenses (service, amount) VALUES ($1,$2)",
      [service, price]
    )

    res.json({ message: "Despesa criada" })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao criar despesa" })
  }

})*/

export default router