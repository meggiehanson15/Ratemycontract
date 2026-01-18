export default function HomePage() {
  return (
    <main style={{ maxWidth: 700, margin: "60px auto", padding: 20 }}>
      <h1 style={{ fontSize: 32, marginBottom: 10 }}>
        RateMyContract
      </h1>

      <p style={{ color: "#555", marginBottom: 20 }}>
        Honest travel nurse reviews by city, hospital, and unit.
      </p>

      {/* SEARCH FORM */}
      <form action="/reviews" method="GET">
        <input
          name="q"
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
          Search
        </button>
      </form>

      <p style={{ marginTop: 30, color: "#777", fontSize: 14 }}>
        Built by travelers, for travelers. Anonymous. Honest. Community-driven.
      </p>
    </main>
  );
}
