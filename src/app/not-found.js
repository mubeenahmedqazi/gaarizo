import Link from "next/link";
import { CarFront } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center px-4 text-center">
      <span className="btn-gradient mb-6 flex h-20 w-20 items-center justify-center rounded-3xl">
        <CarFront size={40} />
      </span>
      <h1 className="text-gradient text-6xl font-extrabold">404</h1>
      <p className="mt-2 text-lg font-semibold">This road leads nowhere</p>
      <p className="text-muted mt-1 text-sm">The page you are looking for does not exist.</p>
      <Link href="/" className="btn-gradient mt-6 rounded-xl px-6 py-3 text-sm">Back to Home</Link>
    </div>
  );
}
