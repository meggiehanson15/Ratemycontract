import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "http://localhost:3000";

export const metadata = {
  title: "RateMyContract | Travel Nurse Contract Reviews",
  description:
    "Transparent travel nurse contract reviews — real experiences, real pay, real units.",
  metadataBase: new URL(siteUrl),
  icons: {
  icon: "/icon.png",
},

  verification: {
    google: "RjqevS6c3TLvEh34P6XmF62CX1V5fyPK8QDq6ORiroM",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <div className="headerInner">
            <Link href="/" className="brand">
              <img
                src="/rm-heart-logo.png"
                alt="RateMyContract"
                className="headerLogo"
              />
            </Link>

            <nav className="nav">
              <Link className="pill" href="/">
                Home
              </Link>

              <Link className="pill" href="/reviews">
                Reviews
              </Link>

              <Link className="pill" href="/agencies">
                Agencies
              </Link>

              <Link className="pill pillPrimary" href="/submit">
                Submit a Review
              </Link>
            </nav>
          </div>
        </header>

        <div className="siteNotice">
          Reviews are anonymous user-submitted opinions and are not verified by
          RateMyContract. Do not include patient information (PHI).
        </div>

        <main className="container">{children}</main>

        <footer className="footer">
          <div className="footerInner">
            <div className="footerLeft">
              <div className="footerBrand">RateMyContract</div>

              <p className="footerNote">
                Reviews reflect individual experiences and are not independently
                verified.
              </p>

              <p className="footerCopy">
                © {new Date().getFullYear()} RateMyContract
              </p>
            </div>

            <div
              className="footerLinks"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <Link className="pill" href="/about">
                About
              </Link>

              <Link
                href="/favorites"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 18px",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 14,
                  textDecoration: "none",
                  color: "#081217",
                  background:
                    "linear-gradient(135deg, rgba(103,214,218,1), rgba(59,190,220,1))",
                  boxShadow:
                    "0 12px 28px rgba(103,214,218,.28), 0 2px 10px rgba(0,0,0,.18)",
                  transition: "all .18s ease",
                }}
              >
                Most Useful Products
              </Link>

              <Link className="pill" href="/privacy">
                Privacy
              </Link>

              <Link className="pill" href="/terms">
                Terms
              </Link>

              <Link className="pill" href="/contact">
                Contact
              </Link>
            </div>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}