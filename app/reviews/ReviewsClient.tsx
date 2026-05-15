"use client";

import Link from "next/link";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function matchesSpecialty(unitValue: string, specialtyValue: string) {
  const unit = normalize(unitValue);
  const specialty = normalize(specialtyValue);

  if (!specialty) return true;

  const aliases: Record<string, string[]> = {
    or: ["or", "operating room"],
    er: ["er", "ed", "emergency room", "emergency department"],
    icu: ["icu", "intensive care"],
    pacu: ["pacu"],
    "med surg": ["med surg", "medical surgical", "medsurg"],
    telemetry: ["telemetry", "tele"],
    "labor delivery": ["labor delivery", "l d", "ld", "labor and delivery"],
    nicu: ["nicu"],
    pediatrics: ["pediatrics", "peds"],
    oncology: ["oncology"],
    stepdown: ["stepdown", "step down", "pcu"],
    cvicu: ["cvicu"],
    psych: ["psych", "psychiatric"],
    rehab: ["rehab", "rehabilitation"],
    "long term care": ["long term care", "ltc"],
  };

  const possibleMatches = aliases[specialty] || [specialty];

  return possibleMatches.some((match) => {
    const normalizedMatch = normalize(match);
    return unit === normalizedMatch || unit.split(" ").includes(normalizedMatch);
  });
}

export default function ReviewsClient({
  reviews,
  query,
  stateFilter,
  specialtyFilter,
}: any) {
  const q = (query || "").toLowerCase().trim();
  const state = (stateFilter || "").toLowerCase().trim();
  const specialty = specialtyFilter || "";

  const filtered = reviews.filter((r: any) => {
    const hospital = (r.hospital || "").toLowerCase();
    const cityState = (r.city_state || "").toLowerCase();
    const unit = r.unit || "";
    const agency = (r.agency || "").toLowerCase();
    const review = (r.review || "").toLowerCase();
    const charting = (r.charting_system || "").toLowerCase();

    const matchesSearch =
      !q ||
      hospital.includes(q) ||
      cityState.includes(q) ||
      unit.toLowerCase().includes(q) ||
      agency.includes(q) ||
      review.includes(q) ||
      charting.includes(q);

    const matchesState = !state || cityState.includes(state);

    const matchesUnit = matchesSpecialty(unit, specialty);

    return matchesSearch && matchesState && matchesUnit;
  });

  if (filtered.length === 0) {
    return (
      <div className="card cardPad">
        <p className="sub">
          No reviews match this filter — help another nurse by adding one.
        </p>

        <Link className="pill pillPrimary" href="/submit">
          Share Your Contract Experience
        </Link>
      </div>
    );
  }

  return (
    <div className="reviewsGrid">
      {filtered.map((r: any) => (
        <Link
          key={r.id}
          href={`/reviews/${r.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="reviewCard" style={{ cursor: "pointer" }}>
            <div className="reviewTop">
              <div>
                <div className="reviewHospital">
                  {r.hospital || "Unknown Hospital"}
                </div>

                <div className="reviewMeta">
                  {r.city_state || "Unknown location"}
                  {r.unit ? ` • ${r.unit}` : ""}
                </div>
              </div>

              <div className="reviewRight">⭐ {r.rating ?? "N/A"}</div>
            </div>

            <div className="reviewBadges">
              {r.agency && <span className="badge">{r.agency}</span>}
              {r.pay && <span className="badge">{r.pay}</span>}
              {r.assignment_length && (
                <span className="badge">{r.assignment_length}</span>
              )}
              {r.charting_system && (
                <span className="badge">{r.charting_system}</span>
              )}
            </div>

            <p className="reviewText">
              {r.review
                ? r.review.length > 180
                  ? r.review.slice(0, 180) + "..."
                  : r.review
                : "No review text provided."}
            </p>

            <div className="reviewBottom">
              <span className="reviewLink">Read full review →</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}