'use client'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import { getCategoryProducts } from '../data/products'

export default function Idols() {
  const [notification, setNotification] = useState('')
  const [products, setProducts] = useState([])
  const [removedProducts, setRemovedProducts] = useState([])

  useEffect(() => {
    loadProducts()
    
    const handleProductsUpdate = () => {
      loadProducts()
    }
    
    window.addEventListener('productsUpdated', handleProductsUpdate)
    return () => window.removeEventListener('productsUpdated', handleProductsUpdate)
  }, [])

  const loadProducts = () => {
    const removed = JSON.parse(localStorage.getItem('removedProducts') || '[]')
    setRemovedProducts(removed)
    const allProducts = getCategoryProducts('idols').filter(p => !removed.includes(p.id))
    setProducts(allProducts)
  }

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItemIndex = cart.findIndex(item => item.id === product.id)
    
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    setNotification(`${product.name} added to cart!`)
    setTimeout(() => setNotification(''), 3000)
    window.dispatchEvent(new Event('cartUpdated'))
  }

  return (
    <>
      <Navbar />
      <div className="category-page">
        <div className="category-hero">
          <div className="container">
            <i className="fas fa-om category-hero-icon"></i>
            <h1>Religious Idols</h1>
            <p>Divine idols crafted with precision and devotion</p>
          </div>
        </div>
        
        <div className="container">
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <Link href={`/product/${product.id}`}>
                  <div className="product-image">
                    <i className={`fas ${product.icon}`}></i>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <p className="product-price">₹{product.price}</p>
                  </div>
                </Link>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  <i className="fas fa-shopping-cart"></i> Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
      
      <Footer />
    </>
  )
}
