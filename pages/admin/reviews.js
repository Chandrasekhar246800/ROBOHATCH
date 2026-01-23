import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function AdminReviews() {
  const router = useRouter()
  const [reviews, setReviews] = useState([])
  const [filteredReviews, setFilteredReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterRating, setFilterRating] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadReviews()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [reviews, filterRating, sortBy, searchTerm])

  const loadReviews = () => {
    const allReviews = JSON.parse(localStorage.getItem('reviews') || '[]')
    setReviews(allReviews)
    setIsLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...reviews]

    // Filter by rating
    if (filterRating !== 'all') {
      filtered = filtered.filter(review => review.rating === parseInt(filterRating))
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(review => 
        review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.id - a.id)
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.id - b.id)
    } else if (sortBy === 'highest') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => a.rating - b.rating)
    }

    setFilteredReviews(filtered)
  }

  const deleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      const updatedReviews = reviews.filter(review => review.id !== reviewId)
      localStorage.setItem('reviews', JSON.stringify(updatedReviews))
      setReviews(updatedReviews)
      alert('Review deleted successfully')
    }
  }

  const getStarDisplay = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <i 
            key={star}
            className={`fas fa-star text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          ></i>
        ))}
      </div>
    )
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating]++
    })
    return distribution
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-primary-orange"></i>
      </div>
    )
  }

  const ratingDist = getRatingDistribution()

  return (
    <>
      <Head>
        <title>Reviews Management - ROBOHATCH Admin</title>
        <meta name="description" content="Manage product reviews" />
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white py-8 sm:py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-5 lg:px-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-dark-brown mb-2">
                  <i className="fas fa-star text-primary-orange mr-3"></i>
                  Reviews Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {reviews.length} total reviews
                </p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="bg-gradient-to-r from-primary-orange to-hover-orange text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all active:scale-95"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Admin
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary-orange mb-1">
                {getAverageRating()}
              </div>
              <div className="flex justify-center mb-2">
                {getStarDisplay(Math.round(parseFloat(getAverageRating())))}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-dark-brown">{rating}</span>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                  </div>
                  <span className="font-bold text-primary-orange">{ratingDist[rating]}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-orange rounded-full h-2 transition-all"
                    style={{ 
                      width: `${reviews.length > 0 ? (ratingDist[rating] / reviews.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search product, customer, or review..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              {/* Filter by Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Rating
                </label>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div 
                  key={review.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <img 
                        src={review.productImage} 
                        alt={review.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                          <div>
                            <h3 className="font-bold text-dark-brown text-lg mb-1">
                              {review.productName}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>
                                <i className="fas fa-user mr-1 text-primary-orange"></i>
                                {review.customerName}
                              </span>
                              <span>
                                <i className="fas fa-calendar mr-1 text-primary-orange"></i>
                                {review.date}
                              </span>
                              <span className="text-xs text-gray-500">
                                Order #{review.orderId}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStarDisplay(review.rating)}
                            <button
                              onClick={() => deleteReview(review.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete review"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>

                        {/* Review Comment */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            "{review.comment}"
                          </p>
                        </div>

                        {/* Review Meta */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>
                            <i className="fas fa-envelope mr-1"></i>
                            {review.customerEmail}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-star text-5xl sm:text-6xl text-primary-orange/50"></i>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-3">
                {searchTerm || filterRating !== 'all' ? 'No Reviews Found' : 'No Reviews Yet'}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {searchTerm || filterRating !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Reviews will appear here once customers start reviewing products'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
