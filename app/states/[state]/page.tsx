import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Review = {
  id: number;
  hospital: string | null;
  city_state: string | null;
  unit: string | null;
  agency: string | null;
  pay: string | null;
  assignment_length: string | null;
  charting_system: string | null;
  rating: number | null;
  review: string | null;
  created_at: string | null;
};

type PageProps = {
  params: Promise<{ state: string }>;
};

const states: Record<string, { name: string; abbreviation: string }> = {
  alabama: { name: "Alabama", abbreviation: "AL" },
  alaska: { name: "Alaska", abbreviation: "AK" },
  arizona: { name: "Arizona", abbreviation: "AZ" },
  arkansas: { name: "Arkansas", abbreviation: "AR" },
  california: { name: "California", abbreviation: "CA" },
  colorado: { name: "Colorado", abbreviation: "CO" },
  connecticut: { name: "Connecticut", abbreviation: "CT" },
  delaware: { name: "Delaware", abbreviation: "DE" },
  florida: { name: "Florida", abbreviation: "FL" },
  georgia: { name: "Georgia", abbreviation: "GA" },
  hawaii: { name: "Hawaii", abbreviation: "HI" },
  idaho: { name: "Idaho", abbreviation: "ID" },
  illinois: { name: "Illinois", abbreviation: "IL" },
  indiana: { name: "Indiana", abbreviation: "IN" },
  iowa: { name: "Iowa", abbreviation: "IA" },
  kansas: { name: "Kansas", abbreviation: "KS" },
  kentucky: { name: "Kentucky", abbreviation: "KY" },
  louisiana: { name: "Louisiana", abbreviation: "LA" },
  maine: { name: "Maine", abbreviation: "ME" },
  maryland: { name: "Maryland", abbreviation: "MD" },
  massachusetts: { name: "Massachusetts", abbreviation: "MA" },
  michigan: { name: "Michigan", abbreviation: "MI" },
  minnesota: { name: "Minnesota", abbreviation: "MN" },
  mississippi: { name: "Mississippi", abbreviation: "MS" },
  missouri: { name: "Missouri", abbreviation: "MO" },
  montana: { name: "Montana", abbreviation: "MT" },
  nebraska: { name: "Nebraska", abbreviation: "NE" },
  nevada: { name: "Nevada", abbreviation: "NV" },
  "new-hampshire": { name: "New Hampshire", abbreviation: "NH" },
  "new-jersey": { name: "New Jersey", abbreviation: "NJ" },
  "new-mexico": { name: "New Mexico", abbreviation: "NM" },
  "new-york": { name: "New York", abbreviation: "NY" },
  "north-carolina": { name: "North Carolina", abbreviation: "NC" },
  "north-dakota": { name: "North Dakota", abbreviation: "ND" },
  ohio: { name: "Ohio", abbreviation: "OH" },
  oklahoma: { name: "Oklahoma", abbreviation: "OK" },
  oregon: { name: "Oregon", abbreviation: "OR" },
  pennsylvania: { name: "Pennsylvania", abbreviation: "PA" },
  "rhode-island": { name: "Rhode Island", abbreviation: "RI" },
  "south-carolina": { name: "South Carolina", abbreviation: "SC" },
  "south-dakota": { name: "South Dakota", abbreviation: "SD" },
  tennessee: { name: "Tennessee", abbreviation: "TN" },
  texas: { name: "Texas", abbreviation: "TX" },
  utah: { name: "Utah", abbreviation: "UT" },
  vermont: { name: "Vermont", abbreviation: "VT" },
  virginia: { name: "Virginia", abbreviation: "VA" },
  washington: { name: "Washington", abbreviation: "WA" },
  "west-virginia": { name: "West Virginia", abbreviation: "WV" },
  wisconsin: { name: "Wisconsin", abbreviation: "WI" },
  wyoming: { name: "Wyoming", abbreviation: "WY" },

  ca: { name: "California", abbreviation: "CA" },
  tx: { name: "Texas", abbreviation: "TX" },
  fl: { name: "Florida", abbreviation: "FL" },
  mn: { name: "Minnesota", abbreviation: "MN" },
  nd: { name: "North Dakota", abbreviation: "ND" },
};

function makeHospitalSlug(hospital: string | null, cityState: string | null) {
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { state } = await params;
  const stateInfo = states[state.toLowerCase()];

  if (!stateInfo) {
    return {
      title: "State Reviews | RateMyContract",
    };
  }

  return {
    title: `${stateInfo.name} Travel Nurse Contract Reviews | RateMyContract`,
    description: `Browse anonymous travel nurse contract reviews in ${stateInfo.name}. Compare hospitals, units, agencies, pay details, charting systems, and assignment experiences.`,
  };
}

export default async function StatePage({ params }: PageProps) {
  const { state } = await params;
  const stateInfo = states[state.toLowerCase()];

  if (!stateInfo) {
    notFound();
  }

  const supabase = supabaseServer();

  const { data } = await supabase
    .from("reviews")
    .select(
      "id,hospital,city_state,unit,agency,pay,assignment_length,charting_system,rating,review,created_at"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1000);

  const reviews = (data ?? []) as Review[];

  const stateReviews = reviews.filter((review) => {
    const location = review.city_state?.toUpperCase() || "";
    return location.includes(`, ${stateInfo.abbreviation}`);
  });

  const ratingReviews = stateReviews.filter((review) => review.rating);

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
    new Set(stateReviews.map((review) => review.unit).filter(Boolean))
  ) as string[];

  const agencies = Array.from(
    new Set(stateReviews.map((review) => review.agency).filter(Boolean))
  ) as string[];

  const chartingSystems = Array.from(
    new Set(
      stateReviews.map((review) => review.charting_system).filter(Boolean)
    )
  ) as string[];

  const hospitalMap = new Map<
    string,
    {
      hospital: string | null;
      city_state: string | null;
      count: number;
      totalRating: number;
    }
  >();

  stateReviews.forEach((review) => {
    const key = `${review.hospital}-${review.city_state}`;

    if (!hospitalMap.has(key)) {
      hospitalMap.set(key, {
        hospital: review.hospital,
        city_state: review.city_state,
        count: 1,
        totalRating: Number(review.rating || 0),
      });
    } else {
      const existing = hospitalMap.get(key);

      if (existing) {
        existing.count += 1;
        existing.totalRating += Number(review.rating || 0);
      }
    }
  });

  const hospitals = Array.from(hospitalMap.values()).sort(
    (a, b) => b.count - a.count
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
        <p className="heroEyebrow">State Reviews</p>

        <h1 className="pageTitle">
          {stateInfo.name} Travel Nurse Contract Reviews
        </h1>

        <p className="pageSubtitle">
          Browse anonymous travel nurse contract reviews in {stateInfo.name}.
          Compare hospitals, units, agencies, pay packages, charting systems,
          and assignment experiences.
        </p>
      </div>

      <section
        className="card cardPad"
        style={{ marginTop: 18, marginBottom: 24 }}
      >
        <div className="heroStats" style={{ marginTop: 0 }}>
          <div className="statCard">
            <strong>{stateReviews.length}</strong>
            <span>review{stateReviews.length === 1 ? "" : "s"}</span>
          </div>

          <div className="statCard">
            <strong>{hospitals.length}</strong>
            <span>hospital{hospitals.length === 1 ? "" : "s"} reviewed</span>
          </div>

          <div className="statCard">
            <strong>⭐ {averageRating}</strong>
            <span>average rating</span>
          </div>
        </div>

        {units.length > 0 && (
          <p className="kicker" style={{ marginTop: 14 }}>
            Units mentioned: {units.slice(0, 14).join(", ")}
          </p>
        )}

        {agencies.length > 0 && (
          <p className="kicker" style={{ marginTop: 8 }}>
            Agencies mentioned: {agencies.slice(0, 14).join(", ")}
          </p>
        )}

        {chartingSystems.length > 0 && (
          <p className="kicker" style={{ marginTop: 8 }}>
            Charting systems mentioned:{" "}
            {chartingSystems.slice(0, 10).join(", ")}
          </p>
        )}
      </section>

      {stateReviews.length === 0 ? (
        <div className="card cardPad">
          <p className="sub">
            No travel nurse reviews have been submitted for {stateInfo.name} yet.
          </p>

          <Link className="pill pillPrimary" href="/submit">
            Submit the First Review
          </Link>
        </div>
      ) : (
        <>
          <section style={{ marginBottom: 26 }}>
            <div className="sectionHeaderRow">
              <div>
                <p className="sectionEyebrow">Hospitals</p>

                <h2 className="sectionTitle">
                  Hospitals Reviewed in {stateInfo.abbreviation}
                </h2>
              </div>
            </div>

            <div className="trendingGrid">
              {hospitals.map((hospital) => {
                const avg =
                  hospital.count > 0
                    ? (hospital.totalRating / hospital.count).toFixed(1)
                    : "N/A";

                const slug = makeHospitalSlug(
                  hospital.hospital,
                  hospital.city_state
                );

                return (
                  <Link
                    key={`${hospital.hospital}-${hospital.city_state}`}
                    href={`/hospitals/${slug}`}
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

                      <div className="trendRating">⭐ {avg}</div>
                    </div>

                    <div className="trendBottom">
                      <span>View details</span>

                      <span className="trendLink">View hospital →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <div className="sectionHeaderRow">
              <div>
                <p className="sectionEyebrow">Latest</p>

                <h2 className="sectionTitle">
                  Latest {stateInfo.abbreviation} Reviews
                </h2>
              </div>

              <Link
                className="pill"
                href={`/reviews?state=${stateInfo.abbreviation}`}
              >
                View All
              </Link>
            </div>

            <div className="reviewsGrid">
              {stateReviews.slice(0, 12).map((review) => {
                return (
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
                            {review.created_at
                              ? ` • ${formatDate(review.created_at)}`
                              : ""}
                          </div>
                        </div>

                        <div className="reviewRight">
                          ⭐ {review.rating ?? "N/A"}
                        </div>
                      </div>

                      <div className="reviewBadges">
                        {review.agency && (
                          <span className="badge">{review.agency}</span>
                        )}

                        {review.pay && (
                          <span className="badge">{review.pay}</span>
                        )}

                        {review.assignment_length && (
                          <span className="badge">
                            {review.assignment_length}
                          </span>
                        )}

                        {review.charting_system && (
                          <span className="badge">
                            {review.charting_system}
                          </span>
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
                );
              })}
            </div>
          </section>
        </>
      )}
    </section>
  );
}