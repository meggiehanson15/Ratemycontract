import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

function makeHospitalSlug(hospital: string | null, cityState: string | null) {
  return `${hospital || "unknown-hospital"}-${cityState || "unknown-location"}`
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function HomePage() {
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("reviews")
    .select(
      "id,hospital,city_state,unit,rating,review,created_at"
    )
    .order("created_at", { ascending: false });

  const reviews = data ?? [];

  const hospitalMap = new Map();

  reviews.forEach((review) => {
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

      existing.count += 1;
      existing.totalRating += Number(review.rating || 0);
    }
  });

  const topHospitals = Array.from(hospitalMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <section>
      <section className="heroSection">
        <div className="heroGlow" />

        <div className="heroContent">
          <p className="heroEyebrow">
            Anonymous travel nurse contract reviews
          </p>

          <h1 className="heroTitle">
            RateMyContract
          </h1>

          <p className="heroSubtitle">
            Real travel nurse experiences. Real pay. Real hospitals.
            Search anonymous contract reviews to help negotiate smarter and avoid bad assignments.
          </p>

          <div className="heroButtons">
            <Link href="/submit" className="button heroPrimaryBtn">
              Submit a Review
            </Link>

            <Link href="/reviews" className="pill heroSecondaryBtn">
              Browse Reviews
            </Link>
          </div>

          <div className="heroStats">
            <div className="statCard">
              <strong>{reviews.length}</strong>
              <span>reviews submitted</span>
            </div>

            <div className="statCard">
              <strong>{hospitalMap.size}</strong>
              <span>hospitals reviewed</span>
            </div>

            <div className="statCard">
              <strong>Anonymous</strong>
              <span>community-driven</span>
            </div>
          </div>
        </div>
      </section>

      {topHospitals.length > 0 && (
        <section style={{ marginTop: 26 }}>
          <div className="sectionHeaderRow">
            <div>
              <p className="sectionEyebrow">Most Reviewed</p>
              <h2 className="sectionTitle">
                Popular Hospitals
              </h2>
            </div>

            <Link href="/reviews" className="pill">
              View All Reviews
            </Link>
          </div>

          <div className="trendingGrid">
            {topHospitals.map((hospital) => {
              const slug = makeHospitalSlug(
                hospital.hospital,
                hospital.city_state
              );

              const avg = (
                hospital.totalRating / hospital.count
              ).toFixed(1);

              return (
                <Link
                  key={`${hospital.hospital}-${hospital.city_state}`}
                  href={`/hospitals/${slug}`}
                  className="trendCard"
                >
                  <div className="trendTop">
                    <div>
                      <h3 className="trendHospital">
                        {hospital.hospital}
                      </h3>

                      <p className="trendLocation">
                        {hospital.city_state}
                      </p>
                    </div>

                    <div className="trendRating">
                      ⭐ {avg}
                    </div>
                  </div>

                  <div className="trendBottom">
                    <span>
                      {hospital.count} review
                      {hospital.count === 1 ? "" : "s"}
                    </span>

                    <span className="trendLink">
                      View reviews →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="ctaSection">
        <div className="ctaCard">
          <div>
            <p className="ctaEyebrow">
              Worked this assignment too?
            </p>

            <h2 className="ctaTitle">
              Help another travel nurse.
            </h2>

            <p className="ctaText">
              Share your honest experience anonymously — hospital culture,
              staffing, charting systems, pay, and assignment details.
            </p>
          </div>

          <Link href="/submit" className="button">
            Share Your Experience
          </Link>
        </div>
      </section>
    </section>
  );
}