import { supabase } from "@/lib/supabase";

export default function Home() {
  const connected = supabase !== null;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">my-app</h1>
      <p className="text-lg">Next.js starter on Vercel.</p>
      <p className={connected ? "text-green-600" : "text-amber-600"}>
        Supabase: {connected ? "configured" : "not configured yet"}
      </p>
    </main>
  );
}
