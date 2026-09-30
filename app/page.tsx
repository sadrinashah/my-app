import { DashboardGate } from "@/components/dashboard/dashboard-gate";
import { supabase } from "@/lib/supabase";

export default function Home() {
  return <DashboardGate supabaseConfigured={supabase !== null} />;
}
