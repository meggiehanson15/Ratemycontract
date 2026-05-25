import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Review = {
  id: number;
  created_at: string | null;
  hospital: string | null;
  city_state: string | null;
  unit: string | null;
  agency: string | null;
  review: string | null;
  rating: number | null;
  status: string | null;
};

export default async function AdminReviewsPage() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,review,rating,status"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const reviews = (data ?? []) as Review[];
  const flagged = reviews.filter((review) => review.status === "flagged");
  const approved = reviews.filter((review) => review.status === "approved");

  return (
    <section>
      <div className="pageHeader">
        <h1 className="pageTitle">Admin Review Moderation</h1>

        <p className="pageSubtitle">
          Review flagged submissions and monitor recent approved reviews.
        </p>
      </div>

      {error && (
        <div className="card cardPad" style={{ marginTop: 18 }}>
          <p className="sub">Something went wrong loading reviews.</p>
        </div>
      )}

      <section className="card cardPad" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Flagged Reviews</h2>

        {flagged.length === 0 ? (
          <p className="sub">No flagged reviews right now.</p>
        ) : (
          <div className="reviewsGrid">
            {flagged.map((review) => (
              <div key={review.id} className="reviewCard">
                <div className="reviewTop">
                  <div>
                    <div className="reviewHospital">
                      {review.hospital || "Unknown Hospital"}
                    </div>

                    <div className="reviewMeta">
                      ID: {review.id}
                      {review.city_state ? ` • ${review.city_state}` : ""}
                      {review.unit ? ` • ${review.unit}` : ""}
                    </div>
                  </div>

                  <div className="reviewRight">⭐ {review.rating ?? "N/A"}</div>
                </div>

                <div className="reviewBadges">
                  <span className="badge">Status: {review.status}</span>
                  {review.agency && <span className="badge">{review.agency}</span>}
                </div>

                <p className="reviewText">
                  {review.review || "No review text provided."}
                </p>

                <p className="kicker" style={{ marginTop: 10 }}>
                  To approve or delete this review, go to Supabase → reviews
                  table → find ID {review.id}.
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card cardPad" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Recent Approved Reviews</h2>

        {approved.length === 0 ? (
          <p className="sub">No approved reviews found.</p>
        ) : (
          <div className="reviewsGrid">
            {approved.slice(0, 20).map((review) => (
              <div key={review.id} className="reviewCard">
                <div className="reviewTop">
                  <div>
                    <div className="reviewHospital">
                      {review.hospital || "Unknown Hospital"}
                    </div>

                    <div className="reviewMeta">
                      ID: {review.id}
                      {review.city_state ? ` • ${review.city_state}` : ""}
                      {review.unit ? ` • ${review.unit}` : ""}
                    </div>
                  </div>

                  <div className="reviewRight">⭐ {review.rating ?? "N/A"}</div>
                </div>

                <p className="reviewText">
                  {review.review
                    ? review.review.length > 180
                      ? review.review.slice(0, 180) + "..."
                      : review.review
                    : "No review text provided."}
                </p>

                <div className="reviewBottom">
                  <Link className="reviewLink" href={`/reviews/${review.id}`}>
                    View public review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}