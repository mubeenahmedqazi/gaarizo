"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Car, Heart, LayoutDashboard, ListChecks, LogOut, Menu, Moon, Plus, Sun, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Browse Cars" },
  { href: "/favourites", label: "Favourites" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);

  // close menus on navigation
  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success("Logged out");
    window.location.href = "/";
  }

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="btn-gradient flex h-9 w-9 items-center justify-center rounded-xl">
            <Car size={20} />
          </span>
          <span id="site-title" className="text-gradient text-xl font-extrabold tracking-tight">
            Gaarizo
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(l.href) ? "text-gradient" : "text-muted hover:text-fg"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle theme" className="btn-ghost rounded-xl p-2.5">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link id="post-ad-btn" href="/post-ad" className="btn-gradient hidden items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm sm:flex">
            <Plus size={16} /> Post Ad
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {loading ? null : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenu((m) => !m)}
                  className="btn-gradient flex h-10 w-10 items-center justify-center rounded-full text-sm"
                  aria-label="Account menu"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="glass absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg)] p-2 shadow-xl"
                    >
                      <p className="truncate px-3 py-2 text-sm font-semibold">{user.name}</p>
                      <p className="text-muted truncate px-3 pb-2 text-xs">{user.email}</p>
                      <Link href="/my-ads" className="hover:bg-white/10 flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
                        <ListChecks size={16} /> My Ads
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link href="/admin" className="hover:bg-white/10 flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <button onClick={handleLogout} className="hover:bg-white/10 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400">
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost rounded-xl px-4 py-2.5 text-sm">Login</Link>
                <Link href="/register" className="btn-ghost rounded-xl px-4 py-2.5 text-sm">Sign Up</Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen((o) => !o)} className="btn-ghost rounded-xl p-2.5 md:hidden" aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 pb-4">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-white/10">
                  {l.label}
                </Link>
              ))}
              <Link href="/post-ad" className="btn-gradient mt-1 flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm">
                <Plus size={16} /> Post Ad
              </Link>
              {user ? (
                <>
                  <Link href="/my-ads" className="rounded-lg px-3 py-2.5 text-sm hover:bg-white/10">My Ads</Link>
                  {user.role === "ADMIN" && (
                    <Link href="/admin" className="rounded-lg px-3 py-2.5 text-sm hover:bg-white/10">Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="rounded-lg px-3 py-2.5 text-left text-sm text-red-400 hover:bg-white/10">
                    Logout ({user.name})
                  </button>
                </>
              ) : (
                <div className="mt-1 flex gap-2">
                  <Link href="/login" className="btn-ghost flex-1 rounded-xl px-4 py-2.5 text-center text-sm">Login</Link>
                  <Link href="/register" className="btn-ghost flex-1 rounded-xl px-4 py-2.5 text-center text-sm">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
