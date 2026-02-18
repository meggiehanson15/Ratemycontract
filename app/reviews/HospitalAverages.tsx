// app/reviews/HospitalAverages.tsx
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Row = {
  hospital: string;
  avg_rating: number;
  review_count: number;
};

export default async function HospitalAverages() {
  const supabase = supabaseServer();

  // Pull hospital + rating from the real table you already have
  const { data, error } = await supabase
    .from("reviews")
    .select("hospital, rating");

  if (error) {
    return <p style={{ color: "red" }}>Averages error: {error.message}</p>;
  }

  const rowsRaw = (data ?? [])
    .map((r: any) => ({
      hospital: (r.hospital ?? "").trim(),
      rating: typeof r.rating === "number" ? r.rating : Number(r.rating),
    }))
    .filter((r) => r.hospital.length > 0 && Number.isFinite(r.rating));

  if (!rowsRaw.length) return <p>No hospital averages yet.</p>;

  // Aggregate
  const map = new Map<string, { sum: number; count: number }>();
  for (const r of rowsRaw) {
    const key = r.hospital;
    const prev = map.get(key) ?? { sum: 0, count: 0 };
    map.set(key, { sum: prev.sum + r.rating, count: prev.count + 1 });
  }

  const rows: Row[] = Array.from(map.entries())
    .map(([hospital, v]) => ({
      hospital,
      avg_rating: v.sum / v.count,
      review_count: v.count,
    }))
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, 20);

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ marginBottom: 10 }}>Average ratings per hospital</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((r) => (
          <div
            key={r.hospital}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ fontWeight: 800 }}>{r.hospital}</div>
            <div>
              ⭐ {r.avg_rating.toFixed(1)}{" "}
              <span style={{ opacity: 0.7 }}>({r.review_count} reviews)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
