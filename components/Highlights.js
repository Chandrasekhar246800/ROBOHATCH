export default function Highlights() {
  const highlights = [
    {
      icon: 'fa-cube',
      title: '3D Printed',
      description: 'Every product is crafted with precision using advanced 3D printing technology'
    },
    {
      icon: 'fa-palette',
      title: 'Customizable',
      description: 'Personalize colors, sizes, and designs to match your unique style'
    },
    {
      icon: 'fa-leaf',
      title: 'Sustainable',
      description: 'Eco-friendly materials and minimal waste production process'
    },
    {
      icon: 'fa-shipping-fast',
      title: 'Fast Delivery',
      description: 'Quick production and reliable shipping to your doorstep'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-orange-50/40 to-amber-50/30">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((highlight, index) => (
            <div 
              key={highlight.title} 
              className="bg-gradient-to-br from-white via-white to-orange-50/30 rounded-[20px] p-8 text-center shadow-[0_10px_30px_rgba(242,92,5,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(242,92,5,0.15)] hover:to-orange-100/40 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-orange to-hover-orange flex items-center justify-center text-white text-2xl mb-4 mx-auto">
                <i className={`fas ${highlight.icon}`}></i>
              </div>
              <h3 className="text-xl font-bold text-dark-brown mb-2">{highlight.title}</h3>
              <p className="text-gray-600 text-sm">{highlight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
