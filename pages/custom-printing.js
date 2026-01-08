import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function CustomPrinting() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    material: '',
    color: '',
    quantity: '1',
    description: '',
    deliveryOption: 'standard'
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const materials = [
    { value: 'pla', label: 'PLA (Polylactic Acid) - Standard', price: '₹50/gram' },
    { value: 'abs', label: 'ABS (Acrylonitrile Butadiene Styrene) - Durable', price: '₹60/gram' },
    { value: 'petg', label: 'PETG - Strong & Flexible', price: '₹70/gram' },
    { value: 'tpu', label: 'TPU (Flexible) - Rubber-like', price: '₹100/gram' },
    { value: 'nylon', label: 'Nylon - High Strength', price: '₹120/gram' },
    { value: 'resin', label: 'Resin - High Detail', price: '₹200/gram' }
  ];

  const colors = [
    'White', 'Black', 'Red', 'Blue', 'Green', 'Yellow', 
    'Orange', 'Purple', 'Pink', 'Gray', 'Brown', 'Transparent'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Form Data:', formData);
    console.log('Uploaded File:', uploadedFile);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        material: '',
        color: '',
        quantity: '1',
        description: '',
        deliveryOption: 'standard'
      });
      setUploadedFile(null);
    }, 3000);
  };

  return (
    <>
      <Head>
        <title>Custom 3D Printing - ROBOHATCH</title>
        <meta name="description" content="Submit your custom 3D printing request" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <section className="custom-printing-page">
        <div className="container">
          <div className="page-header">
            <i className="fas fa-print header-icon"></i>
            <h1>Custom 3D Printing Request</h1>
            <p>Upload your design and let us bring your ideas to life with precision 3D printing</p>
          </div>

          <div className="custom-printing-layout">
            {/* Form Section */}
            <div className="printing-form-container">
              <form onSubmit={handleSubmit} className="printing-form">
                {/* Personal Information */}
                <div className="form-section">
                  <h3><i className="fas fa-user"></i> Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                {/* Design Upload */}
                <div className="form-section">
                  <h3><i className="fas fa-upload"></i> Upload Your Design</h3>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".stl,.obj,.3mf,.jpg,.jpeg,.png,.pdf"
                      onChange={handleFileUpload}
                      required
                    />
                    <label htmlFor="file-upload" className="file-upload-label">
                      {uploadedFile ? (
                        <>
                          <i className="fas fa-check-circle"></i>
                          <span>{uploadedFile.name}</span>
                          <small>Click to change file</small>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-cloud-upload-alt"></i>
                          <span>Click to upload or drag & drop</span>
                          <small>Supported: STL, OBJ, 3MF, JPG, PNG, PDF</small>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Material & Color */}
                <div className="form-section">
                  <h3><i className="fas fa-layer-group"></i> Material & Specifications</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="material">Material Type *</label>
                      <select
                        id="material"
                        name="material"
                        value={formData.material}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select material</option>
                        {materials.map((mat) => (
                          <option key={mat.value} value={mat.value}>
                            {mat.label} - {mat.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="color">Color *</label>
                      <select
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select color</option>
                        {colors.map((color) => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="quantity">Quantity *</label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        max="100"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="deliveryOption">Delivery Speed *</label>
                      <select
                        id="deliveryOption"
                        name="deliveryOption"
                        value={formData.deliveryOption}
                        onChange={handleChange}
                        required
                      >
                        <option value="standard">Standard (7-10 days) - Free</option>
                        <option value="express">Express (3-5 days) - ₹200</option>
                        <option value="urgent">Urgent (1-2 days) - ₹500</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="form-section">
                  <h3><i className="fas fa-comment-dots"></i> Additional Details</h3>
                  <div className="form-group">
                    <label htmlFor="description">Project Description (Optional)</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Tell us more about your project, specific requirements, dimensions, or any special instructions..."
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <button type="submit" className="submit-btn" disabled={submitted}>
                  {submitted ? (
                    <>
                      <i className="fas fa-check-circle"></i>
                      Request Submitted!
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info Sidebar */}
            <div className="info-sidebar">
              <div className="info-card">
                <i className="fas fa-info-circle"></i>
                <h4>How It Works</h4>
                <ol>
                  <li>Fill out the form with your details</li>
                  <li>Upload your 3D model or design image</li>
                  <li>Select material and specifications</li>
                  <li>Submit your request</li>
                  <li>We'll review and send you a quote</li>
                  <li>Approve and we'll start printing!</li>
                </ol>
              </div>

              <div className="info-card">
                <i className="fas fa-clock"></i>
                <h4>Turnaround Time</h4>
                <ul>
                  <li><strong>Standard:</strong> 7-10 business days</li>
                  <li><strong>Express:</strong> 3-5 business days</li>
                  <li><strong>Urgent:</strong> 1-2 business days</li>
                </ul>
              </div>

              <div className="info-card">
                <i className="fas fa-dollar-sign"></i>
                <h4>Pricing</h4>
                <p>Final price depends on:</p>
                <ul>
                  <li>Model size & complexity</li>
                  <li>Material type</li>
                  <li>Quantity ordered</li>
                  <li>Delivery speed</li>
                </ul>
                <p className="note">You'll receive a detailed quote within 24 hours</p>
              </div>

              <div className="info-card">
                <i className="fas fa-headset"></i>
                <h4>Need Help?</h4>
                <p>Contact our team:</p>
                <p><strong>Email:</strong> support@robohatch.com</p>
                <p><strong>Phone:</strong> +91 XXXXX XXXXX</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
