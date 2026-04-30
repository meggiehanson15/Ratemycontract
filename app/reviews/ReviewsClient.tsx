"use client";

import { useMemo } from "react";

export default function ReviewsClient({ reviews, query }: any) {
  const q = (query || "").toLowerCase().trim();

  // helper: extract state from "City, ST"
  function getState(cityState: string | null) {
    if (!cityState) return "";
    const parts = cityState.split(",");
    return parts.length > 1 ? parts[1].trim().toLowerCase() : "";
  }

  // helper: convert state abbreviation to full name
  const stateMap: Record<string, string> = {
    ca: "california",
    tx: "texas",
    fl: "florida",
    ny: "new york",
    az: "arizona",
    wa: "washington",
    co: "colorado",
    nv: "nevada",
    or: "oregon",
    ut: "utah",
    sd: "south dakota",
    nd: "north dakota",
    mn: "minnesota",
    wi: "wisconsin",
    il: "illinois",
    ga: "georgia",
    nc: "north carolina",
    sc: "south carolina",
  };

  const filtered = useMemo(() => {
    if (!q) return reviews;

    return reviews.filter((r: any) => {
      const hospital = (r.hospital || "").toLowerCase();
      const cityState = (r.city_state || "").toLowerCase();
      const review = (r.review || "").toLowerCase();

      const stateAbbr = getState(r.city_state);
      const stateFull = stateMap[stateAbbr] || "";

      return (
        hospital.includes(q) ||
        cityState.includes(q) ||
        review.includes(q) ||
        stateAbbr.includes(q) ||
        stateFull.includes(q)
      );
    });
  }, [reviews, q]);

  return (
    <div className="reviewsGrid">
      {filtered.map((r: any) => (
        <div key={r.id} className="reviewCard">
          <div className="reviewTop">
            <div>
              <div className="reviewHospital">
                {r.hospital || "Unknown Hospital"}
              </div>

              <div className="reviewMeta">
                {r.city_state}
              </div>
            </div>

            <div className="reviewRight">
              ⭐ {r.rating ?? "N/A"}
            </div>
          </div>

          <p className="reviewText">
            {r.review?.slice(0, 180)}...
          </p>
        </div>
      ))}
    </div>
  );
}