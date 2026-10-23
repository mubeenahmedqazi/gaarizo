"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import CarCard from "@/components/CarCard";
import { EmptyState, GridSkeleton, PageHeader } from "@/components/ui";
import { api } from "@/components/api";

const FILTER_KEYS = ["search", "brand", "city", "minPrice", "maxPrice", "minYear", "maxYear", "fuel", "transmission", "sort"];
const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR - 1989 }, (_, i) => THIS_YEAR - i);

export default function CarsView() {
  const router = useRouter();
  const params = useSearchParams();
  const query = params.toString();

  const [meta, setMeta] = useState({ brands: [], cities: [] });
  const [data, setData] = useState(null);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    api("/api/ads/meta").then(setMeta).catch(() => {});
  }, []);

  // Filters live in the URL, so every change just updates the query string.
  useEffect(() => {
    setData(null);
    api(`/api/ads?${query}`)
      .then(setData)
      .catch(() => setData({ ads: [], total: 0, page: 1, pages: 1 }));
  }, [query]);

  function setParam(key, value) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    if (key !== "page") p.delete("page");
    router.replace(`/cars?${p.toString()}`, { scroll: false });
  }

  function clearAll() {
    router.replace("/cars", { scroll: false });
  }

  const hasFilters = FILTER_KEYS.some((k) => params.get(k));
  const page = Number(params.get("page")) || 1;

  const panel = (
    <div className="space-y-4">
      <Select label="Brand" value={params.get("brand")} onChange={(v) => setParam("brand", v)} options={meta.brands} all="All Brands" />
      <Select label="City" value={params.get("city")} onChange={(v) => setParam("city", v)} options={meta.cities} all="All Cities" />
      <div>
        <Label>Price (PKR)</Label>
        <div className="grid grid-cols-2 gap-2">
          <input className="field" type="number" min="0" placeholder="Min" defaultValue={params.get("minPrice") || ""} key={`min${params.get("minPrice")}`} onBlur={(e) => setParam("minPrice", e.target.value)} />
          <input className="field" type="number" min="0" placeholder="Max" defaultValue={params.get("maxPrice") || ""} key={`max${params.get("maxPrice")}`} onBlur={(e) => setParam("maxPrice", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Year</Label>
        <div className="grid grid-cols-2 gap-2">
          <select className="field" value={params.get("minYear") || ""} onChange={(e) => setParam("minYear", e.target.value)}>
            <option value="">From</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="field" value={params.get("maxYear") || ""} onChange={(e) => setParam("maxYear", e.target.value)}>
            <option value="">To</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <Select label="Fuel" value={params.get("fuel")} onChange={(v) => setParam("fuel", v)} options={FUELS} all="Any Fuel" />
      <Select label="Transmission" value={params.get("transmission")} onChange={(v) => setParam("transmission", v)} options={["Manual", "Automatic"]} all="Any" />
      <div>
        <Label>Sort by</Label>
        <select className="field" value={params.get("sort") || "newest"} onChange={(e) => setParam("sort", e.target.value)}>
          <option value="newest">Newest</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
        </select>
      </div>
      {hasFilters && (
        <button onClick={clearAll} className="btn-ghost w-full rounded-xl py-2.5 text-sm">Clear all filters</button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Browse Cars" subtitle="Find the right car at the right price" />

      <div className="mb-5 flex gap-3">
        <input
          className="field"
          placeholder="Search by title, brand or model..."
          defaultValue={params.get("search") || ""}
          key={`s${params.get("search")}`}
          onKeyDown={(e) => e.key === "Enter" && setParam("search", e.currentTarget.value.trim())}
          onBlur={(e) => e.target.value.trim() !== (params.get("search") || "") && setParam("search", e.target.value.trim())}
        />
        <button onClick={() => setDrawer(true)} className="btn-ghost flex items-center gap-2 rounded-xl px-4 lg:hidden">
          <SlidersHorizontal size={18} /> Filters
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="glass hidden h-fit rounded-2xl p-5 lg:sticky lg:top-24 lg:block">{panel}</aside>

        <div>
          <p className="text-muted mb-4 text-sm">
            {data ? `${data.total} car${data.total === 1 ? "" : "s"} found` : "Loading..."}
          </p>

          {data === null ? (
            <GridSkeleton count={6} />
          ) : data.ads.length === 0 ? (
            <EmptyState title="No cars match your filters" message="Try changing or clearing some filters." action={<button onClick={clearAll} className="btn-gradient rounded-xl px-5 py-2.5 text-sm">Clear filters</button>} />
          ) : (
            <div id="car-list" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.ads.map((ad, i) => <CarCard key={ad.id} ad={ad} index={i} />)}
            </div>
          )}

          {data && data.pages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => setParam("page", String(page - 1))} className="btn-ghost rounded-xl p-2.5 disabled:opacity-40" aria-label="Previous page">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm">Page {data.page} of {data.pages}</span>
              <button disabled={page >= data.pages} onClick={() => setParam("page", String(page + 1))} className="btn-ghost rounded-xl p-2.5 disabled:opacity-40" aria-label="Next page">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="glass ml-auto h-full w-[88%] max-w-sm overflow-y-auto bg-[var(--bg)] p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Filters</h3>
                <button onClick={() => setDrawer(false)} aria-label="Close filters"><X size={20} /></button>
              </div>
              {panel}
              <button onClick={() => setDrawer(false)} className="btn-gradient mt-5 w-full rounded-xl py-3">Show results</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Label({ children }) {
  return <label className="text-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">{children}</label>;
}

function Select({ label, value, onChange, options, all }) {
  return (
    <div>
      <Label>{label}</Label>
      <select className="field" value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">{all}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
