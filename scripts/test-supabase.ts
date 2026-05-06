/**
 * Test connexion Supabase + vérifie que les tables existent.
 * Run: npx tsx scripts/test-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error("Manquant : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const tables = ["properties", "advisors", "neighborhoods", "journal_articles"];
  for (const t of tables) {
    const { count, error } = await supabase
      .from(t)
      .select("*", { count: "exact", head: true });
    if (error) {
      console.log(`✗ ${t.padEnd(20)} ${error.message}`);
    } else {
      console.log(`✓ ${t.padEnd(20)} ${count ?? 0} rows`);
    }
  }
}

main().then(() => process.exit(0));
