import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function About() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[120px] pb-20 bg-gradient-to-br from-orange-50/60 via-amber-50/40 to-orange-100/30">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-5xl text-[#2c3e50] mb-5 font-bold">About ROBOHATCH</h1>
            <p className="text-xl text-[#666]">Bringing Your Ideas to Life with 3D Printing</p>
          </section>

          {/* Our Story */}
          <section className="mb-16">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h2 className="text-3xl text-[#2c3e50] mb-6 font-semibold">Our Story</h2>
                <p className="text-[#555] leading-relaxed text-lg mb-6">
                  ROBOHATCH was founded with a simple mission: to make custom 3D printing accessible to everyone. 
                  What started as a passion project has grown into a thriving business dedicated to transforming 
                  digital designs into tangible products.
                </p>
                <p className="text-[#555] leading-relaxed text-lg">
                  We believe that everyone should have access to personalized, high-quality 3D printed products. 
                  Whether you're looking for custom keychains, decorative items, educational toys, or unique gifts, 
                  we're here to bring your vision to life.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-64 h-64 bg-gradient-to-br from-primary-orange to-[#ff3b29] rounded-3xl flex items-center justify-center shadow-[0_10px_30px_rgba(255,94,77,0.3)] transform transition-transform hover:scale-105">
                  <i className="fas fa-cube text-white text-8xl"></i>
                </div>
              </div>
            </div>
          </section>

          {/* What We Do */}
          <section className="mb-16">
            <h2 className="text-4xl text-[#2c3e50] mb-12 font-semibold text-center">What We Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(255,94,77,0.2)]">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-[#ff3b29] rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-print text-white text-2xl"></i>
                </div>
                <h3 className="text-xl text-[#2c3e50] mb-4 font-semibold">Custom 3D Printing</h3>
                <p className="text-[#666] leading-relaxed">We transform your ideas into physical products using state-of-the-art 3D printing technology.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(255,94,77,0.2)]">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-[#ff3b29] rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-pencil-ruler text-white text-2xl"></i>
                </div>
                <h3 className="text-xl text-[#2c3e50] mb-4 font-semibold">Design Services</h3>
                <p className="text-[#666] leading-relaxed">Our expert designers can help create custom models based on your specifications and requirements.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(255,94,77,0.2)]">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-[#ff3b29] rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-box text-white text-2xl"></i>
                </div>
                <h3 className="text-xl text-[#2c3e50] mb-4 font-semibold">Wide Product Range</h3>
                <p className="text-[#666] leading-relaxed">From keychains and toys to decorative items and office supplies, we offer a diverse catalog of products.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-2 hover:shadow-[0_8px_25px_rgba(255,94,77,0.2)]">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-[#ff3b29] rounded-full flex items-center justify-center mb-6">
                  <i className="fas fa-shipping-fast text-white text-2xl"></i>
                </div>
                <h3 className="text-xl text-[#2c3e50] mb-4 font-semibold">Fast Delivery</h3>
                <p className="text-[#666] leading-relaxed">We ensure quick turnaround times and secure shipping to deliver your products safely.</p>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="mb-16">
            <h2 className="text-4xl text-[#2c3e50] mb-12 font-semibold text-center">Why Choose ROBOHATCH?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1">
                <i className="fas fa-check-circle text-primary-orange text-2xl mt-1 flex-shrink-0"></i>
                <div>
                  <h4 className="text-xl text-[#2c3e50] mb-2 font-semibold">Quality Materials</h4>
                  <p className="text-[#666] leading-relaxed">We use premium PLA, ABS, and specialty filaments for durable, high-quality products.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1">
                <i className="fas fa-check-circle text-primary-orange text-2xl mt-1 flex-shrink-0"></i>
                <div>
                  <h4 className="text-xl text-[#2c3e50] mb-2 font-semibold">Customization</h4>
                  <p className="text-[#666] leading-relaxed">Personalize your products with names, logos, colors, and custom designs.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1">
                <i className="fas fa-check-circle text-primary-orange text-2xl mt-1 flex-shrink-0"></i>
                <div>
                  <h4 className="text-xl text-[#2c3e50] mb-2 font-semibold">Affordable Pricing</h4>
                  <p className="text-[#666] leading-relaxed">Competitive prices without compromising on quality or service.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1">
                <i className="fas fa-check-circle text-primary-orange text-2xl mt-1 flex-shrink-0"></i>
                <div>
                  <h4 className="text-xl text-[#2c3e50] mb-2 font-semibold">Expert Support</h4>
                  <p className="text-[#666] leading-relaxed">Our team is always ready to help with design advice and product recommendations.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1">
                <i className="fas fa-check-circle text-primary-orange text-2xl mt-1 flex-shrink-0"></i>
                <div>
                  <h4 className="text-xl text-[#2c3e50] mb-2 font-semibold">Eco-Friendly</h4>
                  <p className="text-[#666] leading-relaxed">We prioritize sustainable materials and responsible manufacturing practices.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1">
                <i className="fas fa-check-circle text-primary-orange text-2xl mt-1 flex-shrink-0"></i>
                <div>
                  <h4 className="text-xl text-[#2c3e50] mb-2 font-semibold">Customer Satisfaction</h4>
                  <p className="text-[#666] leading-relaxed">Your satisfaction is our priority. We stand behind every product we create.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-16 bg-gradient-to-r from-primary-orange/10 to-[#ff3b29]/10 p-12 rounded-3xl">
            <h2 className="text-4xl text-[#2c3e50] mb-12 font-semibold text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] text-center">
                <h3 className="text-2xl text-[#2c3e50] mb-4 font-semibold">Innovation</h3>
                <p className="text-[#666] leading-relaxed">We constantly explore new technologies and materials to deliver cutting-edge products.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] text-center">
                <h3 className="text-2xl text-[#2c3e50] mb-4 font-semibold">Quality</h3>
                <p className="text-[#666] leading-relaxed">Every product undergoes rigorous quality checks to ensure it meets our high standards.</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] text-center">
                <h3 className="text-2xl text-[#2c3e50] mb-4 font-semibold">Customer Focus</h3>
                <p className="text-[#666] leading-relaxed">Your needs and satisfaction drive everything we do.</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-br from-primary-orange to-[#ff3b29] p-16 rounded-3xl shadow-[0_10px_40px_rgba(255,94,77,0.3)] text-white">
            <h2 className="text-4xl mb-4 font-bold">Ready to Create Something Amazing?</h2>
            <p className="text-lg mb-8 opacity-95">Let's bring your ideas to life with custom 3D printing</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/contact" className="bg-white text-primary-orange px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl inline-block">Get in Touch</a>
              <a href="/#products" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:-translate-y-1 hover:bg-white/10 inline-block">Browse Products</a>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  )
}
