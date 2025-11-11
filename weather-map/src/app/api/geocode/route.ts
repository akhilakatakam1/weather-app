import { NextRequest } from "next/server";
import { buildGeocodeUrl } from "@/lib/openmeteo";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const count = Number(searchParams.get("count") || "5");
  const language = searchParams.get("language") || "en";

  if (!q || q.trim().length < 2) {
    return new Response(JSON.stringify({ error: "Missing or too short query" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const url = buildGeocodeUrl(q, count, language);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), 10000);
    let resp: Response;
    try {
      resp = await fetch(url, { next: { revalidate: 3600 }, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!resp.ok) throw new Error(`Upstream ${resp.status}`);
    const data = await resp.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (e: any) {
    const message = e?.name === "AbortError" ? "Geocoding fetch timed out" : (e?.message || "Geocoding failed");
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}
