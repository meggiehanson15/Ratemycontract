import Link from "next/link";

export const metadata = {
  title: "Travel Nurse Favorites | RateMyContract",
  description:
    "Helpful items commonly used by travel nurses during assignments, relocation, temporary housing, and long shifts.",
};

const sections = [
  {
    title: "Travel Essentials",
    subtitle:
      "For travel days, airports, relocation, and staying organized between contracts.",
    items: [
      {
        title: "Travel Backpack",
        description:
          "Useful for assignment travel, airports, and keeping work gear organized between contracts.",
        link: "https://amzn.to/4uvPtyw",
      },
      {
        title: "Travel Multi Charger",
        description:
          "Helpful for keeping multiple devices charged during travel days and long shifts.",
        link: "https://amzn.to/4e6lCGf",
      },
      {
        title: "Travel Lunch Box",
        description:
          "Useful for long shifts, meal prep, and temporary contract housing.",
        link: "https://amzn.to/3RsEUOj",
      },
      {
        title: "Hydrojug",
        description:
          "A popular option for staying hydrated during long hospital shifts.",
        link: "https://amzn.to/4e1RT27",
      },
      {
        title: "Compression Socks",
        description:
          "A travel nurse staple for long shifts, airport days, and extended time on your feet.",
        link: "https://amzn.to/4v0MZIm",
      },
    ],
  },

  {
    title: "Temporary Housing",
    subtitle:
      "Small comforts that make temporary housing feel more manageable.",
    items: [
      {
        title: "Portable Sound Machine",
        description:
          "Helpful in temporary housing, hotels, and unfamiliar apartment environments.",
        link: "https://amzn.to/4e1RT27",
      },
      {
        title: "Travel Blackout Curtains",
        description:
          "Useful for night shift schedules, early sleep, and bright temporary rentals.",
        link: "https://amzn.to/3RsKOim",
      },
      {
        title: "Travel Mattress Topper",
        description:
          "Temporary housing quality varies a lot between assignments.",
        link: "https://amzn.to/4wMIDWT",
      },
      {
        title: "Shower Caddy",
        description:
          "Simple but useful when moving frequently between furnished rentals.",
        link: "https://amzn.to/4wMGivl",
      },
      {
        title: "Kitchen Utensil Set",
        description:
          "Helpful for temporary apartment setups and avoiding rebuying basics every contract.",
        link: "https://amzn.to/4wK9Nhe",
      },
      {
        title: "Mini Kitchen Tools",
        description:
          "Compact kitchen essentials useful during short-term housing stays.",
        link: "https://amzn.to/4fGmjYV",
      },
      {
        title: "Seasoning & Condiment Carriers",
        description:
          "Helpful for temporary housing setups and avoiding constantly rebuying kitchen basics between assignments.",
        link: "https://amzn.to/42TqxFe",
      },
    ],
  },

  {
    title: "Travel & Commute",
    subtitle:
      "Useful for road contracts, winter assignments, and unfamiliar areas.",
    items: [
      {
        title: "Travel Car Jumper",
        description:
          "Useful for long commutes, winter contracts, and unfamiliar travel areas during assignments.",
        link: "https://amzn.to/49ScjIp",
      },
    ],
  },

  {
    title: "Long Shift Comfort",
    subtitle:
      "Items commonly used during long hospital shifts and busy assignments.",
    items: [
      {
        title: "ASICS Gel Nimbus",
        description:
          "A commonly used long-shift shoe among healthcare workers and travelers.",
        link: "https://amzn.to/3RZj2tT",
      },
    ],
  },
];

export default function FavoritesPage() {
  return (
    <section>
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 34,
          padding: "52px 34px",
          marginBottom: 34,
          border: "1px solid rgba(103,214,218,.22)",
          background:
            "radial-gradient(circle at top left, rgba(103,214,218,.18), transparent 34%), linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.04))",
          boxShadow: "0 24px 54px rgba(0,0,0,.28)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -90,
            right: -90,
            width: 280,
            height: 280,
            borderRadius: 999,
            background: "rgba(103,214,218,.16)",
            filter: "blur(40px)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 850 }}>
          <p className="heroEyebrow">Travel nurse living</p>

          <h1
            className="pageTitle"
            style={{
              fontSize: 50,
              lineHeight: 1.05,
              marginBottom: 16,
            }}
          >
            Travel Nurse Favorites
          </h1>

          <p
            style={{
              color: "rgba(255,255,255,.78)",
              lineHeight: 1.75,
              fontSize: 17,
              maxWidth: 760,
              margin: 0,
            }}
          >
            Practical items many travel nurses commonly use during assignments,
            temporary housing, relocation, long commutes, and busy hospital
            schedules.
          </p>

          <div className="rowWrap" style={{ marginTop: 24 }}>
            <span className="chip">Temporary housing</span>
            <span className="chip">Assignment travel</span>
            <span className="chip">Long shifts</span>
            <span className="chip">Travel comfort</span>
          </div>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.title} style={{ marginBottom: 42 }}>
          <div style={{ marginBottom: 18 }}>
            <p className="sectionEyebrow">{section.title}</p>

            <h2
              className="sectionTitle"
              style={{
                fontSize: 32,
                marginBottom: 8,
              }}
            >
              {section.title}
            </h2>

            <p className="sub">{section.subtitle}</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
            }}
          >
            {section.items.map((item) => (
              <article
                key={item.title}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  padding: 24,
                  borderRadius: 26,
                  border: "1px solid rgba(255,255,255,.10)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.035))",
                  boxShadow: "0 14px 36px rgba(0,0,0,.22)",
                  minHeight: 235,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background:
                      "linear-gradient(90deg, rgba(103,214,218,.92), rgba(58,190,220,.18))",
                  }}
                />

                <p
                  style={{
                    margin: "4px 0 12px",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "rgba(103,214,218,.92)",
                  }}
                >
                  {section.title}
                </p>

                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: 22,
                    lineHeight: 1.2,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    margin: "0 0 24px",
                    color: "rgba(255,255,255,.72)",
                    lineHeight: 1.72,
                    fontSize: 15,
                  }}
                >
                  {item.description}
                </p>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill"
                >
                  View item →
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section
        className="card cardPad"
        style={{
          marginTop: 28,
          textAlign: "center",
          background:
            "linear-gradient(180deg, rgba(103,214,218,.08), rgba(255,255,255,.04))",
        }}
      >
        <p className="sub" style={{ marginBottom: 22 }}>
          Some links on this page may be affiliate links. RateMyContract may
          earn a small commission from qualifying purchases at no extra cost to
          you.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "15px 24px",
            borderRadius: 999,
            fontWeight: 800,
            fontSize: 15,
            textDecoration: "none",
            color: "#081217",
            background:
              "linear-gradient(135deg, rgba(103,214,218,1), rgba(59,190,220,1))",
            boxShadow:
              "0 12px 30px rgba(103,214,218,.30), 0 3px 12px rgba(0,0,0,.18)",
            transition: "all .18s ease",
          }}
        >
          ← Return to RateMyContract
        </Link>
      </section>
    </section>
  );
}