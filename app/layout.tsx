// app/layout.tsx
// Root layout with comprehensive SEO metadata.
// Includes Open Graph, Twitter cards, canonical URLs, and JSON-LD structured data.

import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const playfair = Playfair_Display({
  subsets:  ["latin"],
  variable: "--font-display",
  display:  "swap",
});

const dmSans = DM_Sans({
  subsets:  ["latin"],
  variable: "--font-body",
  display:  "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://premasse.co.zw";

// ── Root metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:  "Premasse Business Services | Tax, Compliance & Business Growth Zimbabwe",
    template: "%s | Premasse Business Services",
  },

  description:
    "ZIMRA-registered tax accountants in Harare, Zimbabwe. Company registration, NSSA, PRAZ, ZIMDEF compliance, accounting, bookkeeping, and business growth advisory. WE HELP YOU GROW.",

  keywords: [
    "tax clearance certificate Zimbabwe",
    "company registration Zimbabwe",
    "ZIMRA registration Zimbabwe",
    "tax accountant Harare",
    "NSSA compliance Zimbabwe",
    "PRAZ compliance Zimbabwe",
    "ZIMDEF compliance Zimbabwe",
    "accounting services Zimbabwe",
    "bookkeeping services Zimbabwe",
    "startup business acumen Zimbabwe",
    "SME accounting Zimbabwe",
    "ZIMRA registered accountant Zimbabwe",
    "tax consultant Harare",
    "VAT registration Zimbabwe",
    "PAYE registration Zimbabwe",
  ],

  authors:  [{ name: "Premasse Business Services", url: SITE_URL }],
  creator:  "Premasse Business Services",
  publisher:"Premasse Business Services",

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    type:        "website",
    locale:      "en_ZW",
    url:         SITE_URL,
    siteName:    "Premasse Business Services",
    title:       "Premasse Business Services | Tax, Compliance & Business Growth Zimbabwe",
    description: "ZIMRA-registered tax accountants in Harare. Company registration, NSSA, PRAZ, ZIMDEF compliance, accounting, bookkeeping, and business growth advisory. WE HELP YOU GROW.",
    images: [
      {
        url:    `${SITE_URL}/og-image.png`,
        width:  1200,
        height: 630,
        alt:    "Premasse Business Services — Tax & Business Growth Zimbabwe",
      },
    ],
  },

  twitter: {
    card:        "summary_large_image",
    title:       "Premasse Business Services | Tax, Compliance & Business Growth Zimbabwe",
    description: "ZIMRA-registered tax accountants. Company registration, compliance, accounting, bookkeeping. WE HELP YOU GROW.",
    images:      [`${SITE_URL}/og-image.png`],
  },

  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
};

// ── JSON-LD Structured Data ────────────────────────────────────────────────────

const structuredData = {
  "@context": "https://schema.org",
  "@type":    "AccountingService",
  name:       "Premasse Business Services",
  url:        SITE_URL,
  logo:       `${SITE_URL}/logo.png`,
  image:      `${SITE_URL}/og-image.png`,
  description:
    "ZIMRA-registered tax accountants and business services specialists in Zimbabwe. Company registration, NSSA, PRAZ, ZIMDEF compliance, accounting, bookkeeping, and business growth advisory.",
  telephone:    "",
  email:        "info@premasse.co.zw",
  priceRange:   "$$",
  currenciesAccepted: "USD, ZWL",
  paymentAccepted:    "Cash, EcoCash, OneMoney, Bank Transfer",
  areaServed: {
    "@type": "Country",
    name:    "Zimbabwe",
  },
  address: {
    "@type":           "PostalAddress",
    addressLocality:   "Harare",
    addressRegion:     "Harare",
    addressCountry:    "ZW",
  },
  openingHoursSpecification: [
    {
      "@type":     "OpeningHoursSpecification",
      dayOfWeek:   ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens:       "08:00",
      closes:      "17:00",
    },
  ],
  sameAs: [],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name:    "Business Services",
    itemListElement: [
      {
        "@type":       "Offer",
        itemOffered: {
          "@type":       "Service",
          name:          "Company Registration Zimbabwe",
          description:   "End-to-end company registration under COBE including name reservation, certificate of incorporation, and CR14.",
          url:           `${SITE_URL}/services/company-registration`,
        },
      },
      {
        "@type":       "Offer",
        itemOffered: {
          "@type":       "Service",
          name:          "NSSA Compliance Zimbabwe",
          description:   "National Social Security Authority registration and compliance for Zimbabwean businesses.",
          url:           `${SITE_URL}/services/nssa-compliance`,
        },
      },
      {
        "@type":       "Offer",
        itemOffered: {
          "@type":       "Service",
          name:          "PRAZ Compliance Zimbabwe",
          description:   "Procurement Regulatory Authority of Zimbabwe compliance. Get your business registered for government tenders.",
          url:           `${SITE_URL}/services/praz-compliance`,
        },
      },
      {
        "@type":       "Offer",
        itemOffered: {
          "@type":       "Service",
          name:          "ZIMDEF Compliance Zimbabwe",
          description:   "Zimbabwe Manpower Development Fund compliance. Registration and levy submissions.",
          url:           `${SITE_URL}/services/zimdef-compliance`,
        },
      },
      {
        "@type":       "Offer",
        itemOffered: {
          "@type":       "Service",
          name:          "Accounting & Bookkeeping Services Zimbabwe",
          description:   "Professional accounting and bookkeeping services for SMEs in Zimbabwe.",
          url:           `${SITE_URL}/services/accounting-services`,
        },
      },
      {
        "@type":       "Offer",
        itemOffered: {
          "@type":       "Service",
          name:          "Startup Business Acumen Zimbabwe",
          description:   "We help startups gain simple business acumen knowledge to help them in their day-to-day operations. WE HELP YOU GROW.",
          url:           `${SITE_URL}/services/startup-business-acumen`,
        },
      },
    ],
  },
};

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${dmSans.variable}`}
    >
      <head>
        {/* JSON-LD structured data for Google rich results */}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="bg-white font-body antialiased">{children}</body>
    </html>
  );
}