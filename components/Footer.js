'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [notification, setNotification] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email && email.includes('@')) {
      setNotification('Successfully subscribed to newsletter!')
      setEmail('')
    } else {
      setNotification('Please enter a valid email address')
    }
    setTimeout(() => setNotification(''), 3000)
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo-container">
              <Image src="/logo.png" alt="ROBOHATCH Logo" width={40} height={40} />
              <h3 className="footer-logo">ROBOHATCH</h3>
            </div>
            <p>Bringing your ideas to life through innovative 3D printing technology.</p>
            <div className="social-links">
              <Link href="#"><i className="fab fa-facebook"></i></Link>
              <Link href="#"><i className="fab fa-instagram"></i></Link>
              <Link href="#"><i className="fab fa-twitter"></i></Link>
              <Link href="#"><i className="fab fa-pinterest"></i></Link>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="#home">Home</Link></li>
              <li><Link href="#categories">Categories</Link></li>
              <li><Link href="#products">Products</Link></li>
              <li><Link href="#about">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faqs">FAQs</Link></li>
              <li><Link href="#">Shipping Info</Link></li>
              <li><Link href="#">Returns</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Stay updated with our latest products</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="subscribe-btn">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 ROBOHATCH. All rights reserved.</p>
        </div>
      </div>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </footer>
  )
}
