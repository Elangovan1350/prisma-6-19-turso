import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const app = new Hono();

const adapter = new PrismaLibSql({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
});
const prisma = new PrismaClient({ adapter });

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/tests", async (c) => {
  const tests = await prisma.test.findMany();
  return c.json(tests);
});

app.post("/tests", async (c) => {
  const { name, value } = await c.req.json();
  const newTest = await prisma.test.create({
    data: {
      name,
      value,
    },
  });
  return c.json(newTest);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
