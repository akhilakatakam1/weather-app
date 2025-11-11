"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leafletRef.current) return;
    const container = mapRef.current;
    if (!container) return;

    // Ensure the container has non-zero size before initializing Leaflet
    const hasSize = () => (container.offsetWidth > 0 && container.offsetHeight > 0);

    const initMap = () => {
      if (!mapRef.current || leafletRef.current) return;
      const map = L.map(mapRef.current, { zoomControl: true });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      map.setView([20, 0], 2);
      map.whenReady(() => {
        map.invalidateSize();
      });

      // Default marker icon fix for Next bundling
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // Guard: map might be removed during async callback
            if (!leafletRef.current) return;
            const { latitude, longitude } = pos.coords;
            leafletRef.current.setView([latitude, longitude], 10);
            L.marker([latitude, longitude], { icon }).addTo(leafletRef.current);
          },
          () => setError("Could not get your location for the map."),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }

      leafletRef.current = map;
    };

    if (hasSize()) {
      initMap();
    } else {
      // Observe until the container is laid out
      const ro = new ResizeObserver(() => {
        if (hasSize()) {
          ro.disconnect();
          initMap();
        }
      });
      ro.observe(container);
      return () => ro.disconnect();
    }

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove();
        leafletRef.current = null;
      }
    };
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-10 bg-gradient-to-b from-sky-100 to-white dark:from-sky-950 dark:to-black">
      <div className="max-w-5xl mx-auto space-y-4">
        <header className="flex items-baseline justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold">Map</h1>
          <a className="text-sky-600 hover:underline" href="/">Back</a>
        </header>
        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
            {error}
          </div>
        )}
        <div ref={mapRef} className="h-[70vh] w-full rounded-xl overflow-hidden border" />
      </div>
    </main>
  );
}
