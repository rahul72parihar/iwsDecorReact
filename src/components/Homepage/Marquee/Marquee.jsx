import "./Marquee.css";

function Marquee() {
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        <span>Handcrafted Brass</span>
        <span className="dot">✦</span>

        <span>Premium Decor</span>
        <span className="dot">✦</span>

        <span>Luxury Lighting</span>
        <span className="dot">✦</span>

        <span>50,000+ Happy Homes</span>
        <span className="dot">✦</span>

        {/* Duplicate for smooth loop */}

        <span>Handcrafted Brass</span>
        <span className="dot">✦</span>

        <span>Premium Decor</span>
        <span className="dot">✦</span>

        <span>Luxury Lighting</span>
        <span className="dot">✦</span>

        <span>50,000+ Happy Homes</span>
        <span className="dot">✦</span>
      </div>
    </div>
  );
}

export default Marquee;