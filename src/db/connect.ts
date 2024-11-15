import { drizzle } from 'drizzle-orm/node-postgres';
import pg from "pg";
import config from '../common/config';

const pool = new pg.Pool({
    connectionString: config.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
})
export const db = drizzle(pool);
