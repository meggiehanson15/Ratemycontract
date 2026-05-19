import Link from "next/link";
import ReviewsClient from "./ReviewsClient";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    state?: string;
    specialty?: string;
    rating?: string;
    page?: string;
  }>;
};

export default async function ReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const q = params?.q || "";
  const state = params?.state || "";
  const specialty = params?.specialty || "";
  const rating = params?.rating || "";
  const currentPage = Math.max(Number(params?.page || "1"), 1);

  const pageSize = 100;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = supabaseServer();

  let query = supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,charting_system,review,rating,helpful_count,not_helpful_count",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (rating) {
    const ratingNumber = Number(rating);

    if (ratingNumber === 5) {
      query = query.eq("rating", 5);
    }

    if (ratingNumber === 2) {
      query = query.lte("rating", 2);
    }
  }

  const { data, count, error } = await query;

  const reviews = data ?? [];
  const totalReviews = count ?? 0;
  const totalPages = Math.max(Math.ceil(totalReviews / pageSize), 1);

  function buildPageHref(page: number) {
    const urlParams = new URLSearchParams();

    if (q) urlParams.set("q", q);
    if (state) urlParams.set("state", state);
    if (specialty) urlParams.set("specialty", specialty);
    if (rating) urlParams.set("rating", rating);

    urlParams.set("page", String(page));

    return `/reviews?${urlParams.toString()}`;
  }

  return (
    <section>
      <div className="pageHeader">
        <div className="pageHeaderTop">
          <div>
            <h1 className="pageTitle">Travel Nurse Contract Reviews</h1>

            <p className="pageSubtitle">
              Browse anonymous travel nurse contract reviews by hospital, city,
              state, specialty, agency, pay, and charting system.
            </p>
          </div>

          <Link className="pill pillPrimary" href="/submit">
            Submit a Review
          </Link>
        </div>

        <form action="/reviews" method="GET" className="searchRow">
          <input
            className="input"
            name="q"
            defaultValue={q}
            placeholder="Search hospital, city, state, agency, unit..."
          />

          <select className="input" name="state" defaultValue={state}>
            <option value="">All states</option>
            {[
              "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID",
              "IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS",
              "MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK",
              "OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV",
              "WI","WY",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select className="input" name="specialty" defaultValue={specialty}>
            <option value="">All specialties</option>
            <option value="icu">ICU</option>
            <option value="er">ER / ED</option>
            <option value="or">OR</option>
            <option value="pacu">PACU</option>
            <option value="med surg">Med Surg</option>
            <option value="telemetry">Telemetry</option>
            <option value="labor delivery">Labor & Delivery</option>
            <option value="nicu">NICU</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="oncology">Oncology</option>
            <option value="stepdown">Stepdown / PCU</option>
            <option value="cvicu">CVICU</option>
            <option value="psych">Psych</option>
            <option value="rehab">Rehab</option>
            <option value="long term care">Long Term Care</option>
          </select>

          {rating && <input type="hidden" name="rating" value={rating} />}

          <button className="button" type="submit">
            Search
          </button>
        </form>

        <div className="rowWrap resultsMeta">
          <span className="chip">
            {totalReviews} review{totalReviews === 1 ? "" : "s"}
          </span>

          <span className="chip">
            Page {currentPage} of {totalPages}
          </span>

          <Link className="chip" href="/reviews?rating=5">
            ⭐ Top Rated
          </Link>

          <Link className="chip" href="/reviews?rating=2">
            Low Rated
          </Link>

          <Link className="chip" href="/reviews">
            Clear Filters
          </Link>
        </div>
      </div>

      {error ? (
        <div className="card cardPad">
          <p className="sub">Something went wrong loading reviews.</p>
        </div>
      ) : (
        <>
          <ReviewsClient
            reviews={reviews}
            query={q}
            stateFilter={state}
            specialtyFilter={specialty}
          />

          {totalPages > 1 && (
            <div
              className="rowWrap"
              style={{
                marginTop: 20,
                justifyContent: "center",
              }}
            >
              {currentPage > 1 && (
                <Link className="pill" href={buildPageHref(currentPage - 1)}>
                  ← Previous Page
                </Link>
              )}

              <span className="chip">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages && (
                <Link className="pill pillPrimary" href={buildPageHref(currentPage + 1)}>
                  Next Page →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}