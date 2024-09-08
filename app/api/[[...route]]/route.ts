import { Hono } from "hono";
import { handle } from "hono/vercel";
import accounts from "./accounts";
import categories from "./categories";
import transactions from "./transactions";
import summary from "./summary";
import plaid from "./plaid";
import subscriptions from "./subscription";
import test from "./test";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

const routes = app
  .route("/accounts", accounts)
  .route("/categories", categories)
  .route("/transactions", transactions)
  .route("/summary", summary)
  .route("/plaid", plaid)
  .route("/subscriptions", subscriptions)
  .route("/test", test);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

// ALWAYS HANDLE THE METHODS

export type AppType = typeof routes;
