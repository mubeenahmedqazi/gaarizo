"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Fuel, Gauge, Heart, MapPin, Settings2, Star } from "lucide-react";
import { useFavourites } from "@/context/FavouritesContext";
import { cloudinaryUrl, formatLacs, formatMileage, formatPrice } from "@/lib/format";
import CarImage from "@/components/CarImage";

export default function CarCard({ ad, index = 0 }) {
  const { isFavourite, toggle } = useFavourites();
  const fav = isFavourite(ad.id);
  const cover = Array.isArray(ad.images) ? ad.images[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.06, duration: 0.45 }}
      whileHover={{ y: -6 }}
      className="car-card glass glass-hover group relative overflow-hidden rounded-2xl"
    >
      <Link href={`/cars/${ad.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <CarImage
            src={cover ? cloudinaryUrl(cover.url) : null}
            alt={ad.title}
            brand={ad.brand}
            model={ad.model}
            className="transition duration-500 group-hover:scale-110"
          />
          {ad.isFeatured && (
            <span className="btn-gradient absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs">
              <Star size={12} fill="currentColor" /> Featured
            </span>
          )}
          {ad.isSold && (
            <div className="absolute -left-10 top-5 w-36 -rotate-45 bg-red-600 py-1 text-center text-xs font-bold tracking-widest text-white shadow-lg">
              SOLD
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 text-base font-bold">{ad.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <Chip>{ad.year}</Chip>
            <Chip icon={<Gauge size={12} />}>{formatMileage(ad.mileage)}</Chip>
            <Chip icon={<Fuel size={12} />}>{ad.fuel}</Chip>
            <Chip icon={<Settings2 size={12} />}>{ad.transmission}</Chip>
          </div>
          <p className="text-muted mt-3 flex items-center gap-1 text-sm">
            <MapPin size={14} /> {ad.city}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-gradient text-xl font-extrabold">{formatPrice(ad.price)}</span>
            <span className="text-muted text-xs">{formatLacs(ad.price)}</span>
          </div>
        </div>
      </Link>

      <button
        onClick={() => toggle(ad.id)}
        aria-label="Toggle favourite"
        className="glass absolute right-3 top-3 z-10 rounded-full p-2 transition hover:scale-110"
      >
        <Heart size={16} className={fav ? "fill-pink-500 text-pink-500" : ""} />
      </button>
    </motion.div>
  );
}

function Chip({ children, icon }) {
  return (
    <span className="bg-white/5 border-[var(--card-border)] text-muted flex items-center gap-1 rounded-full border px-2 py-0.5">
      {icon}
      {children}
    </span>
  );
}
