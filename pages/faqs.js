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
      
      <div className="faqs-page">
        <div className="container">
          <div className="faqs-header">
            <h1>Frequently Asked Questions</h1>
            <p>Find answers to common questions about our 3D printing services</p>
          </div>

          <div className="faqs-list">
            {faqData.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${openIndex === index ? 'active' : ''}`}
              >
                <div 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3>{faq.question}</h3>
                  <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
                </div>
                {openIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="faqs-contact">
            <h3>Still have questions?</h3>
            <p>Can't find the answer you're looking for? Please reach out to our customer support team.</p>
            <a href="/contact">
              <button className="contact-btn">Contact Us</button>
            </a>
          </div>
        </div>
      </div>
      
      <Footer />

      <style jsx>{`
        .faqs-page {
          min-height: 100vh;
          padding: 120px 0 80px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .faqs-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .faqs-header h1 {
          font-size: 3rem;
          color: #2c3e50;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .faqs-header p {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .faqs-list {
          max-width: 900px;
          margin: 0 auto 60px;
        }

        .faq-item {
          background: white;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .faq-item.active {
          box-shadow: 0 5px 20px rgba(255, 94, 77, 0.2);
        }

        .faq-question {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 30px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .faq-question:hover {
          background: #f8f9fa;
        }

        .faq-question h3 {
          font-size: 1.2rem;
          color: #2c3e50;
          margin: 0;
          font-weight: 600;
          flex: 1;
          padding-right: 20px;
        }

        .faq-icon {
          font-size: 2rem;
          color: #ff5e4d;
          font-weight: 300;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ff5e4d;
          border-radius: 50%;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .faq-item.active .faq-icon {
          background: #ff5e4d;
          color: white;
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 0 30px 25px 30px;
          animation: slideDown 0.3s ease;
        }

        .faq-answer p {
          color: #555;
          line-height: 1.8;
          font-size: 1.05rem;
          margin: 0;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .faqs-contact {
          text-align: center;
          background: white;
          padding: 50px 30px;
          border-radius: 12px;
          max-width: 700px;
          margin: 0 auto;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .faqs-contact h3 {
          font-size: 2rem;
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .faqs-contact p {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 30px;
        }

        .contact-btn {
          background: linear-gradient(135deg, #ff5e4d 0%, #ff3b29 100%);
          color: white;
          border: none;
          padding: 15px 40px;
          font-size: 1.1rem;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .contact-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px rgba(255, 94, 77, 0.4);
        }

        @media (max-width: 768px) {
          .faqs-page {
            padding: 100px 0 60px;
          }

          .faqs-header h1 {
            font-size: 2rem;
          }

          .faqs-header p {
            font-size: 1rem;
          }

          .faq-question {
            padding: 20px;
          }

          .faq-question h3 {
            font-size: 1rem;
          }

          .faq-answer {
            padding: 0 20px 20px 20px;
          }

          .faq-answer p {
            font-size: 0.95rem;
          }

          .faqs-contact {
            padding: 40px 20px;
          }

          .faqs-contact h3 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  )
}
