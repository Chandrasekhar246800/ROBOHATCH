export default function Categories() {
  const categories = [
    { icon: 'fa-lightbulb', title: 'Lamps', description: 'Illuminate your space with unique designs' },
    { icon: 'fa-key', title: 'Keychains', description: 'Personalized accessories for everyday' },
    { icon: 'fa-om', title: 'Devotional Items', description: 'Sacred symbols crafted with precision' },
    { icon: 'fa-hands-praying', title: 'Idols', description: 'Beautiful spiritual figurines' },
    { icon: 'fa-leaf', title: 'Flower Pots', description: 'Modern planters for green living' },
    { icon: 'fa-gem', title: 'Accessories', description: 'Unique decor and lifestyle items' },
  ]

  return (
    <section className="categories" id="categories">
      <div className="container">
        <div className="category-grid">
          {categories.map((category, index) => (
            <div key={category.title} className={`category-card slide-up delay-${index + 1}`}>
              <div className="category-icon">
                <i className={`fas ${category.icon}`}></i>
              </div>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
