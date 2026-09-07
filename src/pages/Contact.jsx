import React, { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './Contact.module.css';
import NairobiImg from '../assets/Nairobi.jpg';
import InstagramIcon from '../assets/Instagram.png';
import LinkedInIcon from '../assets/LinkedIn.png';
import TiktokIcon from '../assets/Tiktok.png';
import FacebookIcon from '../assets/Facebook.png';
import WhatsAppIcon from '../assets/whatsapp.png';
import { FaPhoneAlt, FaEnvelope, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';

const heroStyle = {
  width: '100%',
  height: '260px',
  backgroundImage: `url(${NairobiImg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '2rem',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(24, 28, 32, 0.45)',
  zIndex: 1,
};

const heroTextStyle = {
  position: 'relative',
  zIndex: 2,
  color: '#fff',
  fontSize: '2.5rem',
  fontWeight: 800,
  textShadow: '0 4px 24px rgba(0,0,0,0.25)',
  letterSpacing: '0.04em',
};

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: ''
  });
  
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitStatus({ loading: true, success: false, error: null });
    
    try {
      const response = await fetch(`${API_BASE_URL}/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      // Success!
      setSubmitStatus({ 
        loading: false, 
        success: true, 
        error: null 
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        comment: ''
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(prev => ({ ...prev, success: false }));
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({ 
        loading: false, 
        success: false, 
        error: error.message 
      });
    }
  };

  return (
    <div className={styles.contactPage}>
      <Breadcrumbs crumbs={[{ label: 'Home', path: '/' }, { label: 'Contact Us', path: '/contact' }]} />
      <div style={heroStyle}>
        <div style={overlayStyle}></div>
        <div style={heroTextStyle}>Contact Us</div>
      </div>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.headerText}>
            Visit our store or talk to us on phone, email or social media
          </div>
          <div className={styles.contentGrid}>
            {/* Left Grid: Contact Information */}
            <div className={styles.leftGrid}>
              <div className={styles.infoBlock}>
                <h3 className={styles.infoHeader}>Physical Address:</h3>
                <div className={styles.infoItem}>
                  <FaMapMarkerAlt className={styles.icon} />
                  <div className={styles.infoText}>
                    Shelter house, Dai dai Road, South B, Ground Floor Apartment GF4, Nairobi<br />
                    43322-00100 Nairobi, Kenya
                  </div>
                </div>
              </div>

              <div className={styles.infoBlock}>
                <h3 className={styles.infoHeader}>Email Address:</h3>
                <div className={styles.infoItem}>
                  <FaEnvelope className={styles.icon} />
                  <span className={styles.infoText}>info@edgesystems.co.ke</span>
                </div>
              </div>

              <div className={styles.infoBlock}>
                <h3 className={styles.infoHeader}>Phone Numbers:</h3>
                <div className={styles.infoItem}>
                  <FaPhoneAlt className={styles.icon} />
                  <div className={styles.infoText}>
                    +254721247356<br />
                    +254117320000
                  </div>
                </div>
              </div>

              <div className={styles.infoBlock}>
                <div className={styles.infoItem}>
                  <FaGlobe className={styles.icon} />
                  <a href="http://www.edgesystems.co.ke" target="_blank" rel="noopener noreferrer" className={styles.infoText}>
                    www.edgesystems.co.ke
                  </a>
                </div>
              </div>
            </div>

            {/* Right Grid: Contact Form */}
            <div className={styles.rightGrid}>
              <h3 className={styles.formHeader}>Send us a message</h3>
              
              {/* Success Message */}
              {submitStatus.success && (
                <div className={styles.successMessage}>
                  ✓ Your message has been sent successfully! We'll get back to you soon.
                </div>
              )}
              
              {/* Error Message */}
              {submitStatus.error && (
                <div className={styles.errorMessage}>
                  ✗ {submitStatus.error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.label}>Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                    disabled={submitStatus.loading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.input}
                    required
                    disabled={submitStatus.loading}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="comment" className={styles.label}>Comment</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    className={styles.textarea}
                    rows="5"
                    required
                    disabled={submitStatus.loading}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={submitStatus.loading}
                >
                  {submitStatus.loading ? 'Sending...' : 'Submit'}
                </button>
              </form>

              <div className={styles.socialMedia}>
                <a href="https://www.instagram.com/edge_systems.co.ke?utm_source=qr&igsh=aHpldnhnZnRmYjM3" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <img src={InstagramIcon} alt="Instagram" className={styles.socialIconImg} />
                </a>
                <a href="https://www.facebook.com/edgesystemslimited" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <img src={FacebookIcon} alt="Facebook" className={styles.socialIconImg} />
                </a>
                <a href="https://www.tiktok.com/@edgesystems6?_t=ZM-8yCr3l8iIwn&_r=1" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <img src={TiktokIcon} alt="TikTok" className={styles.socialIconImg} />
                </a>
                <a href="https://www.linkedin.com/in/edge-systems-903b32222?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <img src={LinkedInIcon} alt="LinkedIn" className={styles.socialIconImg} />
                </a>
                <a href="https://wa.me/254117320000" target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
                  <img src={WhatsAppIcon} alt="WhatsApp" className={styles.socialIconImg} />
                </a>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className={styles.mapSection}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7715895126757!2d36.83312637404577!3d-1.3124660356533566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f113986bb27bd%3A0x24556136c93bceca!2sEdge%20Systems%20Limited!5e0!3m2!1sen!2ske!4v1759135166203!5m2!1sen!2ske"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Edge Systems Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;