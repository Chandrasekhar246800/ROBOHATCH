'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar({ hideLogin = false, hideMenu = false, hideCart = false }) {
  const [cartCount, setCartCount] = useState(0)

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-content">
          <Link href="/" className="logo">
            <Image src="/logo.png" alt="ROBOHATCH Logo" width={50} height={50} />
            <span>ROBOHATCH</span>
          </Link>
          {!hideMenu && (
            <ul className="nav-menu">
              <li><Link href="#home">Home</Link></li>
              <li><Link href="#categories">Categories</Link></li>
              <li><Link href="#products">Products</Link></li>
              <li><Link href="#about">About</Link></li>
              <li><Link href="#contact">Contact</Link></li>
            </ul>
          )}
          <div className="nav-icons">
            {!hideCart && (
              <Link href="#cart" className="cart-icon">
                <i className="fas fa-shopping-cart"></i>
                <span className="cart-count">{cartCount}</span>
              </Link>
            )}
            {!hideLogin && (
              <Link href="/login" className="login-btn">
                <i className="fas fa-user"></i>
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
