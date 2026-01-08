'use client'
import { useState } from 'react'

export default function Products() {
  const [cartCount, setCartCount] = useState(0)
  const [notification, setNotification] = useState('')

  const products = [
    { icon: 'fa-lightbulb', name: 'Geometric Lamp', category: 'Lamps', price: '₹1,299', badge: 'New' },
    { icon: 'fa-om', name: 'Ganesha Idol', category: 'Devotional Items', price: '₹899', badge: '' },
    { icon: 'fa-key', name: 'Custom Keychain Set', category: 'Keychains', price: '₹299', badge: 'Popular' },
    { icon: 'fa-leaf', name: 'Modern Planter', category: 'Flower Pots', price: '₹599', badge: '' },
    { icon: 'fa-praying-hands', name: 'Buddha Statue', category: 'Idols', price: '₹1,499', badge: '' },
    { icon: 'fa-gem', name: 'Desk Organizer', category: 'Accessories', price: '₹799', badge: 'New' },
  ]

  const handleAddToCart = (productName) => {
    setCartCount(prev => prev + 1)
    setNotification(`${productName} added to cart!`)
    setTimeout(() => setNotification(''), 3000)
  }

  return (
    <section className="products" id="products">
      <div className="container">
        <h2 className="section-title slide-up">Featured Products</h2>
        <p className="section-subtitle slide-up">Handpicked bestsellers and new arrivals</p>

        <div className="products-grid">
          {products.map((product, index) => (
            <div key={product.name} className={`product-card slide-up delay-${index + 1}`}>
              <div className="product-image">
                <div className="image-placeholder">
                  <i className={`fas ${product.icon}`}></i>
                </div>
                {product.badge && <span className="product-badge">{product.badge}</span>}
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <div className="product-footer">
                  <span className="product-price">{product.price}</span>
                  <button 
                    className="add-to-cart"
                    onClick={() => handleAddToCart(product.name)}
                  >
                    <i className="fas fa-shopping-cart"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}
    </section>
  )
}
