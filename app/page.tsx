// app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Suggestions = {
  hospitals: string[];
  cities: string[];
};

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

  // close dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  // debounced fetch suggestions
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
          hospitals: Array.isArray(json.hospitals) ? json.hospitals : [],
          cities: Array.isArray(json.cities) ? json.cities : [],
        });
      } catch {
        setSuggestions({ hospitals: [], cities: [] });
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [trimmed]);

  const hasAny =
    suggestions.hospitals.length > 0 || suggestions.cities.length > 0;

  function choose(value: string) {
    setQ(value);
    setOpen(false);
    // keep focus
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <main style={{ maxWidth: 700, margin: "60px auto", padding: 20 }}>
      <h1 style={{ fontSize: 32, marginBottom: 10 }}>RateMyContract</h1>

      <p style={{ color: "#555", marginBottom: 20 }}>
        Transparent travel nurse contract reviews.
        <br />
        Real experiences. Real pay. Real units.
      </p>

      {/* SEARCH FORM */}
      <div ref={wrapRef} style={{ position: "relative" }}>
        <form action="/reviews" method="GET">
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
            style={{
              padding: "10px 12px",
              width: "70%",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              marginRight: 8,
              fontSize: 16,
            }}
          />

          <button
            type="submit"
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#0f172a",
              color: "white",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Search Contracts
          </button>
        </form>
        <p style={{
          marginTop: 18,
          fontSize: 14,
          color: "#64748b",
          lineHeight: 1.6
        }}>
          100% anonymous. No login required.
          <br />
          Built to help nurses negotiate better contracts.
        </p>

        {/* Dropdown */}
        {open && trimmed.length >= 2 && (
          <div
            style={{
              position: "absolute",
              zIndex: 20,
              marginTop: 8,
              width: "70%",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "white",
              boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "10px 12px", fontSize: 13, color: "#6b7280" }}>
              {loading
                ? "Searching…"
                : hasAny
                ? "Suggestions (click to select)"
                : "No suggestions yet — press Search to browse anyway"}
            </div>

            {suggestions.hospitals.length > 0 && (
              <div style={{ borderTop: "1px solid #f1f5f9" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    fontSize: 12,
                    color: "#0f172a",
                    fontWeight: 800,
                    background: "#f8fafc",
                  }}
                >
                  Hospitals
                </div>
                {suggestions.hospitals.map((h) => (
                  <button
                    key={`h-${h}`}
                    type="button"
                    onClick={() => choose(h)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      border: "none",
                      background: "white",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}

            {suggestions.cities.length > 0 && (
              <div style={{ borderTop: "1px solid #f1f5f9" }}>
                <div
                  style={{
                    padding: "8px 12px",
                    fontSize: 12,
                    color: "#0f172a",
                    fontWeight: 800,
                    background: "#f8fafc",
                  }}
                >
                  Cities
                </div>
                {suggestions.cities.map((c) => (
                  <button
                    key={`c-${c}`}
                    type="button"
                    onClick={() => choose(c)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      border: "none",
                      background: "white",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <p style={{ marginTop: 30, color: "#777", fontSize: 14 }}>
        Built by travelers, for travelers. Anonymous. Honest. Community-driven.
      </p>
    </main>
  );
}

