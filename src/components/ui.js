"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SearchX, X } from "lucide-react";

export function CardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-6 w-1/2" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon = SearchX, title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass mx-auto flex max-w-md flex-col items-center rounded-3xl px-6 py-14 text-center"
    >
      <span className="btn-gradient mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
        <Icon size={30} />
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      {message && <p className="text-muted mt-1 text-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

export function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="glass w-full max-w-md rounded-3xl bg-[var(--bg)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{title}</h3>
              <button onClick={onClose} aria-label="Close" className="text-muted hover:text-fg">
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
    APPROVED: "bg-green-500/15 text-green-400 border-green-500/40",
    REJECTED: "bg-red-500/15 text-red-400 border-red-500/40",
  };
  const label = { PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {label[status]}
    </span>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
      <h1 className="text-gradient text-3xl font-extrabold sm:text-4xl">{title}</h1>
      {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
    </motion.div>
  );
}
