"use client";

import Link from "next/link";

export default function ReviewsClient({ reviews, query }: any) {
  const q = (query || "").toLowerCase();

  const filtered = reviews.filter((r: any) => {
    if (!q) return true;

    return (
      r.hospital?.toLowerCase().includes(q) ||
      r.city_state?.toLowerCase().includes(q) ||
      r.unit?.toLowerCase().includes(q) ||
      r.agency?.toLowerCase().includes(q) ||
      r.review?.toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    return (
      <div className="card cardPad">
        <p className="sub">
          No reviews match this search — help another nurse by adding one.
        </p>

        <Link className="pill pillPrimary" href="/submit">
          Share Your Contract Experience
        </Link>
      </div>
    );
  }

  return (
    <div className="reviewsGrid">
      {filtered.map((r: any) => (
        <Link
          key={r.id}
          href={`/reviews/${r.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="reviewCard" style={{ cursor: "pointer" }}>
            <div className="reviewTop">
              <div>
                <div className="reviewHospital">
                  {r.hospital || "Unknown Hospital"}
                </div>

                <div className="reviewMeta">
                  {r.city_state || "Unknown location"}
                  {r.unit ? ` • ${r.unit}` : ""}
                </div>
              </div>

              <div className="reviewRight">⭐ {r.rating ?? "N/A"}</div>
            </div>

            <div className="reviewBadges">
              {r.agency && <span className="badge">{r.agency}</span>}
              {r.pay && <span className="badge">{r.pay}</span>}
              {r.assignment_length && (
                <span className="badge">{r.assignment_length}</span>
              )}
            </div>

            <p className="reviewText">
              {r.review
                ? r.review.length > 180
                  ? r.review.slice(0, 180) + "..."
                  : r.review
                : "No review text provided."}
            </p>

            <div className="reviewBottom">
              <span className="reviewLink">Read full review →</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}