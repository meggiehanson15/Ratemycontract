"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";

type Review = {
  id: number;
  created_at: string | null;
  hospital: string | null;
  city_state: string | null;
  unit: string | null;
  agency: string | null;
  pay: string | null;
  assignment_length: string | null;
  charting_system: string | null;
  review: string | null;
  rating: number | null;
  helpful_count: number | null;
  not_helpful_count: number | null;
};

export default function ReviewDetailPage() {
  const params = useParams();
  const id = Number(params?.id);

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [vote, setVote] = useState<"yes" | "no" | null>(null);
  const [savingVote, setSavingVote] = useState(false);

  useEffect(() => {
    async function loadReview() {
      const supabase = supabaseServer();

      const { data, error } = await supabase
        .from("reviews")
        .select(
          "id,created_at,hospital,city_state,unit,agency,pay,assignment_length,charting_system,review,rating,helpful_count,not_helpful_count"
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Review detail error:", error.message);
      }

      setReview(data as Review | null);
      setLoading(false);

      try {
        const storedVotes = JSON.parse(
          localStorage.getItem("reviewVotes") || "{}"
        );

        const storedVote = storedVotes[id];

        if (storedVote === "yes" || storedVote === "no") {
          setVote(storedVote);
        }
      } catch {
        setVote(null);
      }
    }

    if (id) {
      loadReview();
    }
  }, [id]);

  async function handleVote(voteType: "yes" | "no") {
    if (!review || vote || savingVote) return;

    setSavingVote(true);

    const nextHelpful =
      voteType === "yes"
        ? Number(review.helpful_count || 0) + 1
        : Number(review.helpful_count || 0);

    const nextNotHelpful =
      voteType === "no"
        ? Number(review.not_helpful_count || 0) + 1
        : Number(review.not_helpful_count || 0);

    const previousReview = review;

    setReview({
      ...review,
      helpful_count: nextHelpful,
      not_helpful_count: nextNotHelpful,
    });

    setVote(voteType);

    let previousVotes = {};

    try {
      previousVotes = JSON.parse(
        localStorage.getItem("reviewVotes") || "{}"
      );
    } catch {
      previousVotes = {};
    }

    const nextVotes = {
      ...previousVotes,
      [review.id]: voteType,
    };

    localStorage.setItem("reviewVotes", JSON.stringify(nextVotes));

    const supabase = supabaseServer();

    const { error } = await supabase
      .from("reviews")
      .update({
        helpful_count: nextHelpful,
        not_helpful_count: nextNotHelpful,
      })
      .eq("id", review.id);

    if (error) {
      console.error("Vote error:", error.message);

      setReview(previousReview);
      setVote(null);
      localStorage.setItem("reviewVotes", JSON.stringify(previousVotes));
    }

    setSavingVote(false);
  }

  if (loading) {
    return (
      <section className="card cardPad">
        <p className="sub">Loading review...</p>
      </section>
    );
  }

  if (!review) {
    return (
      <section className="card cardPad">
        <Link className="pill" href="/reviews">
          ← Back to Reviews
        </Link>

        <h1 className="pageTitle" style={{ marginTop: 16 }}>
          Review not found
        </h1>
      </section>
    );
  }

  return (
    <section>
      <div className="rowWrap" style={{ marginBottom: 14 }}>
        <Link className="pill" href="/reviews">
          ← Back to Reviews
        </Link>

        <Link className="pill pillPrimary" href="/submit">
          Share Your Contract Experience
        </Link>
      </div>

      <article className="card cardPad">
        <div className="detailTop">
          <div>
            <h1 className="detailTitle">
              {review.hospital || "Unknown Hospital"}
            </h1>

            <p className="detailSubtitle">
              {review.city_state || "Location not listed"}
              {review.unit ? ` • ${review.unit}` : ""}
            </p>
          </div>

          <div className="detailRight">
            <div className="stars">
              {"⭐".repeat(Number(review.rating) || 0)}
            </div>

            <p className="kicker" style={{ marginTop: 6 }}>
              {review.rating ? `${review.rating}/5 rating` : "No rating listed"}
            </p>
          </div>
        </div>

        <hr className="hr" />

        <div className="reviewBadges">
          {review.agency && <span className="badge">{review.agency}</span>}
          {review.pay && <span className="badge">{review.pay}</span>}
          {review.assignment_length && (
            <span className="badge">{review.assignment_length}</span>
          )}
          {review.charting_system && (
            <span className="badge">{review.charting_system}</span>
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          <p className="detailReview">
            {review.review || "No review text provided."}
          </p>
        </div>

        <div className="rowWrap" style={{ marginTop: 22 }}>
          <a
            className="pill"
            href={`mailto:YOUR_EMAIL@gmail.com?subject=Report Review ${review.id}&body=I would like to report this review:%0D%0A%0D%0AReview ID: ${review.id}%0D%0AHospital: ${review.hospital || "Unknown"}%0D%0AReason:%0D%0A`}
          >
            Report this review
          </a>
        </div>

        <div className="detailVoteWrap">
          <div className="voteBox">
            <span className="voteQuestion">Was this helpful?</span>

            <button
              type="button"
              className={`voteBtn ${vote === "yes" ? "voteBtnActive" : ""}`}
              onClick={() => handleVote("yes")}
              disabled={Boolean(vote) || savingVote}
            >
              Yes {review.helpful_count || 0}
            </button>

            <button
              type="button"
              className={`voteBtn ${vote === "no" ? "voteBtnActive" : ""}`}
              onClick={() => handleVote("no")}
              disabled={Boolean(vote) || savingVote}
            >
              No {review.not_helpful_count || 0}
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 26,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 15,
              }}
            >
              Worked this assignment too?
            </p>

            <p
              className="kicker"
              style={{
                marginTop: 6,
                maxWidth: 520,
              }}
            >
              Help another travel nurse by sharing your experience anonymously.
            </p>
          </div>

          <Link href="/submit" className="pill pillPrimary">
            Submit a Review
          </Link>
        </div>
      </article>
    </section>
  );
}