// app/api/suggestions/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ hospitals: [], cities: [] });
  }

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("reviews")
    .select("hospital, city_state")
    .or(`hospital.ilike.%${q}%,city_state.ilike.%${q}%`)
    .limit(250);

  if (error) {
    return NextResponse.json(
      { hospitals: [], cities: [], error: error.message },
      { status: 500 }
    );
  }

  const qLower = q.toLowerCase();
  const hospitalsSet = new Set<string>();
  const citiesSet = new Set<string>();

  for (const row of data ?? []) {
    const h = (row.hospital ?? "").trim();
    const c = (row.city_state ?? "").trim();
    if (h && h.toLowerCase().includes(qLower)) hospitalsSet.add(h);
    if (c && c.toLowerCase().includes(qLower)) citiesSet.add(c);
  }

  return NextResponse.json({
    hospitals: Array.from(hospitalsSet).sort().slice(0, 10),
    cities: Array.from(citiesSet).sort().slice(0, 10),
  });
}
