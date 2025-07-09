import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres/driver';
import { Pool } from 'pg';

import * as schema from './schema';

// Load environment variables from .env.local or .env.production based on NODE_ENV
const envFile = '.env.local';
dotenv.config({ path: envFile });

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Create a connection pool with secure defaults
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: process.env.CA_CERT,
  } : {
    rejectUnauthorized: false,
    ca: process.env.CA_CERT || undefined,
  },
});

// Create the Drizzle database instance
export const db = drizzle(pool, { schema });
