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

// ✅ In your Next.js 16 setup, searchParams can be a Promise
type SearchParamsMaybePromise =
  | { q?: string }
  | Promise<{ q?: string }>;

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: SearchParamsMaybePromise;
}) {
  const resolved = await Promise.resolve(searchParams as any);
  const q = String(resolved?.q ?? "").trim();

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,review,rating"
    )
    .order("created_at", { ascending: false })
    .limit(300);

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

  const reviewsForClient = reviews.map((r) => ({
    ...r,
    created_at: r.created_at ?? undefined,
  }));

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
              Search ranks best matches first (hospital, city/state, unit, agency, review text).
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
            placeholder="Search: Palmdale • Denver • Aberdeen • ICU • Aya…"
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
      </div>

      <HospitalAverages />

      {/* ✅ Pass query down so the client can sort */}
      <ReviewsClient reviews={reviewsForClient as any} query={q} />
    </section>
  );
}