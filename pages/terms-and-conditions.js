'use client'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'

export default function TermsAndConditions() {
  return (
    <>
      <Head>
        <title>Terms and Conditions - ROBOHATCH</title>
        <meta name="description" content="Terms and Conditions for ROBOHATCH - Read our terms of service" />
      </Head>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white py-8 sm:py-12 md:py-16">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-5 lg:px-6">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-dark-brown mb-3 sm:mb-4">
              Terms and Conditions
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Last updated: January 23, 2026
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
            <div className="prose prose-sm sm:prose-base max-w-none">
              {/* Introduction */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Welcome to ROBOHATCH. These Terms and Conditions ("Terms") govern your use of our website and services. 
                  By accessing or using our website, you agree to be bound by these Terms. If you do not agree with any 
                  part of these Terms, please do not use our services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  ROBOHATCH specializes in 3D printing services and products, offering custom printing, ready-made products, 
                  and design services. These Terms apply to all visitors, users, and customers of our platform.
                </p>
              </section>

              {/* Definitions */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">2. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>"Company"</strong>, <strong>"We"</strong>, <strong>"Us"</strong>, or <strong>"Our"</strong> refers to ROBOHATCH.</li>
                  <li><strong>"User"</strong>, <strong>"You"</strong>, or <strong>"Your"</strong> refers to the individual or entity using our services.</li>
                  <li><strong>"Services"</strong> refers to all products, custom printing, and services offered by ROBOHATCH.</li>
                  <li><strong>"Website"</strong> refers to the ROBOHATCH online platform and all associated pages.</li>
                </ul>
              </section>

              {/* Account Registration */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">3. Account Registration</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  To access certain features of our services, you may be required to create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
                </p>
              </section>

              {/* Orders and Payments */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">4. Orders and Payments</h2>
                <h3 className="text-lg sm:text-xl font-semibold text-dark-brown mb-3 mt-4">4.1 Placing Orders</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  By placing an order through our website, you are making an offer to purchase products or services. 
                  All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order.
                </p>
                
                <h3 className="text-lg sm:text-xl font-semibold text-dark-brown mb-3 mt-4">4.2 Pricing</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>All prices are displayed in Indian Rupees (INR) and include applicable taxes</li>
                  <li>Prices are subject to change without notice</li>
                  <li>We strive to ensure pricing accuracy but errors may occur</li>
                  <li>In case of pricing errors, we will contact you before processing the order</li>
                </ul>

                <h3 className="text-lg sm:text-xl font-semibold text-dark-brown mb-3 mt-4">4.3 Payment Methods</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  We accept various payment methods including credit/debit cards, UPI, and cash on delivery. 
                  Payment information is processed securely through trusted payment gateways.
                </p>
              </section>

              {/* Custom Printing Services */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">5. Custom Printing Services</h2>
                <h3 className="text-lg sm:text-xl font-semibold text-dark-brown mb-3 mt-4">5.1 Design Files</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Customers must provide print-ready design files in supported formats (STL, OBJ, etc.)</li>
                  <li>ROBOHATCH is not responsible for design file quality or printability</li>
                  <li>We reserve the right to refuse printing designs that are inappropriate or infringe on copyrights</li>
                </ul>

                <h3 className="text-lg sm:text-xl font-semibold text-dark-brown mb-3 mt-4">5.2 Production Time</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Custom orders require processing time. Estimated delivery dates are provided at checkout but are not guaranteed. 
                  Delays may occur due to technical issues, material availability, or other unforeseen circumstances.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold text-dark-brown mb-3 mt-4">5.3 Quality Standards</h3>
                <p className="text-gray-700 leading-relaxed">
                  We maintain high-quality standards for all prints. Minor variations in color, texture, or dimensions may occur 
                  due to the nature of 3D printing technology and are considered acceptable.
                </p>
              </section>

              {/* Shipping and Delivery */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">6. Shipping and Delivery</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Shipping charges are calculated based on order value, weight, and delivery location</li>
                  <li>Free shipping is available on orders above ₹1000</li>
                  <li>Delivery times are estimates and may vary based on location and other factors</li>
                  <li>Risk of loss passes to you upon delivery to the carrier</li>
                  <li>You are responsible for providing accurate delivery information</li>
                </ul>
              </section>

              {/* Returns and Refunds */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">7. Returns and Refunds</h2>
                <h3 className="text-lg sm:text-xl font-semibold text-dark-brown mb-3 mt-4">7.1 Return Policy</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Ready-made products can be returned within 7 days of delivery if unused and in original packaging</li>
                  <li>Custom-made products are generally non-returnable unless defective</li>
                  <li>Return shipping costs are borne by the customer unless the product is defective</li>
                </ul>

                <h3 className="text-lg sm:text-xl font-semibold text-dark-brown mb-3 mt-4">7.2 Refund Process</h3>
                <p className="text-gray-700 leading-relaxed">
                  Approved refunds will be processed within 7-10 business days to the original payment method. 
                  Shipping charges are non-refundable except in cases of defective products.
                </p>
              </section>

              {/* Intellectual Property */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">8. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  All content on the ROBOHATCH website, including text, graphics, logos, images, and software, is the property 
                  of ROBOHATCH or its licensors and is protected by copyright and intellectual property laws.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You may not reproduce, distribute, modify, or create derivative works without our express written permission. 
                  By submitting designs for printing, you warrant that you own or have rights to use such designs.
                </p>
              </section>

              {/* User Conduct */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">9. User Conduct</h2>
                <p className="text-gray-700 leading-relaxed mb-3">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Use our services for any illegal or unauthorized purpose</li>
                  <li>Submit designs that infringe on copyrights, trademarks, or other intellectual property rights</li>
                  <li>Submit offensive, inappropriate, or harmful content</li>
                  <li>Attempt to interfere with the proper functioning of the website</li>
                  <li>Engage in fraudulent activities or misrepresent yourself</li>
                </ul>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">10. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  To the fullest extent permitted by law, ROBOHATCH shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages arising from your use of our services, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Service interruptions or errors</li>
                  <li>Unauthorized access to your data</li>
                  <li>Third-party actions or products</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Our total liability for any claim shall not exceed the amount paid by you for the specific product or service.
                </p>
              </section>

              {/* Privacy */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">11. Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy. 
                  By using our services, you consent to our Privacy Policy.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">12. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting 
                  on our website. Your continued use of our services after changes constitutes acceptance of the modified Terms. 
                  We encourage you to review these Terms periodically.
                </p>
              </section>

              {/* Termination */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">13. Termination</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account and access to our services immediately, without prior notice, 
                  for any reason, including breach of these Terms. Upon termination, your right to use our services will cease immediately.
                </p>
              </section>

              {/* Governing Law */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">14. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising 
                  from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in 
                  [Your City], India.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-dark-brown mb-4">15. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  If you have any questions about these Terms and Conditions, please contact us:
                </p>
                <div className="bg-orange-50 rounded-lg p-5 space-y-2">
                  <p className="text-gray-700"><strong>Email:</strong> <a href="mailto:support@robohatch.com" className="text-primary-orange hover:underline">support@robohatch.com</a></p>
                  <p className="text-gray-700"><strong>Phone:</strong> <a href="tel:+911234567890" className="text-primary-orange hover:underline">+91 123 456 7890</a></p>
                  <p className="text-gray-700"><strong>Address:</strong> ROBOHATCH, [Your Address], India</p>
                </div>
              </section>

              {/* Acceptance */}
              <section className="mb-0">
                <div className="bg-gradient-to-r from-primary-orange/10 to-hover-orange/10 rounded-lg p-6 border-l-4 border-primary-orange">
                  <p className="text-gray-700 leading-relaxed font-medium">
                    By using ROBOHATCH services, you acknowledge that you have read, understood, and agree to be bound by 
                    these Terms and Conditions.
                  </p>
                </div>
              </section>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-gray-200">
              <Link
                href="/"
                className="flex-1 text-center bg-gradient-to-r from-primary-orange to-hover-orange text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all no-underline"
              >
                Back to Home
              </Link>
              <Link
                href="/contact"
                className="flex-1 text-center bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:border-primary-orange hover:text-primary-orange transition-all no-underline"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
