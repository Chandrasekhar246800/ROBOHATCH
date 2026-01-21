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

      <section className="min-h-screen pt-20 bg-light-gray">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-brown mb-4">Browse All Categories</h1>
            <p className="text-lg text-gray-600">Explore our comprehensive collection of 3D printed products organized by category</p>
          </div>

          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-orange to-hover-orange flex items-center justify-center text-white text-2xl">
                        <i className={`fas ${category.icon}`}></i>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-dark-brown">{category.name}</h2>
                        <span className="inline-block mt-1 px-3 py-1 bg-soft-peach/20 text-primary-orange text-sm font-semibold rounded-full">
                          {category.items.length} items
                        </span>
                      </div>
                    </div>
                    <Link 
                      href={category.link} 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary-orange to-hover-orange text-white rounded-full font-semibold shadow-[0_4px_15px_rgba(242,92,5,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,92,5,0.4)] transition-all duration-300"
                    >
                      Explore
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {category.items.slice(0, 4).map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-light-gray rounded-lg hover:bg-soft-peach/10 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary-orange/10 flex items-center justify-center text-primary-orange">
                          <i className={`fas ${category.icon} text-sm`}></i>
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
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
