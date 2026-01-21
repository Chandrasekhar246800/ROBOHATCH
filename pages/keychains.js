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
      
      <div className="min-h-screen pt-20 bg-light-gray">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-brown mb-4">
              <i className="fas fa-key mr-3"></i> Keychains
            </h1>
            <p className="text-lg text-gray-600">Personalized and custom 3D printed keychains</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-[15px] overflow-hidden shadow-[0_5px_20px_rgba(0,0,0,0.08)] hover:-translate-y-2.5 hover:shadow-[0_15px_40px_rgba(0,0,0,0.15)] transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-soft-peach to-primary-orange p-8 flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center">
                    <i className={`fas ${product.icon} text-6xl text-white`}></i>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-dark-brown mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-orange">₹{product.price}</span>
                    <button 
                      className="px-6 py-3 bg-gradient-to-br from-primary-orange to-hover-orange text-white rounded-full font-semibold shadow-[0_4px_15px_rgba(242,92,5,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,92,5,0.4)] transition-all duration-300 flex items-center gap-2"
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
        <div className="fixed bottom-8 right-8 px-6 py-4 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-3 animate-slideInRight z-50">
          <i className="fas fa-check-circle text-xl"></i>
          {notification}
        </div>
      )}
      
      <Footer />
    </>
  )
}
