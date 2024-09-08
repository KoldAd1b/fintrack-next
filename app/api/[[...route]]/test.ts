import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { Hono } from "hono";

import { eachDayOfInterval, format } from "date-fns";
import { convertAmountToMiliunits } from "@/lib/utils";
import { subDays } from "date-fns";
import { db } from "@/db/drizzle";
import { categories, accounts, transactions } from "@/db/schema";
import { HTTPException } from "hono/http-exception";
import { and, eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

const app = new Hono()
  .delete("/reset", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      throw new HTTPException(401, {
        res: c.json(
          {
            error: "Unauthorized",
          },
          401
        ),
      });
    }
    try {
      // Reset database with the associated userId

      //   Delete Accounts
      await db.delete(accounts).where(eq(accounts.userId, auth.userId));
      // Delete categories
      await db.delete(categories).where(eq(categories.userId, auth.userId));

      return c.json(
        {
          success: true,
        },
        200
      );
    } catch (err) {
      return c.json({ error: "Could not delete your data" }, 500);
    }
  })
  .post("/generate", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      throw new HTTPException(401, {
        res: c.json(
          {
            error: "Unauthorized",
          },
          401
        ),
      });
    }

    const AUTH_USER_ID = auth.userId;

    const [existingTransaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.testUserId, auth.userId));

    if (existingTransaction) {
      return c.json(
        {
          error: "Already generated test data",
        },
        403
      );
    }

    const TEST_CATEGORIES = [
      {
        id: createId() + AUTH_USER_ID + "- 1",
        name: "Food",
        userId: AUTH_USER_ID,
        plaidId: null,
      },
      {
        id: createId() + AUTH_USER_ID + "- 2",
        name: "Rent",
        userId: AUTH_USER_ID,
        plaidId: null,
      },
      {
        id: createId() + AUTH_USER_ID + "- 3",
        name: "Utilities",
        userId: AUTH_USER_ID,
        plaidId: null,
      },
      {
        id: createId() + AUTH_USER_ID + "- 4",
        name: "Clothing",
        userId: AUTH_USER_ID,
        plaidId: null,
      },
    ];

    const TEST_ACCOUNTS = [
      {
        id: createId() + AUTH_USER_ID + "- 1",
        name: "Checking",
        userId: AUTH_USER_ID,
        plaidId: null,
      },
      {
        id: createId() + AUTH_USER_ID + "- 1",
        name: "Savings",
        userId: AUTH_USER_ID,
        plaidId: null,
      },
    ];

    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 90);
    const TEST_TRANSACTIONS: (typeof transactions.$inferSelect)[] = [];

    const generateRandomAmount = (category: typeof categories.$inferInsert) => {
      switch (category.name) {
        case "Rent":
          return Math.random() * 400 + 90; // Rent will likely be a larger amount
        case "Utilities":
          return Math.random() * 200 + 50;
        case "Food":
          return Math.random() * 30 + 10;
        case "Transportation":
        case "Health":
          return Math.random() * 50 + 15;
        case "Entertainment":
        case "Clothing":
        case "Miscellaneous":
          return Math.random() * 100 + 20;
        default:
          return Math.random() * 50 + 10;
      }
    };

    const generateTransactionsForDay = (day: Date) => {
      const numTransactions = Math.floor(Math.random() * 4) + 1; // 1 to 4 transactions per day
      for (let i = 0; i < numTransactions; i++) {
        const category =
          TEST_CATEGORIES[Math.floor(Math.random() * TEST_CATEGORIES.length)];
        const isExpense = Math.random() > 0.6; // 60% chance of being an expense
        const amount = generateRandomAmount(category);
        const formattedAmount = convertAmountToMiliunits(
          isExpense ? -amount : amount
        ); // Negative for expenses

        TEST_TRANSACTIONS.push({
          id: `transaction_${format(day, "yyyy-MM-dd")}_${i}${
            createId() + AUTH_USER_ID
          }`,
          testUserId: auth.userId,
          accountId: TEST_ACCOUNTS[0].id, // Assuming always using the first account for simplicity
          categoryId: category.id,
          date: day,
          amount: formattedAmount,
          payee: "Merchant",
          notes: "Random transaction",
        });
      }
    };
    const generateTransactions = () => {
      const days = eachDayOfInterval({ start: defaultFrom, end: defaultTo });
      days.forEach((day) => generateTransactionsForDay(day));
    };

    try {
      generateTransactions();
    } catch (err) {
      return c.json({ error: "Could not generate the transactions" }, 500);
    }

    try {
      // Seed categories
      await db.insert(categories).values(TEST_CATEGORIES).execute();
      // Seed accounts
      await db.insert(accounts).values(TEST_ACCOUNTS).execute();
      // Seed transactions
      await db.insert(transactions).values(TEST_TRANSACTIONS).execute();

      return c.json(
        {
          success: true,
        },
        200
      );
    } catch (error) {
      console.error("Error during seed:", error);
      return c.json({ error: "Could not generate the transactions" }, 500);
    }
  });

export default app;
