import { defineConfig } from "drizzle-kit";

// drizzle-kit does not auto-load .env.local — load it here (Node >=20.6).
try {
  process.loadEnvFile(".env.local");
} catch {
  // file missing or unsupported Node — fall back to ambient env
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
