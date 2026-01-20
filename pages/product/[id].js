'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Head from 'next/head'
import Link from 'next/link'
import { getProductById } from '../../data/products'

export default function ProductDetail() {
  const router = useRouter()
  const { id } = router.query
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [notification, setNotification] = useState('')

  useEffect(() => {
    if (id) {
      const productData = getProductById(id)
      setProduct(productData)
    }
  }, [id])

  const addToCart = () => {
    if (!product) return
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItemIndex = cart.findIndex(item => item.id === product.id)
    
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    setNotification(`${product.name} added to cart!`)
    setTimeout(() => setNotification(''), 3000)
    window.dispatchEvent(new Event('cartUpdated'))
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="product-detail-page">
          <div className="container">
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading product...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{product.name} - ROBOHATCH</title>
        <meta name="description" content={product.description} />
      </Head>
      
      <Navbar />
      
      <div className="product-detail-page">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <i className="fas fa-chevron-right"></i>
            <Link href="/#products">Products</Link>
            <i className="fas fa-chevron-right"></i>
            <span>{product.name}</span>
          </div>

          <div className="product-detail-content">
            <div className="product-detail-image">
              <div className="detail-image-placeholder">
                <i className={`fas ${product.icon}`}></i>
              </div>
            </div>

            <div className="product-detail-info">
              <h1 className="product-detail-title">{product.name}</h1>
              
              <div className="product-detail-price">
                <span className="current-price">₹{product.price}</span>
                <span className="price-label">Inclusive of all taxes</span>
              </div>

              <div className="product-detail-description">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>

              <div className="product-features">
                <h3>Features</h3>
                <ul>
                  <li><i className="fas fa-check-circle"></i> High-quality 3D printed material</li>
                  <li><i className="fas fa-check-circle"></i> Durable and long-lasting</li>
                  <li><i className="fas fa-check-circle"></i> Customization available</li>
                  <li><i className="fas fa-check-circle"></i> Eco-friendly production</li>
                </ul>
              </div>

              <div className="product-actions">
                <div className="quantity-selector">
                  <label>Quantity</label>
                  <div className="quantity-controls-detail">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                <button className="add-to-cart-detail-btn" onClick={addToCart}>
                  <i className="fas fa-shopping-cart"></i>
                  Add to Cart
                </button>
              </div>

              <div className="product-meta">
                <div className="meta-item">
                  <i className="fas fa-truck"></i>
                  <span>Free delivery on orders above ₹500</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>7 days return policy</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-headset"></i>
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
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
