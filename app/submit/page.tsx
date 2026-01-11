'use client'; 
export default function SubmitPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F6FAFF",
        padding: "48px 16px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        color: "#0A2540",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Top bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
          }}
        >
          {/* Simple clipboard icon */}
          <div
            aria-hidden="true"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "white",
              border: "1px solid #E2ECF7",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 6px 18px rgba(10,37,64,0.06)",
            }}
          >
            <div
              style={{
                width: 22,
                height: 26,
                borderRadius: 6,
                border: "2px solid #0A2540",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 14,
                  height: 10,
                  borderRadius: 6,
                  border: "2px solid #0A2540",
                  background: "white",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  left: 5,
                  right: 5,
                  height: 2,
                  background: "#2EC4B6",
                  borderRadius: 2,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  left: 5,
                  right: 9,
                  height: 2,
                  background: "#CFE2F7",
                  borderRadius: 2,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 5,
                  right: 12,
                  height: 2,
                  background: "#CFE2F7",
                  borderRadius: 2,
                }}
              />
            </div>
          </div>

          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>RateMyContract</div>
            <div style={{ color: "#3b556e", fontSize: 13 }}>
              Share a travel nurse contract experience
            </div>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <a
              href="/"
              style={{
                fontSize: 13,
                color: "#0A2540",
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #E2ECF7",
                background: "white",
              }}
            >
              ← Back to home
            </a>
          </div>
        </header>

        {/* Card */}
        <section
          style={{
            background: "white",
            borderRadius: 20,
            border: "1px solid #E2ECF7",
            boxShadow: "0 10px 30px rgba(10,37,64,0.08)",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: 22,
              borderBottom: "1px solid #EAF2FB",
              background:
                "linear-gradient(180deg, rgba(46,196,182,0.10) 0%, rgba(255,255,255,1) 85%)",
            }}
          >
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>
              Submit a Contract Review
            </h1>
            <p style={{ margin: "8px 0 0 0", color: "#3b556e" }}>
              Keep it honest, helpful, and nurse-focused. Don’t include patient info.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Next step: we’ll save this to a database.");
            }}
            style={{ padding: 22 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <Field label="City / State" placeholder="e.g., Denver, CO" required />
              <Field label="Hospital / Facility" placeholder="e.g., UCHealth University Hospital" required />
              <Field label="Unit" placeholder="e.g., ICU, ER, Med-Surg" />
              <Field label="Agency (optional)" placeholder="e.g., Aya, AMN, Medical Solutions" />
              <Field label="Assignment length" placeholder="e.g., 13 weeks" />
              <Field label="Pay (optional)" placeholder="e.g., $2,300/wk or $75/hr" />
            </div>

            <div style={{ height: 14 }} />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 220px",
                gap: 14,
                alignItems: "start",
              }}
            >
              <TextArea
                label="Your review"
                placeholder="Staffing ratios, floating, orientation, culture, scheduling, housing, recruiter honesty, overtime…"
                required
              />

              <div
                style={{
                  border: "1px solid #EAF2FB",
                  borderRadius: 16,
                  padding: 14,
                  background: "#FBFDFF",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Overall rating</div>

                <label style={{ display: "grid", gap: 8 }}>
                  <span style={{ fontSize: 13, color: "#3b556e" }}>1 (worst) → 5 (best)</span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    defaultValue={5}
                    style={inputStyle}
                  />
                </label>

                <div style={{ marginTop: 12, fontSize: 12, color: "#5b6b7a" }}>
                  Tip: Be specific (ratios, call, floating, support).
                </div>
              </div>
            </div>

            <div style={{ height: 18 }} />

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontSize: 12, color: "#5b6b7a" }}>
                By submitting, you confirm this is your own experience and you’re not sharing private info.
              </div>

              <button
                type="submit"
                style={{
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "1px solid #0A2540",
                  background: "#0A2540",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 800,
                  boxShadow: "0 10px 24px rgba(10,37,64,0.18)",
                }}
              >
                Submit Review
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

/* ---------- small reusable bits ---------- */

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid #D7E2EE",
  background: "white",
  outline: "none",
};

function Field({
  label,
  placeholder,
  required,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontWeight: 800, fontSize: 13 }}>{label}</span>
      <input required={required} placeholder={placeholder} style={inputStyle} />
    </label>
  );
}

function TextArea({
  label,
  placeholder,
  required,
}: {
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontWeight: 800, fontSize: 13 }}>{label}</span>
      <textarea
        required={required}
        placeholder={placeholder}
        rows={8}
        style={{
          ...inputStyle,
          resize: "vertical",
          padding: "12px",
          lineHeight: 1.4,
        }}
      />
    </label>
  );
}
