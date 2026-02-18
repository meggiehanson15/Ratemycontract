// app/reviews/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, created_at, city_state, hospital, unit, rating, assignment_length"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Reviews</h1>
        <p style={{ color: "red" }}>{error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 20 }}>Travel Nurse Reviews</h1>

      {!data || data.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {data.map((review) => (
            <Link
              key={review.id}
              href={`/reviews/${review.id}`}
              style={{
                display: "block",
                padding: 16,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <h3 style={{ margin: 0 }}>
                {review.hospital ?? "Hospital"}
              </h3>

              <p style={{ margin: "4px 0", opacity: 0.8 }}>
                {review.city_state ?? "City"} · {review.unit ?? "Unit"}
              </p>

              <p style={{ margin: "6px 0" }}>
                ⭐ {review.rating ?? "—"}
              </p>

              {review.assignment_length && (
                <p style={{ margin: 0, opacity: 0.7 }}>
                  {review.assignment_length}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
