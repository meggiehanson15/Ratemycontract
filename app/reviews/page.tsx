// app/reviews/page.tsx
import Link from "next/link";
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

type SearchParamsMaybePromise =
  | { q?: string; rating?: string }
  | Promise<{ q?: string; rating?: string }>;

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams?: SearchParamsMaybePromise;
}) {
  const resolved = await Promise.resolve(searchParams as any);

  const q = String(resolved?.q ?? "").trim();
  const ratingParam = String(resolved?.rating ?? "").trim();

  const supabase = supabaseServer();

  let query = supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,review,rating"
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (ratingParam === "5") {
    query = query.eq("rating", 5);
  }

  if (ratingParam === "2") {
    query = query.lte("rating", 2);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getReviews error:", error.message);

    return (
      <section>
        <div className="pageHeader">
          <Link className="pill" href="/">
            ← Home
          </Link>

          <h1 className="pageTitle">Reviews</h1>
          <p className="pageSubtitle">Could not load reviews.</p>
        </div>
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
              {reviews.length} review{reviews.length === 1 ? "" : "s"} shown.
              Reviews reflect individual experiences and are not independently verified.
            </p>
          </div>

          <Link className="pill pillPrimary" href="/submit">
            <strong>Share Your Contract Experience</strong>
          </Link>
        </div>

        <form className="searchRow" action="/reviews" method="GET">
          <input
            className="input"
            name="q"
            defaultValue={q}
            placeholder="Search hospital, city, unit, or agency..."
            aria-label="Search reviews"
          />

          <button className="button" type="submit">
            Search
          </button>

          {(q || ratingParam) && (
            <Link className="pill" href="/reviews">
              Clear
            </Link>
          )}
        </form>

        <div className="rowWrap" style={{ marginTop: 12 }}>
          <Link className="chip" href="/reviews?rating=5">
            ⭐ Top Rated
          </Link>

          <Link className="chip" href="/reviews?rating=2">
            ⚠️ Low Rated
          </Link>
        </div>

        {ratingParam === "5" && (
          <p className="kicker resultsMeta">Showing 5-star reviews</p>
        )}

        {ratingParam === "2" && (
          <p className="kicker resultsMeta">
            Showing reviews rated 2 stars or lower
          </p>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="card cardPad">
          <p className="sub">
            No reviews yet for this filter — help another nurse by adding one.
          </p>

          <Link className="pill pillPrimary" href="/submit">
            Share Your Contract Experience
          </Link>
        </div>
      ) : (
        <ReviewsClient reviews={reviewsForClient as any} query={q} />
      )}
    </section>
  );
}