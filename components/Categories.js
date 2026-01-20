'use client'
import { useState, useEffect } from 'react'
import { getCategoryProducts } from '../data/products'
import Link from 'next/link'

export default function Categories() {
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
    { 
      icon: 'fa-key', 
      title: 'Keychains', 
      key: 'keychains',
      description: 'Personalized accessories for everyday',
      link: '/keychains'
    },
    { 
      icon: 'fa-mask', 
      title: 'Superhero Models', 
      key: 'superhero',
      description: 'Collectible superhero action figures',
      link: '/superhero-models'
    },
    { 
      icon: 'fa-om', 
      title: 'Devotional Idols', 
      key: 'devotional',
      description: 'Sacred symbols crafted with precision',
      link: '/devotional'
    },
    { 
      icon: 'fa-dice', 
      title: 'Toys & Games', 
      key: 'toys',
      description: 'Fun and educational 3D printed toys',
      link: '/toys'
    },
    { 
      icon: 'fa-lightbulb', 
      title: 'Lamps & Lighting', 
      key: 'lamps',
      description: 'Illuminate your space uniquely',
      link: '/lamps'
    },
    { 
      icon: 'fa-om', 
      title: 'Religious Idols', 
      key: 'idols',
      description: 'Divine idols for worship',
      link: '/idols'
    },
    { 
      icon: 'fa-seedling', 
      title: 'Flowerpots', 
      key: 'flowerpots',
      description: 'Beautiful planters for your plants',
      link: '/flowerpots'
    },
    { 
      icon: 'fa-briefcase', 
      title: 'Office Supplies', 
      key: 'office',
      description: 'Professional desk accessories',
      link: '/office'
    },
    { 
      icon: 'fa-mobile-alt', 
      title: 'Phone Accessories', 
      key: 'phoneaccessories',
      description: 'Must-have mobile accessories',
      link: '/phoneaccessories'
    },
    { 
      icon: 'fa-image', 
      title: 'Home Decor', 
      key: 'homedecor',
      description: 'Beautiful decorative items for your home',
      link: '/homedecor'
    },
    { 
      icon: 'fa-gem', 
      title: 'Jewelry & Accessories', 
      key: 'jewelry',
      description: 'Unique custom jewelry pieces',
      link: '/jewelry'
    }
  ]

  const [expandedCategory, setExpandedCategory] = useState(null)

  const toggleCategory = (index) => {
    setExpandedCategory(expandedCategory === index ? null : index)
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
    <section className="categories" id="categories">
      <div className="container">
        <h2 className="section-title">Browse Categories</h2>
        <div className="category-grid">
          {categories.map((category, index) => {
            const products = getCategoryProducts(category.key).filter(p => !removedProducts.includes(p.id))
            
            return (
              <div key={category.title} className={`category-card slide-up delay-${index + 1}`}>
                <div className="category-icon">
                  <i className={`fas ${category.icon}`}></i>
                </div>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
                <div className="category-actions">
                  <button 
                    className="category-expand-btn"
                    onClick={() => toggleCategory(index)}
                  >
                    {expandedCategory === index ? 'Hide Products' : 'View Products'}
                    <i className={`fas fa-chevron-${expandedCategory === index ? 'up' : 'down'}`}></i>
                  </button>
                  <Link href={category.link} className="category-view-all-btn">
                    View All <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
                
                {expandedCategory === index && (
                  <div className="category-products-grid">
                    {products.map(product => (
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
                )}
              </div>
            )
          })}
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

