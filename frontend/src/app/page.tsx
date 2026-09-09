import TravelPortal from "@/components/TravelPortal";

export default function Home() {
  const buildTimestamp = new Date().toUTCString();

  return <TravelPortal buildTimestamp={buildTimestamp} />;
}