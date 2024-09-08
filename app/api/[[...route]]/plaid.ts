import { db } from "@/db/drizzle";
import {
  accounts,
  categories,
  connectedBanks,
  transactions,
} from "@/db/schema";
import { convertAmountToMiliunits } from "@/lib/utils";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, isNotNull } from "drizzle-orm";
import { Hono } from "hono";
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";
import { z } from "zod";

const config = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_TOKEN,
      "PLAID-SECRET": process.env.PLAID_SECRET_TOKEN,
    },
  },
});

const client = new PlaidApi(config);

const app = new Hono()
  .get("/connected-bank", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }
    const [connectedBank] = await db
      .select()
      .from(connectedBanks)
      .where(eq(connectedBanks.userId, auth.userId));

    return c.json({
      data: connectedBank || null,
    });
  })
  .post("/create-link-token", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }
    const token = await client.linkTokenCreate({
      user: {
        client_user_id: auth.userId,
      },
      client_name: "FinTrack",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });

    return c.json(
      {
        data: token.data.link_token,
      },
      200
    );
  })
  .post(
    "/exchange-public-token",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        publicToken: z.string(),
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const { publicToken } = c.req.valid("json");

      if (!auth?.userId) {
        return c.json(
          {
            error: "Unauthorized",
          },
          401
        );
      }

      const exchangeToken = await client.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const [connectedBank] = await db
        .insert(connectedBanks)
        .values({
          id: createId(),
          userId: auth.userId,
          accessToken: exchangeToken.data.access_token,
        })
        .returning();

      const plaidTransactions = await client.transactionsSync({
        access_token: connectedBank.accessToken,
      });
      const plaidAccounts = await client.accountsGet({
        access_token: connectedBank.accessToken,
      });
      const plaidCategories = await client.categoriesGet({});
      const newAccounts = await db
        .insert(accounts)
        .values(
          plaidAccounts.data.accounts.map((account) => {
            return {
              id: createId(),
              name: account.name,
              plaidId: account.account_id,
              userId: auth.userId,
            };
          })
        )
        .returning();

      const newCategories = await db
        .insert(categories)
        .values(
          plaidCategories.data.categories.map((category) => {
            return {
              id: createId(),
              name: category.hierarchy.join(", "),
              plaidId: category.category_id,
              userId: auth.userId,
            };
          })
        )
        .returning();

      const newTransactionValues = plaidTransactions.data.added.reduce(
        (acc, transaction) => {
          const account = newAccounts.find(
            (account) => account.plaidId === transaction.account_id
          );
          const category = newCategories.find(
            (category) => category.plaidId === transaction.category_id
          );
          const amountInMiliunits = convertAmountToMiliunits(
            transaction.amount
          );
          if (account) {
            acc.push({
              id: createId(),

              amount: amountInMiliunits,
              payee: transaction.merchant_name || transaction.name,
              notes: transaction.name,
              date: new Date(transaction.date),
              accountId: account.id,
              categoryId: category?.id,
            });
          }
          return acc;
        },
        [] as (typeof transactions.$inferInsert)[]
      );
      if (newTransactionValues.length > 0) {
        await db.insert(transactions).values(newTransactionValues);
      }

      return c.json({ ok: true }, 200);
    }
  )
  .delete("/connected-bank", clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401
      );
    }
    const [connectedBank] = await db
      .delete(connectedBanks)
      .where(eq(connectedBanks.userId, auth.userId))
      .returning({
        id: connectedBanks.id,
      });

    await db
      .delete(accounts)
      .where(
        and(eq(accounts.userId, auth.userId), isNotNull(accounts.plaidId))
      );

    await db
      .delete(categories)
      .where(
        and(eq(categories.userId, auth.userId), isNotNull(categories.plaidId))
      );

    if (!connectedBank) {
      return c.json(
        {
          error: "Not found",
        },
        404
      );
    }
    return c.json({
      data: connectedBank || null,
    });
  });

export default app;
