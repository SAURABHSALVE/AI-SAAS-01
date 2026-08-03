import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const agents = await sql`SELECT id, name, user_id FROM agents`;
const users = await sql`SELECT id, email FROM "user"`;

console.log("AGENTS:", JSON.stringify(agents, null, 2));
console.log("USERS:", JSON.stringify(users, null, 2));
