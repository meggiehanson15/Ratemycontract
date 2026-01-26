// app/reviews/ReviewsClient.tsx
"use client";

import Link from "next/link";

type ReviewRow = {
  id: number | string;
  created_at?: string;
  city_state?: string | null;
  hospital?: string | null;
  unit?: string | null;
  rating?: number | null;
  assignment_length?: string | null;
  review?: string | null;
};

export default function ReviewsClient({ reviews }: { reviews: ReviewRow[] }) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Reviews</h1>

      {!reviews?.length ? (
        <p>No reviews yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {reviews.map((r) => {
            const idStr = String(r.id ?? "").trim();

            // Prevents generating /reviews/ (empty)
            if (!idStr) {
              console.warn("Review row missing id:", r);
              return null;
            }

            // FIX: Never default rating to 5. Show dash if missing.
            const ratingDisplay =
              typeof r.rating === "number" ? `⭐ ${r.rating}` : "—";

            return (
              <li
                key={idStr}
                style={{
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {r.hospital ?? "Unknown hospital"}
                    </div>
                    <div style={{ opacity: 0.8 }}>
                      {(r.city_state ?? "Unknown city")} · {(r.unit ?? "Unknown unit")}
                    </div>
                    {r.assignment_length ? (
                      <div style={{ opacity: 0.8 }}>Length: {r.assignment_length}</div>
                    ) : null}
                  </div>

                  <div style={{ fontWeight: 800 }}>{ratingDisplay}</div>
                </div>

                {r.review ? (
                  <p style={{ marginTop: 10, opacity: 0.9 }}>{r.review}</p>
                ) : null}

                <div style={{ marginTop: 10 }}>
                  <Link href={`/reviews/${idStr}`}>View details →</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
