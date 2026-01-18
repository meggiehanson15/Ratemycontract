// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "RateMyContract",
  description: "Honest travel nurse reviews by city, hospital, and unit.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
          background: "#f7f8fb",
          color: "#111827",
        }}
      >
        {/* Top Bar */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              maxWidth: 980,
              margin: "0 auto",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            {/* Brand */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                color: "inherit",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              {/* Logo placeholder (swap for your real logo later) */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  display: "grid",
                  placeItems: "center",
                  background: "#ffffff",
                  fontSize: 13,
                  fontWeight: 900,
                }}
                aria-label="RateMyContract logo"
                title="RateMyContract"
              >
                RM
              </div>

              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontSize: 18 }}>RateMyContract</div>
                <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
                  Honest travel nurse reviews
                </div>
              </div>
            </Link>

            {/* Tabs */}
            <nav
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
              aria-label="Primary navigation"
            >
              <Tab href="/">Home</Tab>
              <Tab href="/reviews">Reviews</Tab>
              <TabPrimary href="/submit">Submit a Review</TabPrimary>
            </nav>
          </div>
        </header>

        {/* Page container */}
        <main
          style={{
            maxWidth: 980,
            margin: "0 auto",
            padding: "22px 16px 48px",
          }}
        >
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid #e5e7eb",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              maxWidth: 980,
              margin: "0 auto",
              padding: "18px 16px",
              fontSize: 12,
              color: "#6b7280",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span>© {new Date().getFullYear()} RateMyContract</span>
            <span>Don’t include patient info. Be respectful.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}

/** Simple tab */
function Tab({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "#111827",
        padding: "8px 12px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {children}
    </Link>
  );
}

/** Primary tab/button */
function TabPrimary({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "#ffffff",
        padding: "9px 12px",
        borderRadius: 999,
        border: "1px solid #111827",
        background: "#111827",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {children}
    </Link>
  );
}
