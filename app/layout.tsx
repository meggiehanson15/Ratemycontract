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

  verification: {
    google: "RjqevS6c3TLvEh34P6XmF62CX1V5fyPK8QDq6ORiroM",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="siteHeader">
          <div className="headerInner">
            <Link href="/" className="brand">
              <img
                src="/logo.jpg"
                alt="RateMyContract"
                style={{
                  height: 42,
                  width: "auto",
                  objectFit: "contain",
                }}
              />
            </Link>

            <nav className="nav">
              <Link className="pill" href="/">
                Home
              </Link>

              <Link className="pill" href="/reviews">
                Reviews
              </Link>

              <Link
                className="pill pillPrimary"
                href="/submit"
              >
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
              <div className="footerBrand">
                RateMyContract
              </div>

              <p className="footerNote">
                Reviews reflect individual experiences and are not independently
                verified.
              </p>

              <p className="footerCopy">
                © {new Date().getFullYear()} RateMyContract
              </p>
            </div>

            <div className="footerLinks">
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}