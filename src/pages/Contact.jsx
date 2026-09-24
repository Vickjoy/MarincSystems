import { API_BASE_URL } from '../config/api';
import React, { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './Contact.module.css';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa6';

const API_URL = `${API_BASE_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    comment: '',
  });

  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, success: false, error: null });

    try {
      const response = await fetch(`${API_URL}/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Note: `subject` is sent along with the rest of the payload. If the
        // backend serializer doesn't yet accept it, it will simply be ignored
        // by DRF rather than causing an error — flag to wire it up server-side
        // when ready.
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', email: '', subject: '', comment: '' });

      setTimeout(() => {
        setSubmitStatus((prev) => ({ ...prev, success: false }));
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({ loading: false, success: false, error: error.message });
    }
  };

  return (
    <div className={styles.contactPage}>
      <Breadcrumbs crumbs={[{ label: 'Home', path: '/' }, { label: 'Contact Us', path: '/contact' }]} />

      {/* Map-first hero */}
      <div className={styles.mapHero}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7714067757215!2d36.83565!3d-1.3125806!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f11003bf54ff9%3A0xe6c55eb36a15217!2sMarinc%20system%20ltd!5e0!3m2!1sen!2ske!4v1789645792222!5m2!1sen!2ske"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Marinc Systems Location"
        />
      </div>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Get in Touch</h1>
            <p className={styles.pageSubtitle}>Visit us, call, email, or send a message below</p>
          </div>

          <div className={styles.contentGrid}>
            {/* Form — wider, left */}
            <div className={styles.formColumn}>
              <h2 className={styles.formHeader}>Send us a message</h2>

              {submitStatus.success && (
                <div className={styles.successMessage}>
                  ✓ Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              {submitStatus.error && (
                <div className={styles.errorMessage}>✗ {submitStatus.error}</div>
              )}

              <form onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formRow}>
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      disabled={submitStatus.loading}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={submitStatus.loading}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g. Fire alarm installation quote"
                    disabled={submitStatus.loading}
                  />
                </div>

                <div className="field">
                  <label htmlFor="comment">Message</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows="5"
                    required
                    disabled={submitStatus.loading}
                  />
                </div>

                <button type="submit" className="btn btn--primary" disabled={submitStatus.loading}>
                  {submitStatus.loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Info cards — narrower, right */}
            <div className={styles.infoColumn}>
              <div className={styles.infoCard}>
                <FaMapMarkerAlt className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoLabel}>Mombasa (HQ)</h3>
                  <p className={styles.infoText}>
                    Said Bin Seif Building, Meru Road, Opposite Fantasy Restaurant
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <FaMapMarkerAlt className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoLabel}>Nairobi</h3>
                  <p className={styles.infoText}>
                    Shelter House, Dai Dai Road, South B, Ground Floor Apartment GF4
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <FaPhoneAlt className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoLabel}>Phone</h3>
                  <p className={styles.infoText}>+254 721 247 356<br />+254 113 808 073</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <FaEnvelope className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoLabel}>Email</h3>
                  <p className={styles.infoText}>info@marincsystems.co.ke</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <FaClock className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoLabel}>Business Hours</h3>
                  <p className={styles.infoText}>Mon–Fri, 8am–5pm<br />24/7 emergency call-out</p>
                </div>
              </div>

              <div className={styles.socialRow}>
                <a href="https://www.facebook.com/share/1EdzJithHP/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FaFacebookF />
                </a>
                <a href="https://www.instagram.com/marincsystemske?stkn=MTE5ODJxcXlmaHcxMw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href="https://www.tiktok.com/@marincsystemske?_r=1&_t=ZS-99ntiuRObX5" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <FaTiktok />
                </a>
                <a href="https://wa.me/254113808073" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <FaWhatsapp />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;