'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState('keychains')

  const categories = [
    { id: 1, icon: 'fa-key', name: 'Keychains', link: '/keychains', key: 'keychains' },
    { id: 2, icon: 'fa-mask', name: 'Superhero Models', link: '/superhero-models', key: 'superhero' },
    { id: 3, icon: 'fa-om', name: 'Devotional', link: '/devotional', key: 'devotional' },
    { id: 4, icon: 'fa-dice', name: 'Toys', link: '/toys', key: 'toys' }
  ]

  const products = {
    keychains: [
      { name: 'Custom Name Keychain', price: '₹199', icon: 'fa-key' },
      { name: 'Logo Keychain', price: '₹249', icon: 'fa-tag' },
      { name: 'Photo Keychain', price: '₹299', icon: 'fa-image' },
      { name: 'Designer Keychain', price: '₹349', icon: 'fa-star' }
    ],
    superhero: [
      { name: 'Iron Man Figure', price: '₹1,299', icon: 'fa-robot' },
      { name: 'Spider-Man Model', price: '₹1,199', icon: 'fa-spider' },
      { name: 'Batman Statue', price: '₹1,399', icon: 'fa-bat' },
      { name: 'Captain America', price: '₹1,499', icon: 'fa-shield-alt' }
    ],
    devotional: [
      { name: 'Ganesha Idol', price: '₹899', icon: 'fa-om' },
      { name: 'Buddha Statue', price: '₹1,099', icon: 'fa-praying-hands' },
      { name: 'Lakshmi Figure', price: '₹799', icon: 'fa-lotus' },
      { name: 'Hanuman Idol', price: '₹949', icon: 'fa-hands-praying' }
    ],
    toys: [
      { name: 'Puzzle Cube', price: '₹399', icon: 'fa-cube' },
      { name: 'Action Figure', price: '₹599', icon: 'fa-user-ninja' },
      { name: 'Educational Toy', price: '₹449', icon: 'fa-graduation-cap' },
      { name: 'Building Blocks', price: '₹699', icon: 'fa-cubes' }
    ]
  }

  const handleCategoryClick = (categoryKey) => {
    setActiveCategory(activeCategory === categoryKey ? null : categoryKey)
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
                  <Link href="/keychains" className="view-all-link">
                    View All <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
                <div className="category-cards-grid">
                  {products.keychains.map((product, index) => (
                    <Link href="/keychains" key={index} className="mini-product-card">
                      <div className="product-image-placeholder">
                        <i className={`fas ${product.icon}`}></i>
                      </div>
                      <div className="product-card-name">
                        <h4>{product.name}</h4>
                        <span className="product-card-price">{product.price}</span>
                      </div>
                    </Link>
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
                  <Link href="/superhero-models" className="view-all-link">
                    View All <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
                <div className="category-cards-grid">
                  {products.superhero.map((product, index) => (
                    <Link href="/superhero-models" key={index} className="mini-product-card">
                      <div className="product-image-placeholder">
                        <i className={`fas ${product.icon}`}></i>
                      </div>
                      <div className="product-card-name">
                        <h4>{product.name}</h4>
                        <span className="product-card-price">{product.price}</span>
                      </div>
                    </Link>
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
                  <Link href="/devotional" className="view-all-link">
                    View All <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
                <div className="category-cards-grid">
                  {products.devotional.map((product, index) => (
                    <Link href="/devotional" key={index} className="mini-product-card">
                      <div className="product-image-placeholder">
                        <i className={`fas ${product.icon}`}></i>
                      </div>
                      <div className="product-card-name">
                        <h4>{product.name}</h4>
                        <span className="product-card-price">{product.price}</span>
                      </div>
                    </Link>
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
                  <Link href="/toys" className="view-all-link">
                    View All <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
                <div className="category-cards-grid">
                  {products.toys.map((product, index) => (
                    <Link href="/toys" key={index} className="mini-product-card">
                      <div className="product-image-placeholder">
                        <i className={`fas ${product.icon}`}></i>
                      </div>
                      <div className="product-card-name">
                        <h4>{product.name}</h4>
                        <span className="product-card-price">{product.price}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
