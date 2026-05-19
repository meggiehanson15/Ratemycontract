"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseServer } from "@/lib/supabaseServer";

type Suggestions = {
  hospitals: string[];
  cities: string[];
};

type Review = {
  id: number;
  hospital: string;
  city_state: string | null;
  unit: string | null;
  rating: number | null;
  created_at: string;
};

export default function HomePage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const [suggestions, setSuggestions] = useState<Suggestions>({
    hospitals: [],
    cities: [],
  });

  const [reviews, setReviews] = useState<Review[]>([]);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const trimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    async function fetchReviews() {
      const supabase = supabaseServer();

      const { data } = await supabase
        .from("reviews")
        .select("id,created_at,hospital,city_state,unit,rating")
        .order("created_at", { ascending: false })
        .limit(500);

      setReviews((data ?? []) as Review[]);
    }

    fetchReviews();
  }, []);

  const stats = useMemo(() => {
    const states = new Set<string>();

    reviews.forEach((review) => {
      const state = review.city_state?.split(",")[1]?.trim();

      if (state) {
        states.add(state);
      }
    });

    return {
      reviewCount: reviews.length,
      stateCount: states.size,
    };
  }, [reviews]);

  const mostReviewedHospitals = useMemo(() => {
    const map = new Map<
      string,
      {
        hospital: string;
        city_state: string | null;
        count: number;
        ratingTotal: number;
        ratingCount: number;
      }
    >();

    reviews.forEach((review) => {
      if (!review.hospital) return;

      const key = `${review.hospital.toLowerCase().trim()}-${review.city_state || ""}`;

      const existing = map.get(key) || {
        hospital: review.hospital,
        city_state: review.city_state,
        count: 0,
        ratingTotal: 0,
        ratingCount: 0,
      };

      existing.count += 1;

      if (review.rating) {
        existing.ratingTotal += Number(review.rating);
        existing.ratingCount += 1;
      }

      map.set(key, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [reviews]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current) return;

      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", onDown);

    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (trimmed.length < 2) {
        setSuggestions({
          hospitals: [],
          cities: [],
        });

        return;
      }

      try {
        const res = await fetch(
          `/api/suggestions?q=${encodeURIComponent(trimmed)}`
        );

        const json = await res.json();

        setSuggestions({
          hospitals: Array.isArray(json?.hospitals)
            ? json.hospitals
            : [],
          cities: Array.isArray(json?.cities)
            ? json.cities
            : [],
        });
      } catch {
        setSuggestions({
          hospitals: [],
          cities: [],
        });
      }
    }, 200);

    return () => clearTimeout(t);
  }, [trimmed]);

  function choose(value: string) {
    setQ(value);
    setOpen(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function onKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <section className="homeShell">
      <div className="backgroundOrb orb1" />
      <div className="backgroundOrb orb2" />
      <div className="backgroundOrb orb3" />
      <div className="heroGlow" />

      <div className="heroBlock">
        <p className="heroBadge">
          Built by a travel nurse, for travel nurses
        </p>

        <h1 className="h1 heroTitle">
          RateMyContract
        </h1>

        <p className="sub heroSubtitle">
          Stop walking into contracts blind. See real
          travel nurse experiences about hospitals,
          pay, units, charting systems, and assignment
          details before you sign.
        </p>

        <div className="heroCtaPanel">
          <div>
            <p className="heroCtaEyebrow">
              Had a contract worth warning others about?
            </p>

            <h2 className="heroCtaTitle">
              Share your experience anonymously.
            </h2>

            <p className="heroCtaText">
              Good, bad, or somewhere in between —
              your review can help another nurse make
              a smarter decision.
            </p>
          </div>

          <Link
            className="heroBigCTA"
            href="/submit"
          >
            Share Your Experience
            <span>It only takes a minute</span>
          </Link>
        </div>

        <div className="heroStats">
          <div className="statCard">
            <strong>{stats.reviewCount}</strong>
            <span>reviews submitted</span>
          </div>

          <div className="statCard">
            <strong>{stats.stateCount}</strong>
            <span>states represented</span>
          </div>

          <div className="statCard">
            <strong>{mostReviewedHospitals.length}</strong>
            <span>trending hospitals</span>
          </div>
        </div>
      </div>

      {mostReviewedHospitals.length > 0 && (
        <section className="card cardPad featureCard">
          <h2 style={{ marginBottom: 8 }}>
            Most Reviewed Hospitals
          </h2>

          <p
            className="kicker"
            style={{ marginBottom: 12 }}
          >
            Hospitals with the most shared contract
            experiences
          </p>

          <div
            style={{
              display: "grid",
              gap: 10,
            }}
          >
            {mostReviewedHospitals.map((item) => {
              const average =
                item.ratingCount > 0
                  ? (
                      item.ratingTotal /
                      item.ratingCount
                    ).toFixed(1)
                  : "N/A";

              return (
                <Link
                  key={`${item.hospital}-${item.city_state}`}
                  href={`/reviews?q=${encodeURIComponent(
                    item.hospital
                  )}`}
                  className="pill trendLink"
                >
                  <span>
                    {item.hospital}

                    {item.city_state
                      ? ` • ${item.city_state}`
                      : ""}
                  </span>

                  <span>
                    {item.count} review
                    {item.count === 1 ? "" : "s"} • ⭐{" "}
                    {average}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div
        ref={wrapRef}
        className="card cardPad searchFeature"
      >
        <form action="/reviews" method="GET">
          <div className="row">
            <input
              ref={inputRef}
              name="q"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Search hospital, city, state, specialty..."
              className="input"
              autoComplete="off"
            />

            <button className="button">
              Search
            </button>
          </div>

          <div
            className="rowWrap"
            style={{ marginTop: 12 }}
          >
            <Link
              className="chip"
              href="/reviews?rating=5"
            >
              ⭐ Top Rated
            </Link>

            <Link
              className="chip"
              href="/reviews?rating=2"
            >
              Low Rated
            </Link>
          </div>

          <p
            className="kicker"
            style={{ marginTop: 12 }}
          >
            Anonymous reviews. No login required.
          </p>
        </form>

        {open && trimmed.length >= 2 && (
          <div className="suggestions">
            <div className="suggestionsHeader">
              Suggestions
            </div>

            <div className="suggestionsBody">
              {suggestions.hospitals.map((h) => (
                <button
                  key={`h-${h}`}
                  type="button"
                  onClick={() => choose(h)}
                  className="suggestionsItem"
                >
                  {h}
                </button>
              ))}

              {suggestions.cities.map((c) => (
                <button
                  key={`c-${c}`}
                  type="button"
                  onClick={() => choose(c)}
                  className="suggestionsItem"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <section className="card cardPad featureCard">
        <h2>Support RateMyContract</h2>

        <p
          className="sub"
          style={{ marginBottom: 12 }}
        >
          If this site helped you avoid a bad contract
          or make a better decision, you can support
          keeping it available for other nurses.
        </p>

        <div className="rowWrap">
          <a
            className="pill pillPrimary"
            href="https://venmo.com/YOURUSERNAME"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support via Venmo
          </a>
        </div>

        <p
          className="kicker"
          style={{ marginTop: 10 }}
        >
          Completely optional — helps keep the site
          running.
        </p>
      </section>

      <Link
        className="mobileStickyCTA"
        href="/submit"
      >
        Share Your Experience
      </Link>
    </section>
  );
}