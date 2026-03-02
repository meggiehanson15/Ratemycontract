// app/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Suggestions = {
  hospitals: string[];
  cities: string[];
};

function toTitleCase(input: string) {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      const w = word.toLowerCase();

      const acronyms = new Set([
        "ICU",
        "ER",
        "OR",
        "PACU",
        "ED",
        "RN",
        "LPN",
        "NP",
        "PA",
        "OB",
        "NICU",
      ]);
      if (acronyms.has(word.toUpperCase())) return word.toUpperCase();

      if (w === "st." || w === "st") return "St.";
      if (w === "mt." || w === "mt") return "Mt.";
      if (w === "dr." || w === "dr") return "Dr.";

      return w
        .split("-")
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join("-");
    })
    .join(" ");
}

export default function HomePage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestions>({
    hospitals: [],
    cities: [],
  });

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const trimmed = useMemo(() => q.trim(), [q]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  // Debounced fetch suggestions
  useEffect(() => {
    const t = setTimeout(async () => {
      const query = trimmed;
      if (query.length < 2) {
        setSuggestions({ hospitals: [], cities: [] });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
        const json = (await res.json()) as Suggestions;

        setSuggestions({
          hospitals: Array.isArray(json?.hospitals) ? json.hospitals : [],
          cities: Array.isArray(json?.cities) ? json.cities : [],
        });
      } catch {
        setSuggestions({ hospitals: [], cities: [] });
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(t);
  }, [trimmed]);

  const hasAny = suggestions.hospitals.length > 0 || suggestions.cities.length > 0;

  function choose(value: string) {
    setQ(toTitleCase(value));
    setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") setOpen(false);
  }

  function onSubmitNormalize() {
    setQ((prev) => (prev.trim() ? toTitleCase(prev) : prev));
  }

  return (
    <section style={{ padding: "38px 0 10px" }}>
      {/* HERO */}
      <div style={{ maxWidth: 860, padding: "18px 0 10px" }}>
        <h1 className="h1" style={{ fontSize: 54, letterSpacing: -0.6, marginBottom: 10 }}>
          RateMyContract
        </h1>
        <p className="sub" style={{ maxWidth: 720 }}>
          Transparent travel nurse contract reviews — real experiences, real pay, real units.
        </p>

        {/* CTAs */}
        <div className="rowWrap" style={{ margin: "10px 0 18px" }}>
          <Link className="pill pillPrimary" href="/submit">
            Submit a Review
          </Link>
          <Link className="pill" href="/reviews">
            Browse Reviews
          </Link>
          <span className="kicker">Anonymous • No login required</span>
        </div>
      </div>

      {/* SEARCH CARD */}
      <div ref={wrapRef} className="card cardPad" style={{ maxWidth: 760, position: "relative" }}>
        <form action="/reviews" method="GET" onSubmit={onSubmitNormalize}>
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
              autoComplete="off"
              placeholder="Search hospital or city (e.g., Sanford, Fargo, SD)"
              className="input"
            />
            <button type="submit" className="button">
              Search
            </button>
          </div>

          <div style={{ marginTop: 10 }} className="kicker">
            <div>100% anonymous. No login required.</div>
            <div>Built to help nurses negotiate better contracts.</div>
          </div>
        </form>

        {/* Dropdown */}
        {open && trimmed.length >= 2 && (
          <div className="suggestions">
            <div className="suggestionsHeader">
              {loading
                ? "Searching…"
                : hasAny
                ? "Suggestions (click to select)"
                : "No suggestions yet — press Search to browse anyway"}
            </div>

            <div className="suggestionsBody">
              {suggestions.hospitals.length > 0 && (
                <div>
                  <div className="suggestionsGroupTitle">Hospitals</div>

                  {suggestions.hospitals.map((h) => (
                    <button
                      key={`h-${h}`}
                      type="button"
                      onClick={() => choose(h)}
                      className="suggestionsItem"
                    >
                      {toTitleCase(h)}
                    </button>
                  ))}

                  <div className="suggestionsDivider" />
                </div>
              )}

              {suggestions.cities.length > 0 && (
                <div>
                  <div className="suggestionsGroupTitle">Cities</div>

                  {suggestions.cities.map((c) => (
                    <button
                      key={`c-${c}`}
                      type="button"
                      onClick={() => choose(c)}
                      className="suggestionsItem"
                    >
                      {toTitleCase(c)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="kicker" style={{ marginTop: 18 }}>
        Built by travelers, for travelers.
      </p>
    </section>
  );
}