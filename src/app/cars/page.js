import { Suspense } from "react";
import CarsView from "@/views/CarsView";
import { GridSkeleton } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata = { title: "Browse Cars - Gaarizo" };

export default function CarsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10"><GridSkeleton count={6} /></div>}>
      <CarsView />
    </Suspense>
  );
}
