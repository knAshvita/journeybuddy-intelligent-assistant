import TravelPortal from "@/components/TravelPortal";
import { AuthProvider } from "@/context/AuthContext";

export default function Home() {
  const buildTimestamp = new Date().toISOString();

  return (
    <AuthProvider>
      <TravelPortal buildTimestamp={buildTimestamp} />
    </AuthProvider>
  );
}