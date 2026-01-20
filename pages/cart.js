'use client'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Head from 'next/head'
import Link from 'next/link'

export default function Cart() {
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    // Load cart from localStorage
    loadCart()
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart()
    }
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(cart)
  }

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 0 ? 10 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <>
      <Head>
        <title>Shopping Cart - ROBOHATCH</title>
        <meta name="description" content="Your shopping cart at ROBOHATCH" />
      </Head>
      
      <Navbar />
      
      <div className="cart-page">
        <div className="container">
          <div className="cart-header">
            <h1>Shopping Cart</h1>
            <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <i className="fas fa-shopping-cart"></i>
              <h2>Your cart is empty</h2>
              <p>Add some amazing 3D printed products to get started!</p>
              <Link href="/" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <div className="image-placeholder-cart">
                        <i className={`fas ${item.icon || 'fa-box'}`}></i>
                      </div>
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-description">{item.description}</p>
                      <button 
                        className="remove-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                    <div className="item-quantity">
                      <label>Quantity</label>
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    <div className="item-price">
                      <label>Price</label>
                      <p className="price">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="unit-price">₹{item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (8%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                
                <button className="checkout-btn">
                  Proceed to Checkout
                  <i className="fas fa-arrow-right"></i>
                </button>
                
                <Link href="/" className="continue-shopping">
                  <i className="fas fa-arrow-left"></i>
                  Continue Shopping
                </Link>

                <div className="payment-methods">
                  <p>We accept</p>
                  <div className="payment-icons">
                    <i className="fab fa-cc-visa"></i>
                    <i className="fab fa-cc-mastercard"></i>
                    <i className="fab fa-cc-paypal"></i>
                    <i className="fab fa-cc-amex"></i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  )
}
