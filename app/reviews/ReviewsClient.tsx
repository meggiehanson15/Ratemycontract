"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseServer } from "@/lib/supabaseServer";

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

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [votes, setVotes] = useState<Record<number, { yes: number; no: number }>>(
    () =>
      Object.fromEntries(
        reviews.map((r: any) => [
          r.id,
          {
            yes: Number(r.helpful_count) || 0,
            no: Number(r.not_helpful_count) || 0,
          },
        ])
      )
  );

  const [clickedVotes, setClickedVotes] = useState<Record<number, "yes" | "no">>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("reviewVotes") || "{}");
      setClickedVotes(stored);
    } catch {
      setClickedVotes({});
    }
  }, []);

  async function copyReviewLink(reviewId: number) {
    const url = `${window.location.origin}/reviews/${reviewId}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(reviewId);

    setTimeout(() => {
      setCopiedId(null);
    }, 1600);
  }

  async function vote(
    e: React.MouseEvent<HTMLButtonElement>,
    reviewId: number,
    voteType: "yes" | "no"
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (clickedVotes[reviewId]) return;

    const current = votes[reviewId] || { yes: 0, no: 0 };

    const next = {
      yes: voteType === "yes" ? current.yes + 1 : current.yes,
      no: voteType === "no" ? current.no + 1 : current.no,
    };

    setVotes((prev) => ({ ...prev, [reviewId]: next }));

    const nextClicked = { ...clickedVotes, [reviewId]: voteType };
    setClickedVotes(nextClicked);
    localStorage.setItem("reviewVotes", JSON.stringify(nextClicked));

    const supabase = supabaseServer();

    const { error } = await supabase
      .from("reviews")
      .update({
        helpful_count: next.yes,
        not_helpful_count: next.no,
      })
      .eq("id", reviewId);

    if (error) {
      setVotes((prev) => ({ ...prev, [reviewId]: current }));

      const reverted = { ...nextClicked };
      delete reverted[reviewId];

      setClickedVotes(reverted);
      localStorage.setItem("reviewVotes", JSON.stringify(reverted));
    }
  }

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
      {filtered.map((r: any) => {
        const reviewVotes = votes[r.id] || { yes: 0, no: 0 };
        const userVote = clickedVotes[r.id];
        const hospitalSlug = makeHospitalSlug(r.hospital, r.city_state);

        return (
          <div key={r.id} className="reviewCard">
            <div className="reviewTop">
              <div>
                <Link
                  href={`/hospitals/${hospitalSlug}`}
                  className="reviewHospital"
                  style={{ color: "inherit" }}
                >
                  {r.hospital || "Unknown Hospital"}
                </Link>

                <div className="reviewMeta">
                  {r.city_state || "Unknown location"}
                  {r.unit ? ` • ${r.unit}` : ""}
                  {r.created_at ? ` • ${formatDate(r.created_at)}` : ""}
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
              <Link className="reviewLink" href={`/reviews/${r.id}`}>
                Read full review →
              </Link>

              <button
                type="button"
                className="pill"
                onClick={() => copyReviewLink(r.id)}
              >
                {copiedId === r.id ? "Copied!" : "Share"}
              </button>

              <div className="voteBox">
                <span className="voteQuestion">Helpful?</span>

                <button
                  type="button"
                  className={`voteBtn ${userVote === "yes" ? "voteBtnActive" : ""}`}
                  onClick={(e) => vote(e, r.id, "yes")}
                  disabled={Boolean(userVote)}
                >
                  Yes {reviewVotes.yes}
                </button>

                <button
                  type="button"
                  className={`voteBtn ${userVote === "no" ? "voteBtnActive" : ""}`}
                  onClick={(e) => vote(e, r.id, "no")}
                  disabled={Boolean(userVote)}
                >
                  No {reviewVotes.no}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}