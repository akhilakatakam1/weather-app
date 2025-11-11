"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Thermometer, Wind, Droplets, Sun } from "lucide-react";

type WeatherData = any;
type AirData = any;

export default function Home() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [air, setAir] = useState<AirData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported. Search coming next.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
      },
      () => setError("Failed to get location. Allow permission or search."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      if (!coords) return;
      setLoading(true);
      setError(null);
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "auto";
        const [w, a] = await Promise.all([
          fetch(`/api/weather?lat=${coords.lat}&lon=${coords.lon}&tz=${encodeURIComponent(tz)}`),
          fetch(`/api/air?lat=${coords.lat}&lon=${coords.lon}&tz=${encodeURIComponent(tz)}`),
        ]);
        if (!w.ok) throw new Error("Weather fetch failed");
        if (!a.ok) throw new Error("Air quality fetch failed");
        setWeather(await w.json());
        setAir(await a.json());
      } catch (e: any) {
        setError(e?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [coords]);

  return (
    <main className="min-h-screen p-6 md:p-10 bg-gradient-to-b from-sky-100 to-white dark:from-sky-950 dark:to-black">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dashboard</h1>
          <a className="text-sky-700 hover:underline font-medium" href="/map">Open Map →</a>
        </header>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="animate-pulse text-sm text-gray-600">Loading data…</div>
        )}

        {coords && (
          <div className="text-sm text-gray-500">
            Location: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
          </div>
        )}

        {weather && (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="font-medium">Current Weather</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-sky-700" />
                  <div>
                    <div className="text-gray-500">Temperature</div>
                    <div className="text-lg font-medium">
                      {weather.current?.temperature_2m}
                      <span className="text-gray-500 text-sm">°C</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div>
                    <div className="text-gray-500">Feels like</div>
                    <div className="text-lg font-medium">
                      {weather.current?.apparent_temperature}
                      <span className="text-gray-500 text-sm">°C</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-cyan-600" />
                  <div>
                    <div className="text-gray-500">Humidity</div>
                    <div className="text-lg font-medium">
                      {weather.current?.relative_humidity_2m}
                      <span className="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wind className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="text-gray-500">Wind</div>
                    <div className="text-lg font-medium">
                      {weather.current?.wind_speed_10m}
                      <span className="text-gray-500 text-sm"> km/h</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {air && (
          <Card>
            <CardHeader>
              <h2 className="font-medium">Air Quality (hourly)</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">PM2.5</div>
                  <div className="text-lg font-medium">
                    {air.hourly?.pm2_5?.[0] ?? "-"}
                    <span className="text-gray-500 text-sm"> μg/m³</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">PM10</div>
                  <div className="text-lg font-medium">
                    {air.hourly?.pm10?.[0] ?? "-"}
                    <span className="text-gray-500 text-sm"> μg/m³</span>
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Ozone</div>
                  <div className="text-lg font-medium">{air.hourly?.ozone?.[0] ?? "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500">UV Index</div>
                  <div className="text-lg font-medium">{air.hourly?.uv_index?.[0] ?? "-"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <footer className="text-xs text-gray-500 pt-4">
          Data by Open‑Meteo. Map tiles by OpenStreetMap contributors.
        </footer>
      </div>
    </main>
  );
}
