import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type Review = {
  id: number;
  hospital: string | null;
  city_state: string | null;
  unit: string | null;
  rating: number | null;
  review: string | null;
  created_at: string | null;
};

const states: Record<string, { name: string; abbreviation: string }> = {
  california: { name: "California", abbreviation: "CA" },
  texas: { name: "Texas", abbreviation: "TX" },
  florida: { name: "Florida", abbreviation: "FL" },
  minnesota: { name: "Minnesota", abbreviation: "MN" },
  "north-dakota": { name: "North Dakota", abbreviation: "ND" },
  washington: { name: "Washington", abbreviation: "WA" },
  colorado: { name: "Colorado", abbreviation: "CO" },
  illinois: { name: "Illinois", abbreviation: "IL" },
  "new-york": { name: "New York", abbreviation: "NY" },
  arizona: { name: "Arizona", abbreviation: "AZ" },

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

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;

  const stateKey = state.toLowerCase();
  const stateInfo = states[stateKey];

  if (!stateInfo) {
    notFound();
  }

  const supabase = supabaseServer();

  const { data } = await supabase
    .from("reviews")
    .select("id,hospital,city_state,unit,rating,review,created_at")
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as Review[];

  const stateReviews = reviews.filter((review) => {
    const location = review.city_state?.toUpperCase() || "";

    return location.includes(`, ${stateInfo.abbreviation}`);
  });

  if (stateReviews.length === 0) {
    return (
      <section>
        <div className="pageHeader">
          <p className="heroEyebrow">State Reviews</p>

          <h1 className="pageTitle">
            No Reviews Yet
          </h1>

          <p className="pageSubtitle">
            No travel nurse reviews have been submitted for{" "}
            {stateInfo.name} yet.
          </p>

          <div className="rowWrap" style={{ marginTop: 18 }}>
            <Link className="pill pillPrimary" href="/submit">
              Submit the First Review
            </Link>

            <Link className="pill" href="/reviews">
              Browse Reviews
            </Link>
          </div>
        </div>
      </section>
    );
  }

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
      <div className="pageHeader">
        <p className="heroEyebrow">State Reviews</p>

        <h1 className="pageTitle">
          {stateInfo.name} Travel Nurse Reviews
        </h1>

        <p className="pageSubtitle">
          Browse anonymous travel nurse reviews, hospital ratings,
          and assignment experiences in {stateInfo.name}.
        </p>
      </div>

      <div className="heroStats" style={{ marginTop: 18, marginBottom: 26 }}>
        <div className="statCard">
          <strong>{stateReviews.length}</strong>
          <span>reviews</span>
        </div>

        <div className="statCard">
          <strong>{hospitals.length}</strong>
          <span>hospitals</span>
        </div>

        <div className="statCard">
          <strong>{stateInfo.abbreviation}</strong>
          <span>state</span>
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
                <span>
                  {hospital.count} review
                  {hospital.count === 1 ? "" : "s"}
                </span>

                <span className="trendLink">
                  View hospital →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}