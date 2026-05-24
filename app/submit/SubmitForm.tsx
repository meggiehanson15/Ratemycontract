"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseServer } from "@/lib/supabaseServer";

const states = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const chartingSystems = [
  "Epic",
  "Cerner",
  "Meditech",
  "Allscripts",
  "Athenahealth",
  "PointClickCare",
  "Homecare Homebase",
  "Other",
  "Not sure",
];

type Suggestions = {
  hospitals: string[];
  cities: string[];
};

export default function SubmitForm() {
  const [hospital, setHospital] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [unit, setUnit] = useState("");
  const [agency, setAgency] = useState("");
  const [pay, setPay] = useState("");
  const [assignmentLength, setAssignmentLength] = useState("");
  const [contractTimeframe, setContractTimeframe] = useState("");
  const [wouldWorkAgain, setWouldWorkAgain] = useState("");
  const [housingAreaRating, setHousingAreaRating] = useState("");
  const [floatingFrequency, setFloatingFrequency] = useState("");
  const [chartingSystem, setChartingSystem] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [suggestions, setSuggestions] = useState<Suggestions>({
    hospitals: [],
    cities: [],
  });

  const [activeDropdown, setActiveDropdown] = useState<
    "hospital" | "city" | null
  >(null);

  const wrapRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!wrapRef.current) return;

      if (!wrapRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }

    window.addEventListener("mousedown", close);

    return () => window.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const query =
      activeDropdown === "hospital" ? hospital.trim() : city.trim();

    const timer = setTimeout(async () => {
      if (!activeDropdown || query.length < 2) {
        setSuggestions({
          hospitals: [],
          cities: [],
        });

        return;
      }

      try {
        const res = await fetch(
          `/api/suggestions?q=${encodeURIComponent(query)}`
        );

        const json = (await res.json()) as Suggestions;

        setSuggestions({
          hospitals: Array.isArray(json?.hospitals) ? json.hospitals : [],
          cities: Array.isArray(json?.cities) ? json.cities : [],
        });
      } catch {
        setSuggestions({
          hospitals: [],
          cities: [],
        });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [hospital, city, activeDropdown]);

  function selectCity(value: string) {
    const parts = value.split(",");

    setCity(parts[0]?.trim() || value);

    const statePart = parts[1]?.trim();

    if (statePart && statePart.length === 2) {
      setStateName(statePart);
    }

    setActiveDropdown(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    if (website) return;

    if (!hospital.trim() || !city.trim() || !stateName || !review.trim()) {
      setMessage("Please fill out hospital, city, state, and review.");
      return;
    }

    if (!chartingSystem) {
      setMessage("Please select a charting system.");
      return;
    }

    if (rating === 0) {
      setMessage("Please select a star rating before submitting.");
      return;
    }

    if (review.trim().length < 20) {
      setMessage("Please write at least 20 characters for your review.");
      return;
    }

    setLoading(true);

    const supabase = supabaseServer();

    const { error } = await supabase.from("reviews").insert({
      hospital: hospital.trim(),
      city_state: `${city.trim()}, ${stateName}`,
      unit: unit.trim() || null,
      agency: agency.trim() || null,
      pay: pay.trim() || null,
      assignment_length: assignmentLength.trim() || null,
      contract_timeframe: contractTimeframe || null,
      would_work_again: wouldWorkAgain || null,
      housing_area_rating: housingAreaRating || null,
      floating_frequency: floatingFrequency || null,
      charting_system: chartingSystem,
      review: review.trim(),
      rating,
    });

    setLoading(false);

    if (error) {
      console.error("SUBMIT ERROR:", error);
      setMessage("Something went wrong. Please try again.");
      return;
    }

    setHospital("");
    setCity("");
    setStateName("");
    setUnit("");
    setAgency("");
    setPay("");
    setAssignmentLength("");
    setContractTimeframe("");
    setWouldWorkAgain("");
    setHousingAreaRating("");
    setFloatingFrequency("");
    setChartingSystem("");
    setReview("");
    setRating(0);

    setMessage("Review submitted successfully.");
  }

  return (
    <form ref={wrapRef} className="card cardPad" onSubmit={handleSubmit}>
      {message && (
        <div
          className={`alert ${
            message.includes("successfully") ? "alertSuccess" : "alertError"
          }`}
        >
          {message}
        </div>
      )}

      <div className="hpWrap">
        <label>
          Website
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
          />
        </label>
      </div>

      <div className="formGrid">
        <div style={{ position: "relative" }}>
          <label className="fieldLabel">Hospital *</label>

          <input
            className="input"
            value={hospital}
            onChange={(e) => {
              setHospital(e.target.value);
              setActiveDropdown("hospital");
            }}
            onFocus={() => setActiveDropdown("hospital")}
            placeholder="Example: Sanford Medical Center"
            autoComplete="off"
          />

          {activeDropdown === "hospital" &&
            suggestions.hospitals.length > 0 && (
              <div className="suggestions" style={{ left: 0, right: 0, top: 74 }}>
                <div className="suggestionsHeader">Hospitals</div>

                <div className="suggestionsBody">
                  {suggestions.hospitals.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className="suggestionsItem"
                      onClick={() => {
                        setHospital(h);
                        setActiveDropdown(null);
                      }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div style={{ position: "relative" }}>
          <label className="fieldLabel">City *</label>

          <input
            className="input"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setActiveDropdown("city");
            }}
            onFocus={() => setActiveDropdown("city")}
            placeholder="Example: Fargo"
            autoComplete="off"
          />

          {activeDropdown === "city" && suggestions.cities.length > 0 && (
            <div className="suggestions" style={{ left: 0, right: 0, top: 74 }}>
              <div className="suggestionsHeader">Cities</div>

              <div className="suggestionsBody">
                {suggestions.cities.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="suggestionsItem"
                    onClick={() => selectCity(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="fieldLabel">State *</label>

          <select
            className="input"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
          >
            <option value="">Select state</option>

            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="fieldLabel">Unit</label>

          <input
            className="input"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Example: ICU, PACU"
          />
        </div>

        <div>
          <label className="fieldLabel">Agency</label>

          <input
            className="input"
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            placeholder="Example: Aya"
          />
        </div>

        <div>
          <label className="fieldLabel">Pay</label>

          <input
            className="input"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            placeholder="Example: $2,500/week"
          />
        </div>

        <div>
          <label className="fieldLabel">Assignment Length</label>

          <input
            className="input"
            value={assignmentLength}
            onChange={(e) => setAssignmentLength(e.target.value)}
            placeholder="Example: 13 weeks"
          />
        </div>

        <div>
          <label className="fieldLabel">When did you take this contract?</label>

          <select
            className="input"
            value={contractTimeframe}
            onChange={(e) => setContractTimeframe(e.target.value)}
          >
            <option value="">Select timeframe</option>
            <option value="Current assignment">Current assignment</option>
            <option value="Within the last 3 months">
              Within the last 3 months
            </option>
            <option value="3–6 months ago">3–6 months ago</option>
            <option value="6–12 months ago">6–12 months ago</option>
            <option value="1–2 years ago">1–2 years ago</option>
            <option value="More than 2 years ago">
              More than 2 years ago
            </option>
          </select>
        </div>

        <div>
          <label className="fieldLabel">
            Would you take another contract here?
          </label>

          <select
            className="input"
            value={wouldWorkAgain}
            onChange={(e) => setWouldWorkAgain(e.target.value)}
          >
            <option value="">Select option</option>
            <option value="Yes">Yes</option>
            <option value="Maybe">Maybe</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="fieldLabel">
            How was the housing / area situation?
          </label>

          <select
            className="input"
            value={housingAreaRating}
            onChange={(e) => setHousingAreaRating(e.target.value)}
          >
            <option value="">Select option</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Difficult">Difficult</option>
            <option value="Terrible">Terrible</option>
          </select>
        </div>

        <div>
          <label className="fieldLabel">How often were you floated?</label>

          <select
            className="input"
            value={floatingFrequency}
            onChange={(e) => setFloatingFrequency(e.target.value)}
          >
            <option value="">Select option</option>
            <option value="Rarely floated">Rarely floated</option>
            <option value="Occasionally floated">Occasionally floated</option>
            <option value="Frequently floated">Frequently floated</option>
            <option value="Constantly floated">Constantly floated</option>
          </select>
        </div>

        <div>
          <label className="fieldLabel">Charting System *</label>

          <select
            className="input"
            value={chartingSystem}
            onChange={(e) => setChartingSystem(e.target.value)}
          >
            <option value="">Select charting system</option>

            {chartingSystems.map((system) => (
              <option key={system} value={system}>
                {system}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <label className="fieldLabel">⭐ Rate This Assignment *</label>

        <div className="starsPicker" style={{ gap: 12 }}>
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              className="starBtn"
              onClick={() => setRating(num)}
              style={{
                fontSize: 42,
                transform: num === rating ? "scale(1.12)" : "scale(1)",
                transition: "all .15s ease",
              }}
            >
              {num <= rating ? "⭐" : "☆"}
            </button>
          ))}

          <span
            className="kicker"
            style={{
              marginLeft: 10,
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            {rating === 0 ? "Select a rating" : `${rating}/5`}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <label className="fieldLabel">Review *</label>

        <textarea
          className="input"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share what the assignment was like. Avoid patient info, names, or confidential details."
          rows={6}
        />
      </div>

      <p className="kicker" style={{ marginTop: 12 }}>
        Do not include patient-identifiable information, coworker names, or
        confidential details.
      </p>

      <div style={{ marginTop: 16 }}>
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </form>
  );
}