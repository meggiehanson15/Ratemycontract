import Link from "next/link";
import { Metadata } from "next";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Most Traveler Friendly Hospitals | RateMyContract",
  description:
    "Browse the most traveler-friendly hospitals based on anonymous travel nurse contract reviews, assignment ratings, floating frequency, housing experiences, and return rates.",
};

type Review = {
  hospital: string | null;
  city_state: string | null;
  rating: number | null;
  would_work_again: string | null;
  housing_area_rating: string | null;
  floating_frequency: string | null;
};

function makeHospitalSlug(
  hospital: string | null,
  cityState: string | null
) {
  return `${hospital || "unknown-hospital"}-${
    cityState || "unknown-location"
  }`
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function TravelerFriendlyHospitalsPage() {
  const supabase = supabaseServer();

  const { data } = await supabase
    .from("reviews")
    .select(
      "hospital,city_state,rating,would_work_again,housing_area_rating,floating_frequency"
    )
    .order("created_at", {
      ascending: false,
    });

  const reviews = (data ?? []) as Review[];

  const hospitalMap = new Map();

  reviews.forEach((review) => {
    const key = `${review.hospital}-${review.city_state}`;

    if (!hospitalMap.has(key)) {
      hospitalMap.set(key, {
        hospital: review.hospital,
        city_state: review.city_state,
        totalReviews: 0,
        totalRating: 0,
        ratingCount: 0,
        yesReturns: 0,
        returnAnswers: 0,
        housingScore: 0,
        housingAnswers: 0,
        floatingScore: 0,
        floatingAnswers: 0,
      });
    }

    const item = hospitalMap.get(key);

    item.totalReviews += 1;

    if (review.rating) {
      item.totalRating += Number(
        review.rating
      );

      item.ratingCount += 1;
    }

    if (review.would_work_again) {
      item.returnAnswers += 1;

      if (
        review.would_work_again ===
        "Yes"
      ) {
        item.yesReturns += 1;
      }
    }

    if (review.housing_area_rating) {
      item.housingAnswers += 1;

      const housingMap: Record<
        string,
        number
      > = {
        Excellent: 5,
        Good: 4,
        Average: 3,
        Difficult: 2,
        Terrible: 1,
      };

      item.housingScore +=
        housingMap[
          review.housing_area_rating
        ] || 0;
    }

    if (review.floating_frequency) {
      item.floatingAnswers += 1;

      const floatMap: Record<
        string,
        number
      > = {
        "Rarely floated": 5,
        "Occasionally floated": 4,
        "Frequently floated": 2,
        "Constantly floated": 1,
      };

      item.floatingScore +=
        floatMap[
          review.floating_frequency
        ] || 0;
    }
  });

  const rankedHospitals = Array.from(
    hospitalMap.values()
  )
    .map((hospital) => {
      const averageRating =
        hospital.ratingCount > 0
          ? hospital.totalRating /
            hospital.ratingCount
          : 0;

      const returnRate =
        hospital.returnAnswers > 0
          ? Math.round(
              (hospital.yesReturns /
                hospital.returnAnswers) *
                100
            )
          : 0;

      const housingAverage =
        hospital.housingAnswers > 0
          ? hospital.housingScore /
            hospital.housingAnswers
          : 0;

      const floatingAverage =
        hospital.floatingAnswers > 0
          ? hospital.floatingScore /
            hospital.floatingAnswers
          : 0;

      const travelerScore = Math.round(
        averageRating * 10 +
          returnRate * 0.45 +
          housingAverage * 6 +
          floatingAverage * 6
      );

      return {
        ...hospital,
        averageRating,
        returnRate,
        travelerScore,
      };
    })
    .filter(
      (hospital) =>
        hospital.totalReviews >= 2
    )
    .sort(
      (a, b) =>
        b.travelerScore -
        a.travelerScore
    )
    .slice(0, 50);

  return (
    <section>
      <div className="pageHeader">
        <p className="heroEyebrow">
          Rankings
        </p>

        <h1 className="pageTitle">
          Most Traveler Friendly Hospitals
        </h1>

        <p className="pageSubtitle">
          Ranked using anonymous travel
          nurse reviews, assignment
          ratings, return willingness,
          housing experiences, and
          floating frequency.
        </p>
      </div>

      <section
        className="card cardPad"
        style={{ marginBottom: 24 }}
      >
        <p
          style={{
            lineHeight: 1.8,
            color:
              "rgba(255,255,255,.78)",
            marginBottom: 0,
          }}
        >
          These rankings are generated
          using travel nurse contract
          reviews submitted by the
          community. Hospitals with
          higher assignment ratings,
          better housing experiences,
          lower floating frequency,
          and stronger return rates
          rank higher on the traveler
          friendliness score.
        </p>
      </section>

      <div className="reviewsGrid">
        {rankedHospitals.map(
          (hospital, index) => {
            const slug =
              makeHospitalSlug(
                hospital.hospital,
                hospital.city_state
              );

            return (
              <Link
                key={`${hospital.hospital}-${hospital.city_state}`}
                href={`/hospitals/${slug}`}
                style={{
                  textDecoration:
                    "none",
                  color: "inherit",
                }}
              >
                <div className="reviewCard">
                  <div className="reviewTop">
                    <div>
                      <div className="reviewHospital">
                        #{index + 1}{" "}
                        {
                          hospital.hospital
                        }
                      </div>

                      <div className="reviewMeta">
                        {
                          hospital.city_state
                        }
                      </div>
                    </div>

                    <div className="reviewRight">
                      ⭐{" "}
                      {hospital.averageRating.toFixed(
                        1
                      )}
                    </div>
                  </div>

                  <div className="reviewBadges">
                    <span className="badge">
                      Traveler Friendly
                      Score:{" "}
                      {
                        hospital.travelerScore
                      }
                    </span>

                    <span className="badge">
                      {
                        hospital.totalReviews
                      }{" "}
                      reviews
                    </span>

                    <span className="badge">
                      {
                        hospital.returnRate
                      }
                      % would return
                    </span>
                  </div>

                  <p className="reviewText">
                    Travel nurse rankings
                    based on floating
                    frequency, housing
                    experience, assignment
                    ratings, and traveler
                    return rates.
                  </p>

                  <div className="reviewBottom">
                    <span className="reviewLink">
                      View hospital →
                    </span>
                  </div>
                </div>
              </Link>
            );
          }
        )}
      </div>
    </section>
  );
}