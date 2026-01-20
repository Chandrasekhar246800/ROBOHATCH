'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar({ hideLogin = false, hideMenu = false, hideCart = false }) {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Load cart count on mount
    updateCartCount()
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      updateCartCount()
    }
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const updateCartCount = () => {
    if (typeof window !== 'undefined') {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(totalItems)
    }
  }

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
              <li><Link href="/">Home</Link></li>
              <li><Link href="/#services">Categories</Link></li>
              <li><Link href="/#products">Products</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          )}
          <div className="nav-icons">
            {!hideCart && (
              <Link href="/cart" className="cart-icon">
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
