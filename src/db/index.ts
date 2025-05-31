import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres/driver';
import { Pool } from 'pg';

import * as schema from './schema';

// Load environment variables from .env.local or .env.production based on NODE_ENV
const envFile = '.env.production';
dotenv.config({ path: envFile });

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'renavest',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.CA_CERT || undefined,
  },
});

// Create the Drizzle database instance
export const db = drizzle(pool, { schema });
