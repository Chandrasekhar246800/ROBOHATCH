export default function Highlights() {
  const highlights = [
    {
      icon: 'fa-cube',
      title: '3D Printed',
      description: 'Every product is crafted with precision using advanced 3D printing technology'
    },
    {
      icon: 'fa-palette',
      title: 'Customizable',
      description: 'Personalize colors, sizes, and designs to match your unique style'
    },
    {
      icon: 'fa-leaf',
      title: 'Sustainable',
      description: 'Eco-friendly materials and minimal waste production process'
    },
    {
      icon: 'fa-shipping-fast',
      title: 'Fast Delivery',
      description: 'Quick production and reliable shipping to your doorstep'
    }
  ]

  return (
    <section className="highlights">
      <div className="container">
        <div className="highlights-grid">
          {highlights.map((highlight, index) => (
            <div key={highlight.title} className={`highlight-card fade-in delay-${index}`}>
              <div className="highlight-icon">
                <i className={`fas ${highlight.icon}`}></i>
              </div>
              <h3>{highlight.title}</h3>
              <p>{highlight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
