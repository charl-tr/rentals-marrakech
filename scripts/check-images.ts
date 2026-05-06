import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supa
    .from("properties")
    .select("slug, images")
    .in("slug", ["villa-essaouira-vue-mer-diabat", "riad-renove-medina-koutoubia"]);
  data?.forEach((p: any) => {
    console.log(p.slug);
    (p.images as string[]).forEach((i: string) => console.log("  " + i.slice(0, 130)));
  });
}
main();
