import { ECB_RATES_URL, parseEcbRates } from "@/lib/fx";

export async function GET() {
  try {
    const response = await fetch(ECB_RATES_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Exchange feed unavailable");
    const rates = parseEcbRates(await response.text());
    return Response.json(rates, { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" } });
  } catch {
    // Preserve recorded EUR/MAD if FX is unavailable; never fabricate a rate.
    return Response.json({ error: "Exchange rates temporarily unavailable" }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
}
