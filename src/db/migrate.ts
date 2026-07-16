import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  await sql`DROP TABLE IF EXISTS "users"`;

  await sql`
    CREATE TABLE IF NOT EXISTS "user" (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name VARCHAR(255) NOT NULL,
      age INTEGER NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE
    )
  `;

  console.log("user table ensured in Neon");
}

migrate().catch((error) => {
  console.error("Failed to create user table:", error);
  process.exit(1);
});
