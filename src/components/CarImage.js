import { Car } from "lucide-react";

// Shows the image if present; otherwise a stylish gradient placeholder.
export default function CarImage({ src, alt, brand, model, className = "" }) {
  if (src) {
    // Plain <img> on purpose: avoids next/image remote-domain config.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  }
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-600/40 via-cyan-500/30 to-violet-600/40 ${className}`}
    >
      <Car size={44} className="opacity-80" />
      <span className="px-3 text-center text-sm font-semibold opacity-90">
        {brand} {model}
      </span>
    </div>
  );
}
