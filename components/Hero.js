export default function Hero() {
  const scrollToProducts = () => {
    const productsSection = document.querySelector('#products')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="hero" id="home">
      <div className="container">
        {/* Animated ROBOHATCH with rotating lights */}
        <div className="hero-animation-section">
          <div className="light-ring">
            <div className="light-arc arc-1"></div>
            <div className="light-arc arc-2"></div>
            <div className="light-arc arc-3"></div>
             <div className="light-arc arc-4"></div>
            <div className="light-arc arc-5"></div>
            <div className="light-arc arc-6"></div>
          </div>
          
          <h1 className="animated-brand-name">
            <span className="letter letter-1">R</span>
            <span className="letter letter-2">O</span>
            <span className="letter letter-3">B</span>
            <span className="letter letter-4">O</span>
            <span className="letter letter-5">H</span>
            <span className="letter letter-6">A</span>
            <span className="letter letter-7">T</span>
            <span className="letter letter-8">C</span>
            <span className="letter letter-9">H</span>
          </h1>
          
          <div className="center-glow"></div>
        </div>

        <div className="hero-content-wrapper">
          <div className="hero-content">
            <h2 className="hero-title fade-in">
              Custom 3D Printed
              <span className="highlight">Products for Your Life</span>
            </h2>
            <p className="hero-subtitle fade-in delay-1">
              Discover unique, handcrafted 3D-printed lamps, idols, accessories, and more.
              <br />Premium quality, sustainable materials, endless creativity.
            </p>
            <button className="cta-button fade-in delay-2" onClick={scrollToProducts}>
              Shop Now <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="hero-image fade-in delay-1">
            <div className="hero-product-showcase">
              <div className="product-placeholder">
                <i className="fas fa-lightbulb"></i>
                <p>3D Printed Lamps</p>
              </div>
              <div className="product-placeholder">
                <i className="fas fa-om"></i>
                <p>Devotional Idols</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
