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

const unitMap: Record<string, { name: string; aliases: string[] }> = {
  icu: { name: "ICU", aliases: ["icu", "intensive care"] },
  er: {
    name: "ER / ED",
    aliases: ["er", "ed", "emergency room", "emergency department"],
  },
  or: { name: "OR", aliases: ["or", "operating room"] },
  pacu: { name: "PACU", aliases: ["pacu"] },
  telemetry: { name: "Telemetry", aliases: ["telemetry", "tele"] },
  "med-surg": {
    name: "Med Surg",
    aliases: ["med surg", "medsurg"],
  },
  nicu: { name: "NICU", aliases: ["nicu"] },
  oncology: { name: "Oncology", aliases: ["oncology"] },
  stepdown: {
    name: "Stepdown / PCU",
    aliases: ["stepdown", "pcu"],
  },
  cvicu: { name: "CVICU", aliases: ["cvicu"] },
  psych: { name: "Psych", aliases: ["psych"] },
  rehab: { name: "Rehab", aliases: ["rehab"] },
  "labor-delivery": {
    name: "Labor & Delivery",
    aliases: ["labor delivery", "labor and delivery", "l&d"],
  },
};

function normalize(value: string | null) {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function makeHospitalSlug(hospital: string | null, cityState: string | null) {
  return `${hospital || "unknown-hospital"}-${cityState || "unknown-location"}`
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ unit: string }>;
}) {
  const { unit } = await params;

  const unitInfo = unitMap[unit.toLowerCase()];

  if (!unitInfo) {
    notFound();
  }

  const supabase = supabaseServer();

  const { data } = await supabase
    .from("reviews")
    .select("id,hospital,city_state,unit,rating,review,created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as Review[];

  const unitReviews = reviews.filter((review) => {
    const normalizedUnit = normalize(review.unit);

    return unitInfo.aliases.some((alias) => {
      const normalizedAlias = normalize(alias);

      return (
        normalizedUnit === normalizedAlias ||
        normalizedUnit.includes(normalizedAlias)
      );
    });
  });

  if (unitReviews.length === 0) {
    return (
      <section>
        <div className="pageHeader">
          <p className="heroEyebrow">Specialty Reviews</p>

          <h1 className="pageTitle">No Reviews Yet</h1>

          <p className="pageSubtitle">
            No travel nurse reviews have been submitted for {unitInfo.name} yet.
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

  unitReviews.forEach((review) => {
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
        <p className="heroEyebrow">Specialty Reviews</p>

        <h1 className="pageTitle">{unitInfo.name} Travel Nurse Reviews</h1>

        <p className="pageSubtitle">
          Browse anonymous {unitInfo.name} travel nurse reviews, hospital
          ratings, and assignment experiences.
        </p>
      </div>

      <div className="heroStats" style={{ marginTop: 18, marginBottom: 26 }}>
        <div className="statCard">
          <strong>{unitReviews.length}</strong>
          <span>reviews</span>
        </div>

        <div className="statCard">
          <strong>{hospitals.length}</strong>
          <span>hospitals</span>
        </div>

        <div className="statCard">
          <strong>{unitInfo.name}</strong>
          <span>specialty</span>
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
                  {hospital.count} review{hospital.count === 1 ? "" : "s"}
                </span>

                <span className="trendLink">View hospital →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}