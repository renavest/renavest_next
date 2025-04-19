#!/usr/bin/env node
/* eslint-env node */
/* global process */

import readline from 'readline';

import { Clerk } from '@clerk/backend';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

import { db } from '../db/index.js';
import { users } from '../db/schema.js';


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function deleteUserFromClerk(email, clerkSecretKey, envLabel) {
  console.log(`Attempting to delete user ${email} from Clerk (${envLabel})...`);
  try {
    const clerk = Clerk({ secretKey: clerkSecretKey });
    const usersList = await clerk.users.getUserList({ email });
    if (usersList.length > 0) {
      const userId = usersList[0].id;
      console.log(`Found Clerk user with ID: ${userId}. Deleting...`);
      await clerk.users.deleteUser(userId);
      console.log(`Successfully deleted user ${email} (Clerk ID: ${userId}) from Clerk (${envLabel}).`);
      return true;
    } else {
      console.log(`User with email ${email} not found in Clerk (${envLabel}).`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting user ${email} from Clerk (${envLabel}):`, error);
    return false;
  }
}

async function deleteUserFromDatabase(email, dbConnectionString, envLabel) {
  console.log(`Attempting to delete user ${email} from database (${envLabel})...`);
  const originalDatabaseUrl = process.env.DATABASE_URL;
  try {
    process.env.DATABASE_URL = dbConnectionString;
    // Use the imported db instance (assumes it reads DATABASE_URL at runtime)
    await db.delete(users).where(eq(users.email, email));
    console.log(`Attempted to delete user ${email} from database (${envLabel}). Please verify.`);
    return true;
  } catch (error) {
    console.error(`Error deleting user ${email} from database (${envLabel}):`, error);
    return false;
  } finally {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
}

async function runDeleteScript() {
  const emailToDelete = process.argv[2];
  if (!emailToDelete) {
    console.error('Usage: node scripts/delete-user.js <email>');
    process.exit(1);
  }

  console.log(`\nWARNING: This will attempt to permanently delete user ${emailToDelete} from:\n- Clerk (Development)\n- Clerk (Production)\n- Database (renavest_dev)\n- Database (renavest_prod)\n`);

  rl.question('Are you sure you want to proceed? (y/n): ', async (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Deletion cancelled.');
      rl.close();
      process.exit(0);
    }

    // Load .env.local (Development)
    dotenv.config({ path: '.env.local' });
    const devClerkSecretKey = process.env.CLERK_SECRET_KEY;
    const devDbUser = process.env.DB_USER;
    const devDbPassword = process.env.DB_PASSWORD;
    const devDbHost = process.env.DB_HOST;
    const devDbPort = process.env.DB_PORT;
    const devDbName = process.env.DB_DATABASE;
    const devDatabaseUrl = devDbUser && devDbPassword && devDbHost && devDbPort && devDbName
      ? `postgres://${devDbUser}:${devDbPassword}@${devDbHost}:${devDbPort}/${devDbName}`
      : undefined;

    // Load .env.production (Production)
    dotenv.config({ path: '.env.production' });
    const prodClerkSecretKey = process.env.CLERK_SECRET_KEY;
    const prodDbUser = process.env.DB_USER;
    const prodDbPassword = process.env.DB_PASSWORD;
    const prodDbHost = process.env.DB_HOST;
    const prodDbPort = process.env.DB_PORT;
    const prodDbName = process.env.DB_DATABASE;
    const prodDatabaseUrl = prodDbUser && prodDbPassword && prodDbHost && prodDbPort && prodDbName
      ? `postgres://${prodDbUser}:${prodDbPassword}@${prodDbHost}:${prodDbPort}/${prodDbName}`
      : undefined;

    // 1. Delete from Clerk (Development)
    if (!devClerkSecretKey) {
      console.error('Missing DEV CLERK_SECRET_KEY. Cannot proceed with Clerk DEV deletion.');
    } else {
      await deleteUserFromClerk(emailToDelete, devClerkSecretKey, 'Development');
    }

    // 2. Delete from Clerk (Production)
    if (!prodClerkSecretKey) {
      console.error('Missing PROD CLERK_SECRET_KEY. Cannot proceed with Clerk PROD deletion.');
    } else {
      await deleteUserFromClerk(emailToDelete, prodClerkSecretKey, 'Production');
    }

    // 3. Delete from Database (renavest_dev)
    if (!devDatabaseUrl) {
      console.error('Missing DEV DATABASE_URL. Cannot proceed with renavest_dev DB deletion.');
    } else {
      await deleteUserFromDatabase(emailToDelete, devDatabaseUrl, 'renavest_dev');
    }

    // 4. Delete from Database (renavest_prod)
    if (!prodDatabaseUrl) {
      console.error('Missing PROD DATABASE_URL. Cannot proceed with renavest_prod DB deletion.');
    } else {
      await deleteUserFromDatabase(emailToDelete, prodDatabaseUrl, 'renavest_prod');
    }

    console.log('\nDeletion process finished.');
    rl.close();
  });
}

runDeleteScript(); 