import { NextRequest } from "next/server";
import { buildAirUrl } from "@/lib/openmeteo";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const tz = searchParams.get("tz") || "auto";

  if (!isFinite(lat) || !isFinite(lon)) {
    return new Response(JSON.stringify({ error: "lat/lon required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const hourly = [
    "pm10",
    "pm2_5",
    "carbon_monoxide",
    "nitrogen_dioxide",
    "sulphur_dioxide",
    "ozone",
    "uv_index",
  ];

  try {
    const url = buildAirUrl({ latitude: lat, longitude: lon, hourly, timezone: tz });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), 10000);
    let resp: Response;
    try {
      resp = await fetch(url, { next: { revalidate: 1800 }, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!resp.ok) throw new Error(`Upstream ${resp.status}`);
    const data = await resp.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, s-maxage=1800, stale-while-revalidate=600",
      },
    });
  } catch (e: any) {
    const message = e?.name === "AbortError" ? "Air quality fetch timed out" : (e?.message || "Air quality fetch failed");
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}
