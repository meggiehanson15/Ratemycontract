"use client";

import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSubmitted(false);
    setIsSaving(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      const payload = {
        city_state: (formData.get("cityState") as string)?.trim() || null,
        hospital: (formData.get("hospital") as string)?.trim() || null, // REQUIRED
        unit: (formData.get("unit") as string)?.trim() || null,
        agency: ((formData.get("agency") as string) || "").trim() || null,
        pay: ((formData.get("pay") as string) || "").trim() || null,
        assignment_length:
          (formData.get("assignment_length") as string)?.trim() || null,
        review: ((formData.get("review") as string) || "").trim() || null, // OPTIONAL
        rating: Number(formData.get("rating") || 5),
      };

      // Hospital required
      if (!payload.hospital) {
        setError("Hospital / facility is required.");
        setIsSaving(false);
        return;
      }

      // Rating safety
      if (Number.isNaN(payload.rating) || payload.rating < 1 || payload.rating > 5) {
        setError("Please choose a rating from 1 to 5.");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase.from("reviews").insert([payload]);

      if (error) {
        setError(error.message);
        setIsSaving(false);
        return;
      }

      setSubmitted(true);
      form.reset();
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#ffffff",
    padding: "32px 16px",
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: 980,
    margin: "0 auto",
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 24,
    background: "#fff",
  };

  const h1Style: React.CSSProperties = {
    fontSize: 36,
    margin: "8px 0 8px",
    fontWeight: 800,
    letterSpacing: -0.5,
  };

  const subtitleStyle: React.CSSProperties = {
    margin: "0 0 20px",
    color: "#4b5563",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  };

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 700,
    fontSize: 13,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: 14,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  };

  const buttonDisabledStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.6,
    cursor: "not-allowed",
  };

  const bannerBase: React.CSSProperties = {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
  };

  const successStyle: React.CSSProperties = {
    ...bannerBase,
    border: "1px solid #86efac",
    background: "#f0fdf4",
  };

  const errorStyle: React.CSSProperties = {
    ...bannerBase,
    border: "1px solid #fecaca",
    background: "#fef2f2",
  };

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 22 }}>📋</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>RateMyContract</div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              Share a travel nurse contract experience
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h1 style={h1Style}>Submit a Contract Review</h1>
          <p style={subtitleStyle}>
            Keep it honest, helpful, and nurse-focused. Don’t include patient info.
          </p>

          {submitted && (
            <div style={successStyle}>✅ Thanks! Your review was submitted.</div>
          )}

          {error && <div style={errorStyle}>❌ {error}</div>}
          {submitted && (
            <div style={{ marginBottom: 12, padding: 12, borderRadius: 12, border: "1px solid #b7ebc6" }}>
            Review submitted! Thanks for sharing.
              </div>)}
          )}
          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <div style={gridStyle}>
              <div style={fieldStyle}>
                <label style={labelStyle}>City / State</label>
                <input
                  name="cityState"
                  placeholder="e.g., Denver, CO"
                  style={inputStyle}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Hospital / Facility <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  name="hospital"
                  placeholder="e.g., UCHealth University Hospital"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Unit</label>
                <input name="unit" placeholder="e.g., ICU, ER, Med-Surg" style={inputStyle} />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Agency (optional)</label>
                <input name="agency" placeholder="e.g., Aya, AMN, Medical Solutions" style={inputStyle} />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Assignment length</label>
                <input name="assignment_length" placeholder="e.g., 13 weeks" style={inputStyle} />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Pay (optional)</label>
                <input name="pay" placeholder="e.g., $2,300/wk or $75/hr" style={inputStyle} />
              </div>

              <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Your review (optional)</label>
                <textarea
                  name="review"
                  placeholder="Staffing ratios, floating, orientation, culture, scheduling, housing, recruiter honesty, overtime…"
                  style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Overall rating</label>
                <select name="rating" defaultValue="5" style={inputStyle}>
                  <option value="5">5 (best)</option>
                  <option value="4">4</option>
                  <option value="3">3</option>
                  <option value="2">2</option>
                  <option value="1">1 (worst)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <button type="submit" style={isSaving ? buttonDisabledStyle : buttonStyle} disabled={isSaving}>
                {isSaving ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

