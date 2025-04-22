import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres/driver';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres/driver';
import fetch from 'node-fetch';
import { Pool } from 'pg';

import { users } from '@/src/db/schema';
import * as schema from '@/src/db/schema';

interface User {
  id: number;
  email: string;
  clerkId: string;
  firstName?: string | null;
  lastName?: string | null;
}

interface ClerkUser {
  id: string;
  email_addresses?: { email_address: string }[];
  [key: string]: unknown;
}

async function getClerkUserByEmail(
  email: string,
  clerkSecretKey: string,
): Promise<ClerkUser | null> {
  const res = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
    },
  );
  if (!res.ok) return null;
  const users = (await res.json()) as ClerkUser[];
  console.log(users);
  return Array.isArray(users) && users.length > 0 ? users[0] : null;
}

async function createClerkUser(
  email: string,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
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
      first_name: firstName || email.split('@')[0],
      last_name: lastName || '',
      skip_password_checks: true,
      skip_password_requirement: true,
    }),
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create Clerk user: ${error}`);
  }
  const data = (await res.json()) as ClerkUser;
  return data.id;
}

interface DbConnection {
  db: NodePgDatabase<typeof schema>;
  pool: Pool;
}

async function createDbConnection(env: 'production' | 'development'): Promise<DbConnection> {
  dotenv.config({ path: env === 'production' ? '.env.production' : '.env.local' });

  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: env === 'production' ? 'renavest_prod' : process.env.DB_DATABASE || 'renavest',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: {
      rejectUnauthorized: false,
      ca: process.env.CA_CERT || undefined,
    },
  });

  return {
    db: drizzle(pool, { schema }),
    pool,
  };
}

async function syncUsers(env: 'production' | 'development') {
  console.log(`Starting sync for ${env} environment`);

  // Load environment variables
  dotenv.config({ path: env === 'production' ? '.env.production' : '.env.local' });
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) {
    throw new Error(`Missing CLERK_SECRET_KEY for ${env}`);
  }

  // Create database connection
  const { db, pool } = await createDbConnection(env);
  console.log(`Connected to database for ${env}`);

  try {
    // Fetch all users
    const allUsers: User[] = await db
      .select({
        id: users.id,
        email: users.email,
        clerkId: users.clerkId,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users);

    console.log(`Found ${allUsers.length} users to process`);

    let updated = 0;
    let created = 0;

    for (const user of allUsers) {
      if (!user.email) continue;
      let clerkUser = await getClerkUserByEmail(user.email, clerkSecretKey);
      if (!clerkUser) {
        // Create Clerk user
        const clerkId = await createClerkUser(
          user.email,
          user.firstName,
          user.lastName,
          clerkSecretKey,
        );
        clerkUser = { id: clerkId };
        created++;
        console.log(`[${env}] Created Clerk user for ${user.email}`);
      }
      if (user.clerkId !== clerkUser.id) {
        await db.update(users).set({ clerkId: clerkUser.id }).where(eq(users.id, user.id));
        updated++;
        console.log(`[${env}] Updated user ${user.email} clerkId to ${clerkUser.id}`);
      }
    }

    console.log(`[${env}] Done. Created: ${created}, Updated: ${updated}`);
  } finally {
    // Ensure pool is always closed
    await pool.end();
  }
}

async function main() {
  await syncUsers('production');
  // await syncUsers('development');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
