import React from 'react';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './About.module.css';
import AboutOffice from '../assets/AboutOffice.jpeg';
import AboutFire from '../assets/AboutFire.jpeg';
import AboutCabling from '../assets/AboutCabling.jpeg';

const values = [
  { number: '01', title: 'Safety First', text: 'Protecting lives and property is at the heart of everything we do.' },
  { number: '02', title: 'Integrity', text: 'We operate with honesty, transparency, and ethical standards.' },
  { number: '03', title: 'Innovation', text: 'We embrace proven, cost-effective technology suited to real client needs.' },
  { number: '04', title: 'Excellence', text: 'We deliver quality workmanship and dependable after-sales service.' },
  { number: '05', title: 'Customer Focus', text: 'Every solution is designed around what actually works for the client.' },
];

const differentiators = [
  { title: 'Authorized EATON Distributor', text: 'Certified to sell, commission and maintain EATON fire and voice alarm systems.' },
  { title: 'In-House Installation', text: 'Most installations are carried out directly by our own engineers, each project assigned a dedicated project manager from concept to handover.' },
  { title: '24-Hour Response', text: 'A standing call-out procedure with telephonic response within the hour and on-site attendance within 24 hours.' },
  { title: 'Trusted by Established Organizations', text: 'Our work spans hospitality, insurance, mining, and public institutions across Kenya.' },
];

const clients = [
  'Resolution Insurance', 'AAR Insurance', 'DeLaRue', 'Sarova Whitesands',
  'Sarova Woodlands', 'IEBC', 'Base Titanium', 'MasterPower Systems',
];

const techPartners = ['EATON', 'Cisco', 'Alcatel-Lucent', 'Avaya', 'Ubiquiti', 'Siemon', 'D-Link'];

const About = () => {
  return (
    <div className={styles.aboutPage}>
      <Breadcrumbs crumbs={[{ label: 'Home', path: '/' }, { label: 'About Us', path: '/about' }]} />

      {/* Full-bleed image hero */}
      <section className={styles.hero} style={{ backgroundImage: `url(${AboutOffice})` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>About Marinc Systems Ltd</h1>
          <p className={styles.heroSubtitle}>Simplifying Fire, Security & ICT Solutions Across Kenya</p>
        </div>
      </section>

      {/* Single centered intro */}
      <section className={styles.intro}>
        <p className={styles.introText}>
          Established in August 2016, Marinc Systems Ltd is a quality-driven dealer in electricals, IT
          and fire equipment, staffed by professionals with genuine hands-on experience. We design and
          install integrated fire and security systems from initial concept through to final handover,
          backed by dependable after-sales support.
        </p>
      </section>

      {/* Zigzag editorial blocks */}
      <section className={styles.zigzagSection}>
        <div className={styles.zigzagBlock}>
          <div className={styles.zigzagImage}>
            <img src={AboutFire} alt="Fire safety systems installation" />
          </div>
          <div className={styles.zigzagText}>
            <span className={styles.eyebrow}>What We Deliver</span>
            <h2 className={styles.zigzagTitle}>Fire Detection, Security & Connectivity</h2>
            <p className={styles.zigzagBody}>
              As an authorized EATON distributor, we supply, commission and maintain addressable fire
              alarm and voice evacuation systems alongside firefighting equipment. Alongside this, we
              design and install structured cabling, CCTV and IP surveillance, wireless networks, and
              unified communications built on Cisco and Alcatel-Lucent platforms — connecting a building's
              safety systems and its data network under one roof.
            </p>
          </div>
        </div>

        <div className={`${styles.zigzagBlock} ${styles.reverse}`}>
          <div className={styles.zigzagImage}>
            <img src={AboutCabling} alt="Structured cabling and network installation" />
          </div>
          <div className={styles.zigzagText}>
            <span className={styles.eyebrow}>Our Approach</span>
            <h2 className={styles.zigzagTitle}>In-House, Start to Finish</h2>
            <p className={styles.zigzagBody}>
              Most of our installations are carried out directly by our own engineers rather than
              subcontracted out, with every project assigned a dedicated manager from concept to
              handover. Once a system is live, our standard call-out procedure guarantees a telephonic
              response within the hour and an on-site technician within 24 hours — supported by planned
              preventive maintenance, spares, and system refurbishment.
            </p>
          </div>
        </div>

        <div className={styles.zigzagBlock}>
          <div className={styles.zigzagImage}>
            <img src={AboutOffice} alt="Marinc Systems office" />
          </div>
          <div className={styles.zigzagText}>
            <span className={styles.eyebrow}>Our Mission</span>
            <ul className={styles.missionList}>
              <li>Deliver quality, innovative, cost-effective solutions through continuous improvement.</li>
              <li>Ensure customer satisfaction through committed, professional service.</li>
              <li>Exceed expectations on every telecommunications and networking project with the best available technology.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Values — horizontal numbered timeline */}
      <section className={styles.valuesSection}>
        <div className={styles.sectionHeadingCenter}>
          <span className={styles.eyebrow}>Our Values</span>
          <h2 className={styles.sectionTitle}>What Guides Our Work</h2>
        </div>
        <div className={styles.timeline}>
          {values.map((v, idx) => (
            <div key={v.number} className={styles.timelineItem}>
              <span className={styles.timelineNumber}>{v.number}</span>
              <h4 className={styles.timelineTitle}>{v.title}</h4>
              <p className={styles.timelineText}>{v.text}</p>
              {idx < values.length - 1 && <span className={styles.timelineConnector} />}
            </div>
          ))}
        </div>
      </section>

      {/* Differentiators — kept as its own distinct section */}
      <section className={styles.diffSection}>
        <div className={styles.sectionHeadingCenter}>
          <span className={styles.eyebrow}>Why Marinc</span>
          <h2 className={styles.sectionTitle}>What Sets Us Apart</h2>
        </div>
        <div className={styles.diffGrid}>
          {differentiators.map((d) => (
            <div key={d.title} className={styles.diffCard}>
              <h4 className={styles.diffTitle}>{d.title}</h4>
              <p className={styles.diffText}>{d.text}</p>
            </div>
          ))}
        </div>

        <div className={styles.trustStrip}>
          <p className={styles.trustLabel}>Trusted by organizations including</p>
          <div className={styles.pillRow}>
            {clients.map((c) => <span key={c} className={styles.trustPill}>{c}</span>)}
          </div>
          <p className={styles.trustLabel}>Technology partners</p>
          <div className={styles.pillRow}>
            {techPartners.map((t) => <span key={t} className={styles.trustPill}>{t}</span>)}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h3 className={styles.ctaTitle}>Let's Build Something Great Together</h3>
          <p className={styles.ctaText}>
            Whether it's fire safety, security, or connectivity — partner with Marinc Systems for
            solutions designed and supported from concept to handover.
          </p>
          <a href="/contact" className="btn btn--primary">Get in Touch</a>
        </div>
      </section>
    </div>
  );
};

export default About;