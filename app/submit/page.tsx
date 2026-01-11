"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  outline: "none",
  fontSize: 14,
};

const labelStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 6,
  display: "block",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonStyle,
  opacity: 0.6,
  cursor: "not-allowed",
};

export default function SubmitPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(false);
    setError(null);

    if (!supabase) {
      setError(
        "Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel + local .env."
      );
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const city_state = String(formData.get("city_state") ?? "").trim();
    const hospital = String(formData.get("hospital") ?? "").trim();
    const unit = String(formData.get("unit") ?? "").trim();
    const agencyRaw = String(formData.get("agency") ?? "").trim();
    const payRaw = String(formData.get("pay") ?? "").trim();
    const assignment_length = String(formData.get("assignment_length") ?? "").trim();
    const reviewRaw = String(formData.get("review") ?? "").trim();
    const ratingRaw = String(formData.get("rating") ?? "5");

    // REQUIREMENTS YOU ASKED FOR:
    // - hospital required
    // - review optional
    if (!hospital) {
      setError("Please enter a hospital/facility name.");
      return;
    }

    const ratingNum = Number(ratingRaw);
    const rating =
      Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5
        ? ratingNum
        : 5;

    const payload = {
      city_state: city_state || null,
      hospital, // required
      unit: unit || null,
      agency: agencyRaw || null,
      pay: payRaw || null,
      assignment_length: assignment_length || null,
      review: reviewRaw || null, // optional
      rating, // 1-5
    };

    setIsSaving(true);
    try {
      const { error: insertError } = await supabase.from("reviews").insert([payload]);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error submitting review.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main style={{ padding: 24, display: "flex", justifyContent: "center" }}>
      <div style={{ width: "min(900px, 100%)" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 28 }}>Submit a Contract Review</div>
          <div style={{ color: "#6b7280", marginTop: 6 }}>
            Keep it honest, helpful, and nurse-focused. Don’t include patient info.
          </div>
        </div>

        {submitted && (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #b7ebc6",
              background: "#f0fdf4",
            }}
          >
            ✅ Review submitted! Thanks for sharing.
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              alignItems: "start",
            }}
          >
            <div>
              <label style={labelStyle}>City / State</label>
              <input name="city_state" placeholder="e.g., Denver, CO" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>
                Hospital / Facility <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                name="hospital"
                placeholder="e.g., UCHealth University Hospital"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Unit</label>
              <input name="unit" placeholder="e.g., ICU, ER, Med-Surg" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Agency (optional)</label>
              <input name="agency" placeholder="e.g., Aya, AMN, Medical Solutions" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Assignment length</label>
              <input name="assignment_length" placeholder="e.g., 13 weeks" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Pay (optional)</label>
              <input name="pay" placeholder="e.g., $2,300/wk or $75/hr" style={inputStyle} />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Your review (optional)</label>
              <textarea
                name="review"
                placeholder="Staffing ratios, floating, orientation, culture, scheduling, housing, recruiter honesty, overtime…"
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
              />
            </div>

            <div>
              <label style={labelStyle}>Overall rating</label>
              <select name="rating" style={inputStyle} defaultValue="5">
                <option value="5">5 (best)</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1 (worst)</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "end" }}>
              <button
                type="submit"
                disabled={isSaving}
                style={isSaving ? buttonDisabledStyle : buttonStyle}
              >
                {isSaving ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </form>

        <div style={{ marginTop: 14, color: "#6b7280", fontSize: 12 }}>
          Tip: If submissions work locally but not on Vercel, confirm your Vercel env vars are set for
          Production/Preview/Development and redeploy.
        </div>
      </div>
    </main>
  );
}
