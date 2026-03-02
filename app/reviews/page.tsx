// app/reviews/page.tsx
import Link from "next/link";
import HospitalAverages from "./HospitalAverages";
import ReviewsClient from "./ReviewsClient";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export type ReviewRow = {
  id: number;
  created_at: string | null;
  hospital: string | null;
  city_state: string | null;
  unit: string | null;
  agency: string | null;
  pay: string | null;
  assignment_length: string | null;
  review: string | null;
  rating: number | null;
};

function escapeIlikeQuery(q: string) {
  // Escape Postgres LIKE wildcards so a user searching "50% off" or "_" doesn't behave oddly.
  // We still wrap with %...% afterwards.
  return q.replace(/[%_\\]/g, (m) => `\\${m}`);
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const rawQ = (searchParams?.q ?? "").trim();
  const q = rawQ;

  const supabase = supabaseServer();

  let query = supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,review,rating"
    )
    .order("created_at", { ascending: false });

  if (q) {
    const safe = escapeIlikeQuery(q);

    // NOTE: Using .or with ilike patterns; the escape function prevents accidental wildcarding.
    // Supabase/Postgres treats backslash as escape in LIKE patterns depending on settings,
    // but this still improves behavior for most cases.
    query = query.or(
      [
        `hospital.ilike.%${safe}%`,
        `city_state.ilike.%${safe}%`,
        `unit.ilike.%${safe}%`,
        `agency.ilike.%${safe}%`,
      ].join(",")
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("getReviews error:", error.message);
    return (
      <section>
        <div className="pageHeader">
          <div className="rowWrap" style={{ marginBottom: 10 }}>
            <Link className="pill" href="/">
              ← Home
            </Link>
          </div>

          <h1 className="pageTitle">Reviews</h1>
          <p className="pageSubtitle">Could not load reviews.</p>
        </div>

        <HospitalAverages />
      </section>
    );
  }

  const reviews: ReviewRow[] = Array.isArray(data) ? (data as ReviewRow[]) : [];

  // Keep client component happy: undefined instead of null for created_at
  const reviewsForClient = reviews.map((r) => ({
    ...r,
    created_at: r.created_at ?? undefined,
  }));

  const resultsCount = reviewsForClient.length;

  return (
    <section>
      <div className="pageHeader">
        <div className="pageHeaderTop">
          <div>
            <div className="rowWrap" style={{ marginBottom: 10 }}>
              <Link className="pill" href="/">
                ← Home
              </Link>
              <span className="kicker">Anonymous • No login required</span>
            </div>

            <h1 className="pageTitle">Reviews</h1>
            <p className="pageSubtitle">
              Browse honest travel nurse reviews. Search by hospital, city/state, unit, or agency.
            </p>
          </div>

          <Link className="pill pillPrimary" href="/submit">
            Submit a Review
          </Link>
        </div>

        <form className="searchRow" action="/reviews" method="GET">
          <input
            className="input"
            name="q"
            defaultValue={q}
            placeholder="Search: Sanford, Fargo, ND, ICU, Aya…"
            aria-label="Search reviews"
          />
          <button className="button" type="submit">
            Search
          </button>

          {q ? (
            <Link className="pill" href="/reviews" aria-label="Clear search">
              Clear
            </Link>
          ) : null}
        </form>

        <div className="resultsMeta">
          <span className="kicker">
            {resultsCount} {resultsCount === 1 ? "review" : "reviews"}
            {q ? (
              <>
                {" "}
                • Showing results for <span className="chip">{q}</span>
              </>
            ) : null}
          </span>
        </div>
      </div>

      <HospitalAverages />

      {resultsCount === 0 ? (
        <div className="card cardPad" style={{ marginTop: 12 }}>
          <div className="h1" style={{ fontSize: 18, marginBottom: 6 }}>
            No reviews found
          </div>
          <p className="sub" style={{ marginBottom: 14 }}>
            Try a different search (city/state, hospital name, unit), or be the first to submit one.
          </p>
          <div className="rowWrap">
            <Link className="pill pillPrimary" href="/submit">
              Submit the first review
            </Link>
            <Link className="pill" href="/reviews">
              Browse all reviews
            </Link>
          </div>
        </div>
      ) : (
        <ReviewsClient reviews={reviewsForClient as any} />
      )}
    </section>
  );
}