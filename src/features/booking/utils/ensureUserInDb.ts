import { clerkClient } from '@clerk/nextjs/server';

import { db } from '@/src/db';
import { users } from '@/src/db/schema';

/**
 * Ensures a user exists in the DB by Clerk ID or email. If not, fetches from Clerk and inserts.
 * Returns the user row from the DB.
 */
export async function ensureUserInDb({ clerkId, email }: { clerkId?: string; email?: string }) {
  if (!clerkId && !email) throw new Error('Must provide clerkId or email');

  // Try to find by Clerk ID
  let user = clerkId
    ? await db.query.users.findFirst({ where: (u, { eq }) => eq(u.clerkId, clerkId) })
    : null;

  // Try to find by email if not found
  if (!user && email) {
    user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, email) });
  }

  if (user) return user;

  // Fetch from Clerk
  const clerk = await clerkClient();
  let clerkUser;
  if (clerkId) {
    clerkUser = await clerk.users.getUser(clerkId);
  } else if (email) {
    const usersList = await clerk.users.getUserList({ emailAddress: [email] });
    clerkUser = usersList.data[0];
  }
  if (!clerkUser) throw new Error('User not found in Clerk');

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) throw new Error('No email found for Clerk user');

  // Insert into DB
  const [inserted] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email: primaryEmail,
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      imageUrl: clerkUser.imageUrl || null,
      isActive: true,
      createdAt: createDate(clerkUser.createdAt),
      updatedAt: createDate(clerkUser.updatedAt),
    })
    .returning();

  return inserted;
}
