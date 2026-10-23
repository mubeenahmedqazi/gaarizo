"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Car, ClipboardCheck, Search, UserPlus, Wallet } from "lucide-react";
import CarCard from "@/components/CarCard";
import { EmptyState, GridSkeleton } from "@/components/ui";
import { api } from "@/components/api";

const POPULAR = ["Toyota", "Honda", "Suzuki", "KIA", "Hyundai", "Changan"];

const LOGOS = {
  Toyota: "/brands/toyota.jpg",
  Honda: "/brands/honda.svg",
  Suzuki: "/brands/suzuki.jpg",
  KIA: "/brands/kia.svg",
  Hyundai: "/brands/hyundai.svg",
};

const HERO_IMAGES = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"];

// Crossfading background photos (CSS only, no JS timers).
function HeroSlides() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {HERO_IMAGES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" loading={i === 0 ? "eager" : "lazy"} className="hero-slide absolute inset-0 h-full w-full object-cover" style={{ animationDelay: `${i * 6}s` }} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />
    </div>
  );
}

const STEPS = [
  { icon: UserPlus, title: "Sign up", text: "Create a free account in under a minute." },
  { icon: Car, title: "Post your ad", text: "Add photos and details of your car." },
  { icon: ClipboardCheck, title: "Get approved & sell", text: "We review your ad, then buyers contact you directly." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

function Section({ title, children, href }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      className="mx-auto mt-16 max-w-7xl px-4 sm:px-6"
    >
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
        {href && (
          <Link href={href} className="text-gradient text-sm font-semibold">
            View all →
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  );
}

export default function HomeView() {
  const router = useRouter();
  const [meta, setMeta] = useState({ brands: [], cities: [] });
  const [brand, setBrand] = useState("");
  const [city, setCity] = useState("");
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    api("/api/ads/meta").then(setMeta).catch(() => {});
    api("/api/ads/featured").then((d) => setFeatured(d.ads)).catch(() => setFeatured([]));
    api("/api/ads?limit=8").then((d) => setLatest(d.ads.slice(0, 8))).catch(() => setLatest([]));
  }, []);

  function onSearch(e) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (brand) p.set("brand", brand);
    if (city) p.set("city", city);
    router.push(`/cars${p.toString() ? `?${p}` : ""}`);
  }

  return (
    <div className="pb-4">
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <HeroSlides />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-16 text-center text-white sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-extrabold leading-tight sm:text-6xl"
        >
          Find your next <span className="text-gradient">dream car</span> in Pakistan
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-4 text-lg text-white/80"
        >
          Pakistan ki gaariyan, aik jagah
        </motion.p>

        <motion.form
          id="hero-search"
          onSubmit={onSearch}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="glass mx-auto mt-10 grid max-w-3xl gap-3 rounded-3xl p-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <select className="field" value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Brand">
            <option value="">All Brands</option>
            {meta.brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select className="field" value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
            <option value="">All Cities</option>
            {meta.cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button id="hero-search-btn" type="submit" className="btn-gradient flex items-center justify-center gap-2 rounded-xl px-6 py-3">
            <Search size={18} /> Search
          </button>
        </motion.form>
        </div>
      </section>

      <Section title="Popular Brands">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {POPULAR.map((b, i) => (
            <motion.div key={b} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <Link
                href={`/cars?brand=${encodeURIComponent(b)}`}
                className="glass glass-hover flex flex-col items-center gap-2 rounded-2xl py-6 transition hover:-translate-y-1"
              >
                {LOGOS[b] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={LOGOS[b]} alt={b} loading="lazy" className="h-12 w-12 rounded-lg bg-white object-contain p-1" />
                ) : (
                  <span className="btn-gradient flex h-12 w-12 items-center justify-center rounded-xl text-lg">{b[0]}</span>
                )}
                <span className="font-semibold">{b}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section title="Featured Cars" href="/cars">
        {featured === null ? (
          <GridSkeleton count={4} />
        ) : featured.length === 0 ? (
          <EmptyState title="No featured cars yet" message="Check back soon for hand-picked listings." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((ad, i) => <CarCard key={ad.id} ad={ad} index={i} />)}
          </div>
        )}
      </Section>

      <Section title="Latest Cars" href="/cars">
        {latest === null ? (
          <GridSkeleton count={8} />
        ) : latest.length === 0 ? (
          <EmptyState title="No cars listed yet" message="Be the first to post an ad." action={<Link href="/post-ad" className="btn-gradient rounded-xl px-5 py-2.5 text-sm">Post Ad</Link>} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latest.map((ad, i) => <CarCard key={ad.id} ad={ad} index={i} />)}
          </div>
        )}
      </Section>

      <Section title="How it works">
        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="glass glass-hover rounded-2xl p-6"
            >
              <span className="btn-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <s.icon size={22} />
              </span>
              <p className="text-muted text-xs font-semibold">STEP {i + 1}</p>
              <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
              <p className="text-muted mt-1 text-sm">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}
