// app/reviews/page.tsx
import Link from "next/link";
import ReviewsClient from "./ReviewsClient";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const states = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"
];

const specialties = [
  "ICU",
  "ER",
  "PACU",
  "Med Surg",
  "Telemetry",
  "OR",
  "Labor & Delivery",
  "NICU",
  "Pediatrics",
  "Oncology",
  "Stepdown",
  "CVICU",
  "Psych",
  "Rehab",
  "Long Term Care",
];

export default async function ReviewsPage({ searchParams }: any) {
  const resolved = await Promise.resolve(searchParams);

  const q = String(resolved?.q ?? "").trim();
  const ratingParam = String(resolved?.rating ?? "").trim();
  const stateFilter = String(resolved?.state ?? "").trim();
  const specialtyFilter = String(resolved?.specialty ?? "").trim();

  const supabase = supabaseServer();

  let query = supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,charting_system,review,rating"
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (ratingParam === "5") query = query.eq("rating", 5);
  if (ratingParam === "2") query = query.lte("rating", 2);

  const { data, error } = await query;

  if (error) {
    console.error("getReviews error:", error.message);

    return (
      <section>
        <div className="pageHeader">
          <Link className="pill" href="/">← Home</Link>
          <h1 className="pageTitle">Reviews</h1>
          <p className="pageSubtitle">Could not load reviews.</p>
        </div>
      </section>
    );
  }

  const reviews = Array.isArray(data) ? data : [];

  return (
    <section>
      <div className="pageHeader">
        <div className="pageHeaderTop">
          <div>
            <div className="rowWrap" style={{ marginBottom: 10 }}>
              <Link className="pill" href="/">← Home</Link>
              <span className="kicker">Anonymous • No login required</span>
            </div>

            <h1 className="pageTitle">Reviews</h1>

            <p className="pageSubtitle">
              {reviews.length} review{reviews.length === 1 ? "" : "s"} shown.
              Search by hospital, city, state, specialty, agency, or charting system.
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
            placeholder="Search hospital, city, agency, charting system..."
            aria-label="Search reviews"
          />

          <select className="input" name="state" defaultValue={stateFilter}>
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select className="input" name="specialty" defaultValue={specialtyFilter}>
            <option value="">All specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <button className="button" type="submit">
            Filter
          </button>

          {(q || ratingParam || stateFilter || specialtyFilter) && (
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

        {(q || stateFilter || specialtyFilter) && (
          <p className="kicker resultsMeta">
            Showing results
            {q ? ` for “${q}”` : ""}
            {stateFilter ? ` in ${stateFilter}` : ""}
            {specialtyFilter ? ` for ${specialtyFilter}` : ""}
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
        <ReviewsClient
          reviews={reviews as any}
          query={q}
          stateFilter={stateFilter}
          specialtyFilter={specialtyFilter}
        />
      )}
    </section>
  );
}