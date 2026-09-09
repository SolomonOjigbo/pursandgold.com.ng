import { ImageResponse } from "next/og";

export const alt = "Purs & Gold Limited · Digital Solutions. Real Growth.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0e1116 0%, #14213d 100%)",
          color: "#faf7f0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, letterSpacing: 4, color: "#e6b54a" }}>
          PURS &amp; GOLD LIMITED
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.02 }}>Digital Solutions.</div>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.02, color: "#e6b54a" }}>Real Growth.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "rgba(250,247,240,.7)" }}>
          <span>Websites · Marketing · ERP &amp; CRM · Cloud &amp; Managed IT</span>
          <span>pursandgold.com.ng</span>
        </div>
      </div>
    ),
    size,
  );
}
