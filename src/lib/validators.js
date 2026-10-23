export const PHONE_REGEX = /^03\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"];
export const TRANSMISSIONS = ["Manual", "Automatic"];
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
export const MAX_IMAGES = 4;

// Each validator returns an error message string, or null when valid.
export function validateRegister({ name, email, phone, password }) {
  if (!name || name.trim().length < 2) return "Name must be at least 2 characters";
  if (!email || !EMAIL_REGEX.test(email)) return "Enter a valid email address";
  if (!phone || !PHONE_REGEX.test(phone)) return "Phone must look like 03XXXXXXXXX";
  if (!password || password.length < 6) return "Password must be at least 6 characters";
  return null;
}

export function validateLogin({ email, password }) {
  if (!email || !password) return "Email and password are required";
  return null;
}

export function validateAd(f) {
  const currentYear = new Date().getFullYear() + 1;
  for (const key of ["title", "brand", "model", "city", "color", "description"]) {
    if (!f[key] || !String(f[key]).trim()) return `${key} is required`;
  }
  if (String(f.title).trim().length < 5) return "Title must be at least 5 characters";
  if (!Number.isInteger(f.year) || f.year < 1980 || f.year > currentYear) return "Enter a valid year";
  if (!Number.isFinite(f.price) || f.price < 10000) return "Enter a valid price";
  if (!Number.isInteger(f.mileage) || f.mileage < 0) return "Enter a valid mileage";
  if (!Number.isInteger(f.engineCC) || f.engineCC < 50) return "Enter a valid engine capacity (cc)";
  if (!FUELS.includes(f.fuel)) return "Invalid fuel type";
  if (!TRANSMISSIONS.includes(f.transmission)) return "Invalid transmission";
  if (String(f.description).trim().length < 10) return "Description must be at least 10 characters";
  return null;
}

export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Only JPG, PNG or WEBP images are allowed";
  if (file.size > MAX_IMAGE_SIZE) return "Each image must be 3MB or smaller";
  return null;
}
