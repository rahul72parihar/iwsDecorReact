import "./WhyUs.css";
function WhyUs() {
  const features = [
    { icon: "✨", title: "Premium craftsmanship", description: "Handmade by skilled artisans across India." },
    { icon: "🚚", title: "Pan India delivery",     description: "Fast and secure delivery to 27,000+ pincodes." },
    { icon: "🛡️", title: "2 year warranty",        description: "Trusted quality and long-lasting durability." },
    { icon: "💬", title: "Expert support",         description: "Interior decor experts available to assist." },
  ];

  return (
    <section className="ws">
      <div className="ws-inner">
        <div className="ws-head">
          <span className="ws-tag">Why IWS Decor</span>
          <h2 className="ws-title">Crafted with purpose</h2>
        </div>
        <div className="ws-grid">
          {features.map((f, i) => (
            <div className="ws-card" key={i}>
              <div className="ws-icon">{f.icon}</div>
              <h4>{f.title}</h4>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyUs;