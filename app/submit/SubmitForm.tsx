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

function clampRating(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(1, Math.min(5, Math.round(n)));
}

/** Common medical acronyms (kept uppercase). Add/remove freely. */
const UPPER_TOKENS = new Set([
  "ICU",
  "ER",
  "ED",
  "OR",
  "PACU",
  "IR",
  "NICU",
  "PICU",
  "OB",
  "L&D",
  "LD",
  "CVICU",
  "MICU",
  "SICU",
  "CCU",
  "TCU",
  "PCU",
  "IMC",
  "MRI",
  "CT",
  "US",
  "IV",
  "RN",
  "LPN",
  "CNA",
  "NP",
  "PA",
  "MD",
  "DO",
  "VA",
  "UC",
  "UCLA",
  "NYU",
]);

const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

function normalizeSpaces(s: string) {
  return s
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*-\s*/g, "-")
    .trim();
}

function titlePart(part: string) {
  if (!part) return part;

  const lower = part.toLowerCase();

  if (/[0-9]/.test(part)) return part;
  if (part.length > 1 && part === part.toUpperCase()) return part;

  if (lower.includes("'")) {
    return lower
      .split("'")
      .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : p))
      .join("'");
  }

  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function toTitleCaseSmart(input: string) {
  const s = normalizeSpaces(input);
  if (!s) return "";

  return s
    .split(" ")
    .map((word) => {
      if (!word) return word;

      const upperCandidate = word.replace(/[().]/g, "");
      if (UPPER_TOKENS.has(upperCandidate.toUpperCase())) {
        return word.toUpperCase();
      }

      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => titlePart(part))
          .join("-");
      }

      return titlePart(word);
    })
    .join(" ");
}

function formatAssignmentLength(input: string) {
  const s = input.trim();
  if (!s) return "";

  if (/\b(month|months|day|days|year|years|yr|yrs)\b/i.test(s)) return s;

  const match = s.match(/(\d+(\.\d+)?)/);
  if (!match) return s;

  return `${match[1]} weeks`;
}

function debounce<T extends (...args: any[]) => void>(fn: T, wait = 250) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Parse "City, ST" into parts */
function parseCityState(s: string): { city: string; state: string } | null {
  const cleaned = normalizeSpaces(s);
  const m = cleaned.match(/^(.+?),\s*([A-Za-z]{2})$/);
  if (!m) return null;
  return { city: toTitleCaseSmart(m[1]).trim(), state: m[2].toUpperCase() };
}

function StarsPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const v = clampRating(value);
  return (
    <div className="starsPicker" role="radiogroup" aria-label="Overall rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const on = starValue <= v;
        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            className={`starBtn ${on ? "starOn" : "starOff"}`}
            onClick={() => onChange(starValue)}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            aria-checked={starValue === v}
            role="radio"
          >
            ★
          </button>
        );
      })}
      <span className="kicker" style={{ marginLeft: 10 }}>
        {v}/5
      </span>
    </div>
  );
}

function SuggestBox({
  show,
  suggestions,
  onPick,
}: {
  show: boolean;
  suggestions: string[];
  onPick: (s: string) => void;
}) {
  if (!show || suggestions.length === 0) return null;

  return (
    <div
      className="card"
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        marginTop: 6,
        padding: 8,
        zIndex: 50,
      }}
    >
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          className="button"
          style={{ width: "100%", marginBottom: 6 }}
          onMouseDown={(e) => {
            e.preventDefault(); // prevents blur before click
            onPick(s);
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export default function SubmitForm() {
  const router = useRouter();

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Honeypot
  const [website, setWebsite] = useState("");

  // NEW: split City + State
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");

  const [hospital, setHospital] = useState("");
  const [unit, setUnit] = useState("");
  const [agency, setAgency] = useState("");
  const [pay, setPay] = useState("");
  const [assignmentLength, setAssignmentLength] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState<number>(5);

  // Suggestions
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const [hospitalSuggestions, setHospitalSuggestions] = useState<string[]>([]);
  const [showHospitalSuggestions, setShowHospitalSuggestions] = useState(false);

  const [unitSuggestions, setUnitSuggestions] = useState<string[]>([]);
  const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);

  const [agencySuggestions, setAgencySuggestions] = useState<string[]>([]);
  const [showAgencySuggestions, setShowAgencySuggestions] = useState(false);

  const [lengthSuggestions, setLengthSuggestions] = useState<string[]>([]);
  const [showLengthSuggestions, setShowLengthSuggestions] = useState(false);

  // Fetch location suggestions from existing city_state values (e.g., "Aberdeen, SD")
  const fetchLocationSuggestions = useMemo(() => {
    return debounce(async (q: string) => {
      if (!supabase) return;
      const query = q.trim();
      if (query.length < 2) {
        setLocationSuggestions([]);
        return;
      }

      const { data, error } = await supabase
        .from("reviews")
        .select("city_state")
        .ilike("city_state", `%${query}%`)
        .limit(10);

      if (error) {
        setLocationSuggestions([]);
        return;
      }

      const unique = Array.from(
        new Set(
          (data ?? [])
            .map((r: any) => (typeof r?.city_state === "string" ? r.city_state : ""))
            .filter((v: string) => v.trim().length > 0)
        )
      ) as string[];

      // Prefer clean "City, ST" looking strings
      const cleaned = unique
        .map((v) => {
          const parsed = parseCityState(v);
          return parsed ? `${parsed.city}, ${parsed.state}` : normalizeSpaces(v);
        })
        .filter(Boolean);

      setLocationSuggestions(Array.from(new Set(cleaned)).slice(0, 8));
    }, 250);
  }, [supabase]);

  const makeSimpleFetcher = useMemo(() => {
    return function make(
      column: "hospital" | "unit" | "agency" | "assignment_length",
      setSuggestions: (arr: string[]) => void
    ) {
      return debounce(async (q: string) => {
        if (!supabase) return;
        const query = q.trim();
        if (query.length < 2) {
          setSuggestions([]);
          return;
        }

        const { data, error } = await supabase
          .from("reviews")
          .select(column)
          .ilike(column, `%${query}%`)
          .limit(10);

        if (error) {
          setSuggestions([]);
          return;
        }

        const unique = Array.from(
          new Set(
            (data ?? [])
              .map((r: any) => r?.[column])
              .filter((v: any) => typeof v === "string" && v.trim().length > 0)
          )
        ) as string[];

        setSuggestions(unique.slice(0, 8));
      }, 250);
    };
  }, [supabase]);

  const fetchHospitalSuggestions = useMemo(
    () => makeSimpleFetcher("hospital", setHospitalSuggestions),
    [makeSimpleFetcher]
  );
  const fetchUnitSuggestions = useMemo(
    () => makeSimpleFetcher("unit", setUnitSuggestions),
    [makeSimpleFetcher]
  );
  const fetchAgencySuggestions = useMemo(
    () => makeSimpleFetcher("agency", setAgencySuggestions),
    [makeSimpleFetcher]
  );
  const fetchLengthSuggestions = useMemo(
    () => makeSimpleFetcher("assignment_length", setLengthSuggestions),
    [makeSimpleFetcher]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (website.trim()) {
      setError("Submission blocked. Please try again.");
      return;
    }

    if (!supabase) {
      setError("Missing Supabase environment variables in this deployment.");
      return;
    }

    const cityClean = toTitleCaseSmart(city).trim();
    const stateClean = stateCode.trim().toUpperCase();

    // Require state if any city is entered (and fix ambiguity like Aberdeen)
    if (cityClean && !stateClean) {
      setError("Please select a state.");
      return;
    }

    const cityStateClean =
      cityClean && stateClean ? `${cityClean}, ${stateClean}` : "";

    const hospitalClean = toTitleCaseSmart(hospital).trim();
    const unitClean = toTitleCaseSmart(unit).trim();
    const agencyClean = toTitleCaseSmart(agency).trim();
    const assignmentLengthClean = formatAssignmentLength(assignmentLength).trim();
    const ratingClean = clampRating(Number(rating));

    if (!hospitalClean) {
      setError("Hospital / Facility is required.");
      return;
    }

    const payload: InsertReview = {
      city_state: cityStateClean ? cityStateClean : null,
      hospital: hospitalClean,
      unit: unitClean ? unitClean : null,
      agency: agencyClean ? agencyClean : null,
      pay: pay.trim() ? pay.trim() : null,
      assignment_length: assignmentLengthClean ? assignmentLengthClean : null,
      review: review.trim() ? review.trim() : null,
      rating: ratingClean,
    };

    setIsSaving(true);

    try {
      const { data, error: insertError } = await supabase
        .from("reviews")
        .insert([payload])
        .select("id")
        .single();

      if (insertError) throw insertError;

      setSuccess("✅ Review submitted! Redirecting…");

      // Clear form
      setWebsite("");
      setCity("");
      setStateCode("");
      setHospital("");
      setUnit("");
      setAgency("");
      setPay("");
      setAssignmentLength("");
      setReview("");
      setRating(5);

      // Clear suggestions
      setLocationSuggestions([]);
      setHospitalSuggestions([]);
      setUnitSuggestions([]);
      setAgencySuggestions([]);
      setLengthSuggestions([]);
      setShowLocationSuggestions(false);
      setShowHospitalSuggestions(false);
      setShowUnitSuggestions(false);
      setShowAgencySuggestions(false);
      setShowLengthSuggestions(false);

      const newId = data?.id;
      if (newId !== undefined && newId !== null) {
        router.push(`/reviews/${String(newId)}`);
        router.refresh();
      } else {
        router.push("/reviews");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong submitting the review.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card cardPad">
      {error ? (
        <div className="alert alertError" role="alert">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="alert alertSuccess" role="status">
          {success}
        </div>
      ) : null}

      {/* Honeypot */}
      <div className="hpWrap" aria-hidden="true">
        <label className="hpLabel">Website</label>
        <input
          className="hpInput"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="formGrid">
        {/* City with "City, ST" suggestions */}
        <div style={{ position: "relative" }}>
          <label className="fieldLabel">City</label>
          <input
            className="input"
            value={city}
            disabled={isSaving}
            onChange={(e) => {
              const v = e.target.value;
              setCity(v);
              setShowLocationSuggestions(true);
              fetchLocationSuggestions(v);
            }}
            onBlur={() => {
              setTimeout(() => setShowLocationSuggestions(false), 150);
              setCity(toTitleCaseSmart(city));
            }}
            placeholder="e.g., Aberdeen"
          />

          <SuggestBox
            show={showLocationSuggestions}
            suggestions={locationSuggestions}
            onPick={(picked) => {
              const parsed = parseCityState(picked);
              if (parsed) {
                setCity(parsed.city);
                setStateCode(parsed.state);
              } else {
                // fallback: just fill city
                setCity(toTitleCaseSmart(picked));
              }
              setShowLocationSuggestions(false);
            }}
          />
          <p className="kicker" style={{ marginTop: 6 }}>
            Tip: pick “City, ST” from the dropdown to avoid ambiguous cities.
          </p>
        </div>

        {/* State dropdown (solves Aberdeen WA vs SD) */}
        <div>
          <label className="fieldLabel">State {city.trim() ? "*" : ""}</label>
          <select
            className="input"
            value={stateCode}
            disabled={isSaving}
            onChange={(e) => setStateCode(e.target.value)}
          >
            <option value="">Select…</option>
            {US_STATES.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Hospital */}
        <div style={{ position: "relative" }}>
          <label className="fieldLabel">Hospital / Facility *</label>
          <input
            className="input"
            value={hospital}
            disabled={isSaving}
            onChange={(e) => {
              const v = e.target.value;
              setHospital(v);
              setShowHospitalSuggestions(true);
              fetchHospitalSuggestions(v);
            }}
            onBlur={() => {
              setTimeout(() => setShowHospitalSuggestions(false), 150);
              setHospital(toTitleCaseSmart(hospital));
            }}
            placeholder="e.g., UCHealth University Hospital"
            required
          />
          <SuggestBox
            show={showHospitalSuggestions}
            suggestions={hospitalSuggestions}
            onPick={(s) => {
              setHospital(s);
              setShowHospitalSuggestions(false);
            }}
          />
        </div>

        {/* Unit */}
        <div style={{ position: "relative" }}>
          <label className="fieldLabel">Unit</label>
          <input
            className="input"
            value={unit}
            disabled={isSaving}
            onChange={(e) => {
              const v = e.target.value;
              setUnit(v);
              setShowUnitSuggestions(true);
              fetchUnitSuggestions(v);
            }}
            onBlur={() => {
              setTimeout(() => setShowUnitSuggestions(false), 150);
              setUnit(toTitleCaseSmart(unit));
            }}
            placeholder="e.g., ICU, ER, Med-Surg"
          />
          <SuggestBox
            show={showUnitSuggestions}
            suggestions={unitSuggestions}
            onPick={(s) => {
              setUnit(s);
              setShowUnitSuggestions(false);
            }}
          />
        </div>

        {/* Agency */}
        <div style={{ position: "relative" }}>
          <label className="fieldLabel">Agency (optional)</label>
          <input
            className="input"
            value={agency}
            disabled={isSaving}
            onChange={(e) => {
              const v = e.target.value;
              setAgency(v);
              setShowAgencySuggestions(true);
              fetchAgencySuggestions(v);
            }}
            onBlur={() => {
              setTimeout(() => setShowAgencySuggestions(false), 150);
              setAgency(toTitleCaseSmart(agency));
            }}
            placeholder="e.g., Aya, AMN, Medical Solutions"
          />
          <SuggestBox
            show={showAgencySuggestions}
            suggestions={agencySuggestions}
            onPick={(s) => {
              setAgency(s);
              setShowAgencySuggestions(false);
            }}
          />
        </div>

        {/* Assignment length */}
        <div style={{ position: "relative" }}>
          <label className="fieldLabel">Assignment length</label>
          <input
            className="input"
            value={assignmentLength}
            disabled={isSaving}
            onChange={(e) => {
              const v = e.target.value;
              setAssignmentLength(v);
              setShowLengthSuggestions(true);
              fetchLengthSuggestions(v);
            }}
            onBlur={() => {
              setTimeout(() => setShowLengthSuggestions(false), 150);
              setAssignmentLength(formatAssignmentLength(assignmentLength));
            }}
            placeholder="e.g., 13 or 13 weeks"
          />
          <SuggestBox
            show={showLengthSuggestions}
            suggestions={lengthSuggestions}
            onPick={(s) => {
              setAssignmentLength(s);
              setShowLengthSuggestions(false);
            }}
          />
        </div>

        {/* Pay */}
        <div>
          <label className="fieldLabel">Pay (optional)</label>
          <input
            className="input"
            value={pay}
            disabled={isSaving}
            onChange={(e) => setPay(e.target.value)}
            placeholder="e.g., $2,300/wk or $75/hr"
          />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="fieldLabel">Your review (optional)</label>
        <textarea
          className="input"
          style={{ minHeight: 120, resize: "vertical" }}
          value={review}
          disabled={isSaving}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Staffing ratios, floating, orientation, culture, scheduling, housing, recruiter honesty, overtime..."
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="fieldLabel">Overall rating</label>
        <StarsPicker value={rating} onChange={setRating} disabled={isSaving} />
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          type="submit"
          disabled={isSaving}
          className="button"
          style={{ width: "100%" }}
        >
          {isSaving ? "Submitting..." : "Submit Review"}
        </button>
      </div>

      <p className="kicker" style={{ marginTop: 10 }}>
        Tip: Avoid names, dates, or anything that could identify a patient.
      </p>
    </form>
  );
}