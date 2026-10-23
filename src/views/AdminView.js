"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { animate, motion } from "framer-motion";
import { Check, ClipboardList, Star, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, Modal, PageHeader, StatusBadge } from "@/components/ui";
import { api, jsonOptions } from "@/components/api";
import { formatPrice } from "@/lib/format";

const STATS = [
  { key: "totalAds", label: "Total Ads", color: "from-red-700 to-red-400" },
  { key: "pending", label: "Pending", color: "from-yellow-500 to-amber-300" },
  { key: "approved", label: "Approved", color: "from-green-500 to-emerald-300" },
  { key: "rejected", label: "Rejected", color: "from-red-500 to-rose-300" },
  { key: "sold", label: "Sold", color: "from-neutral-600 to-neutral-400" },
  { key: "users", label: "Users", color: "from-red-600 to-orange-400" },
];

function Counter({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, { duration: 1, onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [value]);
  return <>{n}</>;
}

export default function AdminView() {
  const [tab, setTab] = useState("pending");
  const [stats, setStats] = useState(null);
  const [ads, setAds] = useState(null);
  const [users, setUsers] = useState(null);
  const [filter, setFilter] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [deleting, setDeleting] = useState(null);

  const loadStats = useCallback(() => api("/api/admin/stats").then(setStats).catch((e) => toast.error(e.message)), []);

  const loadAds = useCallback(() => {
    const status = tab === "pending" ? "PENDING" : filter;
    setAds(null);
    api(`/api/admin/ads${status ? `?status=${status}` : ""}`)
      .then((d) => setAds(d.ads))
      .catch((e) => {
        toast.error(e.message);
        setAds([]);
      });
  }, [tab, filter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (tab === "users") {
      api("/api/admin/users").then((d) => setUsers(d.users)).catch((e) => toast.error(e.message));
    } else {
      loadAds();
    }
  }, [tab, loadAds]);

  async function run(promise, okMessage) {
    try {
      await promise;
      toast.success(okMessage);
      loadAds();
      loadStats();
    } catch (e) {
      toast.error(e.message);
    }
  }

  const approve = (ad) => run(api(`/api/admin/ads/${ad.id}/approve`, { method: "PATCH" }), "Ad approved");
  const feature = (ad) => run(api(`/api/admin/ads/${ad.id}/feature`, { method: "PATCH" }), ad.isFeatured ? "Removed from featured" : "Marked as featured");

  async function confirmReject() {
    if (!reason.trim()) return toast.error("Please enter a reason");
    await run(api(`/api/admin/ads/${rejecting.id}/reject`, jsonOptions("PATCH", { reason })), "Ad rejected");
    setRejecting(null);
    setReason("");
  }

  async function confirmDelete() {
    await run(api(`/api/ads/${deleting.id}`, { method: "DELETE" }), "Ad deleted");
    setDeleting(null);
  }

  const tabs = [
    { id: "pending", label: "Pending" },
    { id: "all", label: "All Ads" },
    { id: "users", label: "Users" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader title="Admin Dashboard" subtitle="Review ads and manage the marketplace" />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {STATS.map((s, i) => (
          <motion.div key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="glass glass-hover rounded-2xl p-4">
            <p className="text-muted text-xs font-semibold uppercase">{s.label}</p>
            <p className={`mt-1 bg-gradient-to-r ${s.color} bg-clip-text text-3xl font-extrabold text-transparent`}>
              {stats ? <Counter value={stats[s.key]} /> : "–"}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-5 py-2.5 text-sm ${tab === t.id ? "btn-gradient" : "btn-ghost"}`}
          >
            {t.label}
            {t.id === "pending" && stats ? ` (${stats.pending})` : ""}
          </button>
        ))}
        {tab === "all" && (
          <select className="field ml-auto w-auto" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Status filter">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        )}
      </div>

      {tab === "users" ? (
        users === null ? <TableSkeleton /> : (
          <Table head={["Name", "Email", "Phone", "Role", "Ads", "Joined"]}>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-[var(--card-border)]">
                <td className="px-4 py-3 font-semibold">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.phone}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3">{u._count.ads}</td>
                <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </Table>
        )
      ) : ads === null ? (
        <TableSkeleton />
      ) : ads.length === 0 ? (
        <EmptyState icon={ClipboardList} title={tab === "pending" ? "No pending ads" : "No ads found"} message={tab === "pending" ? "All caught up. Nothing waiting for review." : "Try a different status filter."} />
      ) : (
        <Table head={["Ad", "Seller", "Price", "Status", "Actions"]}>
          {ads.map((ad) => (
            <tr key={ad.id} className="border-t border-[var(--card-border)] align-top">
              <td className="px-4 py-3">
                <Link href={`/cars/${ad.id}`} className="font-semibold hover:underline">{ad.title}</Link>
                <p className="text-muted text-xs">{ad.city} · {ad.year}{ad.isSold ? " · SOLD" : ""}</p>
              </td>
              <td className="px-4 py-3 text-sm">{ad.seller?.name}<p className="text-muted text-xs">{ad.seller?.phone}</p></td>
              <td className="whitespace-nowrap px-4 py-3 text-sm">{formatPrice(ad.price)}</td>
              <td className="px-4 py-3"><StatusBadge status={ad.status} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {ad.status !== "APPROVED" && (
                    <button onClick={() => approve(ad)} className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500">
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {ad.status !== "REJECTED" && (
                    <button onClick={() => setRejecting(ad)} className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500">
                      <X size={14} /> Reject
                    </button>
                  )}
                  {tab === "all" && ad.status === "APPROVED" && (
                    <button onClick={() => feature(ad)} className="btn-ghost flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs">
                      <Star size={14} className={ad.isFeatured ? "fill-yellow-400 text-yellow-400" : ""} /> {ad.isFeatured ? "Unfeature" : "Feature"}
                    </button>
                  )}
                  {tab === "all" && (
                    <button onClick={() => setDeleting(ad)} className="btn-ghost flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-red-400">
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject ad">
        <p className="text-muted mb-3 text-sm">Tell the seller why &quot;{rejecting?.title}&quot; was rejected.</p>
        <textarea className="field min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Photos are unclear or price looks incorrect" />
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setRejecting(null)} className="btn-ghost rounded-xl px-4 py-2.5 text-sm">Cancel</button>
          <button onClick={confirmReject} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500">Reject ad</button>
        </div>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete this ad?">
        <p className="text-muted text-sm">&quot;{deleting?.title}&quot; will be permanently deleted.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setDeleting(null)} className="btn-ghost rounded-xl px-4 py-2.5 text-sm">Cancel</button>
          <button onClick={confirmDelete} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function Table({ head, children }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-muted text-xs uppercase">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
    </div>
  );
}
