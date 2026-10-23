"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api, jsonOptions } from "@/components/api";
import { useAuth } from "@/context/AuthContext";
import { EMAIL_REGEX, PHONE_REGEX } from "@/lib/validators";

// One form component used by both /login and /register.
export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const params = useSearchParams();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e = {};
    if (isRegister && form.name.trim().length < 2) e.name = "Enter your full name";
    if (!EMAIL_REGEX.test(form.email)) e.email = "Enter a valid email";
    if (isRegister && !PHONE_REGEX.test(form.phone)) e.phone = "Phone must look like 03XXXXXXXXX";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const { user } = await api(`/api/auth/${mode}`, jsonOptions("POST", form));
      setUser(user);
      toast.success(isRegister ? "Account created. Welcome to Gaarizo!" : `Welcome back, ${user.name}!`);
      const next = params.get("next");
      // full navigation so the proxy sees the new cookie
      window.location.href = next && next.startsWith("/") ? next : "/";
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <motion.form
        onSubmit={submit}
        noValidate
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md space-y-4 rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center">
          <h1 className="text-gradient text-3xl font-extrabold">{isRegister ? "Create account" : "Welcome back"}</h1>
          <p className="text-muted mt-1 text-sm">
            {isRegister ? "Join Gaarizo and start selling" : "Log in to your Gaarizo account"}
          </p>
        </div>

        {isRegister && (
          <Input label="Full name" value={form.name} onChange={set("name")} error={errors.name} placeholder="Ali Khan" />
        )}
        <Input label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} placeholder="you@example.com" />
        {isRegister && (
          <Input label="Phone" value={form.phone} onChange={set("phone")} error={errors.phone} placeholder="03XXXXXXXXX" />
        )}

        <div>
          <label className="text-muted mb-1.5 block text-xs font-semibold uppercase">Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              className="field pr-11"
              value={form.password}
              onChange={set("password")}
              placeholder="At least 6 characters"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="text-muted absolute right-3 top-1/2 -translate-y-1/2" aria-label="Show or hide password">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
        </div>

        <button type="submit" disabled={busy} className="btn-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3">
          {busy && <Loader2 size={18} className="animate-spin" />}
          {isRegister ? "Sign Up" : "Login"}
        </button>

        <p className="text-muted text-center text-sm">
          {isRegister ? "Already have an account? " : "New to Gaarizo? "}
          <Link href={isRegister ? "/login" : "/register"} className="text-gradient font-semibold">
            {isRegister ? "Login" : "Sign Up"}
          </Link>
        </p>
      </motion.form>
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-muted mb-1.5 block text-xs font-semibold uppercase">{label}</label>
      <input className="field" {...props} />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
