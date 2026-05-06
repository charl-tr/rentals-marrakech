/**
 * Run a single SQL migration file via Supabase REST.
 * Usage: npx tsx scripts/run-migration.ts supabase/migrations/0002_property_status.sql
 *
 * Note: Supabase JS SDK ne supporte pas l'exécution de SQL arbitraire — on passe
 * par une RPC `pg_query` ou on copie-colle dans le SQL Editor du dashboard.
 * Pour les besoins du démo, on exécute via l'API REST si possible, sinon on
 * affiche les instructions.
 */
import { readFileSync } from "node:fs";
import { config } from "dotenv";
config({ path: ".env.local" });

const file = process.argv[2];
if (!file) {
  console.error("Usage: tsx scripts/run-migration.ts <path-to-sql>");
  process.exit(1);
}

const sql = readFileSync(file, "utf-8");
console.log("\n═══ MIGRATION SQL ═══");
console.log(sql);
console.log("\n═══ INSTRUCTIONS ═══");
console.log("Copier le SQL ci-dessus dans Supabase Dashboard → SQL Editor → Run.");
console.log(
  "(Le SDK supabase-js ne permet pas l'exécution de DDL arbitraire ; le " +
    "passage par le SQL Editor est l'approche standard.)\n"
);
