import CarDetailView from "@/views/CarDetailView";

export const dynamic = "force-dynamic";

export default async function CarDetailPage({ params }) {
  const { id } = await params;
  return <CarDetailView id={id} />;
}
