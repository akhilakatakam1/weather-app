"use client";

import Link from "next/link";

export function Header() {
  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-white/50 dark:bg-black/30 border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">Weather Map</Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-gray-600 hover:text-sky-600">Home</Link>
          <Link href="/map" className="text-gray-600 hover:text-sky-600">Map</Link>
        </nav>
      </div>
    </div>
  );
}
