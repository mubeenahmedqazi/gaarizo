// Small fetch helper: relative URLs only, throws Error(message) on failure.
export async function api(url, options = {}) {
  const res = await fetch(url, { cache: "no-store", ...options });
  let data = {};
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

export function jsonOptions(method, body) {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
