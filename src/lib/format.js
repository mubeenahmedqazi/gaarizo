// Rs 45,00,000 (Pakistani/Indian digit grouping)
export function formatPrice(value) {
  const n = Math.round(Number(value) || 0);
  return "Rs " + n.toLocaleString("en-IN");
}

// 45 lacs / 1.2 crore
export function formatLacs(value) {
  const n = Number(value) || 0;
  if (n >= 10000000) return `${trim(n / 10000000)} crore`;
  if (n >= 100000) return `${trim(n / 100000)} lacs`;
  return n.toLocaleString("en-IN");
}

function trim(x) {
  return String(Math.round(x * 100) / 100);
}

// 03XXXXXXXXX -> https://wa.me/92XXXXXXXXXX
export function whatsappLink(phone, text = "") {
  const digits = String(phone || "").replace(/\D/g, "").replace(/^0/, "");
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/92${digits}${q}`;
}

// Inserts transformations after "/upload/" for fast, optimised images.
export function cloudinaryUrl(url, transform = "f_auto,q_auto,w_800") {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

export function formatMileage(km) {
  return `${Number(km || 0).toLocaleString("en-IN")} km`;
}
