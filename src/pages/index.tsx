import { FlightSearch } from "@/components/flightSearch";
import { NextSeo } from "next-seo";
export default function Home() {
  return (
    <main className="min-h-screen">
      <NextSeo
        title="SkyVoyage"
        description="The best way to travel the world."
        openGraph={{
          title: "SkyVoyage",
          description: "The best way to travel the world.",
        }}
      />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">ค้นหา Flight ที่ดีที่สุดของคุณ</h1>
        <FlightSearch />
      </div>
    </main>
  );
}
