'use client'
import { useState, useEffect } from 'react'
import { getCategoryProducts } from '../data/products'
import Link from 'next/link'

export default function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState('keychains')
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [notification, setNotification] = useState('')
  const [removedProducts, setRemovedProducts] = useState([])

  // Load removed products from localStorage
  useEffect(() => {
    const loadRemovedProducts = () => {
      const stored = localStorage.getItem('removedProducts')
      if (stored) {
        setRemovedProducts(JSON.parse(stored))
      }
    }
    
    loadRemovedProducts()
    
    // Listen for products update event
    const handleProductsUpdate = () => {
      loadRemovedProducts()
    }
    
    window.addEventListener('productsUpdated', handleProductsUpdate)
    return () => window.removeEventListener('productsUpdated', handleProductsUpdate)
  }, [])

  const categories = [
    { id: 1, icon: 'fa-key', name: 'Keychains', key: 'keychains' },
    { id: 2, icon: 'fa-mask', name: 'Superhero Models', key: 'superhero' },
    { id: 3, icon: 'fa-om', name: 'Devotional', key: 'devotional' },
    { id: 4, icon: 'fa-dice', name: 'Toys', key: 'toys' }
  ]

  const handleCategoryClick = (categoryKey) => {
    setActiveCategory(activeCategory === categoryKey ? null : categoryKey)
    setExpandedCategory(null)
  }

  const handleViewAll = (categoryKey) => {
    setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey)
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

  const getDisplayProducts = (categoryKey) => {
    const allProducts = getCategoryProducts(categoryKey)
    // Filter out removed products
    const activeProducts = allProducts.filter(p => !removedProducts.includes(p.id))
    return expandedCategory === categoryKey ? activeProducts : activeProducts.slice(0, 4)
  }

  return (
    <section className="products-section" id="products">
      <div className="container">
        <h2 className="products-section-title">Our Products</h2>
        
        <div className="products-layout">
          {/* Left side - Circular Buttons */}
          <div className="circular-buttons-container">
            {categories.map((category) => (
              <div key={`circle-${category.id}`} className="circular-button-wrapper">
                <button
                  onClick={() => handleCategoryClick(category.key)}
                  className={`circular-product-button ${activeCategory === category.key ? 'active' : ''}`}
                  style={{'--category-color': '#F25C05'}}
                >
                  <i className={`fas ${category.icon}`}></i>
                </button>
                <span className="category-label">{category.name}</span>
              </div>
            ))}
          </div>

          {/* Right side - Product Cards */}
          <div className="products-cards-container">
            {!activeCategory && (
              <div className="no-category-selected">
                <i className="fas fa-hand-pointer"></i>
                <p>Click on a category button to view products</p>
              </div>
            )}

            {/* Keychains */}
            {activeCategory === 'keychains' && (
              <div className="category-group active">
                <div className="category-header">
                  <h1 className="category-group-title">
                    <i className="fas fa-key"></i> Keychains
                  </h1>
                  <button 
                    onClick={() => handleViewAll('keychains')} 
                    className="view-all-link"
                  >
                    {expandedCategory === 'keychains' ? 'Show Less' : 'View All'} 
                    <i className={`fas fa-arrow-${expandedCategory === 'keychains' ? 'up' : 'right'}`}></i>
                  </button>
                </div>
                <div className="category-cards-grid">
                  {getDisplayProducts('keychains').map((product, index) => (
                    <div key={product.id} className="mini-product-card">
                      <Link href={`/product/${product.id}`} className="product-link-overlay">
                        <div className="product-image-placeholder">
                          <i className={`fas ${product.icon}`}></i>
                        </div>
                        <div className="product-card-name">
                          <h4>{product.name}</h4>
                          <span className="product-card-price">₹{product.price}</span>
                        </div>
                      </Link>
                      <button 
                        className="mini-add-to-cart"
                        onClick={(e) => {
                          e.preventDefault()
                          addToCart(product)
                        }}
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Superhero Models */}
            {activeCategory === 'superhero' && (
              <div className="category-group active">
                <div className="category-header">
                  <h3 className="category-group-title">
                    <i className="fas fa-mask"></i> Superhero Models
                  </h3>
                  <button 
                    onClick={() => handleViewAll('superhero')} 
                    className="view-all-link"
                  >
                    {expandedCategory === 'superhero' ? 'Show Less' : 'View All'} 
                    <i className={`fas fa-arrow-${expandedCategory === 'superhero' ? 'up' : 'right'}`}></i>
                  </button>
                </div>
                <div className="category-cards-grid">
                  {getDisplayProducts('superhero').map((product, index) => (
                    <div key={product.id} className="mini-product-card">
                      <Link href={`/product/${product.id}`} className="product-link-overlay">
                        <div className="product-image-placeholder">
                          <i className={`fas ${product.icon}`}></i>
                        </div>
                        <div className="product-card-name">
                          <h4>{product.name}</h4>
                          <span className="product-card-price">₹{product.price}</span>
                        </div>
                      </Link>
                      <button 
                        className="mini-add-to-cart"
                        onClick={(e) => {
                          e.preventDefault()
                          addToCart(product)
                        }}
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Devotional */}
            {activeCategory === 'devotional' && (
              <div className="category-group active">
                <div className="category-header">
                  <h3 className="category-group-title">
                    <i className="fas fa-om"></i> Devotional
                  </h3>
                  <button 
                    onClick={() => handleViewAll('devotional')} 
                    className="view-all-link"
                  >
                    {expandedCategory === 'devotional' ? 'Show Less' : 'View All'} 
                    <i className={`fas fa-arrow-${expandedCategory === 'devotional' ? 'up' : 'right'}`}></i>
                  </button>
                </div>
                <div className="category-cards-grid">
                  {getDisplayProducts('devotional').map((product, index) => (
                    <div key={product.id} className="mini-product-card">
                      <Link href={`/product/${product.id}`} className="product-link-overlay">
                        <div className="product-image-placeholder">
                          <i className={`fas ${product.icon}`}></i>
                        </div>
                        <div className="product-card-name">
                          <h4>{product.name}</h4>
                          <span className="product-card-price">₹{product.price}</span>
                        </div>
                      </Link>
                      <button 
                        className="mini-add-to-cart"
                        onClick={(e) => {
                          e.preventDefault()
                          addToCart(product)
                        }}
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toys */}
            {activeCategory === 'toys' && (
              <div className="category-group active">
                <div className="category-header">
                  <h3 className="category-group-title">
                    <i className="fas fa-dice"></i> Toys
                  </h3>
                  <button 
                    onClick={() => handleViewAll('toys')} 
                    className="view-all-link"
                  >
                    {expandedCategory === 'toys' ? 'Show Less' : 'View All'} 
                    <i className={`fas fa-arrow-${expandedCategory === 'toys' ? 'up' : 'right'}`}></i>
                  </button>
                </div>
                <div className="category-cards-grid">
                  {getDisplayProducts('toys').map((product, index) => (
                    <div key={product.id} className="mini-product-card">
                      <Link href={`/product/${product.id}`} className="product-link-overlay">
                        <div className="product-image-placeholder">
                          <i className={`fas ${product.icon}`}></i>
                        </div>
                        <div className="product-card-name">
                          <h4>{product.name}</h4>
                          <span className="product-card-price">₹{product.price}</span>
                        </div>
                      </Link>
                      <button 
                        className="mini-add-to-cart"
                        onClick={(e) => {
                          e.preventDefault()
                          addToCart(product)
                        }}
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {notification && (
        <div className="notification-popup">
          <i className="fas fa-check-circle"></i>
          {notification}
        </div>
      )}
    </section>
  )
}
