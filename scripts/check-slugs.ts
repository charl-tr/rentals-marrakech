import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const slugs = [
    "charmant-riad-a-renover-au-coeur-de-la-medina",
    "villa-de-luxe-de-7-suites-avec-vue-sur-l-atlas-proposee-au-prix-du-terrain",
    "appartement-a-louer-dans-residence-golfique",
  ];
  for (const s of slugs) {
    const { data } = await supa
      .from("properties")
      .select("slug, listing, type, title")
      .eq("slug", s)
      .maybeSingle();
    console.log(s, "→", data ? `${data.listing} / ${data.type} / "${data.title?.slice(0, 50)}"` : "NOT IN DB");
  }
  // List actual slugs containing "charmant-riad"
  const { data: all } = await supa
    .from("properties")
    .select("slug")
    .ilike("slug", "%charmant-riad%");
  console.log("\nslugs starting with charmant-riad:");
  all?.forEach((r: any) => console.log(" ", r.slug));
}
main();
