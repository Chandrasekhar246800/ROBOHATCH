'use client'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Head from 'next/head'
import { getCategoryProducts } from '../data/products'

export default function Keychains() {
  const [notification, setNotification] = useState('')
  const products = getCategoryProducts('keychains')

  const addToCart = (product) => {
    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === product.id)
    
    if (existingItemIndex > -1) {
      // Increase quantity if exists
      cart[existingItemIndex].quantity += 1
    } else {
      // Add new item with quantity 1
      cart.push({ ...product, quantity: 1 })
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Show notification
    setNotification(`${product.name} added to cart!`)
    setTimeout(() => setNotification(''), 3000)
    
    // Dispatch custom event to update cart count
    window.dispatchEvent(new Event('cartUpdated'))
  }

  return (
    <>
      <Head>
        <title>Keychains - ROBOHATCH</title>
        <meta name="description" content="Custom 3D printed keychains at ROBOHATCH" />
      </Head>
      
      <Navbar />
      
      <div className="category-page">
        <div className="container">
          <div className="category-page-header">
            <h1><i className="fas fa-key"></i> Keychains</h1>
            <p>Personalized and custom 3D printed keychains</p>
          </div>

          <div className="products-grid-full">
            {products.map((product) => (
              <div key={product.id} className="product-card-full">
                <div className="product-image-full">
                  <div className="image-placeholder-full">
                    <i className={`fas ${product.icon}`}></i>
                  </div>
                </div>
                <div className="product-info-full">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer-full">
                    <span className="product-price-full">₹{product.price}</span>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      <i className="fas fa-shopping-cart"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {notification && (
        <div className="notification-popup">
          <i className="fas fa-check-circle"></i>
          {notification}
        </div>
      )}
      
      <Footer />
    </>
  )
}
