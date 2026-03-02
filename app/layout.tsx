import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "http://localhost:3000";

export const metadata = {
  title: "RateMyContract | Travel Nurse Contract Reviews",
  description:
    "Transparent travel nurse contract reviews — real experiences, real pay, real units.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "RateMyContract | Travel Nurse Contract Reviews",
    description:
      "Transparent travel nurse contract reviews — real experiences, real pay, real units.",
    url: siteUrl,
    siteName: "RateMyContract",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skipLink" href="#main">
          Skip to content
        </a>

        <header className="siteHeader">
          <div className="headerInner">
            <Link href="/" className="brand" aria-label="RateMyContract home">
              <div className="logoMark" aria-hidden="true">
                RM
              </div>
              <div className="brandText">
                <strong>RateMyContract</strong>
                <span>Honest travel nurse reviews</span>
              </div>
            </Link>

            <nav className="nav" aria-label="Primary navigation">
              <Link className="pill" href="/">
                Home
              </Link>
              <Link className="pill" href="/reviews">
                Reviews
              </Link>
              <Link className="pill pillPrimary" href="/submit">
                Submit a Review
              </Link>
            </nav>
          </div>
        </header>

        <main id="main" className="container">
          {children}
        </main>

        <footer className="footer">
          <div className="footerInner">
            <div className="footerLeft">
              <div className="footerBrand">RateMyContract</div>
              <div className="footerNote">
                Reviews are user-submitted and may not be verified. Please do not
                include patient information (PHI).
              </div>
              <div className="footerCopy">
                © {new Date().getFullYear()} RateMyContract
              </div>
            </div>

            <div className="footerLinks" aria-label="Footer links">
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <a href="mailto:ratemycontractsite@gmail.com">Contact</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}