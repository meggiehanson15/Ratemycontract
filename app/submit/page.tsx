"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type ReviewRow = {
  id: number;
  created_at: string | null;
  city_state: string | null;
  hospital: string | null;
  unit: string | null;
  agency: string | null;
  pay: string | null;
  assignment_length: string | null;
  review: string | null;
  rating: number | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ReviewsPage() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as ReviewRow[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6 }}>Reviews</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Latest contract reviews submitted by nurses.
      </p>

      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <button
          onClick={load}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Refresh
        </button>
      </div>

      {loading && <div>Loading…</div>}

      {!loading && error && (
        <div
          style={{
            background: "#ffecec",
            border: "1px solid #ffb3b3",
            padding: 12,
            borderRadius: 10,
            color: "#8a0000",
          }}
        >
          Error: {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
        <div
          style={{
            background: "#f6f6f6",
            border: "1px solid #e5e5e5",
            padding: 12,
            borderRadius: 10,
          }}
        >
          No reviews yet.
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((r) => (
          <article
            key={r.id}
            style={{
              border: "1px solid #e6e6e6",
              borderRadius: 14,
              padding: 14,
              background: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontWeight: 800 }}>
                {r.hospital ?? "Unknown hospital"}
              </div>
              <div style={{ color: "#444", fontWeight: 700 }}>
                {r.rating ? `⭐ ${r.rating}/5` : "—"}
              </div>
            </div>

            <div style={{ color: "#666", marginTop: 6, fontSize: 14 }}>
              {(r.city_state ?? "Unknown location")}
              {" • "}
              {(r.unit ?? "Unknown unit")}
              {r.assignment_length ? ` • ${r.assignment_length}` : ""}
            </div>

            {r.agency ? (
              <div style={{ color: "#666", marginTop: 6, fontSize: 14 }}>
                Agency: {r.agency}
              </div>
            ) : null}

            {r.pay ? (
              <div style={{ color: "#666", marginTop: 6, fontSize: 14 }}>
                Pay: {r.pay}
              </div>
            ) : null}

            {r.review ? (
              <p style={{ marginTop: 10, marginBottom: 0, lineHeight: 1.5 }}>
                {r.review}
              </p>
            ) : (
              <p style={{ marginTop: 10, marginBottom: 0, color: "#777" }}>
                (No written review)
              </p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

