"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReviewRow } from "./page";

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
}

function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, rating));
  return (
    <div className="stars" aria-label={`${r} out of 5 stars`}>
      {"★★★★★".slice(0, r)}
      <span className="starsEmpty">{"★★★★★".slice(r)}</span>
    </div>
  );
}

export default function ReviewsClient({
  initialReviews,
  initialQuery,
}: {
  initialReviews: ReviewRow[];
  initialQuery: string;
}) {
  const [q, setQ] = useState(initialQuery ?? "");

  // Local filter (keeps page feeling fast even before server search)
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return initialReviews;

    return initialReviews.filter((r) => {
      const hay = [
        r.hospital ?? "",
        r.city_state ?? "",
        r.unit ?? "",
        r.agency ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [initialReviews, q]);

  return (
    <>
      <section className="toolbar">
        <div className="searchWrap">
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search hospital, city/state, or unit"
            aria-label="Search reviews"
          />
        </div>

        <Link className="btn btnPrimary" href="/submit">
          Submit a Review
        </Link>
      </section>

      <section className="grid">
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="emptyCard">
              <div className="emptyTitle">No matches</div>
              <div className="emptyText">Try a different search.</div>
            </div>
          </div>
        ) : (
          filtered.map((r) => {
            const title = (r.hospital || "Unknown hospital").trim();
            const city = (r.city_state || "").trim();
            const unit = (r.unit || "").trim();
            const date = formatDate(r.created_at);
            const rating = typeof r.rating === "number" ? r.rating : 0;

            return (
              <article key={r.id} className="card">
                <div className="cardTop">
                  <div className="cardTitle">{title}</div>
                  <Stars rating={rating} />
                </div>

                <div className="meta">
                  {city ? <span>{city}</span> : null}
                  {unit ? <span>• {unit}</span> : null}
                  {date ? <span>• {date}</span> : null}
                </div>

                <Link className="cardLink" href={`/reviews/${String(r.id)}`}>
                  View details →
                </Link>
              </article>
            );
          })
        )}
      </section>
    </>
  );
}
