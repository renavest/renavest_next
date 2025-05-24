Absolutely — here’s a full **Stripe architecture and interaction map** for your 3-party system:

---

# ✅ Stripe Setup for Renavest (Employers, Employees, Therapists)

### 🎯 Goal:

Enable a system where:

* **Employees** subscribe or book sessions
* **Employers** optionally **subsidize** subscriptions or sessions
* **Therapists** get paid via Stripe Connect
* **Renavest** keeps a platform fee (subscription or per-session %)

---

## 🧩 Key Stripe Components

| Component                             | Purpose                                       |
| ------------------------------------- | --------------------------------------------- |
| **Stripe Connect (Marketplace)**      | Pay therapists (with Express accounts)        |
| **Subscriptions**                     | Recurring access to async financial therapy   |
| **One-off payments (PaymentIntents)** | Live sessions booked a la carte               |
| **Customer balance**                  | Employer subsidy credits for employees        |
| **Transfers / Application fees**      | Revenue split between Renavest and therapists |
| **Promo codes / Coupons (optional)**  | Employer discounts on sessions                |

---

# 👥 Stakeholder Interactions

---

## 👩‍💼 EMPLOYEE

### A. **Subscriptions**

* Signs up → enters card info → starts free trial.
* Chooses a plan (Starter, Core, Family+).
* Pays monthly unless employer has applied subsidy.

**Stripe Flow:**

```text
Customer (employee)
→ Subscription Product (with optional balance credit applied)
→ Stripe charges employee for their share
→ 60% of revenue added to Renavest’s Therapist Pool for credits
```

### B. **Session Booking**

* Employee books a live session.
* If Google Meet is joined, Renavest charges them **36 hours later**.
* Therapist is paid **automatically via Connect**.

**Stripe Flow:**

```text
Customer (employee)
→ PaymentIntent (post-session)
→ Therapist receives 90% via `transfer_data.destination`
→ Renavest keeps 10% via `application_fee_amount`
```

---

## 🧑‍💼 EMPLOYER

### A. **Subscription Subsidies**

* Employer commits to covering part of subscription (e.g., \$2 for Starter).
* You **charge employer directly** via invoice or Checkout.
* Then, you **add balance credit** to each employee’s Stripe customer.

**Stripe Flow:**

```text
Employer charged → platform receives funds
→ You call `customers.createBalanceTransaction(employee_id, -200)`
→ Stripe auto-applies that $2 to employee’s next subscription charge
```

### B. **Session Subsidies**

* Employer agrees to cover part or all of session cost.
* Two options:

  * **Balance credit** (same as above)
  * **Promo code** for fixed discount (e.g., \$100 off)

**Stripe Flow:**

```text
Employer pays → platform allocates subsidy
→ When employee books, charge is reduced
→ Remaining balance (if any) is paid by employee
→ Therapist still receives full amount via Connect split
```

---

## 👩‍⚕️ THERAPIST

* Onboarded via **Stripe Connect Express**
* No access to dashboard unless you give it via Stripe
* Paid **\$4 per async reply** from Therapist Pool (batch ACH weekly)
* Paid **90% of live sessions**, 36h after session verification

**Stripe Flow:**

```text
Async credits:
  Subscription → 60% → Therapist Pool → $4 per reply via ACH (Friday)

Live sessions:
  PaymentIntent → `transfer_data.destination = therapist_account`
  → 90% paid to therapist automatically
  → 10% to Renavest (via `application_fee_amount`)
```

---

## 🏛️ RENAVEST (Platform)

* Owns and configures:

  * All Stripe products & subscriptions
  * All `PaymentIntent` creation and credit logic
  * Subsidy allocation and employer billing
* Keeps platform fee:

  * **40% of subscription**
  * **10% of live session**
* Pays out therapist share weekly
* Handles fraud/chargeback risk

---

# 🧾 Stripe Account Configuration Summary

| Feature                      | Stripe Feature You Use                  |
| ---------------------------- | --------------------------------------- |
| Therapist payouts            | **Stripe Connect – Express**            |
| Async therapy credits        | **Subscription Products**               |
| Session monetization         | **PaymentIntents + Transfers + Fees**   |
| Employer subsidies           | **Customer balance** or **Promo codes** |
| Revenue split                | **Application fee + transfer\_data**    |
| Subscription trial & billing | **trial\_period\_days + card capture**  |

---

Would you like:

* A **sample schema** to track balances/credits for employees?
* A **diagram** of this 3-party flow?
* A **Stripe API handler template** for post-session charges?

Just say the word — I can generate whichever would help most.


// === Additional Tables for Stripe-Backed Subsidy & Payment Flows ===

// 1. Stripe Customer Linking Table
export const stripeCustomers = pgTable('stripe_customers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Employer Subsidy Credits (applied to employees)
export const employerSubsidies = pgTable('employer_subsidies', {
  id: serial('id').primaryKey(),
  employerId: integer('employer_id')
    .references(() => employers.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  creditAmountCents: integer('credit_amount_cents').notNull(), // e.g., 200 = $2.00
  reason: text('reason'), // e.g., 'Starter plan subsidy'
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Therapist Payout Ledger
export const therapistPayouts = pgTable('therapist_payouts', {
  id: serial('id').primaryKey(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id, { onDelete: 'cascade' })
    .notNull(),
  bookingSessionId: integer('booking_session_id')
    .references(() => bookingSessions.id, { onDelete: 'cascade' })
    .notNull(),
  amountCents: integer('amount_cents').notNull(), // e.g., 13500 = $135.00
  stripeTransferId: varchar('stripe_transfer_id', { length: 255 }),
  paidAt: timestamp('paid_at'),
  status: varchar('status', { length: 50 }).default('pending'), // pending, completed, failed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Session Payments (Stripe receipts)
export const sessionPayments = pgTable('session_payments', {
  id: serial('id').primaryKey(),
  bookingSessionId: integer('booking_session_id')
    .references(() => bookingSessions.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }).notNull().unique(),
  totalAmountCents: integer('total_amount_cents').notNull(),
  subsidyUsedCents: integer('subsidy_used_cents').default(0).notNull(),
  outOfPocketCents: integer('out_of_pocket_cents').notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  chargedAt: timestamp('charged_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


