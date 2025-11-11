export const OPEN_METEO_BASE = "https://api.open-meteo.com/v1";
export const OPEN_METEO_GEO = "https://geocoding-api.open-meteo.com/v1";
export const OPEN_METEO_AIR = "https://air-quality-api.open-meteo.com/v1";

export function buildForecastUrl(params: {
  latitude: number;
  longitude: number;
  hourly?: string[];
  daily?: string[];
  current?: string[];
  timezone?: string;
}) {
  const u = new URL(`${OPEN_METEO_BASE}/forecast`);
  u.searchParams.set("latitude", String(params.latitude));
  u.searchParams.set("longitude", String(params.longitude));
  if (params.current && params.current.length)
    u.searchParams.set("current", params.current.join(","));
  if (params.hourly && params.hourly.length)
    u.searchParams.set("hourly", params.hourly.join(","));
  if (params.daily && params.daily.length)
    u.searchParams.set("daily", params.daily.join(","));
  u.searchParams.set("timezone", params.timezone || "auto");
  return u.toString();
}

export function buildGeocodeUrl(query: string, count = 5, language = "en") {
  const u = new URL(`${OPEN_METEO_GEO}/search`);
  u.searchParams.set("name", query);
  u.searchParams.set("count", String(count));
  u.searchParams.set("language", language);
  u.searchParams.set("format", "json");
  return u.toString();
}

export function buildAirUrl(params: {
  latitude: number;
  longitude: number;
  hourly?: string[];
  timezone?: string;
}) {
  const u = new URL(`${OPEN_METEO_AIR}/air-quality`);
  u.searchParams.set("latitude", String(params.latitude));
  u.searchParams.set("longitude", String(params.longitude));
  if (params.hourly && params.hourly.length)
    u.searchParams.set("hourly", params.hourly.join(","));
  u.searchParams.set("timezone", params.timezone || "auto");
  return u.toString();
}
