#!/usr/bin/env node

import readline from 'readline';

import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres/driver';
import fetch from 'node-fetch';
import { Pool } from 'pg';

import { users } from '../db/schema';

// Helper to prompt for input
function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

async function getEnvConfig(env: 'production' | 'development') {
  dotenv.config({ path: env === 'production' ? '.env.production' : '.env.local' });
  return {
    clerkSecretKey: process.env.CLERK_SECRET_KEY,
    dbHost: process.env.DB_HOST || 'localhost',
    dbUser: process.env.DB_USER || 'postgres',
    dbPassword: process.env.DB_PASSWORD || '',
    dbName: env === 'production' ? 'renavest_prod' : process.env.DB_DATABASE || 'renavest',
    dbPort: parseInt(process.env.DB_PORT || '5432'),
    dbCa: process.env.CA_CERT || undefined,
  };
}

async function createClerkUser(
  email: string,
  firstName: string,
  lastName: string,
  imageUrl: string | undefined,
  clerkSecretKey: string,
): Promise<string> {
  const res = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email_address: [email],
      first_name: firstName,
      last_name: lastName,
      image_url: imageUrl,
      skip_password_checks: true,
      skip_password_requirement: true,
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create Clerk user: ${error}`);
  }
  const data = (await res.json()) as Record<string, any>;
  return data.id;
}

async function createDbUser(
  db: any,
  user: { clerkId: string; email: string; firstName: string; lastName: string; imageUrl?: string },
) {
  const now = createDate();
  const [created] = await db
    .insert(users)
    .values({
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
}

async function main() {
  // Determine environment
  const envArg = process.argv.find((arg) => arg === '--prod' || arg === '--production');
  const env: 'production' | 'development' = envArg ? 'production' : 'development';
  const config = await getEnvConfig(env);

  // Prompt for user details
  const email = process.argv[2] || (await prompt('Email: '));
  const firstName = process.argv[3] || (await prompt('First name: '));
  const lastName = process.argv[4] || (await prompt('Last name: '));
  const imageUrl = process.argv[5] || (await prompt('Image URL (optional): ')).trim() || undefined;

  if (!config.clerkSecretKey) throw new Error('Missing CLERK_SECRET_KEY');

  // Create Clerk user
  console.log(`Creating user in Clerk (${env})...`);
  const clerkId = await createClerkUser(
    email,
    firstName,
    lastName,
    imageUrl,
    config.clerkSecretKey,
  );
  console.log(`Clerk user created with ID: ${clerkId}`);

  // Create DB connection
  const pool = new Pool({
    host: config.dbHost,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    port: config.dbPort,
    ssl: config.dbCa ? { rejectUnauthorized: false, ca: config.dbCa } : undefined,
  });
  const db = drizzle(pool, { schema: { users } });

  // Create user in DB
  console.log(`Creating user in database (${config.dbName})...`);
  const dbUser = await createDbUser(db, { clerkId, email, firstName, lastName, imageUrl });
  console.log('User created in database:', dbUser);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
