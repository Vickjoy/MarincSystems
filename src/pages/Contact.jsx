import React, { useState } from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './Contact.module.css';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa6';
import { CONTACT } from '../config/contact';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    comment: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const lines = [
      `Hello Marinc Systems,`,
      ``,
      `Name: ${formData.name}`,
      formData.email ? `Email: ${formData.email}` : null,
      formData.subject ? `Subject: ${formData.subject}` : null,
      ``,
      formData.comment,
    ].filter((line) => line !== null);

    const message = encodeURIComponent(lines.join('\n'));
    window.open(`${CONTACT.whatsappUrl}?text=${message}`, '_blank', 'noopener,noreferrer');

    setFormData({ name: '', email: '', subject: '', comment: '' });
  };

  return (
    <div className={styles.contactPage}>
      <Breadcrumbs crumbs={[{ label: 'Home', path: '/' }, { label: 'Contact Us', path: '/contact' }]} />

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.headerText}>
            <h1 className={styles.pageTitle}>Get in Touch</h1>
            <p className={styles.pageSubtitle}>Visit us, call, or leave a message on WhatsApp</p>
          </div>

          <div className={styles.contentGrid}>
            {/* Info — left */}
            <div className={styles.infoColumn}>
              <h2 className={styles.columnHeader}>Contact details</h2>

              <div className={styles.infoCard}>
                <FaMapMarkerAlt className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoLabel}>Mombasa Office</h3>
                  <p className={styles.infoText}>
                    Said Bin Seif Building, Meru Road, Opposite Fantasy Restaurant
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <FaPhoneAlt className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoLabel}>Phone</h3>
                  <p className={styles.infoText}>
                    {CONTACT.phones.map((p, i) => (
                      <React.Fragment key={p.tel}>
                        <a href={`tel:${p.tel}`}>{p.intl}</a>
                        {i < CONTACT.phones.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <FaWhatsapp className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoLabel}>WhatsApp</h3>
                  <p className={styles.infoText}>
                    <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
                      {CONTACT.phones[0].intl}
                    </a>
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <FaEnvelope className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoLabel}>Email</h3>
                  <p className={styles.infoText}>
                    <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  </p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <FaClock className={styles.infoIcon} />
                <div>
                  <h3 className={styles.infoLabel}>Business Hours</h3>
                  <p className={styles.infoText}>Mon–Fri, 8am–5pm</p>
                </div>
              </div>

              <div className={styles.socialRow}>
                <a href={CONTACT.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FaFacebookF />
                </a>
                <a href={CONTACT.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href={CONTACT.social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <FaTiktok />
                </a>
                <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <FaWhatsapp />
                </a>
              </div>
            </div>

            {/* Form — right, opens WhatsApp */}
            <div className={styles.formColumn}>
              <h2 className={styles.formHeader}>Leave a comment</h2>
              <p className={styles.formHint}>
                Fill in the form and we’ll open WhatsApp with your message ready to send.
              </p>

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
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email (optional)</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
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
                  />
                </div>

                <button type="submit" className="btn btn--primary">
                  Send via WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.mapHero}>
        <iframe
          src="https://maps.google.com/maps?q=Said+Bin+Seif+Building+Meru+Road+Mombasa&t=&z=16&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Marinc Systems Mombasa HQ"
        />
      </div>
    </div>
  );
};

export default Contact;
