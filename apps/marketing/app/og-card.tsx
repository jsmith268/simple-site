/** 1200×630 social card for the marketing site (Satori/next-og — flexbox only). */
export function MarketingOgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "96px",
        background: "linear-gradient(160deg, #faf8f3 0%, #f1ece2 100%)",
        color: "#211d17",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: "26px",
          fontWeight: 700,
          letterSpacing: "8px",
          textTransform: "uppercase",
          color: "#c2410c",
        }}
      >
        Simple Site
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "28px",
          fontSize: "76px",
          fontWeight: 800,
          lineHeight: 1.05,
          maxWidth: "960px",
          color: "#211d17",
        }}
      >
        Custom websites for small businesses
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "28px",
          fontSize: "34px",
          color: "#4b4439",
          maxWidth: "900px",
        }}
      >
        Real designers · transparent pricing · live in under 72 hours
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "44px",
          height: "14px",
          width: "240px",
          borderRadius: "8px",
          background: "#c2410c",
        }}
      />
    </div>
  );
}
