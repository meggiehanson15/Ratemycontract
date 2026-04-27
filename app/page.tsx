"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseServer } from "@/lib/supabaseServer";

type Suggestions = {
  hospitals: string[];
  cities: string[];
};

type RecentReview = {
  id: number;
  hospital: string;
  city_state: string | null;
  unit: string | null;
  rating: number;
  created_at: string;
};

export default function HomePage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions>({
    hospitals: [],
    cities: [],
  });
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const trimmed = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    async function fetchRecentReviews() {
      const supabase = supabaseServer();

      const { data } = await supabase
        .from("reviews")
        .select("id,hospital,city_state,unit,rating,created_at")
        .order("created_at", { ascending: false })
        .limit(8);

      setRecentReviews((data ?? []) as RecentReview[]);
    }

    fetchRecentReviews();
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (trimmed.length < 2) {
        setSuggestions({ hospitals: [], cities: [] });
        return;
      }

      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(trimmed)}`);
        const json = await res.json();

        setSuggestions({
          hospitals: json?.hospitals || [],
          cities: json?.cities || [],
        });
      } catch {
        setSuggestions({ hospitals: [], cities: [] });
      }
    }, 200);

    return () => clearTimeout(t);
  }, [trimmed]);

  function choose(value: string) {
    setQ(value);
    setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") e.preventDefault();
    if (e.key === "Escape") setOpen(false);
  }

  const trendingHospitals = [
    ...new Set(recentReviews.map((r) => r.hospital)),
  ].slice(0, 5);

  return (
    <section style={{ padding: "38px 0 10px" }}>
      {/* HERO */}
      <div style={{ maxWidth: 860 }}>
        <h1 className="h1" style={{ fontSize: 54 }}>
          RateMyContract
        </h1>

        <p className="sub" style={{ maxWidth: 720 }}>
          Check the contract before you sign. Real travel nurse experiences —
          pay, units, and what it's actually like.
        </p>

        <div className="rowWrap" style={{ marginTop: 14 }}>
          <Link className="pill pillPrimary" href="/submit">
            <strong>Share Your Contract Experience</strong>
          </Link>

          <Link className="pill" href="/reviews">
            See Real Reviews
          </Link>

          <span className="kicker">Anonymous • No login required</span>
        </div>
      </div>

      {/* SEARCH */}
      <div
        ref={wrapRef}
        className="card cardPad"
        style={{ maxWidth: 760, position: "relative", marginTop: 20 }}
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
              placeholder="Search hospital or city"
              className="input"
            />

            <button className="button">Search</button>
          </div>
        </form>

        {open && trimmed.length >= 2 && (
          <div className="suggestions">
            <div className="suggestionsBody">
              {suggestions.hospitals.map((h: string) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => choose(h)}
                  className="suggestionsItem"
                >
                  {h}
                </button>
              ))}

              {suggestions.cities.map((c: string) => (
                <button
                  key={c}
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

      {/* TRENDING */}
      {trendingHospitals.length > 0 && (
        <section className="card cardPad" style={{ maxWidth: 760, marginTop: 20 }}>
          <h2>🔥 Trending Hospitals</h2>

          <p className="kicker" style={{ marginBottom: 12 }}>
            Most active hospitals based on recent reviews
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            {trendingHospitals.map((hospital) => (
              <Link
                key={hospital}
                href={`/reviews?q=${encodeURIComponent(hospital)}`}
                className="pill"
                style={{ justifyContent: "space-between" }}
              >
                <span>{hospital}</span>
                <span>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* VENMO SUPPORT */}
      <section className="card cardPad" style={{ maxWidth: 760, marginTop: 20 }}>
        <h2>Support RateMyContract</h2>

        <p className="sub" style={{ marginBottom: 12 }}>
          If this site helped you avoid a bad contract or make a better decision,
          you can support it below.
        </p>

        <div className="rowWrap">
          <a
            className="pill pillPrimary"
            href="https://venmo.com/ratemycontract"
            target="_blank"
            rel="noopener noreferrer"
          >
            💙 Support via Venmo
          </a>
        </div>

        <p className="kicker" style={{ marginTop: 10 }}>
          Completely optional — just helps keep the site running.
        </p>
      </section>
    </section>
  );
}