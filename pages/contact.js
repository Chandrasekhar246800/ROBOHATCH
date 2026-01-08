import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Head from 'next/head'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [notification, setNotification] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (formData.name && formData.email && formData.message) {
      setNotification('Thank you for contacting us! We will get back to you within 24 hours.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } else {
      setNotification('Please fill in all required fields.')
    }
    
    setTimeout(() => setNotification(''), 5000)
  }

  return (
    <>
      <Head>
        <title>Contact Us - ROBOHATCH</title>
        <meta name="description" content="Get in touch with ROBOHATCH for all your 3D printing needs" />
      </Head>
      
      <Navbar />
      
      <div className="contact-page">
        <div className="container">
          <div className="contact-header">
            <h1>Get In Touch</h1>
            <p>Have a question or want to work together? We'd love to hear from you!</p>
          </div>

          <div className="contact-content">
            <div className="contact-info">
              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h3>Visit Us</h3>
                <p>123 Innovation Street<br/>Tech Park, Building 5<br/>Silicon Valley, CA 94025</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <h3>Call Us</h3>
                <p>+1 (555) 123-4567<br/>Mon-Fri: 9AM - 6PM PST<br/>Sat: 10AM - 4PM PST</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <h3>Email Us</h3>
                <p>info@robohatch.com<br/>support@robohatch.com<br/>sales@robohatch.com</p>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <h3>Business Hours</h3>
                <p>Monday - Friday: 9:00 AM - 6:00 PM<br/>Saturday: 10:00 AM - 4:00 PM<br/>Sunday: Closed</p>
              </div>
            </div>

            <div className="contact-form-container">
              <h2>Send Us a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project or question..."
                    rows="6"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Send Message
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>

          <div className="map-section">
            <h2>Find Us Here</h2>
            <div className="map-placeholder">
              <i className="fas fa-map-marked-alt"></i>
              <p>Interactive Map</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />

      {notification && (
        <div className={`notification ${notification.includes('Thank you') ? 'success' : 'error'}`}>
          {notification}
        </div>
      )}

      <style jsx>{`
        .contact-page {
          min-height: 100vh;
          padding: 120px 0 80px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .contact-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .contact-header h1 {
          font-size: 3rem;
          color: #2c3e50;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .contact-header p {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 40px;
          margin-bottom: 60px;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .info-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(255, 94, 77, 0.2);
        }

        .info-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #ff5e4d 0%, #ff3b29 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .info-icon i {
          font-size: 1.5rem;
          color: white;
        }

        .info-card h3 {
          font-size: 1.3rem;
          color: #2c3e50;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .info-card p {
          color: #666;
          line-height: 1.8;
          font-size: 1rem;
        }

        .contact-form-container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .contact-form-container h2 {
          font-size: 2rem;
          color: #2c3e50;
          margin-bottom: 30px;
          font-weight: 600;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 1rem;
          color: #2c3e50;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 15px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #ff5e4d;
          box-shadow: 0 0 0 3px rgba(255, 94, 77, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .submit-btn {
          background: linear-gradient(135deg, #ff5e4d 0%, #ff3b29 100%);
          color: white;
          border: none;
          padding: 15px 40px;
          font-size: 1.1rem;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          align-self: flex-start;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(255, 94, 77, 0.4);
        }

        .submit-btn i {
          font-size: 1rem;
        }

        .map-section {
          text-align: center;
        }

        .map-section h2 {
          font-size: 2rem;
          color: #2c3e50;
          margin-bottom: 30px;
          font-weight: 600;
        }

        .map-placeholder {
          background: white;
          padding: 80px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .map-placeholder i {
          font-size: 4rem;
          color: #ff5e4d;
        }

        .map-placeholder p {
          font-size: 1.2rem;
          color: #666;
        }

        .notification {
          position: fixed;
          bottom: 30px;
          right: 30px;
          padding: 20px 30px;
          border-radius: 10px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          animation: slideIn 0.3s ease;
          font-weight: 500;
        }

        .notification.success {
          background: #4caf50;
          color: white;
        }

        .notification.error {
          background: #f44336;
          color: white;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 968px) {
          .contact-content {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .contact-page {
            padding: 100px 0 60px;
          }

          .contact-header h1 {
            font-size: 2rem;
          }

          .contact-header p {
            font-size: 1rem;
          }

          .contact-form-container {
            padding: 25px;
          }

          .contact-form-container h2 {
            font-size: 1.5rem;
          }

          .map-placeholder {
            padding: 50px 20px;
          }

          .notification {
            bottom: 20px;
            right: 20px;
            left: 20px;
          }
        }
      `}</style>
    </>
  )
}
