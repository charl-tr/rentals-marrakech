import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const schema = z.object({ sessionId: z.uuid(), event: z.enum(["property_view", "favorite_add"]), slug: z.string().min(1).max(250).regex(/^[a-zA-Z0-9_-]+$/) }).strict();
// Best-effort per-instance backstop; use an edge rate-limit rule for production abuse protection.
const requests = new Map<string, { count: number; expires: number }>();
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return new NextResponse(null, { status: 403 });
  if (Number(request.headers.get("content-length")) > 1024) return new NextResponse(null, { status: 413 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const now = Date.now();
  for (const [key, value] of requests) if (value.expires <= now) requests.delete(key);
  const bucket = requests.get(ip) ?? { count: 0, expires: now + 60_000 };
  if (++bucket.count > 120 || requests.size > 10_000) return new NextResponse(null, { status: 429 });
  requests.set(ip, bucket);
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 1024) return new NextResponse(null, { status: 413 });
    body = schema.safeParse(JSON.parse(raw));
  } catch { return new NextResponse(null, { status: 400 }); }
  if (!body.success) return new NextResponse(null, { status: 400 });
  const { slug, sessionId, event } = body.data;
  const { data: property } = await supabaseAdmin.from("properties").select("slug").eq("slug", slug).eq("published", true).maybeSingle();
  if (!property) return new NextResponse(null, { status: 404 });
  const { error } = await supabaseAdmin.from("conversion_events").upsert({ session_id: sessionId, property_slug: slug, event }, { onConflict: "session_id,event,property_slug", ignoreDuplicates: true });
  if (error) {
    console.error("[conversion] Storage unavailable:", error.code);
    return NextResponse.json({ error: "Measurement unavailable" }, { status: 503 });
  }
  return new NextResponse(null, { status: 204 });
}
