"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FilePlus2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import CarImage from "@/components/CarImage";
import { EmptyState, GridSkeleton, Modal, PageHeader, StatusBadge } from "@/components/ui";
import { api } from "@/components/api";
import { cloudinaryUrl, formatPrice } from "@/lib/format";

export default function MyAdsView() {
  const [ads, setAds] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/api/ads/mine")
      .then((d) => setAds(d.ads))
      .catch((e) => {
        toast.error(e.message);
        setAds([]);
      });
  }, []);

  async function toggleSold(ad) {
    try {
      const { ad: updated } = await api(`/api/ads/${ad.id}/sold`, { method: "PATCH" });
      setAds((list) => list.map((a) => (a.id === ad.id ? { ...a, isSold: updated.isSold } : a)));
      toast.success(updated.isSold ? "Marked as sold" : "Marked as available");
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api(`/api/ads/${toDelete.id}`, { method: "DELETE" });
      setAds((list) => list.filter((a) => a.id !== toDelete.id));
      toast.success("Ad deleted");
      setToDelete(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader title="My Ads" subtitle="Manage the cars you have listed" />

      {ads === null ? (
        <GridSkeleton count={3} />
      ) : ads.length === 0 ? (
        <EmptyState
          icon={FilePlus2}
          title="You have not posted any ads"
          message="Post your first car and reach buyers across Pakistan."
          action={<Link href="/post-ad" className="btn-gradient rounded-xl px-5 py-2.5 text-sm">Post Ad</Link>}
        />
      ) : (
        <div className="space-y-4">
          {ads.map((ad, i) => {
            const cover = Array.isArray(ad.images) ? ad.images[0] : null;
            return (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 8) * 0.06 }}
                className="glass glass-hover flex flex-col gap-4 rounded-2xl p-4 sm:flex-row"
              >
                <Link href={`/cars/${ad.id}`} className="block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl sm:w-48">
                  <CarImage src={cover ? cloudinaryUrl(cover.url, "f_auto,q_auto,w_400") : null} alt={ad.title} brand={ad.brand} model={ad.model} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/cars/${ad.id}`} className="truncate text-lg font-bold hover:underline">{ad.title}</Link>
                      <StatusBadge status={ad.status} />
                      {ad.isSold && <span className="rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">Sold</span>}
                    </div>
                    <p className="text-gradient mt-1 text-lg font-extrabold">{formatPrice(ad.price)}</p>
                    <p className="text-muted text-sm">{ad.city} · {ad.year} · {ad.views} views</p>
                    {ad.status === "REJECTED" && ad.rejectReason && (
                      <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">Reason: {ad.rejectReason}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ad.status === "APPROVED" && (
                      <button onClick={() => toggleSold(ad)} className="btn-ghost flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm">
                        <CheckCircle2 size={16} /> {ad.isSold ? "Mark as Available" : "Mark as Sold"}
                      </button>
                    )}
                    <button onClick={() => setToDelete(ad)} className="btn-ghost flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm text-red-400">
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal open={!!toDelete} onClose={() => !busy && setToDelete(null)} title="Delete this ad?">
        <p className="text-muted text-sm">
          &quot;{toDelete?.title}&quot; and its photos will be permanently removed. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setToDelete(null)} disabled={busy} className="btn-ghost rounded-xl px-4 py-2.5 text-sm">Cancel</button>
          <button onClick={confirmDelete} disabled={busy} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60">
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
