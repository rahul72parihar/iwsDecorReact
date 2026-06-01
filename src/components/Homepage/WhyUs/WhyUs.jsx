import "./WhyUs.css";

function WhyUs() {
  const features = [
    {
      icon: "✨",
      title: "Premium Craftsmanship",
      description: "Handmade by skilled artisans across India.",
    },
    {
      icon: "🚚",
      title: "Pan India Delivery",
      description: "Fast and secure delivery to 27,000+ pincodes.",
    },
    {
      icon: "🛡️",
      title: "2 Year Warranty",
      description: "Trusted quality and long-lasting durability.",
    },
    {
      icon: "💬",
      title: "Expert Support",
      description: "Interior decor experts available for assistance.",
    },
  ];

  return (
    <section className="why-section">
      <div className="why-inner">
        <div className="why-text">
          <p className="section-tag">
            Why IWS Decor
          </p>

          <h2 className="section-title">
            Crafted With Purpose
          </h2>

          <p className="crafted-desc">
            Every product is handcrafted with attention to detail and designed
            to elevate modern Indian interiors.
          </p>
        </div>

        <div className="why-features">
          {features.map((feature, index) => (
            <div className="why-card" key={index}>
              <div className="why-icon">
                {feature.icon}
              </div>

              <h4>{feature.title}</h4>

              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyUs;