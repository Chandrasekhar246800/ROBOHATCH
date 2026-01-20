import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function About() {
  return (
    <>
      <Navbar />
      <div className="about-page">
        <div className="container">
          {/* Hero Section */}
          <section className="about-hero">
            <h1 className="about-title">About ROBOHATCH</h1>
            <p className="about-subtitle">Bringing Your Ideas to Life with 3D Printing</p>
          </section>

          {/* Our Story */}
          <section className="about-section">
            <div className="about-content">
              <div className="about-text">
                <h2>Our Story</h2>
                <p>
                  ROBOHATCH was founded with a simple mission: to make custom 3D printing accessible to everyone. 
                  What started as a passion project has grown into a thriving business dedicated to transforming 
                  digital designs into tangible products.
                </p>
                <p>
                  We believe that everyone should have access to personalized, high-quality 3D printed products. 
                  Whether you're looking for custom keychains, decorative items, educational toys, or unique gifts, 
                  we're here to bring your vision to life.
                </p>
              </div>
              <div className="about-icon-card">
                <i className="fas fa-cube"></i>
              </div>
            </div>
          </section>

          {/* What We Do */}
          <section className="about-section">
            <h2 className="section-center-title">What We Do</h2>
            <div className="services-grid">
              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-print"></i>
                </div>
                <h3>Custom 3D Printing</h3>
                <p>We transform your ideas into physical products using state-of-the-art 3D printing technology.</p>
              </div>
              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-pencil-ruler"></i>
                </div>
                <h3>Design Services</h3>
                <p>Our expert designers can help create custom models based on your specifications and requirements.</p>
              </div>
              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-box"></i>
                </div>
                <h3>Wide Product Range</h3>
                <p>From keychains and toys to decorative items and office supplies, we offer a diverse catalog of products.</p>
              </div>
              <div className="service-card">
                <div className="service-icon">
                  <i className="fas fa-shipping-fast"></i>
                </div>
                <h3>Fast Delivery</h3>
                <p>We ensure quick turnaround times and secure shipping to deliver your products safely.</p>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="about-section">
            <h2 className="section-center-title">Why Choose ROBOHATCH?</h2>
            <div className="features-list">
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h4>Quality Materials</h4>
                  <p>We use premium PLA, ABS, and specialty filaments for durable, high-quality products.</p>
                </div>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h4>Customization</h4>
                  <p>Personalize your products with names, logos, colors, and custom designs.</p>
                </div>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h4>Affordable Pricing</h4>
                  <p>Competitive prices without compromising on quality or service.</p>
                </div>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h4>Expert Support</h4>
                  <p>Our team is always ready to help with design advice and product recommendations.</p>
                </div>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h4>Eco-Friendly</h4>
                  <p>We prioritize sustainable materials and responsible manufacturing practices.</p>
                </div>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h4>Customer Satisfaction</h4>
                  <p>Your satisfaction is our priority. We stand behind every product we create.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="about-section values-section">
            <h2 className="section-center-title">Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <h3>Innovation</h3>
                <p>We constantly explore new technologies and materials to deliver cutting-edge products.</p>
              </div>
              <div className="value-card">
                <h3>Quality</h3>
                <p>Every product undergoes rigorous quality checks to ensure it meets our high standards.</p>
              </div>
              <div className="value-card">
                <h3>Customer Focus</h3>
                <p>Your needs and satisfaction drive everything we do.</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="about-cta">
            <h2>Ready to Create Something Amazing?</h2>
            <p>Let's bring your ideas to life with custom 3D printing</p>
            <div className="cta-buttons">
              <a href="/contact" className="cta-btn primary">Get in Touch</a>
              <a href="/#products" className="cta-btn secondary">Browse Products</a>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
