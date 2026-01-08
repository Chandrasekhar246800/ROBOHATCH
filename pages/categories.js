import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function Categories() {
  const [expandedCategories, setExpandedCategories] = useState([]);

  const categories = [
    {
      id: 1,
      name: 'Keychains',
      icon: 'fa-key',
      items: [
        'Custom Name Keychain',
        'Logo Keychain',
        'Photo Keychain',
        'Designer Keychain',
        'Animal Keychains',
        'Car Brand Keychains',
        'Letter Keychains',
        'Sports Keychains'
      ]
    },
    {
      id: 2,
      name: 'Superhero Models',
      icon: 'fa-mask',
      items: [
        'Iron Man Figure',
        'Spider-Man Model',
        'Batman Statue',
        'Captain America',
        'Wonder Woman',
        'Thor Figure',
        'Hulk Model',
        'Black Panther'
      ]
    },
    {
      id: 3,
      name: 'Devotional Idols',
      icon: 'fa-om',
      items: [
        'Ganesha Idol',
        'Buddha Statue',
        'Lakshmi Figure',
        'Hanuman Idol',
        'Krishna Statue',
        'Shiva Lingam',
        'Saraswati Idol',
        'Durga Maa'
      ]
    },
    {
      id: 4,
      name: 'Toys & Games',
      icon: 'fa-gamepad',
      items: [
        'Puzzle Cube',
        'Action Figure',
        'Educational Toy',
        'Building Blocks',
        'Board Game Pieces',
        'Mini Cars',
        'Dinosaur Models',
        'Robot Toys'
      ]
    },
    {
      id: 5,
      name: 'Home Decor',
      icon: 'fa-home',
      items: [
        'Wall Art',
        'Decorative Vases',
        'Photo Frames',
        'Lamp Shades',
        'Plant Holders',
        'Clock Designs',
        'Candle Holders',
        'Bookends'
      ]
    },
    {
      id: 6,
      name: 'Jewelry & Accessories',
      icon: 'fa-gem',
      items: [
        'Custom Pendants',
        'Earrings',
        'Bracelets',
        'Rings',
        'Brooches',
        'Hair Clips',
        'Cufflinks',
        'Anklets'
      ]
    },
    {
      id: 7,
      name: 'Phone Accessories',
      icon: 'fa-mobile-alt',
      items: [
        'Phone Stands',
        'Custom Cases',
        'Pop Sockets',
        'Cable Organizers',
        'Phone Grips',
        'Charging Docks',
        'Screen Protectors',
        'Camera Lens Covers'
      ]
    },
    {
      id: 8,
      name: 'Office Supplies',
      icon: 'fa-briefcase',
      items: [
        'Pen Holders',
        'Business Card Holders',
        'Desk Organizers',
        'Paper Weights',
        'Cable Management',
        'Phone Docks',
        'Name Plates',
        'Letter Trays'
      ]
    }
  ];

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
                  <button 
                    onClick={() => toggleCategory(category.id)}
                    className="expand-btn"
                  >
                    {expandedCategories.includes(category.id) ? 'Show Less' : 'View All'}
                    <i className={`fas fa-chevron-${expandedCategories.includes(category.id) ? 'up' : 'down'}`}></i>
                  </button>
                </div>
                
                <div className="products-grid">
                  {category.items.slice(0, expandedCategories.includes(category.id) ? category.items.length : 4).map((item, index) => (
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
