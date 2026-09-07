import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './About.module.css';
import AboutOffice from '../assets/AboutOffice.jpeg';
import AboutCamera from '../assets/AboutCamera.jpeg';
import AboutFire from '../assets/AboutFire.jpeg';
import AboutCabling from '../assets/AboutCabling.jpeg';

const About = () => {
  return (
    <div className={styles.aboutPage}>
      <Breadcrumbs crumbs={[{ label: 'Home', path: '/' }, { label: 'About Us', path: '/about' }]} />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            About <span className={styles.highlight}>Edge Systems Ltd</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Kenya's Trusted Partner in Fire Safety & Integrated Solutions
          </p>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className={styles.whoWeAre}>
        <div className={styles.container}>
          <div className={styles.contentSplit}>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>Who We Are</h2>
              <p className={styles.bodyText}>
                <strong>Edge Systems Ltd</strong> is a leading Kenyan company specializing primarily in fire safety systems and solutions. Our core strength lies in delivering comprehensive Eaton fire alarm and detection systems, including advanced fire panels, detectors, alarms, and compliance-driven fire protection services.
              </p>
              <p className={styles.bodyText}>
                We play a vital role in safeguarding businesses, institutions, and properties across Kenya by providing end-to-end fire safety solutions from initial design and professional installation to ongoing maintenance and emergency response readiness.
              </p>
            </div>
            <div className={styles.imageContent}>
              <img src={AboutOffice} alt="Edge Systems Office" className={styles.featuredImage} />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className={styles.missionVision}>
        <div className={styles.container}>
          <div className={styles.mvGrid}>
            <div className={styles.mvCard}>
              <div className={styles.mvIcon}>🎯</div>
              <h3 className={styles.mvTitle}>Our Mission</h3>
              <p className={styles.mvText}>
                To save lives, protect property, and create safer communities through the delivery of modern, reliable fire safety systems. We are committed to ensuring every client receives cutting-edge solutions that meet international standards and local compliance requirements.
              </p>
            </div>
            <div className={styles.mvCard}>
              <div className={styles.mvIcon}>🔥</div>
              <h3 className={styles.mvTitle}>Our Vision</h3>
              <p className={styles.mvText}>
                To be Kenya's most trusted fire safety and integrated solutions partner, recognized for our unwavering commitment to excellence, innovation, and customer-focused service across all sectors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className={styles.values}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitleCenter}>Our Core Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <div className={styles.valueNumber}>01</div>
              <h4 className={styles.valueTitle}>Safety First</h4>
              <p className={styles.valueText}>Protecting lives and property is at the heart of everything we do.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueNumber}>02</div>
              <h4 className={styles.valueTitle}>Integrity</h4>
              <p className={styles.valueText}>We operate with honesty, transparency, and ethical standards.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueNumber}>03</div>
              <h4 className={styles.valueTitle}>Innovation</h4>
              <p className={styles.valueText}>We embrace cutting-edge technology and forward-thinking solutions.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueNumber}>04</div>
              <h4 className={styles.valueTitle}>Excellence</h4>
              <p className={styles.valueText}>We deliver quality workmanship and exceptional service every time.</p>
            </div>
            <div className={styles.valueItem}>
              <div className={styles.valueNumber}>05</div>
              <h4 className={styles.valueTitle}>Customer Focus</h4>
              <p className={styles.valueText}>Your safety needs and satisfaction drive our commitment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Expertise */}
      <section className={styles.expertise}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitleCenter}>Our Expertise</h2>
          <p className={styles.expertiseIntro}>
            At Edge Systems Ltd, fire safety is our primary specialization. We complement this with strategic ICT and energy solutions to create safer, smarter, and more efficient environments.
          </p>
          
          {/* Primary Expertise - Fire Safety */}
          <div className={styles.primaryExpertise}>
            <div className={styles.primaryContent}>
              <span className={styles.badge}>Core Specialty</span>
              <h3 className={styles.primaryTitle}>Fire Safety Systems</h3>
              <ul className={styles.expertiseList}>
                <li>Advanced Fire Alarm & Detection Systems</li>
                <li>Fire Panels, Detectors & Sounders</li>
                <li>Emergency Response Systems</li>
                <li>Compliance & Safety Audits</li>
                <li>Installation, Maintenance & Support</li>
              </ul>
            </div>
            <div className={styles.primaryImage}>
              <img src={AboutFire} alt="Fire Safety Systems" />
            </div>
          </div>

          {/* Supporting Services */}
          <div className={styles.supportingServices}>
            <div className={styles.serviceCard}>
              <img src={AboutCamera} alt="CCTV Surveillance" className={styles.serviceImage} />
              <div className={styles.serviceContent}>
                <h4 className={styles.serviceTitle}>CCTV & IP Surveillance</h4>
                <p className={styles.serviceDesc}>Enhanced security monitoring to complement fire safety measures.</p>
              </div>
            </div>
            <div className={styles.serviceCard}>
              <img src={AboutCabling} alt="Structured Cabling" className={styles.serviceImage} />
              <div className={styles.serviceContent}>
                <h4 className={styles.serviceTitle}>Structured Cabling & VoIP</h4>
                <p className={styles.serviceDesc}>Robust communication infrastructure for seamless connectivity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className={styles.differentiators}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitleCenter}>What Sets Us Apart</h2>
          <div className={styles.differentiatorGrid}>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>🌍</div>
              <h4 className={styles.diffTitle}>Global Partnerships</h4>
              <p className={styles.diffText}>Strategic alliances with leading international fire safety technology providers.</p>
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>👨‍🔧</div>
              <h4 className={styles.diffTitle}>Certified Technicians</h4>
              <p className={styles.diffText}>Highly trained and certified professionals ensuring quality installations.</p>
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>✅</div>
              <h4 className={styles.diffTitle}>Compliance Commitment</h4>
              <p className={styles.diffText}>All solutions meet local regulations and international fire safety standards.</p>
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>🤝</div>
              <h4 className={styles.diffTitle}>Customer Trust</h4>
              <p className={styles.diffText}>Building lasting relationships through reliability, transparency, and excellence.</p>
            </div>
            <div className={styles.diffCard}>
              <div className={styles.diffIcon}>⚡</div>
              <h4 className={styles.diffTitle}>Rapid Response</h4>
              <p className={styles.diffText}>24/7 support and emergency response capabilities when you need us most.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h3 className={styles.ctaTitle}>Ready to Protect What Matters Most?</h3>
          <p className={styles.ctaText}>
            At Edge Systems Ltd, we don't just install fire safety systems, we create peace of mind. Partner with us to safeguard your business, property, and people.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;