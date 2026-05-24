import Link from "next/link";
import ReviewsClient from "../ReviewsClient";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function MostHelpfulReviewsPage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,contract_timeframe,would_work_again,charting_system,review,rating,helpful_count,not_helpful_count",
    )
    .order("helpful_count", { ascending: false })
    .limit(100);

  const reviews = data ?? [];

  return (
    <section>
      <div className="pageHeader">
        <div className="pageHeaderTop">
          <div>
            <p className="heroEyebrow">Community Favorites</p>

            <h1 className="pageTitle">
              Most Helpful Travel Nurse Reviews
            </h1>

            <p className="pageSubtitle">
              Browse the most helpful travel nurse contract reviews ranked by
              community votes.
            </p>
          </div>

          <Link className="pill pillPrimary" href="/submit">
            Submit a Review
          </Link>
        </div>

        <div className="rowWrap resultsMeta">
          <span className="chip">
            {reviews.length} helpful review
            {reviews.length === 1 ? "" : "s"}
          </span>

          <Link className="chip" href="/reviews">
            Latest Reviews
          </Link>

          <Link className="chip" href="/reviews/top-this-month">
            Best This Month
          </Link>
        </div>
      </div>

      {error ? (
        <div className="card cardPad">
          <p className="sub">Something went wrong loading reviews.</p>
        </div>
      ) : (
        <ReviewsClient
          reviews={reviews}
          query=""
          stateFilter=""
          specialtyFilter=""
        />
      )}
    </section>
  );
}