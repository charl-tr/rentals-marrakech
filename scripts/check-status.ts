import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supa.from("properties").select("status, price_mad");
  if (!data) return;
  const statusCount: Record<string, number> = {};
  let withMad = 0;
  data.forEach((p: any) => {
    const s = p.status ?? "available";
    statusCount[s] = (statusCount[s] ?? 0) + 1;
    if (p.price_mad) withMad++;
  });
  console.log("Status distribution:", statusCount);
  console.log(`Properties with MAD price: ${withMad}/${data.length}`);
}
main();
