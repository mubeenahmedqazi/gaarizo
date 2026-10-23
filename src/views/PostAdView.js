"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/ui";
import { FUELS, TRANSMISSIONS, MAX_IMAGES, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/validators";

const BRANDS = ["Toyota", "Honda", "Suzuki", "KIA", "Hyundai", "Changan", "Nissan", "Mercedes", "BMW", "Audi", "MG", "Proton", "Daihatsu"];
const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala"];
const OTHER = "__other__";

const empty = {
  title: "", brand: "", brandOther: "", model: "", year: "", price: "", mileage: "",
  city: "", cityOther: "", fuel: "Petrol", transmission: "Manual", engineCC: "", color: "", description: "",
};

export default function PostAdView() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState([]); // [{file, preview}]
  const [busy, setBusy] = useState(false);

  // free object URLs when leaving the page
  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function addFiles(e) {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    const next = [...files];
    for (const file of picked) {
      if (next.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        break;
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: only JPG, PNG or WEBP`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`${file.name}: larger than 3MB`);
        continue;
      }
      next.push({ file, preview: URL.createObjectURL(file) });
    }
    setFiles(next);
  }

  function removeFile(i) {
    URL.revokeObjectURL(files[i].preview);
    setFiles(files.filter((_, idx) => idx !== i));
  }

  async function submit(e) {
    e.preventDefault();
    const brand = form.brand === OTHER ? form.brandOther.trim() : form.brand;
    const city = form.city === OTHER ? form.cityOther.trim() : form.city;
    if (!brand || !city) return toast.error("Please select or enter brand and city");

    const fd = new FormData();
    const values = { ...form, brand, city };
    delete values.brandOther;
    delete values.cityOther;
    Object.entries(values).forEach(([k, v]) => fd.append(k, v));
    files.forEach((f) => fd.append("images", f.file));

    setBusy(true);
    try {
      const res = await fetch("/api/ads", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not post ad");
      toast.success("Your ad is under review");
      router.push("/my-ads");
    } catch (err) {
      toast.error(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader title="Post your ad" subtitle="Fill in the details. Our team reviews every ad before it goes live." />

      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass space-y-5 rounded-3xl p-6 sm:p-8">
        <Field label="Ad title">
          <input className="field" required minLength={5} value={form.title} onChange={set("title")} placeholder="e.g. Toyota Corolla Altis 1.6 2021" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand">
            <select className="field" required value={form.brand} onChange={set("brand")}>
              <option value="">Select brand</option>
              {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              <option value={OTHER}>Other</option>
            </select>
            {form.brand === OTHER && <input className="field mt-2" required placeholder="Enter brand" value={form.brandOther} onChange={set("brandOther")} />}
          </Field>
          <Field label="Model">
            <input className="field" required value={form.model} onChange={set("model")} placeholder="e.g. Corolla" />
          </Field>
          <Field label="City">
            <select className="field" required value={form.city} onChange={set("city")}>
              <option value="">Select city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value={OTHER}>Other</option>
            </select>
            {form.city === OTHER && <input className="field mt-2" required placeholder="Enter city" value={form.cityOther} onChange={set("cityOther")} />}
          </Field>
          <Field label="Year">
            <input className="field" type="number" required min="1980" max={new Date().getFullYear() + 1} value={form.year} onChange={set("year")} placeholder="2020" />
          </Field>
          <Field label="Price (PKR)">
            <input className="field" type="number" required min="10000" value={form.price} onChange={set("price")} placeholder="4500000" />
          </Field>
          <Field label="Mileage (km)">
            <input className="field" type="number" required min="0" value={form.mileage} onChange={set("mileage")} placeholder="45000" />
          </Field>
          <Field label="Fuel">
            <select className="field" value={form.fuel} onChange={set("fuel")}>
              {FUELS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Transmission">
            <select className="field" value={form.transmission} onChange={set("transmission")}>
              {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Engine capacity (cc)">
            <input className="field" type="number" required min="50" value={form.engineCC} onChange={set("engineCC")} placeholder="1300" />
          </Field>
          <Field label="Color">
            <input className="field" required value={form.color} onChange={set("color")} placeholder="White" />
          </Field>
        </div>

        <Field label="Description">
          <textarea className="field min-h-32" required minLength={10} value={form.description} onChange={set("description")} placeholder="Condition, service history, accessories, reason for selling..." />
        </Field>

        <div>
          <p className="text-muted mb-2 text-xs font-semibold uppercase tracking-wide">Photos (up to {MAX_IMAGES}, JPG/PNG/WEBP, 3MB each)</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {files.map((f, i) => (
              <div key={f.preview} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--card-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.preview} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeFile(i)} aria-label="Remove image" className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white hover:bg-red-600">
                  <X size={14} />
                </button>
              </div>
            ))}
            {files.length < MAX_IMAGES && (
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost text-muted flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border-dashed text-xs">
                <ImagePlus size={22} /> Add photo
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={addFiles} />
        </div>

        <button id="submit-ad-btn" type="submit" disabled={busy} className="btn-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3.5">
          {busy ? <><Loader2 size={18} className="animate-spin" /> {files.length ? "Uploading images..." : "Submitting..."}</> : "Submit ad for review"}
        </button>
      </motion.form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-muted mb-1.5 block text-xs font-semibold uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
