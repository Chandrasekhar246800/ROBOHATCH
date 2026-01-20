import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'
import { allProducts } from '../data/products'
import { defaultCategories } from '../data/categories'

export default function Admin() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [removedProducts, setRemovedProducts] = useState([])
  const [removedCategories, setRemovedCategories] = useState([])
  const [showRemoved, setShowRemoved] = useState(false)
  const [showRemovedCategories, setShowRemovedCategories] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [productEdits, setProductEdits] = useState({})
  const [categoryEdits, setCategoryEdits] = useState({})
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '' })
  const [categoryEditForm, setCategoryEditForm] = useState({ name: '', icon: '', link: '', items: [] })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [customProducts, setCustomProducts] = useState([])
  const [customCategories, setCustomCategories] = useState([])
  const [addForm, setAddForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'keychains',
    icon: 'fa-cube'
  })
  const [addCategoryForm, setAddCategoryForm] = useState({
    name: '',
    icon: 'fa-cube',
    link: '',
    items: ['']
  })
  const [orders, setOrders] = useState([
    { id: 1, customer: 'John Doe', email: 'john@example.com', product: 'Custom Keychain', status: 'Pending', total: '₹299', date: '2026-01-08' },
    { id: 2, customer: 'Jane Smith', email: 'jane@example.com', product: 'Iron Man Model', status: 'Completed', total: '₹899', date: '2026-01-07' },
    { id: 3, customer: 'Mike Johnson', email: 'mike@example.com', product: 'Ganesh Statue', status: 'Processing', total: '₹599', date: '2026-01-09' },
  ])

  // Load removed products, edits, and custom products from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('removedProducts')
    if (stored) {
      setRemovedProducts(JSON.parse(stored))
    }
    const edits = localStorage.getItem('productEdits')
    if (edits) {
      setProductEdits(JSON.parse(edits))
    }
    const custom = localStorage.getItem('customProducts')
    if (custom) {
      setCustomProducts(JSON.parse(custom))
    }
    
    // Load category data
    const removedCats = localStorage.getItem('removedCategories')
    if (removedCats) {
      setRemovedCategories(JSON.parse(removedCats))
    }
    const catEdits = localStorage.getItem('categoryEdits')
    if (catEdits) {
      setCategoryEdits(JSON.parse(catEdits))
    }
    const customCats = localStorage.getItem('customCategories')
    if (customCats) {
      setCustomCategories(JSON.parse(customCats))
    }
  }, [])

  const handleLogout = () => {
    router.push('/login')
  }

  const handleRemoveProduct = (productId) => {
    const newRemovedProducts = [...removedProducts, productId]
    setRemovedProducts(newRemovedProducts)
    localStorage.setItem('removedProducts', JSON.stringify(newRemovedProducts))
    // Dispatch event to update other pages
    window.dispatchEvent(new Event('productsUpdated'))
  }

  const handleRestoreProduct = (productId) => {
    const newRemovedProducts = removedProducts.filter(id => id !== productId)
    setRemovedProducts(newRemovedProducts)
    localStorage.setItem('removedProducts', JSON.stringify(newRemovedProducts))
    // Dispatch event to update other pages
    window.dispatchEvent(new Event('productsUpdated'))
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setEditForm({
      name: productEdits[product.id]?.name || product.name,
      price: productEdits[product.id]?.price || product.price,
      description: productEdits[product.id]?.description || product.description
    })
  }

  const handleSaveEdit = () => {
    if (!editingProduct) return
    
    const newEdits = {
      ...productEdits,
      [editingProduct.id]: {
        name: editForm.name,
        price: parseFloat(editForm.price),
        description: editForm.description
      }
    }
    
    setProductEdits(newEdits)
    localStorage.setItem('productEdits', JSON.stringify(newEdits))
    setEditingProduct(null)
    // Dispatch event to update other pages
    window.dispatchEvent(new Event('productsUpdated'))
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setEditForm({ name: '', price: '', description: '' })
  }

  const handleAddProduct = () => {
    setShowAddModal(true)
    setAddForm({
      name: '',
      price: '',
      description: '',
      category: 'keychains',
      icon: 'fa-cube'
    })
  }

  const handleSaveNewProduct = () => {
    if (!addForm.name || !addForm.price) {
      alert('Please fill in product name and price')
      return
    }

    const newProduct = {
      id: 'custom_' + Date.now(),
      name: addForm.name,
      price: parseFloat(addForm.price),
      description: addForm.description,
      icon: addForm.icon,
      category: addForm.category,
      image: '/products/custom.jpg'
    }

    const updatedCustomProducts = [...customProducts, newProduct]
    setCustomProducts(updatedCustomProducts)
    localStorage.setItem('customProducts', JSON.stringify(updatedCustomProducts))
    setShowAddModal(false)
    // Dispatch event to update other pages
    window.dispatchEvent(new Event('productsUpdated'))
  }

  const handleCancelAdd = () => {
    setShowAddModal(false)
    setAddForm({
      name: '',
      price: '',
      description: '',
      category: 'keychains',
      icon: 'fa-cube'
    })
  }

  // Category Management Functions
  const handleRemoveCategory = (categoryId) => {
    const newRemovedCategories = [...removedCategories, categoryId]
    setRemovedCategories(newRemovedCategories)
    localStorage.setItem('removedCategories', JSON.stringify(newRemovedCategories))
    window.dispatchEvent(new Event('categoriesUpdated'))
  }

  const handleRestoreCategory = (categoryId) => {
    const newRemovedCategories = removedCategories.filter(id => id !== categoryId)
    setRemovedCategories(newRemovedCategories)
    localStorage.setItem('removedCategories', JSON.stringify(newRemovedCategories))
    window.dispatchEvent(new Event('categoriesUpdated'))
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryEditForm({
      name: categoryEdits[category.id]?.name || category.name,
      icon: categoryEdits[category.id]?.icon || category.icon,
      link: categoryEdits[category.id]?.link || category.link,
      items: categoryEdits[category.id]?.items || category.items
    })
  }

  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return
    
    const newEdits = {
      ...categoryEdits,
      [editingCategory.id]: {
        name: categoryEditForm.name,
        icon: categoryEditForm.icon,
        link: categoryEditForm.link,
        items: categoryEditForm.items
      }
    }
    
    setCategoryEdits(newEdits)
    localStorage.setItem('categoryEdits', JSON.stringify(newEdits))
    setEditingCategory(null)
    window.dispatchEvent(new Event('categoriesUpdated'))
  }

  const handleCancelCategoryEdit = () => {
    setEditingCategory(null)
    setCategoryEditForm({ name: '', icon: '', link: '', items: [] })
  }

  const handleAddCategory = () => {
    setShowAddCategoryModal(true)
    setAddCategoryForm({
      name: '',
      icon: 'fa-cube',
      link: '',
      items: ['']
    })
  }

  const handleSaveNewCategory = () => {
    if (!addCategoryForm.name || !addCategoryForm.icon) {
      alert('Please fill in category name and icon')
      return
    }

    const newCategory = {
      id: 'custom_cat_' + Date.now(),
      name: addCategoryForm.name,
      icon: addCategoryForm.icon,
      link: addCategoryForm.link || '/' + addCategoryForm.name.toLowerCase().replace(/\s+/g, '-'),
      items: addCategoryForm.items.filter(item => item.trim() !== '')
    }

    const updatedCustomCategories = [...customCategories, newCategory]
    setCustomCategories(updatedCustomCategories)
    localStorage.setItem('customCategories', JSON.stringify(updatedCustomCategories))
    setShowAddCategoryModal(false)
    window.dispatchEvent(new Event('categoriesUpdated'))
  }

  const handleCancelAddCategory = () => {
    setShowAddCategoryModal(false)
    setAddCategoryForm({
      name: '',
      icon: 'fa-cube',
      link: '',
      items: ['']
    })
  }

  const handleAddCategoryItem = () => {
    setAddCategoryForm({
      ...addCategoryForm,
      items: [...addCategoryForm.items, '']
    })
  }

  const handleRemoveCategoryItem = (index) => {
    const newItems = addCategoryForm.items.filter((_, i) => i !== index)
    setAddCategoryForm({
      ...addCategoryForm,
      items: newItems.length > 0 ? newItems : ['']
    })
  }

  const handleCategoryItemChange = (index, value) => {
    const newItems = [...addCategoryForm.items]
    newItems[index] = value
    setAddCategoryForm({
      ...addCategoryForm,
      items: newItems
    })
  }

  const getAllCategoriesList = () => {
    const categoriesList = []
    defaultCategories.forEach(category => {
      const editedCategory = categoryEdits[category.id] || {}
      categoriesList.push({
        ...category,
        ...editedCategory
      })
    })
    
    customCategories.forEach(category => {
      const editedCategory = categoryEdits[category.id] || {}
      categoriesList.push({
        ...category,
        ...editedCategory
      })
    })
    
    return categoriesList
  }

  const getActiveCategoriesList = () => {
    return getAllCategoriesList().filter(c => !removedCategories.includes(c.id))
  }

  const getRemovedCategoriesList = () => {
    return getAllCategoriesList().filter(c => removedCategories.includes(c.id))
  }

  // Get all products for display with edits applied and custom products
  const getAllProductsList = () => {
    const productsList = []
    Object.keys(allProducts).forEach(category => {
      allProducts[category].forEach(product => {
        const editedProduct = productEdits[product.id] || {}
        productsList.push({
          ...product,
          ...editedProduct,
          category: category.charAt(0).toUpperCase() + category.slice(1)
        })
      })
    })
    
    // Add custom products
    customProducts.forEach(product => {
      const editedProduct = productEdits[product.id] || {}
      productsList.push({
        ...product,
        ...editedProduct,
        category: product.category.charAt(0).toUpperCase() + product.category.slice(1)
      })
    })
    
    return productsList
  }

  const getFilteredProducts = () => {
    const allProductsList = getAllProductsList()
    const activeProducts = allProductsList.filter(p => !removedProducts.includes(p.id))
    if (selectedCategory === 'all') {
      return activeProducts
    }
    return activeProducts.filter(p => p.category.toLowerCase() === selectedCategory)
  }

  const getRemovedProductsList = () => {
    const allProductsList = getAllProductsList()
    return allProductsList.filter(p => removedProducts.includes(p.id))
  }

  return (
    <>
      <Navbar />
      <div className="admin-page">
        <div className="admin-container">
          {/* Sidebar */}
          <div className="admin-sidebar">
            <div className="admin-logo">
              <i className="fas fa-user-shield"></i>
              <h2>Admin Panel</h2>
            </div>
            <nav className="admin-nav">
              <button 
                className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-chart-line"></i>
                Overview
              </button>
              <button 
                className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <i className="fas fa-shopping-bag"></i>
                Orders
              </button>
              <button 
                className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <i className="fas fa-box"></i>
                Products
              </button>
              <button 
                className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                <i className="fas fa-th-large"></i>
                Categories
              </button>
              <button 
                className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                <i className="fas fa-users"></i>
                Customers
              </button>
              <button 
                className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <i className="fas fa-cog"></i>
                Settings
              </button>
            </nav>
            <button className="admin-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>

          {/* Main Content */}
          <div className="admin-content">
            <div className="admin-header">
              <h1>Welcome to Admin Dashboard</h1>
              <p>Manage your ROBOHATCH store</p>
            </div>

            {activeTab === 'overview' && (
              <div className="admin-overview">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon blue">
                      <i className="fas fa-shopping-cart"></i>
                    </div>
                    <div className="stat-info">
                      <h3>Total Orders</h3>
                      <p className="stat-value">156</p>
                      <span className="stat-change positive">+12% from last month</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon green">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="stat-info">
                      <h3>Revenue</h3>
                      <p className="stat-value">₹45,890</p>
                      <span className="stat-change positive">+8% from last month</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon orange">
                      <i className="fas fa-box"></i>
                    </div>
                    <div className="stat-info">
                      <h3>Products</h3>
                      <p className="stat-value">32</p>
                      <span className="stat-change">4 categories</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon purple">
                      <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-info">
                      <h3>Customers</h3>
                      <p className="stat-value">89</p>
                      <span className="stat-change positive">+15 this week</span>
                    </div>
                  </div>
                </div>

                <div className="recent-activity">
                  <h2>Recent Orders</h2>
                  <div className="orders-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Product</th>
                          <th>Status</th>
                          <th>Total</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.customer}</td>
                            <td>{order.product}</td>
                            <td>
                              <span className={`status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>{order.total}</td>
                            <td>{order.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="admin-orders">
                <h2>All Orders</h2>
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Product</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.customer}</td>
                          <td>{order.email}</td>
                          <td>{order.product}</td>
                          <td>
                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>{order.total}</td>
                          <td>{order.date}</td>
                          <td>
                            <button className="action-btn view">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="action-btn edit">
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="admin-products">
                <div className="section-header">
                  <h2>Products Management</h2>
                  <div className="header-actions">
                    <button 
                      className={`toggle-removed-btn ${showRemoved ? 'active' : ''}`}
                      onClick={() => setShowRemoved(!showRemoved)}
                    >
                      <i className="fas fa-eye"></i>
                      {showRemoved ? 'Hide' : 'Show'} Removed ({getRemovedProductsList().length})
                    </button>
                    <button 
                      className="add-product-btn"
                      onClick={handleAddProduct}
                    >
                      <i className="fas fa-plus"></i>
                      Add Product
                    </button>
                  </div>
                </div>

                <div className="category-filter">
                  <button 
                    className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Products ({getFilteredProducts().length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'keychains' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('keychains')}
                  >
                    Keychains ({allProducts.keychains.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'superhero' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('superhero')}
                  >
                    Superhero ({allProducts.superhero.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'devotional' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('devotional')}
                  >
                    Devotional ({allProducts.devotional.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'toys' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('toys')}
                  >
                    Toys ({allProducts.toys.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'lamps' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('lamps')}
                  >
                    Lamps ({allProducts.lamps.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'idols' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('idols')}
                  >
                    Idols ({allProducts.idols.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'flowerpots' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('flowerpots')}
                  >
                    Flower Pots ({allProducts.flowerpots.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'office' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('office')}
                  >
                    Office Supplies ({allProducts.office.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'phoneaccessories' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('phoneaccessories')}
                  >
                    Phone Accessories ({allProducts.phoneaccessories.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'homedecor' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('homedecor')}
                  >
                    Home Decor ({allProducts.homedecor.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                  <button 
                    className={`filter-btn ${selectedCategory === 'jewelry' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('jewelry')}
                  >
                    Jewelry ({allProducts.jewelry.filter(p => !removedProducts.includes(p.id)).length})
                  </button>
                </div>

                {!showRemoved && (
                  <div className="products-grid">
                    {getFilteredProducts().map(product => (
                      <div key={product.id} className="product-card-admin">
                        <div className="product-icon-admin">
                          <i className={`fas ${product.icon}`}></i>
                        </div>
                        <div className="product-details-admin">
                          <h3>{product.name}</h3>
                          <p className="product-description">{product.description}</p>
                          <div className="product-meta">
                            <span className="product-category">{product.category}</span>
                            <span className="product-price">₹{product.price}</span>
                          </div>
                        </div>
                        <div className="product-actions">
                          <button 
                            className="action-btn edit" 
                            title="Edit Product"
                            onClick={() => handleEditProduct(product)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete" 
                            title="Remove Product"
                            onClick={() => handleRemoveProduct(product.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showRemoved && (
                  <div className="removed-products-section">
                    <h3 className="removed-title">
                      <i className="fas fa-archive"></i>
                      Removed Products ({getRemovedProductsList().length})
                    </h3>
                    {getRemovedProductsList().length === 0 ? (
                      <p className="no-removed">No removed products</p>
                    ) : (
                      <div className="products-grid">
                        {getRemovedProductsList().map(product => (
                          <div key={product.id} className="product-card-admin removed">
                            <div className="product-icon-admin">
                              <i className={`fas ${product.icon}`}></i>
                            </div>
                            <div className="product-details-admin">
                              <h3>{product.name}</h3>
                              <p className="product-description">{product.description}</p>
                              <div className="product-meta">
                                <span className="product-category">{product.category}</span>
                                <span className="product-price">₹{product.price}</span>
                              </div>
                            </div>
                            <div className="product-actions">
                              <button 
                                className="action-btn restore" 
                                title="Restore Product"
                                onClick={() => handleRestoreProduct(product.id)}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="admin-categories">
                <div className="section-header">
                  <h2>Categories Management</h2>
                  <div className="header-actions">
                    <button 
                      className={`toggle-removed-btn ${showRemovedCategories ? 'active' : ''}`}
                      onClick={() => setShowRemovedCategories(!showRemovedCategories)}
                    >
                      <i className="fas fa-eye"></i>
                      {showRemovedCategories ? 'Hide' : 'Show'} Removed ({getRemovedCategoriesList().length})
                    </button>
                    <button 
                      className="add-product-btn"
                      onClick={handleAddCategory}
                    >
                      <i className="fas fa-plus"></i>
                      Add Category
                    </button>
                  </div>
                </div>

                {!showRemovedCategories && (
                  <div className="categories-grid-admin">
                    {getActiveCategoriesList().map(category => (
                      <div key={category.id} className="category-card-admin">
                        <div className="category-icon-admin">
                          <i className={`fas ${category.icon}`}></i>
                        </div>
                        <div className="category-details-admin">
                          <h3>{category.name}</h3>
                          <p className="category-link">Link: {category.link}</p>
                          <div className="category-items-preview">
                            <span className="items-count">
                              <i className="fas fa-list"></i>
                              {category.items.length} items
                            </span>
                          </div>
                        </div>
                        <div className="category-actions">
                          <button 
                            className="action-btn edit" 
                            title="Edit Category"
                            onClick={() => handleEditCategory(category)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete" 
                            title="Remove Category"
                            onClick={() => handleRemoveCategory(category.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showRemovedCategories && (
                  <div className="removed-categories-section">
                    <h3 className="removed-title">
                      <i className="fas fa-archive"></i>
                      Removed Categories ({getRemovedCategoriesList().length})
                    </h3>
                    {getRemovedCategoriesList().length === 0 ? (
                      <p className="no-removed">No removed categories</p>
                    ) : (
                      <div className="categories-grid-admin">
                        {getRemovedCategoriesList().map(category => (
                          <div key={category.id} className="category-card-admin removed">
                            <div className="category-icon-admin">
                              <i className={`fas ${category.icon}`}></i>
                            </div>
                            <div className="category-details-admin">
                              <h3>{category.name}</h3>
                              <p className="category-link">Link: {category.link}</p>
                              <div className="category-items-preview">
                                <span className="items-count">
                                  <i className="fas fa-list"></i>
                                  {category.items.length} items
                                </span>
                              </div>
                            </div>
                            <div className="category-actions">
                              <button 
                                className="action-btn restore" 
                                title="Restore Category"
                                onClick={() => handleRestoreCategory(category.id)}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="admin-customers">
                <h2>Customer Management</h2>
                <p className="coming-soon">Customer management interface coming soon...</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="admin-settings">
                <h2>Settings</h2>
                <div className="settings-section">
                  <h3>Store Information</h3>
                  <div className="form-group">
                    <label>Store Name</label>
                    <input type="text" defaultValue="ROBOHATCH" />
                  </div>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input type="email" defaultValue="info@robohatch.com" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" defaultValue="+91 1234567890" />
                  </div>
                  <button className="save-btn">Save Changes</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Product Modal */}
        {editingProduct && (
          <div className="modal-overlay" onClick={handleCancelEdit}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Product</h2>
                <button className="modal-close" onClick={handleCancelEdit}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    placeholder="Enter price"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Enter product description"
                    rows="4"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={handleCancelAdd}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Product</h2>
                <button className="modal-close" onClick={handleCancelAdd}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input 
                    type="text" 
                    value={addForm.name}
                    onChange={(e) => setAddForm({...addForm, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input 
                    type="number" 
                    value={addForm.price}
                    onChange={(e) => setAddForm({...addForm, price: e.target.value})}
                    placeholder="Enter price"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={addForm.description}
                    onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                    placeholder="Enter product description"
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={addForm.category}
                    onChange={(e) => setAddForm({...addForm, category: e.target.value})}
                  >
                    <option value="keychains">Keychains</option>
                    <option value="superhero">Superhero Models</option>
                    <option value="devotional">Devotional Items</option>
                    <option value="toys">Toys & Games</option>
                    <option value="lamps">Lamps</option>
                    <option value="idols">Idols</option>
                    <option value="flowerpots">Flower Pots</option>
                    <option value="office">Office Supplies</option>
                    <option value="phoneaccessories">Phone Accessories</option>
                    <option value="homedecor">Home Decor</option>
                    <option value="jewelry">Jewelry & Accessories</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Icon Class</label>
                  <input 
                    type="text" 
                    value={addForm.icon}
                    onChange={(e) => setAddForm({...addForm, icon: e.target.value})}
                    placeholder="e.g., fa-cube, fa-star, fa-heart"
                  />
                  <small>FontAwesome icon class (e.g., fa-cube, fa-star)</small>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={handleCancelAdd}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSaveNewProduct}>
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {editingCategory && (
          <div className="modal-overlay" onClick={handleCancelCategoryEdit}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Category</h2>
                <button className="modal-close" onClick={handleCancelCategoryEdit}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name</label>
                  <input 
                    type="text" 
                    value={categoryEditForm.name}
                    onChange={(e) => setCategoryEditForm({...categoryEditForm, name: e.target.value})}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="form-group">
                  <label>Icon Class</label>
                  <input 
                    type="text" 
                    value={categoryEditForm.icon}
                    onChange={(e) => setCategoryEditForm({...categoryEditForm, icon: e.target.value})}
                    placeholder="e.g., fa-cube, fa-star"
                  />
                </div>
                <div className="form-group">
                  <label>Link URL</label>
                  <input 
                    type="text" 
                    value={categoryEditForm.link}
                    onChange={(e) => setCategoryEditForm({...categoryEditForm, link: e.target.value})}
                    placeholder="/category-name"
                  />
                </div>
                <div className="form-group">
                  <label>Items (comma separated)</label>
                  <textarea 
                    value={categoryEditForm.items.join(', ')}
                    onChange={(e) => setCategoryEditForm({
                      ...categoryEditForm, 
                      items: e.target.value.split(',').map(item => item.trim())
                    })}
                    placeholder="Item 1, Item 2, Item 3"
                    rows="4"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={handleCancelCategoryEdit}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSaveCategoryEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showAddCategoryModal && (
          <div className="modal-overlay" onClick={handleCancelAddCategory}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Category</h2>
                <button className="modal-close" onClick={handleCancelAddCategory}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input 
                    type="text" 
                    value={addCategoryForm.name}
                    onChange={(e) => setAddCategoryForm({...addCategoryForm, name: e.target.value})}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="form-group">
                  <label>Icon Class *</label>
                  <input 
                    type="text" 
                    value={addCategoryForm.icon}
                    onChange={(e) => setAddCategoryForm({...addCategoryForm, icon: e.target.value})}
                    placeholder="e.g., fa-cube, fa-star, fa-heart"
                  />
                  <small>FontAwesome icon class</small>
                </div>
                <div className="form-group">
                  <label>Link URL</label>
                  <input 
                    type="text" 
                    value={addCategoryForm.link}
                    onChange={(e) => setAddCategoryForm({...addCategoryForm, link: e.target.value})}
                    placeholder="/category-name (leave empty for auto-generate)"
                  />
                </div>
                <div className="form-group">
                  <label>Category Items</label>
                  <div className="items-list">
                    {addCategoryForm.items.map((item, index) => (
                      <div key={index} className="item-input-row">
                        <input 
                          type="text" 
                          value={item}
                          onChange={(e) => handleCategoryItemChange(index, e.target.value)}
                          placeholder={`Item ${index + 1}`}
                        />
                        <button 
                          type="button"
                          className="remove-item-btn"
                          onClick={() => handleRemoveCategoryItem(index)}
                          disabled={addCategoryForm.items.length === 1}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      className="add-item-btn"
                      onClick={handleAddCategoryItem}
                    >
                      <i className="fas fa-plus"></i>
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={handleCancelAddCategory}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSaveNewCategory}>
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
