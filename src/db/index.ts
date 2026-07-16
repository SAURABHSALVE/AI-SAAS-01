import { drizzle } from 'drizzle-orm/neon-http';
import { usersTable } from './schema';

export const db = drizzle(process.env.DATABASE_URL!);

export { usersTable };
