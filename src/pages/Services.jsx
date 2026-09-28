import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import styles from './Services.module.css';
import { CONTACT } from '../config/contact';

const DESIGN_DELIVERABLES = [
  'Equipment layouts',
  'Block diagrams',
  'Conduit and wire-way layouts',
  'Piping isometrics',
  'Gas-extinguishing isometrics and calculations',
  'System diagrams',
  'Wiring schematics',
];

const BRANDS = ['Eaton', 'Cisco', 'Ubiquiti', 'Alcatel-Lucent', 'Avaya', 'Siemon', 'Giganet', 'Hikvision'];

const MAINTENANCE_ITEMS = [
  'Planned preventive maintenance to manufacturer recommendations',
  'Weekly, monthly, quarterly, semi-annual and annual testing and inspection',
  'Emergency call-out',
  'Modifications and extensions',
  'Refilling of portable extinguishers and gas suppression systems',
  'Training',
  'Spares and refurbishment',
  'Calibration',
];

const STEPS = [
  { id: 'step-survey', num: '01', title: 'Survey & Design' },
  { id: 'step-supply', num: '02', title: 'Supply' },
  { id: 'step-installation', num: '03', title: 'Installation & Commissioning' },
  { id: 'step-handover', num: '04', title: 'Handover & Training' },
  { id: 'step-maintenance', num: '05', title: 'Maintenance & Support' },
];

const Services = () => {
  const [active, setActive] = useState(STEPS[0].id);

  // Highlight the step whose section is crossing the upper part of the viewport
  useEffect(() => {
    const sections = STEPS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (sections.length === 0 || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goToStep = (e, id) => {
    e.preventDefault();
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={styles.page}>
      <Breadcrumbs crumbs={[{ label: 'Home', path: '/' }, { label: 'Services', path: '/services' }]} />

      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>From survey to support, one team.</h1>
          <p className={styles.lead}>
            Every Marinc project follows the same five steps, so you always know what happens
            next and who is responsible for it.
          </p>
        </div>
      </section>

      <section className={styles.body}>
        <div className={`${styles.container} ${styles.layout}`}>
          {/* Left: sticky stepper */}
          <nav className={styles.stepper} aria-label="Service steps">
            <ol className={styles.stepList}>
              {STEPS.map((step) => (
                <li key={step.id}>
                  <a
                    href={`#${step.id}`}
                    onClick={(e) => goToStep(e, step.id)}
                    className={`${styles.stepLink} ${active === step.id ? styles.stepActive : ''}`}
                    aria-current={active === step.id ? 'step' : undefined}
                  >
                    <span className={styles.stepNum}>{step.num}</span>
                    <span className={styles.stepName}>{step.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Right: content */}
          <div className={styles.content}>
            <article id="step-survey" className={styles.step}>
              <p className={styles.stepLabel}>01</p>
              <h2 className={styles.stepTitle}>Survey &amp; Design</h2>
              <p className={styles.text}>
                We start by understanding your premises and requirements, then design the
                system in-house so the drawings, calculations and equipment list match what
                will actually be installed.
              </p>
              <div className={styles.monoBlock}>
                <p className={styles.monoHeading}>In-house design deliverables</p>
                <ul className={styles.monoList}>
                  {DESIGN_DELIVERABLES.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>

            <article id="step-supply" className={styles.step}>
              <p className={styles.stepLabel}>02</p>
              <h2 className={styles.stepTitle}>Supply</h2>
              <p className={styles.text}>
                Equipment is supplied through our brand partners, including as an authorized
                Eaton distributor, so what you specify is what arrives on site.
              </p>
              <ul className={styles.chips}>
                {BRANDS.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </article>

            <article id="step-installation" className={styles.step}>
              <p className={styles.stepLabel}>03</p>
              <h2 className={styles.stepTitle}>Installation &amp; Commissioning</h2>
              <p className={styles.text}>
                Most installations are done in-house by Marinc engineers. Each project has a
                dedicated project manager from concept to handover, and every project is
                planned for on-time, on-budget delivery.
              </p>
            </article>

            <article id="step-handover" className={styles.step}>
              <p className={styles.stepLabel}>04</p>
              <h2 className={styles.stepTitle}>Handover &amp; Training</h2>
              <p className={styles.text}>
                Once the system is commissioned, we hand it over and train your team to
                operate it, so it is working and understood on day one.
              </p>
            </article>

            <article id="step-maintenance" className={styles.step}>
              <p className={styles.stepLabel}>05</p>
              <h2 className={styles.stepTitle}>Maintenance &amp; Support</h2>
              <p className={styles.text}>
                Keep the system performing after handover with planned maintenance and
                support from the engineers who know it.
              </p>
              <ul className={styles.checkList}>
                {MAINTENANCE_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className={styles.response}>
                <p className={styles.responseHeading}>Our response commitment</p>
                <div className={styles.responseGrid}>
                  <div className={styles.responseItem}>
                    <span className={styles.bigNum}>1 HR</span>
                    <span className={styles.bigLabel}>Phone response</span>
                  </div>
                  <div className={styles.responseItem}>
                    <span className={styles.bigNum}>24 HRS</span>
                    <span className={styles.bigLabel}>On-site</span>
                  </div>
                </div>
              </div>
            </article>

            <div className={styles.cta}>
              <h2 className={styles.ctaTitle}>Need a survey or a quote?</h2>
              <div className={styles.ctaActions}>
                <Link to="/contact" className="btn btn--primary">
                  Contact us
                </Link>
                <a href={`tel:${CONTACT.phones[0].tel}`} className="btn btn--secondary">
                  Call {CONTACT.phones[0].display}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;