import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { getActiveCategories } from '@/data/categories';
import Link from 'next/link';

export default function Categories() {
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
    
    // Listen for category updates
    const handleCategoriesUpdate = () => {
      loadCategories();
    };
    
    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    return () => window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
  }, []);

  const loadCategories = () => {
    setCategories(getActiveCategories());
  };

  const toggleCategory = (categoryId) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  return (
    <>
      <Head>
        <title>Browse Categories - ROBOHATCH</title>
        <meta name="description" content="Explore our wide range of 3D printed products across multiple categories" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <section className="categories-page">
        <div className="container">
          <div className="page-header">
            <h1>Browse All Categories</h1>
            <p>Explore our comprehensive collection of 3D printed products organized by category</p>
          </div>

          <div className="categories-container">
            {categories.map((category) => (
              <div key={category.id} className="category-block">
                <div className="category-block-header">
                  <div className="category-block-title">
                    <i className={`fas ${category.icon}`}></i>
                    <h2>{category.name}</h2>
                    <span className="item-badge">{category.items.length} items</span>
                  </div>
                  <Link href={category.link} className="explore-btn">
                    Explore
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
                
                <div className="products-grid">
                  {category.items.slice(0, 4).map((item, index) => (
                    <div key={index} className="product-item">
                      <div className="product-item-icon">
                        <i className={`fas ${category.icon}`}></i>
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
