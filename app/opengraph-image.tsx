// app/opengraph-image.tsx
// Generates the /og-image.png used by all OG tags.
// Next.js renders this at build time.
// This creates a professional green/gold branded card for WhatsApp + social previews.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size    = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width:           "100%",
          height:          "100%",
          backgroundColor: "#1B5E20",
          display:         "flex",
          flexDirection:   "column",
          justifyContent:  "center",
          alignItems:      "flex-start",
          padding:         "80px 100px",
          position:        "relative",
        }}
      >
        {/* Gold accent bar */}
        <div
          style={{
            position:        "absolute",
            top:             0,
            left:            0,
            width:           "100%",
            height:          "6px",
            backgroundColor: "#C9A84C",
          }}
        />

        {/* Decorative grid */}
        <div
          style={{
            position:         "absolute",
            top:              0,
            left:             0,
            right:            0,
            bottom:           0,
            backgroundImage:  "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
            backgroundSize:   "60px 60px",
          }}
        />

        {/* Gold line accent */}
        <div
          style={{
            display:       "flex",
            alignItems:    "center",
            gap:           "16px",
            marginBottom:  "32px",
          }}
        >
          <div style={{ width: "48px", height: "2px", backgroundColor: "#C9A84C" }} />
          <span style={{ color: "#C9A84C", fontSize: "14px", letterSpacing: "4px", textTransform: "uppercase" }}>
            ZIMRA Registered Practitioners
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize:     "68px",
            fontWeight:   "700",
            color:        "#FFFFFF",
            lineHeight:   1.1,
            marginBottom: "24px",
            maxWidth:     "800px",
          }}
        >
          Premasse
          <br />
          <span style={{ color: "#C9A84C" }}>Business Services</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize:     "24px",
            color:        "rgba(255,255,255,0.65)",
            maxWidth:     "700px",
            lineHeight:   1.5,
            marginBottom: "48px",
          }}
        >
          Tax clearance · Company registration · NSSA · PRAZ · ZIMDEF compliance · Accounting · Bookkeeping · WE HELP YOU GROW
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display:        "flex",
            alignItems:     "center",
            gap:            "32px",
          }}
        >
          {["ZIMRA Registered", "Harare, Zimbabwe", "info@premasse.co.zw"].map((item) => (
            <div
              key={item}
              style={{
                display:         "flex",
                alignItems:      "center",
                gap:             "8px",
                color:           "rgba(255,255,255,0.5)",
                fontSize:        "18px",
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#C9A84C" }} />
              {item}
            </div>
          ))}
        </div>

        {/* Bottom gold bar */}
        <div
          style={{
            position:        "absolute",
            bottom:          0,
            left:            0,
            width:           "100%",
            height:          "4px",
            backgroundColor: "#C9A84C",
            opacity:         0.4,
          }}
        />
      </div>
    ),
    { ...size }
  );
}