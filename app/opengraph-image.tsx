import { ImageResponse } from "next/og";

export const alt = "Jace Sullivan | Business Growth Strategy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0B0C",
          padding: "72px 80px",
          color: "#F5F3EF",
          border: "1px solid #2B2B2E",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, color: "#C8A96B" }}>JACE SULLIVAN</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }}>
            Turn Your Business Into a Scalable Growth Machine
          </div>
          <div style={{ display: "flex", width: 120, height: 3, background: "#C8A96B", marginTop: 40 }} />
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#A5A5AA" }}>
          Business growth strategy for e-commerce founders, coaches, consultants &amp; online businesses
        </div>
      </div>
    ),
    size,
  );
}
