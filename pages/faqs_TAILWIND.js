import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Head from 'next/head'

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqData = [
    {
      question: "What is 3D printing and how does it work?",
      answer: "3D printing, also known as additive manufacturing, is a process of creating three-dimensional objects from a digital file. The printer builds the object layer by layer using materials like PLA, ABS, or resin. Our printers use precise technology to bring your designs to life with high accuracy and detail."
    },
    {
      question: "What materials do you use for 3D printing?",
      answer: "We work with a variety of materials including PLA (biodegradable plastic), ABS (strong and durable), PETG (flexible and strong), TPU (flexible rubber-like), and specialized resins for high-detail prints. Each material has unique properties suited for different applications."
    },
    {
      question: "How long does it take to complete a custom print?",
      answer: "Print time varies based on size, complexity, and material. Small items may take 2-4 hours, while larger or more complex prints can take 12-48 hours or more. After printing, we also factor in post-processing time. We'll provide an estimated completion time when you submit your order."
    },
    {
      question: "What file formats do you accept for custom prints?",
      answer: "We accept STL, OBJ, 3MF, and STEP files. If you have a design in a different format, contact us and we'll work with you to convert it. We can also help you create a 3D model from your sketches or ideas."
    },
    {
      question: "Can you help me design my custom 3D model?",
      answer: "Yes! Our team includes experienced 3D designers who can help bring your ideas to life. Whether you have sketches, photos, or just a concept, we can create a custom 3D model for you. Design services are available for an additional fee."
    },
    {
      question: "What is your pricing structure?",
      answer: "Pricing depends on several factors: material cost, print time, size, complexity, and quantity. We provide free quotes for custom projects. Simply upload your file or describe your project, and we'll get back to you with a detailed estimate within 24 hours."
    },
    {
      question: "Do you offer bulk or wholesale pricing?",
      answer: "Yes! We offer discounted rates for bulk orders and wholesale partnerships. Contact us with your project details and quantity requirements, and we'll provide a competitive quote tailored to your needs."
    },
    {
      question: "What is your return and refund policy?",
      answer: "We stand behind the quality of our work. If you're not satisfied with your print due to quality issues or defects, contact us within 7 days of receipt. Custom prints are generally non-refundable unless there's a production error on our end. We'll work with you to make it right."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is confirmed, you'll receive email updates at each stage: design approval, printing started, quality check, and shipping. You'll receive a tracking number once your item ships, allowing you to monitor delivery progress."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship worldwide! Shipping costs and delivery times vary by location. International orders may be subject to customs fees and import duties, which are the responsibility of the customer. We'll provide shipping options and estimated delivery times at checkout."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      <Head>
        <title>FAQs - ROBOHATCH</title>
        <meta name="description" content="Frequently asked questions about ROBOHATCH 3D printing services" />
      </Head>
      
      <Navbar />
      
      <div className="min-h-screen pt-20 bg-gradient-to-br from-light-gray via-white to-soft-peach/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-dark-brown mb-6">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find answers to common questions about our 3D printing services</p>
          </div>

          <div className="max-w-4xl mx-auto mb-16 space-y-5">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 ${
                  openIndex === index ? 'shadow-[0_5px_20px_rgba(242,92,5,0.2)]' : 'hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                <div 
                  className="flex justify-between items-center p-6 md:p-8 cursor-pointer hover:bg-light-gray transition-colors"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="text-lg md:text-xl font-semibold text-dark-brown pr-6 flex-1">{faq.question}</h3>
                  <span className={`w-10 h-10 flex items-center justify-center text-3xl font-light border-2 rounded-full flex-shrink-0 transition-all duration-300 ${
                    openIndex === index 
                      ? 'bg-primary-orange border-primary-orange text-white rotate-180' 
                      : 'text-primary-orange border-primary-orange'
                  }`}>
                    {openIndex === index ? '−' : '+'}
                  </span>
                </div>
                {openIndex === index && (
                  <div className="px-6 md:px-8 pb-6 md:pb-8 animate-slideDown">
                    <p className="text-gray-600 leading-relaxed text-base md:text-lg">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto text-center bg-white p-12 md:p-16 rounded-xl shadow-lg">
            <h3 className="text-3xl font-bold text-dark-brown mb-4">Still have questions?</h3>
            <p className="text-lg text-gray-600 mb-8">Can't find the answer you're looking for? Please reach out to our customer support team.</p>
            <a href="/contact">
              <button className="px-8 py-4 bg-gradient-to-br from-primary-orange to-hover-orange text-white rounded-full font-semibold text-lg shadow-[0_4px_15px_rgba(242,92,5,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(242,92,5,0.4)] transition-all duration-300">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  )
}
