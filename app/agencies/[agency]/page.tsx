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
  contract_timeframe: string | null;
  would_work_again: string | null;
  housing_area_rating: string | null;
  floating_frequency: string | null;
  charting_system: string | null;
  review: string | null;
  rating: number | null;
};

type PageProps = {
  params: Promise<{ agency: string }>;
};

function slugify(value: string | null) {
  return (value || "unknown")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function agencyFromSlug(slug: string) {
  return slug.replace(/-/g, " ").trim();
}

function makeHospitalSlug(hospital: string | null, cityState: string | null) {
  return `${hospital || "unknown-hospital"}-${cityState || "unknown-location"}`
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(date: string | null) {
  if (!date) return "Recently reviewed";

  const now = new Date();
  const reviewDate = new Date(date);
  const diffMs = now.getTime() - reviewDate.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days < 1) return "Reviewed today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(days / 365);

  return `${years} year${years === 1 ? "" : "s"} ago`;
}

async function getAgencyReviews(agencySlug: string) {
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("reviews")
    .select(
      "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,contract_timeframe,would_work_again,housing_area_rating,floating_frequency,charting_system,review,rating"
    )
    .eq("status", "approved")
.not("agency", "is", null)
    .order("created_at", { ascending: false })
    .limit(1000);

  const reviews = (data ?? []) as Review[];

  return reviews.filter((review) => slugify(review.agency) === agencySlug);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { agency } = await params;
  const reviews = await getAgencyReviews(agency);

  if (reviews.length === 0) {
    return {
      title: "Travel Nurse Agency Reviews | RateMyContract",
    };
  }

  const agencyName = reviews[0].agency || agencyFromSlug(agency);

  return {
    title: `${agencyName} Travel Nurse Contract Reviews | RateMyContract`,
    description: `Browse anonymous travel nurse contract reviews involving ${agencyName}. Compare hospitals, pay packages, units, floating frequency, housing experiences, and assignment ratings.`,
  };
}

export default async function AgencyPage({ params }: PageProps) {
  const { agency } = await params;
  const agencyReviews = await getAgencyReviews(agency);

  if (agencyReviews.length === 0) {
    notFound();
  }

  const agencyName = agencyReviews[0].agency || agencyFromSlug(agency);

  const ratingReviews = agencyReviews.filter((review) => review.rating);

  const averageRating =
    ratingReviews.length > 0
      ? (
          ratingReviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
          ) / ratingReviews.length
        ).toFixed(1)
      : "N/A";

  const returnAnswers = agencyReviews.filter(
    (review) => review.would_work_again
  );

  const yesReturns = returnAnswers.filter(
    (review) => review.would_work_again === "Yes"
  );

  const returnRate =
    returnAnswers.length > 0
      ? Math.round((yesReturns.length / returnAnswers.length) * 100)
      : null;

  const hospitals = Array.from(
    new Map(
      agencyReviews.map((review) => [
        `${review.hospital}-${review.city_state}`,
        {
          hospital: review.hospital,
          city_state: review.city_state,
          slug: makeHospitalSlug(review.hospital, review.city_state),
        },
      ])
    ).values()
  );

  const units = Array.from(
    new Set(agencyReviews.map((review) => review.unit).filter(Boolean))
  ) as string[];

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
        <p className="heroEyebrow">Agency Reviews</p>

        <h1 className="pageTitle">
          {agencyName} Travel Nurse Contract Reviews
        </h1>

        <p className="pageSubtitle">
          Anonymous travel nurse reviews involving {agencyName}. Compare
          hospitals, units, pay packages, floating frequency, housing
          experiences, and whether nurses would take another contract.
        </p>
      </div>

      <section
        className="card cardPad"
        style={{
          marginTop: 18,
          marginBottom: 24,
        }}
      >
        <div className="heroStats" style={{ marginTop: 0 }}>
          <div className="statCard">
            <strong>{agencyReviews.length}</strong>
            <span>review{agencyReviews.length === 1 ? "" : "s"}</span>
          </div>

          <div className="statCard">
            <strong>⭐ {averageRating}</strong>
            <span>average rating</span>
          </div>

          <div className="statCard">
            <strong>{returnRate === null ? "N/A" : `${returnRate}%`}</strong>
            <span>would take another contract</span>
          </div>
        </div>

        {units.length > 0 && (
          <p className="kicker" style={{ marginTop: 14 }}>
            Units mentioned: {units.slice(0, 12).join(", ")}
          </p>
        )}

        <p className="kicker" style={{ marginTop: 8 }}>
          Hospitals mentioned: {hospitals.length}
        </p>
      </section>

      {hospitals.length > 0 && (
        <section style={{ marginBottom: 26 }}>
          <div className="sectionHeaderRow">
            <div>
              <p className="sectionEyebrow">Hospitals</p>

              <h2 className="sectionTitle">
                Hospitals Reviewed With {agencyName}
              </h2>
            </div>
          </div>

          <div className="trendingGrid">
            {hospitals.slice(0, 12).map((hospital) => (
              <Link
                key={hospital.slug}
                href={`/hospitals/${hospital.slug}`}
                className="trendCard"
              >
                <div className="trendTop">
                  <div>
                    <h3 className="trendHospital">
                      {hospital.hospital || "Unknown Hospital"}
                    </h3>

                    <p className="trendLocation">
                      {hospital.city_state || "Unknown location"}
                    </p>
                  </div>
                </div>

                <div className="trendBottom">
                  <span>View hospital reviews</span>
                  <span className="trendLink">Open →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="sectionHeaderRow">
          <div>
            <p className="sectionEyebrow">Latest</p>

            <h2 className="sectionTitle">Latest {agencyName} Reviews</h2>
          </div>
        </div>

        <div className="reviewsGrid">
          {agencyReviews.map((review) => (
            <Link
              key={review.id}
              href={`/reviews/${review.id}`}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
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
                      {review.created_at
                        ? ` • ${formatDate(review.created_at)}`
                        : ""}
                    </div>
                  </div>

                  <div className="reviewRight">⭐ {review.rating ?? "N/A"}</div>
                </div>

                <div className="reviewBadges">
                  {review.contract_timeframe && (
                    <span className="badge">
                      🕒 {review.contract_timeframe}
                    </span>
                  )}

                  {review.would_work_again && (
                    <span
                      className="badge"
                      style={{
                        background:
                          review.would_work_again === "Yes"
                            ? "rgba(34,197,94,.14)"
                            : review.would_work_again === "No"
                            ? "rgba(239,68,68,.14)"
                            : "rgba(245,158,11,.14)",
                      }}
                    >
                      {review.would_work_again === "Yes"
                        ? "✅ Would return"
                        : review.would_work_again === "No"
                        ? "❌ Would not return"
                        : "⚠️ Maybe return"}
                    </span>
                  )}

                  {review.agency && (
                    <span className="badge">{review.agency}</span>
                  )}

                  {review.pay && <span className="badge">{review.pay}</span>}

                  {review.assignment_length && (
                    <span className="badge">{review.assignment_length}</span>
                  )}

                  {review.housing_area_rating && (
                    <span className="badge">
                      Housing: {review.housing_area_rating}
                    </span>
                  )}

                  {review.floating_frequency && (
                    <span className="badge">{review.floating_frequency}</span>
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

                  <span className="pill">Hospital page</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}