import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const REAL_USER_ID = "KJGeLAMdrH2ODoTI6wEpkiosIx55Gflu"; // saurabhsalve9999@gmail.com

const result = await sql`
  UPDATE agents
  SET user_id = ${REAL_USER_ID}
  WHERE user_id = 'user_123'
  RETURNING id, name, user_id
`;

console.log("Updated agents:", JSON.stringify(result, null, 2));
