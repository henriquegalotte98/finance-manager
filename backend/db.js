import pkg from "pg"

const { Pool } = pkg

export const pool = new Pool({
  host: "dpg-d6d3g2stgctc73etgsh0-a.oregon-postgres.render.com",
  port: 5432,
  user: "finance_aplication_user",
  password: "g6k4n9tKjRKCnQ0ZEaKh5mVA5OG3Hclm",
  database: "finance_aplication",
  ssl: {
    rejectUnauthorized: false
  }
})