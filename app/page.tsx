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
      "id,hospital,city_state,unit,rating,review,created_at,would_work_again"
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

  const popularHospitals = Array.from(hospitalMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const recommendedMap = new Map();

  reviews.forEach((review) => {
    const key = `${review.hospital}-${review.city_state}`;

    if (!recommendedMap.has(key)) {
      recommendedMap.set(key, {
        hospital: review.hospital,
        city_state: review.city_state,
        totalReviews: 0,
        totalRating: 0,
        ratingCount: 0,
        yesCount: 0,
        returnAnswerCount: 0,
      });
    }

    const existing = recommendedMap.get(key);

    existing.totalReviews += 1;

    if (review.rating) {
      existing.totalRating += Number(review.rating);
      existing.ratingCount += 1;
    }

    if (review.would_work_again) {
      existing.returnAnswerCount += 1;

      if (review.would_work_again === "Yes") {
        existing.yesCount += 1;
      }
    }
  });

  const recommendedHospitals = Array.from(recommendedMap.values())
    .map((hospital) => {
      const averageRating =
        hospital.ratingCount > 0
          ? hospital.totalRating / hospital.ratingCount
          : 0;

      const returnRate =
        hospital.returnAnswerCount > 0
          ? Math.round((hospital.yesCount / hospital.returnAnswerCount) * 100)
          : 0;

      return {
        ...hospital,
        averageRating,
        returnRate,
      };
    })
    .filter((hospital) => hospital.totalReviews > 0)
    .sort((a, b) => {
      if (b.returnRate !== a.returnRate) {
        return b.returnRate - a.returnRate;
      }

      return b.averageRating - a.averageRating;
    })
    .slice(0, 6);

  return (
    <section>
      <section className="heroSection">
        <div className="heroGlow" />

        <div className="heroContent">
          <div>
            <p className="heroEyebrow">
              Anonymous travel nurse contract reviews
            </p>

            <h1 className="heroTitle">
              Real reviews.
              <br />
              Real insight.
              <br />
              <span style={{ color: "var(--teal)" }}>Smarter</span> contracts.
            </h1>

            <p className="heroSubtitle">
              Honest feedback from travel nurses to help negotiate smarter and
              avoid bad assignments.
            </p>

            <div className="heroButtons">
              <Link href="/submit" className="button heroPrimaryBtn">
                Submit a Review
              </Link>

              <Link href="/reviews" className="pill heroSecondaryBtn">
                Browse Reviews
              </Link>
            </div>
          </div>

          <div className="heroStats">
            <div className="statCard">
              <strong>{reviews.length}</strong>
              <span>reviews submitted</span>
            </div>

            <div className="statCard">
              <strong>Real</strong>
              <span>hospital experiences</span>
            </div>

            <div className="statCard">
              <strong>Anonymous</strong>
              <span>community driven</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 34 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <p className="sectionEyebrow" style={{ margin: 0 }}>
            Explore
          </p>

          <div
            style={{
              height: 1,
              flex: 1,
              background: "rgba(255,255,255,.14)",
            }}
          />
        </div>

        <div className="exploreGrid">
          <Link className="exploreCard" href="/traveler-friendly-hospitals">
            <strong>Traveler Rankings</strong>
            <span>See the most traveler-friendly hospitals.</span>
          </Link>

          <Link className="exploreCard" href="/reviews/top-this-month">
            <strong>Top This Month</strong>
            <span>The highest rated reviews this month.</span>
          </Link>

          <Link className="exploreCard" href="/reviews/most-helpful">
            <strong>Most Helpful</strong>
            <span>Reviews rated most helpful by nurses.</span>
          </Link>

          <Link className="exploreCard" href="/reviews">
            <strong>All Reviews</strong>
            <span>Browse all hospital reviews from the community.</span>
          </Link>

          <Link className="exploreCard" href="/agencies/aya">
            <strong>Agency Reviews</strong>
            <span>See what nurses are saying about agencies.</span>
          </Link>
        </div>
      </section>

      <section
        className="card cardPad"
        style={{
          marginTop: 28,
          lineHeight: 1.8,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 14,
            fontSize: 28,
          }}
        >
          Travel Nurse Contract Reviews
        </h2>

        <p style={{ color: "rgba(255,255,255,.78)", marginBottom: 16 }}>
          RateMyContract helps travel nurses browse anonymous hospital contract
          reviews across the United States. Compare travel nurse experiences,
          hospital culture, floating frequency, housing situations, charting
          systems, scheduling flexibility, and assignment ratings before
          accepting your next travel nurse contract.
        </p>

        <p style={{ color: "rgba(255,255,255,.72)", marginBottom: 16 }}>
          Search travel nurse hospital reviews by specialty, state, hospital,
          city, agency, or unit. Discover traveler-friendly hospitals, avoid
          difficult assignments, and learn what other travel nurses experienced
          during their contracts.
        </p>

        <p style={{ color: "rgba(255,255,255,.68)", marginBottom: 0 }}>
          Reviews are submitted anonymously by travel nurses and include
          information about pay packages, floating expectations, scheduling,
          unit culture, charting systems, housing experiences, and whether
          nurses would return for another assignment.
        </p>
      </section>

      {recommendedHospitals.length > 0 && (
        <section style={{ marginTop: 26 }}>
          <div className="sectionHeaderRow">
            <div>
              <p className="sectionEyebrow">Community Favorites</p>

              <h2 className="sectionTitle">Most Recommended Hospitals</h2>
            </div>

            <Link href="/traveler-friendly-hospitals" className="pill">
              View Rankings
            </Link>
          </div>

          <div className="trendingGrid">
            {recommendedHospitals.map((hospital) => {
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
                      <h3 className="trendHospital">{hospital.hospital}</h3>

                      <p className="trendLocation">{hospital.city_state}</p>
                    </div>

                    <div className="trendRating">
                      ⭐ {hospital.averageRating.toFixed(1)}
                    </div>
                  </div>

                  <div className="trendBottom">
                    <span>{hospital.returnRate}% would return</span>
                    <span className="trendLink">View hospital →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {popularHospitals.length > 0 && (
        <section style={{ marginTop: 26 }}>
          <div className="sectionHeaderRow">
            <div>
              <p className="sectionEyebrow">Most Reviewed</p>

              <h2 className="sectionTitle">Popular Hospitals</h2>
            </div>

            <Link href="/reviews" className="pill">
              View All Reviews
            </Link>
          </div>

          <div className="trendingGrid">
            {popularHospitals.map((hospital) => {
              const slug = makeHospitalSlug(
                hospital.hospital,
                hospital.city_state
              );

              const avg = (hospital.totalRating / hospital.count).toFixed(1);

              return (
                <Link
                  key={`${hospital.hospital}-${hospital.city_state}`}
                  href={`/hospitals/${slug}`}
                  className="trendCard"
                >
                  <div className="trendTop">
                    <div>
                      <h3 className="trendHospital">{hospital.hospital}</h3>

                      <p className="trendLocation">{hospital.city_state}</p>
                    </div>

                    <div className="trendRating">⭐ {avg}</div>
                  </div>

                  <div className="trendBottom">
                    <span>
                      {hospital.count} review
                      {hospital.count === 1 ? "" : "s"}
                    </span>

                    <span className="trendLink">View reviews →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <div className="sectionHeaderRow">
            <div>
              <p className="sectionEyebrow">Fresh Reviews</p>

              <h2 className="sectionTitle">Recent Travel Nurse Reviews</h2>
            </div>

            <Link href="/reviews" className="pill">
              View All Reviews
            </Link>
          </div>

          <div className="reviewsGrid">
            {reviews.slice(0, 6).map((review) => {
              const slug = makeHospitalSlug(review.hospital, review.city_state);

              return (
                <Link
                  key={review.id}
                  href={`/hospitals/${slug}`}
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
                        </div>
                      </div>

                      <div className="reviewRight">
                        ⭐ {review.rating ?? "N/A"}
                      </div>
                    </div>

                    <p className="reviewText">
                      {review.review
                        ? review.review.length > 140
                          ? review.review.slice(0, 140) + "..."
                          : review.review
                        : "No review text provided."}
                    </p>

                    <div className="reviewBottom">
                      <span className="reviewLink">View hospital →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="card cardPad" style={{ marginTop: 28 }}>
        <div className="sectionHeaderRow">
          <div>
            <p className="sectionEyebrow">FAQ</p>

            <h2 className="sectionTitle">Travel Nurse Review Questions</h2>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <h3>Are RateMyContract reviews anonymous?</h3>
            <p className="sub">
              Yes. Reviews are submitted anonymously so travel nurses can share
              honest contract experiences without listing their name.
            </p>
          </div>

          <div>
            <h3>Can I search reviews by hospital, state, or specialty?</h3>
            <p className="sub">
              Yes. You can browse travel nurse contract reviews by hospital,
              city, state, specialty, agency, unit, rating, and charting system.
            </p>
          </div>

          <div>
            <h3>What should I include in a review?</h3>
            <p className="sub">
              Helpful reviews often include hospital culture, unit experience,
              floating frequency, pay details, housing or area experience,
              charting system, and whether you would take another contract
              there.
            </p>
          </div>

          <div>
            <h3>What should I avoid sharing?</h3>
            <p className="sub">
              Do not include patient information, patient names, coworker names,
              private medical details, or confidential hospital information.
            </p>
          </div>
        </div>
      </section>

      <section className="ctaSection">
        <div className="ctaCard">
          <div>
            <p className="ctaEyebrow">Worked this assignment too?</p>

            <h2 className="ctaTitle">Help another travel nurse.</h2>

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
