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
  agency?: string | null;
  pay?: string | null;
};

function clampRating(rating: number) {
  if (!Number.isFinite(rating)) return 0;
  return Math.max(0, Math.min(5, Math.round(rating)));
}

function safeText(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function cleanCityState(v: unknown) {
  const s = safeText(v);
  if (!s) return "";
  return s.replace(/\s*,\s*/g, ", ").replace(/\s+/g, " ").trim();
}

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fieldScore(fieldValue: string, q: string) {
  const v = norm(fieldValue);
  const query = norm(q);
  if (!v || !query) return 0;

  if (v === query) return 100;
  if (v.startsWith(query)) return 70;
  if (v.includes(query)) return 40;
  return 0;
}

function matchScore(r: ReviewRow, q: string) {
  const query = q.trim();
  if (!query) return 0;

  const hospital = safeText(r.hospital);
  const cityState = cleanCityState(r.city_state);
  const unit = safeText(r.unit);
  const agency = safeText(r.agency);
  const review = safeText(r.review);

  const city = fieldScore(cityState, query) * 1.35;
  const hosp = fieldScore(hospital, query) * 1.15;
  const u = fieldScore(unit, query) * 0.9;
  const ag = fieldScore(agency, query) * 0.85;

  // lets "Palmdale" match review text too
  const rv = fieldScore(review, query) * 0.5;

  return city + hosp + u + ag + rv;
}

function timeAgo(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 7) return `${diffDays}d ago`;

  const w = Math.floor(diffDays / 7);
  if (w < 5) return `${w}w ago`;

  const m = Math.floor(diffDays / 30);
  if (m < 12) return `${m}mo ago`;

  const y = Math.floor(diffDays / 365);
  return `${y}y ago`;
}

function Stars({ rating }: { rating?: number | null }) {
  if (typeof rating !== "number") return <span className="kicker">—</span>;
  const r = clampRating(rating);

  return (
    <span className="stars" aria-label={`${r} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < r ? "starOn" : "starOff"} aria-hidden="true">
          ★
        </span>
      ))}
    </span>
  );
}

function buildMetaLine(city_state?: string | null, unit?: string | null) {
  const city = cleanCityState(city_state);
  const u = safeText(unit);
  const parts = [city, u].filter(Boolean);
  return parts.join(" • ");
}

function truncate(s: string, max = 240) {
  const t = s.trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

export default function ReviewsClient({
  reviews,
  query,
}: {
  reviews: ReviewRow[];
  query?: string;
}) {
  const q = (query ?? "").trim();

  const sorted = [...reviews].sort((a, b) => {
    if (!q) return 0;

    const sa = matchScore(a, q);
    const sb = matchScore(b, q);
    if (sb !== sa) return sb - sa;

    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  });

  return (
    <>
      {/* ✅ Visible proof the query reached the client */}
      {q ? (
        <div className="rowWrap" style={{ margin: "10px 0 6px" }}>
          <span className="badge">Sorting by best match for: “{q}”</span>
        </div>
      ) : null}

      <ul className="reviewsGrid">
        {sorted.map((r) => {
          const idStr = String(r.id ?? "").trim();
          if (!idStr) return null;

          const hospital = safeText(r.hospital) || "Unknown hospital";
          const metaLine = buildMetaLine(r.city_state, r.unit);

          const reviewText = safeText(r.review);
          const preview = reviewText ? truncate(reviewText, 240) : "";

          const score = q ? matchScore(r, q) : 0;

          return (
            <li key={idStr} className="reviewCard">
              <div className="reviewTop">
                <div>
                  <div className="reviewHospital">{hospital}</div>

                  {metaLine ? (
                    <div className="reviewMeta">{metaLine}</div>
                  ) : (
                    <div className="reviewMeta kicker">
                      Location / unit not provided
                    </div>
                  )}

                  <div className="reviewBadges">
                    {q ? <span className="badge">Match score: {score.toFixed(0)}</span> : null}
                    {r.assignment_length ? (
                      <span className="badge">Length: {r.assignment_length}</span>
                    ) : null}
                    {r.agency ? <span className="badge">Agency: {r.agency}</span> : null}
                    {r.pay ? <span className="badge">Pay: {r.pay}</span> : null}
                  </div>
                </div>

                <div className="reviewRight">
                  <Stars rating={r.rating} />
                  <div className="kicker" style={{ marginTop: 6 }}>
                    {timeAgo(r.created_at)}
                  </div>
                </div>
              </div>

              {preview ? <p className="reviewText">{preview}</p> : null}

              <div className="reviewBottom">
                <Link className="reviewLink" href={`/reviews/${idStr}`}>
                  View details →
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}