import { NextRequest } from "next/server";
import { buildForecastUrl } from "@/lib/openmeteo";

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

  const current = [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "wind_speed_10m",
    "is_day",
    "weather_code",
  ];

  const hourly = [
    "temperature_2m",
    "apparent_temperature",
    "precipitation",
    "rain",
    "snowfall",
    "cloud_cover",
    "wind_speed_10m",
    "weather_code",
  ];

  const daily = [
    "temperature_2m_max",
    "temperature_2m_min",
    "sunrise",
    "sunset",
    "uv_index_max",
    "precipitation_sum",
    "weather_code",
  ];

  try {
    const url = buildForecastUrl({
      latitude: lat,
      longitude: lon,
      current,
      hourly,
      daily,
      timezone: tz,
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("timeout"), 10000);
    let resp: Response;
    try {
      resp = await fetch(url, { next: { revalidate: 600 }, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!resp.ok) throw new Error(`Upstream ${resp.status}`);
    const data = await resp.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, s-maxage=600, stale-while-revalidate=600",
      },
    });
  } catch (e: any) {
    const message = e?.name === "AbortError" ? "Weather fetch timed out" : (e?.message || "Weather fetch failed");
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}
