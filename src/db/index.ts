import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres/driver';
import { Pool } from 'pg';

import * as schema from './schema';

// Load environment variables from .env.local or .env.production based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local';
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

// Log the pool connection details
console.log('Database connection pool created with the following details:');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('User:', process.env.DB_USER || 'postgres');
console.log('Database:', process.env.DB_DATABASE || 'renavest');
console.log('Port:', parseInt(process.env.DB_PORT || '5432'));
console.log('SSL:', {
  rejectUnauthorized: false,
  ca: process.env.CA_CERT ? 'Configured' : 'Not configured',
});

// Create the Drizzle database instance
export const db = drizzle(pool, { schema });

// Optional: Add a method to end the pool when the application closes
const closeDbConnection = () => pool.end();

;
