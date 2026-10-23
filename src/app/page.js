import HomeView from "@/views/HomeView";

// Data is fetched client-side from /api, but mark dynamic so build never needs a database.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <HomeView />;
}
