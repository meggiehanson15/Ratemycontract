// app/reviews/[id]/page.tsx
import Link from "next/link";
import CopyLinkButton from "@/app/components/CopyLinkButton";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type ParamsMaybePromise = { id: string } | Promise<{ id: string }>;

/* ---------- Helpers ---------- */
function safeText(v: unknown) {
  if (typeof v !== "string") return "";
  return v.trim();
}

function cleanCityState(v: unknown) {
  // Keep it simple & backwards compatible:
  // - normalize commas/spaces like "Aberdeen,sd" -> "Aberdeen, sd" (we won't force state caps here)
  // because new entries will already be saved as "City, ST"
  const s = safeText(v);
  if (!s) return "";
  return s.replace(/\s*,\s*/g, ", ").replace(/\s+/g, " ").trim();
}

/* ---------- Stars ---------- */
function Stars({ rating }: { rating?: number | null }) {
  if (typeof rating !== "number") {
    return <span className="kicker">—</span>;
  }

  const r = Math.max(1, Math.min(5, Math.round(rating)));

  return (
    <span className="stars" aria-label={`${r} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < r ? "starOn" : "starOff"}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      <span className="kicker" style={{ marginLeft: 10 }}>
        {r}/5
      </span>
    </span>
  );
}

/* ---------- Page ---------- */
export default async function ReviewDetailPage({
  params,
}: {
  params: ParamsMaybePromise;
}) {
  const resolvedParams = await Promise.resolve(params as any);
  const rawId = String(resolvedParams?.id ?? "").trim();

  /* ---------- Invalid ID ---------- */
  if (!rawId || !/^\d+$/.test(rawId)) {
    return (
      <section>
        <div className="rowWrap" style={{ marginTop: 18 }}>
          <Link className="pill" href="/reviews">
            ← Back to reviews
          </Link>
        </div>

        <div className="card cardPad" style={{ marginTop: 14 }}>
          <div className="h1" style={{ fontSize: 20 }}>
            Review not found
          </div>

          <p className="sub">
            Invalid review id: <strong>{rawId || "(empty)"}</strong>
          </p>

          <p className="kicker">
            Debug param received: <code>{String(resolvedParams?.id ?? "")}</code>
          </p>
        </div>
      </section>
    );
  }

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, created_at, city_state, hospital, unit, rating, assignment_length, review, agency, pay"
    )
    .eq("id", rawId)
    .single();

  /* ---------- Not Found ---------- */
  if (error || !data) {
    return (
      <section>
        <Link className="pill" href="/reviews">
          ← Back to reviews
        </Link>

        <div className="card cardPad" style={{ marginTop: 14 }}>
          <div className="h1" style={{ fontSize: 20 }}>
            Review not found
          </div>
          <p className="sub">{error?.message ?? "No data returned"}</p>
        </div>
      </section>
    );
  }

  const hospital = safeText(data.hospital) || "Hospital / Facility";
  const cityState = cleanCityState(data.city_state);
  const unit = safeText(data.unit);

  const posted = data.created_at
    ? new Date(data.created_at).toLocaleString()
    : "—";

  const reviewText = safeText(data.review) || "No written review provided.";

  // Build the subtitle cleanly with bullets only when needed
  const subtitleParts = [cityState, unit].filter(Boolean);
  const subtitle = subtitleParts.join(" • ");

  /* ---------- Report Email ---------- */
  const subject = encodeURIComponent(`Report review #${data.id}`);
  const body = encodeURIComponent(
    `Hi RateMyContract,

I want to report review #${data.id}.

Reason:

Link:
/reviews/${data.id}

Thanks.`
  );

  return (
    <section>
      {/* Navigation */}
      <div className="rowWrap" style={{ marginTop: 18 }}>
        <Link className="pill" href="/reviews">
          ← Back to reviews
        </Link>

        <Link className="pill" href="/submit">
          Submit another review
        </Link>
      </div>

      {/* Card */}
      <div className="card cardPad" style={{ marginTop: 14 }}>
        <div className="detailTop">
          <div>
            <h1 className="detailTitle">{hospital}</h1>

            {subtitle ? (
              <p className="detailSubtitle">{subtitle}</p>
            ) : (
              <p className="detailSubtitle kicker">Location / unit not provided</p>
            )}

            <div className="rowWrap" style={{ marginTop: 10 }}>
              {data.assignment_length ? (
                <span className="badge">Length: {data.assignment_length}</span>
              ) : null}

              {data.agency ? <span className="badge">Agency: {data.agency}</span> : null}

              {data.pay ? <span className="badge">Pay: {data.pay}</span> : null}
            </div>
          </div>

          <div className="detailRight">
            <Stars rating={data.rating} />
            <div className="kicker" style={{ marginTop: 6 }}>
              Posted: {posted}
            </div>
          </div>
        </div>

        <div className="hr" />

        <div>
          <div className="kicker" style={{ marginBottom: 8 }}>
            Written review
          </div>

          <p className="detailReview">{reviewText}</p>
        </div>

        <div className="hr" />

        <div className="detailActions rowWrap">
          <a
            className="pill"
            href={`mailto:ratemycontractsite@gmail.com?subject=${subject}&body=${body}`}
          >
            Report this review
          </a>

          <CopyLinkButton />
        </div>

        <p className="kicker" style={{ marginTop: 10 }}>
          Reviews are user-submitted and may not be verified.
        </p>
      </div>
    </section>
  );
}