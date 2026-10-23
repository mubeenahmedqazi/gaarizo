"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import CarCard from "@/components/CarCard";
import { EmptyState, GridSkeleton, PageHeader } from "@/components/ui";
import { api } from "@/components/api";
import { useFavourites } from "@/context/FavouritesContext";

export default function FavouritesView() {
  const { ids } = useFavourites();
  const [ads, setAds] = useState(null);

  // Saved ids live in localStorage; load each ad (skip ones that no longer exist).
  useEffect(() => {
    let cancelled = false;
    Promise.all(ids.map((id) => api(`/api/ads/${id}`).then((d) => d.ad).catch(() => null))).then((list) => {
      if (!cancelled) setAds(list.filter(Boolean));
    });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Favourites" subtitle="Cars you have saved on this device" />
      {ads === null && ids.length > 0 ? (
        <GridSkeleton count={Math.min(ids.length, 4)} />
      ) : !ads || ads.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          message="Tap the heart on any car to save it here."
          action={<Link href="/cars" className="btn-gradient rounded-xl px-5 py-2.5 text-sm">Browse cars</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ads.map((ad, i) => <CarCard key={ad.id} ad={ad} index={i} />)}
        </div>
      )}
    </div>
  );
}
