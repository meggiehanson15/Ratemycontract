export default function SubmitPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ marginTop: 0, fontSize: 32, fontWeight: 800, color: "#0A2540" }}>
        Submit a Contract Review
      </h1>
      <p style={{ color: "#3b556e" }}>
        Share your experience to help other travel nurses choose safe, fair contracts.
      </p>

      <form
        style={{
          marginTop: 18,
          display: "grid",
          gap: 12,
          padding: 18,
          borderRadius: 16,
          border: "1px solid #e6edf5",
          background: "white",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          alert("Next step: we’ll save this to a database.");
        }}
      >
        <label>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>City / State</div>
          <input
            required
            placeholder="e.g., Denver, CO"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #d7e2ee" }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Hospital / Facility</div>
          <input
            required
            placeholder="e.g., UCHealth University of Colorado Hospital"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #d7e2ee" }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Unit</div>
          <input
            placeholder="e.g., ICU, ER, Med-Surg"
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #d7e2ee" }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Overall rating (1–5)</div>
          <input
            type="number"
            min={1}
            max={5}
            defaultValue={5}
            style={{ width: 120, padding: 12, borderRadius: 12, border: "1px solid #d7e2ee" }}
          />
        </label>

        <label>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Your review</div>
          <textarea
            required
            rows={6}
            placeholder="Staffing, culture, floating, orientation, scheduling, housing, recruiter honesty, etc."
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #d7e2ee" }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #0A2540",
            background: "#0A2540",
            color: "white",
            cursor: "pointer",
            fontWeight: 700,
            width: 200,
          }}
        >
          Submit Review
        </button>
      </form>

      <p style={{ marginTop: 16, color: "#5b6b7a", fontSize: 14 }}>
        Tip: We’ll add anonymity + moderation next.
      </p>
    </main>
  );
}
