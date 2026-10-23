"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [host, setHost] = useState("...");

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setHost(d.hostname || "unknown"))
      .catch(() => setHost("unavailable"));
  }, []);

  return (
    <footer className="glass mt-20 border-x-0 border-b-0">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-16 w-16 rounded-xl bg-white object-contain" />
            <p className="text-gradient text-xl font-extrabold">Gaarizo</p>
          </div>
          <p className="text-muted mt-1 text-sm">Pakistan ki gaariyan, aik jagah</p>
        </div>
        <nav className="text-muted flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/" className="hover:text-fg">Home</Link>
          <Link href="/cars" className="hover:text-fg">Browse Cars</Link>
          <Link href="/post-ad" className="hover:text-fg">Post Ad</Link>
          <Link href="/favourites" className="hover:text-fg">Favourites</Link>
        </nav>
        <div className="text-muted text-sm md:text-right">
          <p>© 2026 Gaarizo</p>
          <p className="mt-1 text-xs">
            Served by: <span id="served-by">{host}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
