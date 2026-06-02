import "./Marquee.css";

function Marquee() {
  const items = [
    "Handcrafted Brass",
    "Premium Decor",
    "Luxury Lighting",
    "50,000+ Happy Homes",
    "Handcrafted Brass",
    "Premium Decor",
    "Luxury Lighting",
    "50,000+ Happy Homes",
  ];

  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "28px" }}
          >
            <span>{item}</span>
            <span className="dot">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marquee;