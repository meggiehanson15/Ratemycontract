export default function Home() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            border: "2px solid #0A2540",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            color: "#0A2540",
          }}
        >
          RM
        </div>

        <div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, color: "#0A2540" }}>
            RateMyContract
          </h1>
          <p style={{ margin: 0, color: "#3b556e" }}>
            Honest travel nurse reviews by city, hospital, and unit.
          </p>
        </div>
      </header>

      <section
        style={{
          marginTop: 24,
          padding: 20,
          borderRadius: 16,
          border: "1px solid #e6edf5",
          background: "#ffffff",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 20 }}>Search (coming soon)</h2>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            placeholder="Search by hospital, city, or state…"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "1px solid #d7e2ee",
              fontSize: 16,
            }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #0A2540",
                background: "#0A2540",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Search
            </button>

            <button
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #d7e2ee",
                background: "white",
                color: "#0A2540",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Submit a Review
            </button>
          </div>

          <p style={{ margin: 0, color: "#5b6b7a", fontSize: 14 }}>
            Built by travelers, for travelers. Anonymous. Honest. Community-driven.
          </p>
        </div>
      </section>
    </main>
  );
}
