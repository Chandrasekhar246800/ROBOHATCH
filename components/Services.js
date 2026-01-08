import Link from 'next/link';

export default function Services() {
  return (
    <section className="services-section" id="services">
      <div className="container">
        <h2 className="services-section-title">Our Services</h2>
        
        <div className="services-grid">
          {/* Custom 3D Printing Card */}
          <Link href="/custom-printing" className="service-card">
            <div className="service-icon">
              <i className="fas fa-print"></i>
            </div>
            <h3>Custom 3D Printing</h3>
            <p>Bring your ideas to life with our custom 3D printing service. We transform your designs into high-quality 3D printed products.</p>
            <div className="service-features">
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Personalized Designs</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>High Quality Materials</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Fast Turnaround</span>
              </div>
            </div>
            <div className="service-cta">
              Get Started <i className="fas fa-arrow-right"></i>
            </div>
          </Link>

          {/* Browse Categories Card */}
          <Link href="/categories" className="service-card">
            <div className="service-icon">
              <i className="fas fa-th-large"></i>
            </div>
            <h3>Browse Categories</h3>
            <p>Explore our wide range of ready-made 3D printed products across various categories to find exactly what you need.</p>
            <div className="service-features">
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>8+ Product Categories</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>60+ Product Types</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Instant Availability</span>
              </div>
            </div>
            <div className="service-cta">
              Explore Categories <i className="fas fa-arrow-right"></i>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
