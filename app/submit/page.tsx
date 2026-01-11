"use client";

import React, { useState } from "react";

export default function SubmitPage() {async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const form = e.currentTarget;
  const formData = new FormData(form);

  const payload = {
    city_state: (formData.get("city_state") as string) || null,
    hospital: (formData.get("hospital") as string) || null,
    unit: (formData.get("unit") as string) || null,
    agency: (formData.get("agency") as string) || null,
    pay: (formData.get("pay") as string) || null,
    assignment_length: (formData.get("assignment_length") as string) || null,
    review: (formData.get("review") as string) || null,
    rating: Number(formData.get("rating") || 5),
  };

  // OPTIONAL: if you still want to require hospital, keep this check
  if (!payload.hospital) {
    alert("Please enter a hospital/facility name.");
    return;
  }

  const { error } = supabase.from("reviews").insert([payload]);

  if (error) {
    alert(`Save failed: ${error.message}`);
    return;
  }

  alert("✅ Review submitted!");
  form.reset();
}

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Turn the form data into a plain object
    const payload = Object.fromEntries(formData.entries());

    // ✅ This shows up in your browser devtools console
    console.log("SUBMIT payload:", payload);

    // ✅ Success UI
    setSubmitted(true);

    // ✅ Clear the form
    form.reset();

    // Optional: hide success message after a few seconds
    setTimeout(() => setSubmitted(false), 3500);
  }

  return (
    <main style={{ maxWidth: 920, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            border: "1px solid rgba(0,0,0,0.12)",
          }}
          aria-hidden
        >
          🏥
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>RateMyContract</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>Share a travel nurse contract experience</div>
        </div>
      </div>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 18,
          padding: 22,
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(6px)",
        }}
      >
        <h1 style={{ fontSize: 30, margin: 0, fontWeight: 900 }}>Submit a Contract Review</h1>
        <p style={{ marginTop: 8, opacity: 0.8 }}>
          Keep it honest, helpful, and nurse-focused. Don’t include patient info.
        </p>

        {submitted && (
          <div
            style={{
              marginTop: 12,
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "rgba(0, 200, 150, 0.10)",
              fontWeight: 600,
            }}
          >
            ✅ Thanks! Your review was “submitted” (logged to the console for now).
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>City / State</label>
              <input
                name="cityState"
                placeholder="e.g., Denver, CO"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Hospital / Facility</label>
              <input
                name="hospital"
                placeholder="e.g., UCHealth University Hospital"
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Unit</label>
              <input
                name="unit"
                placeholder="e.g., ICU, ER, Med-Surg"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Agency (optional)</label>
              <input
                name="agency"
                placeholder="e.g., Aya, AMN, Medical Solutions"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Assignment length</label>
              <input
                name="assignmentLength"
                placeholder="e.g., 13 weeks"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Pay (optional)</label>
              <input
                name="pay"
                placeholder="e.g., $2,300/wk or $75/hr"
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Your review</label>
              <textarea
                name="review"
                placeholder="Staffing ratios, floating, orientation, culture, scheduling, housing, recruiter honesty, overtime…"
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Overall rating</label>
              <select name="rating" style={inputStyle} defaultValue="5">
                <option value="5">5 (best)</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1 (worst)</option>
              </select>
            </div>
          </div>

          <button type="submit" style={buttonStyle}>
            Submit Review
          </button>

          <p style={{ marginTop: 10, opacity: 0.7, fontSize: 13 }}>
            Tip: We’ll add anonymous storage + a real database next.
          </p>
        </form>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.15)",
  outline: "none",
  fontSize: 14,
  background: "white",
};

const buttonStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "black",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
