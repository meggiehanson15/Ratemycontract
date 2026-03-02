// app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Suggestions = {
  hospitals: string[];
  cities: string[];
};

function toTitleCase(input: string) {
  // Basic title-case that works well for hospitals/cities.
  // Keeps punctuation and multiple spaces under control.
  return input
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      const w = word.toLowerCase();

      // Keep common acronyms uppercase
      const acronyms = new Set(["ICU", "ER", "OR", "PACU", "ED", "RN", "LPN", "NP", "PA", "OB", "NICU"]);
      if (acronyms.has(word.toUpperCase())) return word.toUpperCase();

      // Handle things like "st." -> "St."
      if (w === "st." || w === "st") return "St.";
      if (w === "mt." || w === "mt") return "Mt.";
      if (w === "dr." || w === "dr") return "Dr.";

      // Title-case normal words, keep hyphenated pieces title-cased too
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

  const hasAny =
    suggestions.hospitals.length > 0 || suggestions.cities.length > 0;

  function choose(value: string) {
    // ✅ force title case when choosing from dropdown
    setQ(toTitleCase(value));
    setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") setOpen(false);
  }

  function onSubmitNormalize() {
    // ✅ If they typed free-form (not chosen), normalize it right before submit.
    // This helps avoid lowercase junk in URLs/search queries too.
    setQ((prev) => (prev.trim() ? toTitleCase(prev) : prev));
  }

  return (
    <main
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "56px 20px 64px",
      }}
    >
      {/* HERO */}
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 44, letterSpacing: -0.5, margin: 0 }}>
          RateMyContract
        </h1>
        <p style={{ color: "#475569", marginTop: 10, lineHeight: 1.6, maxWidth: 720 }}>
          Transparent travel nurse contract reviews — real experiences, real pay, real units.
        </p>
      </div>

      {/* SEARCH CARD */}
      <div
        ref={wrapRef}
        style={{
          position: "relative",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 18,
          background: "#fff",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          maxWidth: 760,
        }}
      >
        <form action="/reviews" method="GET" onSubmit={onSubmitNormalize}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
                flex: 1,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                outline: "none",
              }}
            />

            <button
              type="submit"
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                border: "none",
                background: "#0f172a",
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>
          </div>

          <div style={{ marginTop: 10, color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
            <div>100% anonymous. No login required.</div>
            <div>Built to help nurses negotiate better contracts.</div>
          </div>
        </form>

        {/* Dropdown */}
        {open && trimmed.length >= 2 && (
          <div
            style={{
              position: "absolute",
              left: 18,
              right: 18,
              top: 78,
              zIndex: 20,
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              background: "white",
              boxShadow: "0 18px 40px rgba(0,0,0,0.10)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                fontSize: 13,
                color: "#6b7280",
                background: "#f8fafc",
                borderBottom: "1px solid #eef2f7",
              }}
            >
              {loading
                ? "Searching…"
                : hasAny
                ? "Suggestions (click to select)"
                : "No suggestions yet — press Search to browse anyway"}
            </div>

            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {suggestions.hospitals.length > 0 && (
                <div>
                  <div
                    style={{
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#0f172a",
                      fontWeight: 800,
                      background: "#ffffff",
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
                      onMouseEnter={(e) => {
                        (e.currentTarget.style.background = "#f8fafc");
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget.style.background = "white");
                      }}
                    >
                      {toTitleCase(h)}
                    </button>
                  ))}

                  <div style={{ height: 1, background: "#eef2f7" }} />
                </div>
              )}

              {suggestions.cities.length > 0 && (
                <div>
                  <div
                    style={{
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "#0f172a",
                      fontWeight: 800,
                      background: "#ffffff",
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
                      onMouseEnter={(e) => {
                        (e.currentTarget.style.background = "#f8fafc");
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget.style.background = "white");
                      }}
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

      {/* FOOTER LINE */}
      <p style={{ marginTop: 22, color: "#94a3b8", fontSize: 13 }}>
        Built by travelers, for travelers.
      </p>
    </main>
  );
}