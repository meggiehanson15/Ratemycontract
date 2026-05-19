import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Review = {
  id: number;
  created_at: string | null;
  hospital: string | null;
  city_state: string | null;
  unit: string | null;
  agency: string | null;
  pay: string | null;
  assignment_length: string | null;
  charting_system: string | null;
  review: string | null;
  rating: number | null;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

function makeSlug(hospital: string | null, cityState: string | null) {
  return `${hospital || "unknown-hospital"}-${cityState || "unknown-location"}`
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(date: string | null) {
  if (!date) return "Recently reviewed";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

async function getHospitalReviews(slug: string) {
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,charting_system,review,rating"
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  const allReviews = (data ?? []) as Review[];

  return allReviews.filter(
    (review) => makeSlug(review.hospital, review.city_state) === slug
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const reviews = await getHospitalReviews(slug);

  if (reviews.length === 0) {
    return {
      title: "Hospital Reviews | RateMyContract",
    };
  }

  const first = reviews[0];
  const title = `${first.hospital} ${first.city_state || ""} Travel Nurse Reviews | RateMyContract`;

  return {
    title,
    description: `Read anonymous travel nurse contract reviews for ${
      first.hospital
    }${first.city_state ? ` in ${first.city_state}` : ""}. See ratings, units, pay details, charting systems, and assignment experiences.`,
  };
}

export default async function HospitalPage({ params }: PageProps) {
  const { slug } = await params;
  const hospitalReviews = await getHospitalReviews(slug);

  if (hospitalReviews.length === 0) {
    notFound();
  }

  const firstReview = hospitalReviews[0];

  const ratingReviews = hospitalReviews.filter((review) => review.rating);
  const averageRating =
    ratingReviews.length > 0
      ? (
          ratingReviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
          ) / ratingReviews.length
        ).toFixed(1)
      : "N/A";

  const units = Array.from(
    new Set(hospitalReviews.map((review) => review.unit).filter(Boolean))
  );

  const chartingSystems = Array.from(
    new Set(
      hospitalReviews.map((review) => review.charting_system).filter(Boolean)
    )
  );

  return (
    <section>
      <div className="rowWrap" style={{ marginBottom: 14 }}>
        <Link className="pill" href="/reviews">
          ← Back to Reviews
        </Link>

        <Link className="pill pillPrimary" href="/submit">
          Submit a Review
        </Link>
      </div>

      <div className="pageHeader">
        <h1 className="pageTitle">
          {firstReview.hospital || "Unknown Hospital"} Travel Nurse Reviews
        </h1>

        <p className="pageSubtitle">
          Anonymous travel nurse contract reviews for{" "}
          {firstReview.hospital || "this hospital"}
          {firstReview.city_state ? ` in ${firstReview.city_state}` : ""}.
        </p>
      </div>

      <section className="card cardPad" style={{ marginBottom: 16 }}>
        <div className="heroStats" style={{ marginTop: 0 }}>
          <div className="statCard">
            <strong>{hospitalReviews.length}</strong>
            <span>review{hospitalReviews.length === 1 ? "" : "s"}</span>
          </div>

          <div className="statCard">
            <strong>⭐ {averageRating}</strong>
            <span>average rating</span>
          </div>

          <div className="statCard">
            <strong>{units.length}</strong>
            <span>unit{units.length === 1 ? "" : "s"} reviewed</span>
          </div>
        </div>

        {units.length > 0 && (
          <p className="kicker" style={{ marginTop: 14 }}>
            Units mentioned: {units.join(", ")}
          </p>
        )}

        {chartingSystems.length > 0 && (
          <p className="kicker" style={{ marginTop: 8 }}>
            Charting systems mentioned: {chartingSystems.join(", ")}
          </p>
        )}

        <div className="rowWrap" style={{ marginTop: 16 }}>
          <Link className="pill pillPrimary" href="/submit">
            Review this hospital
          </Link>

          <Link
            className="pill"
            href={`/reviews?q=${encodeURIComponent(firstReview.hospital || "")}`}
          >
            View in all reviews
          </Link>
        </div>
      </section>

      <div className="reviewsGrid">
        {hospitalReviews.map((review) => (
          <Link
            key={review.id}
            href={`/reviews/${review.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="reviewCard">
              <div className="reviewTop">
                <div>
                  <div className="reviewHospital">
                    {review.hospital || "Unknown Hospital"}
                  </div>

                  <div className="reviewMeta">
                    {review.city_state || "Unknown location"}
                    {review.unit ? ` • ${review.unit}` : ""}
                    {review.created_at ? ` • ${formatDate(review.created_at)}` : ""}
                  </div>
                </div>

                <div className="reviewRight">⭐ {review.rating ?? "N/A"}</div>
              </div>

              <div className="reviewBadges">
                {review.agency && <span className="badge">{review.agency}</span>}
                {review.pay && <span className="badge">{review.pay}</span>}
                {review.assignment_length && (
                  <span className="badge">{review.assignment_length}</span>
                )}
                {review.charting_system && (
                  <span className="badge">{review.charting_system}</span>
                )}
              </div>

              <p className="reviewText">
                {review.review
                  ? review.review.length > 180
                    ? review.review.slice(0, 180) + "..."
                    : review.review
                  : "No review text provided."}
              </p>

              <div className="reviewBottom">
                <span className="reviewLink">Read full review →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}