// app/submit/SubmitForm.tsx
"use client";

import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type InsertReview = {
  city_state: string | null;
  hospital: string;
  unit: string | null;
  agency: string | null;
  pay: string | null;
  assignment_length: string | null;
  review: string | null;
  rating: number;
};

export default function SubmitForm() {
  const router = useRouter();

  // Create client safely at runtime (more stable in prod)
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      // We'll show a friendly error in UI below
      return null;
    }
    return createClient(url, key);
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [cityState, setCityState] = useState("");
  const [hospital, setHospital] = useState("");
  const [unit, setUnit] = useState("");
  const [agency, setAgency] = useState("");
  const [pay, setPay] = useState("");
  const [assignmentLength, setAssignmentLength] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState<number>(5);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!supabase) {
      setError("Missing Supabase environment variables in this deployment.");
      return;
    }

    const hospitalClean = hospital.trim();
    const ratingClean = Number(rating);

    if (!hospitalClean) {
      setError("Hospital / Facility is required.");
      return;
    }
    if (!Number.isFinite(ratingClean) || ratingClean < 1 || ratingClean > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    const payload: InsertReview = {
      city_state: cityState.trim() ? cityState.trim() : null,
      hospital: hospitalClean,
      unit: unit.trim() ? unit.trim() : null,
      agency: agency.trim() ? agency.trim() : null,
      pay: pay.trim() ? pay.trim() : null,
      assignment_length: assignmentLength.trim() ? assignmentLength.trim() : null,
      review: review.trim() ? review.trim() : null,
      rating: ratingClean,
    };

    setIsSaving(true);

    try {
      // Return the inserted id so we can redirect to the detail page
      const { data, error: insertError } = await supabase
        .from("reviews")
        .insert([payload])
        .select("id")
        .single();

      if (insertError) throw insertError;

      setSuccess("Review submitted! Redirecting…");

      // Clear form (optional)
      setCityState("");
      setHospital("");
      setUnit("");
      setAgency("");
      setPay("");
      setAssignmentLength("");
      setReview("");
      setRating(5);

      const newId = data?.id;
      if (newId !== undefined && newId !== null) {
        router.push(`/reviews/${String(newId)}`);
        router.refresh();
      } else {
        // Fallback: go to reviews list
        router.push("/reviews");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong submitting the review.");
    } finally {
      setIsSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    color: "#374151",
    fontWeight: 600,
    marginBottom: 6,
    display: "block",
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: 10,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            color: "#166534",
            padding: 10,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          {success}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div>
          <label style={labelStyle}>City / State</label>
          <input
            style={inputStyle}
            value={cityState}
            onChange={(e) => setCityState(e.target.value)}
            placeholder="e.g., Denver, CO"
          />
        </div>

        <div>
          <label style={labelStyle}>Hospital / Facility *</label>
          <input
            style={inputStyle}
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            placeholder="e.g., UCHealth University Hospital"
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Unit</label>
          <input
            style={inputStyle}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g., ICU, ER, Med-Surg"
          />
        </div>

        <div>
          <label style={labelStyle}>Agency (optional)</label>
          <input
            style={inputStyle}
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            placeholder="e.g., Aya, AMN, Medical Solutions"
          />
        </div>

        <div>
          <label style={labelStyle}>Assignment length</label>
          <input
            style={inputStyle}
            value={assignmentLength}
            onChange={(e) => setAssignmentLength(e.target.value)}
            placeholder="e.g., 13 weeks"
          />
        </div>

        <div>
          <label style={labelStyle}>Pay (optional)</label>
          <input
            style={inputStyle}
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            placeholder="e.g., $2,300/wk or $75/hr"
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Your review (optional)</label>
        <textarea
          style={{ ...inputStyle, minHeight: 110, resize: "vertical" }}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Staffing ratios, floating, orientation, culture, scheduling, housing, recruiter honesty, overtime..."
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={labelStyle}>Overall rating</label>
        <select
          style={inputStyle}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          <option value={5}>5 (best)</option>
          <option value={4}>4</option>
          <option value={3}>3</option>
          <option value={2}>2</option>
          <option value={1}>1 (worst)</option>
        </select>
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          type="submit"
          disabled={isSaving}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #111827",
            background: isSaving ? "#374151" : "#111827",
            color: "#fff",
            fontWeight: 800,
            cursor: isSaving ? "not-allowed" : "pointer",
          }}
        >
          {isSaving ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}
