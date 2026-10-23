"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar, CarFront, Cog, Droplet, Eye, Fuel, Gauge, Heart, MapPin, MessageCircle, Palette, Phone, SearchX, Settings2, User,
} from "lucide-react";
import CarImage from "@/components/CarImage";
import { EmptyState } from "@/components/ui";
import { api } from "@/components/api";
import { useFavourites } from "@/context/FavouritesContext";
import { cloudinaryUrl, formatLacs, formatMileage, formatPrice, whatsappLink } from "@/lib/format";

export default function CarDetailView({ id }) {
  const [ad, setAd] = useState(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);
  const { isFavourite, toggle } = useFavourites();

  useEffect(() => {
    api(`/api/ads/${id}`)
      .then((d) => setAd(d.ad))
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="px-4 py-20">
        <EmptyState title="Car not found" message="This ad may have been removed or is not available." action={<Link href="/cars" className="btn-gradient rounded-xl px-5 py-2.5 text-sm">Browse cars</Link>} />
      </div>
    );
  }
  if (!ad) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="skeleton aspect-[4/3]" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-10 w-1/2" />
          <div className="skeleton h-40" />
        </div>
      </div>
    );
  }

  const images = Array.isArray(ad.images) ? ad.images : [];
  const fav = isFavourite(ad.id);
  const specs = [
    { icon: Calendar, label: "Year", value: ad.year },
    { icon: Gauge, label: "Mileage", value: formatMileage(ad.mileage) },
    { icon: Fuel, label: "Fuel", value: ad.fuel },
    { icon: Settings2, label: "Transmission", value: ad.transmission },
    { icon: Cog, label: "Engine", value: `${ad.engineCC} cc` },
    { icon: Palette, label: "Color", value: ad.color },
    { icon: MapPin, label: "City", value: ad.city },
    { icon: Droplet, label: "Posted", value: new Date(ad.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
    { icon: Eye, label: "Views", value: ad.views },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {ad.status !== "APPROVED" && (
        <div className={`mb-6 rounded-2xl border p-4 text-sm ${ad.status === "PENDING" ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300" : "border-red-500/40 bg-red-500/10 text-red-300"}`}>
          {ad.status === "PENDING"
            ? "This ad is pending admin approval and is not visible to the public yet."
            : `This ad was rejected${ad.rejectReason ? `: ${ad.rejectReason}` : "."}`}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass relative aspect-[4/3] overflow-hidden rounded-3xl">
            <CarImage
              src={images[active] ? cloudinaryUrl(images[active].url, "f_auto,q_auto,w_1200") : null}
              alt={ad.title}
              brand={ad.brand}
              model={ad.model}
            />
            {ad.isSold && (
              <div className="absolute -left-12 top-8 w-48 -rotate-45 bg-red-600 py-1.5 text-center text-sm font-bold tracking-widest text-white shadow-lg">SOLD</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={img.publicId || i}
                  onClick={() => setActive(i)}
                  className={`aspect-[4/3] overflow-hidden rounded-xl border-2 transition ${i === active ? "border-cyan-400" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cloudinaryUrl(img.url, "f_auto,q_auto,w_300")} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="glass mt-6 rounded-3xl p-6">
            <h2 className="mb-2 text-lg font-bold">Description</h2>
            <p className="text-muted whitespace-pre-line text-sm leading-relaxed">{ad.description}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold sm:text-3xl">{ad.title}</h1>
              <button onClick={() => toggle(ad.id)} aria-label="Toggle favourite" className="glass shrink-0 rounded-full p-2.5 transition hover:scale-110">
                <Heart size={20} className={fav ? "fill-pink-500 text-pink-500" : ""} />
              </button>
            </div>
            <p className="text-gradient mt-2 text-4xl font-extrabold">{formatPrice(ad.price)}</p>
            <p className="text-muted text-sm">{formatLacs(ad.price)}</p>
          </div>

          <div className="glass grid grid-cols-2 gap-4 rounded-3xl p-5">
            {specs.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <s.icon size={18} className="shrink-0 text-cyan-400" />
                <div className="min-w-0">
                  <p className="text-muted text-xs">{s.label}</p>
                  <p className="truncate text-sm font-semibold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="text-muted mb-3 text-xs font-semibold uppercase tracking-wide">Seller</p>
            <div className="mb-4 flex items-center gap-3">
              <span className="btn-gradient flex h-11 w-11 items-center justify-center rounded-full"><User size={20} /></span>
              <div>
                <p className="font-bold">{ad.seller?.name}</p>
                <p className="text-muted text-sm">{ad.seller?.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${ad.seller?.phone}`} className="btn-gradient flex items-center justify-center gap-2 rounded-xl py-3 text-sm">
                <Phone size={16} /> Call
              </a>
              <a
                href={whatsappLink(ad.seller?.phone, `Hi, I am interested in your ${ad.title} on Gaarizo.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-sm font-semibold text-white transition hover:bg-green-500"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
