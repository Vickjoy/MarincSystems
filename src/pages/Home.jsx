import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import PopularProductsCarousel from '../components/PopularProductsCarousel';
import { fetchHeroBanners } from '../utils/api';

import EatonLogo from '../assets/Eatonn.webp';
import AlcatelLogo from '../assets/Alcatel.webp';
import AvayaLogo from '../assets/Avaya.webp';
import CiscoLogo from '../assets/Cisco.webp';
import SiemonLogo from '../assets/Siemon.webp';
import UbiquitiLogo from '../assets/Ubiquiti.webp';
import GiganetLogo from '../assets/giganet.jpeg';
import HikvisionLogo from '../assets/hikvision.png';

import FireImage from '../assets/Fire.png';
import EImage from '../assets/E.png';
import FImage from '../assets/F.png';
import UbiquitiProductImage from '../assets/ubiquiti.png';
import CiscoProductImage from '../assets/Cisco.png';
import GImage from '../assets/G.png';
import AImage from '../assets/A.png';
import BImage from '../assets/B.png';

import AlarmImage from '../assets/xDetect.jpg';
import VoIPImage from '../assets/VoIP.jpg';
import IPImage from '../assets/IP.jpg';
import StructuredCablingImage from '../assets/Structured.jpg';

import WhyImage from '../assets/WHY.jpeg';

/* ---------- Static data (module scope = stable references) ---------- */

const permanentSlides = [
  {
    id: 1,
    displayMode: 'standard',
    subtitle: 'Protect what matters most',
    title: 'Advanced Fire Alarm & Detection Systems',
    description:
      'Detect threats early with reliable fire panels, detectors, alarms, and emergency systems designed for fast response and dependable protection.',
    images: [FireImage, EImage, FImage],
    link: '/category/addressable-fire-alarm-detection-systems',
    buttonText: 'Explore fire safety',
  },
  {
    id: 2,
    displayMode: 'standard',
    subtitle: 'Connect. Communicate. Perform.',
    title: 'Reliable Network & Connectivity Solutions',
    description:
      'Build a faster, more secure network with enterprise-grade access points, switches, and connectivity solutions designed to keep your business connected.',
    images: [UbiquitiProductImage, CiscoProductImage, GImage],
    link: '/category/ubiquiti-products',
    buttonText: 'Explore networking',
  },
  {
    id: 3,
    displayMode: 'standard',
    subtitle: 'Infrastructure built for the future',
    title: 'Structured Cabling & Fiber Solutions',
    description:
      'Create a dependable network foundation with quality Cat6, Cat6A, and fiber optic cabling engineered for speed, stability, and scalability.',
    images: [AImage, BImage],
    link: '/category/giganet-products',
    buttonText: 'Explore cabling',
  },
];

const brands = [
  { logo: AlcatelLogo, name: 'Alcatel', link: 'https://www.al-enterprise.com/' },
  { logo: AvayaLogo, name: 'Avaya', link: 'https://www.avaya.com/' },
  { logo: CiscoLogo, name: 'Cisco', link: 'https://www.cisco.com/' },
  { logo: EatonLogo, name: 'Eaton', link: 'https://www.eaton.com/' },
  { logo: SiemonLogo, name: 'Siemon', link: 'https://www.siemon.com/' },
  { logo: UbiquitiLogo, name: 'Ubiquiti', link: 'https://www.ui.com/' },
  { logo: GiganetLogo, name: 'Giganet', link: 'https://www.giganet.com.eg/' },
  { logo: HikvisionLogo, name: 'Hikvision', link: 'https://www.hikvision.com/' },
];
// Two copies so the -50% marquee loop is seamless
const marqueeBrands = [...brands, ...brands];

const services = [
  {
    id: 1,
    image: AlarmImage,
    title: 'Fire Alarm & Detection',
    description:
      'Fire safety systems with smoke detectors, heat sensors, and panels. Ensure fast detection, real-time alerts, regulatory compliance, and secure operations.',
    link: '/category/addressable-fire-alarm-detection-systems',
  },
  {
    id: 2,
    image: StructuredCablingImage,
    title: 'Structured Cabling',
    description:
      'Fiber optics, Cat6/Cat6a cabling, and management systems. Enable seamless communication, high-speed transmission, scalability, and reduced downtime for businesses.',
    link: '/category/giganet-products',
  },
  {
    id: 3,
    image: IPImage,
    title: 'CCTV / IP Camera',
    description:
      'HD IP cameras with night vision, motion detection, and cloud storage. Provide continuous monitoring, analytics, and asset protection around-the-clock.',
    link: '/category/hikvision',
  },
  {
    id: 4,
    image: VoIPImage,
    title: 'VoIP & Telephony',
    description:
      'VoIP systems with call routing, conferencing, voicemail-to-email, and mobile integration. Improve collaboration, cut costs, and scale communication efficiently.',
    link: '/category/alcatel-lucent-products',
  },
];

const stats = [
  { number: '10+', label: 'Years experience' },
  { number: '500+', label: 'Projects delivered' },
  { number: String(brands.length), label: 'Trusted brand partners' },
  { number: '100%', label: 'Customer commitment' },
];

const whyChoosePoints = [
  'Authorized Eaton Distributor — certified partnership with globally trusted brands',
  'Quality Products — we deliver only premium solutions that meet the highest industry standards',
  'Certified Technicians — professional installation and support services guaranteed',
  'Competitive Pricing — best value solutions without compromising on quality',
];

const HERO_INTRO_MS = 1800;
const SLIDE_MS = 6000;
const FADE_MS = 300;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ---------- Hooks / small components ---------- */

const useScrollReveal = (enabled, visibleClass) => {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll('[data-reveal]');

    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add(visibleClass));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(visibleClass);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled, visibleClass]);

  return rootRef;
};

const HeroDots = ({ count, current, onSelect }) =>
  Array.from({ length: count }).map((_, index) => (
    <button
      key={index}
      type="button"
      onClick={() => onSelect(index)}
      className={`${styles.heroDot} ${index === current ? styles.heroDotActive : ''}`}
      aria-label={`Go to slide ${index + 1}`}
      aria-current={index === current ? 'true' : undefined}
    />
  ));

/* ---------- Page ---------- */

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  // True only right after load; afterwards the entrance classes are removed so
  // slide rotation never replays the intro animation.
  const [introActive, setIntroActive] = useState(true);
  const fadeTimer = useRef(null);

  const revealRootRef = useScrollReveal(!loading, styles.revealVisible);

  useEffect(() => {
    let cancelled = false;

    const loadBanners = async () => {
      try {
        const data = await fetchHeroBanners(); // always an array
        const promotionalSlides = data.map((banner) => ({
          id: `promo-${banner.id}`,
          displayMode: banner.display_mode,
          posterImage: banner.poster_image,
          posterLink: banner.poster_link,
          subtitle: banner.subtitle,
          title: banner.title,
          description: banner.description,
          images: Array.isArray(banner.images) ? banner.images : [],
          link: banner.button_link,
          buttonText: banner.button_text || 'Explore products',
        }));
        if (!cancelled) setSlides([...promotionalSlides, ...permanentSlides]);
      } catch (error) {
        console.error('Error fetching hero banners:', error);
        if (!cancelled) setSlides(permanentSlides);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadBanners();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading) return undefined;
    const timer = setTimeout(() => setIntroActive(false), HERO_INTRO_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  // Auto-rotate. Depends on currentSlide so a manual change restarts the timer
  // instead of being immediately followed by an automatic advance.
  useEffect(() => {
    if (slides.length < 2 || prefersReducedMotion()) return undefined;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_MS);
    return () => clearInterval(interval);
  }, [slides.length, currentSlide]);

  useEffect(() => () => clearTimeout(fadeTimer.current), []);

  const handleSlideChange = useCallback(
    (index) => {
      if (index === currentSlide) return;
      setIsTransitioning(true);
      clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, FADE_MS);
    },
    [currentSlide]
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer} role="status">
        <div className={styles.spinner} />
        <p>Loading…</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide] || permanentSlides[0];
  const currentImages = currentSlideData.images || [];

  const introClass = (variant = '') => (introActive ? `${styles.introItem} ${variant}` : '');
  const introStyle = (delayMs) => (introActive ? { '--intro-delay': `${delayMs}ms` } : undefined);

  const imagesGridClass = `${styles.heroImagesGrid} ${
    currentImages.length === 3 ? styles.threeImages : currentImages.length === 2 ? styles.twoImages : ''
  }`;

  const renderHeroImages = (delay) => (
    <div
      className={`${styles.heroImageWrapper} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}
    >
      <div className={`${imagesGridClass} ${introClass(styles.introImages)}`} style={introStyle(delay)}>
        {currentImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={idx === 0 ? currentSlideData.title : ''}
            className={styles.heroImage}
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>
    </div>
  );

  const goTo = (link) => () => navigate(link);

  const posterImg = (
    <img
      src={currentSlideData.posterImage}
      alt={currentSlideData.title || 'Promotional poster'}
      className={`${styles.heroPosterImage} ${introClass(styles.introPoster)}`}
      style={introStyle(0)}
    />
  );

  return (
    <div ref={revealRootRef}>
      {/* Hero */}
      <section className={styles.heroSection} aria-roledescription="carousel" aria-label="Featured">
        {currentSlideData.displayMode === 'poster' ? (
          <div className={styles.heroPosterContainer}>
            {currentSlideData.posterLink ? (
              <a href={currentSlideData.posterLink} className={styles.heroPosterLink}>{posterImg}</a>
            ) : (
              posterImg
            )}
            <div className={styles.heroPosterNavigation}>
              <HeroDots count={slides.length} current={currentSlide} onSelect={handleSlideChange} />
            </div>
          </div>
        ) : (
          <div className={styles.heroContainer}>
            {/* Desktop */}
            <div className={styles.heroContent}>
              <p className={`label-mono ${styles.heroSubtitle} ${introClass()}`} style={introStyle(100)}>
                {currentSlideData.subtitle}
              </p>

              <h1 className={`${styles.heroTitle} ${introClass(styles.introTitle)}`} style={introStyle(220)}>
                {currentSlideData.title}
              </h1>

              <p className={`${styles.heroDescription} ${introClass()}`} style={introStyle(340)}>
                {currentSlideData.description}
              </p>

              <div className={`${styles.heroButtons} ${introClass(styles.introButtons)}`} style={introStyle(460)}>
                <button type="button" className="btn btn--primary" onClick={goTo(currentSlideData.link)}>
                  {currentSlideData.buttonText}
                  <span className="btn__arrow" aria-hidden="true">→</span>
                </button>
                <Link to="/contact" className="btn btn--secondary">Get a quote</Link>
              </div>

              <div className={`${styles.heroNavigation} ${introClass(styles.introButtons)}`} style={introStyle(560)}>
                <HeroDots count={slides.length} current={currentSlide} onSelect={handleSlideChange} />
              </div>
            </div>

            <div className={styles.heroImageContainer}>{renderHeroImages(200)}</div>

            {/* Mobile */}
            <div className={styles.heroMobileLayout}>
              <div className={styles.heroMobileImages}>{renderHeroImages(80)}</div>

              <button
                type="button"
                className={`btn btn--primary ${introClass(styles.introButtons)}`}
                style={introStyle(200)}
                onClick={goTo(currentSlideData.link)}
              >
                {currentSlideData.buttonText}
                <span className="btn__arrow" aria-hidden="true">→</span>
              </button>

              <div className={styles.heroMobileContent}>
                <p className={`label-mono ${styles.heroSubtitle} ${introClass()}`} style={introStyle(280)}>
                  {currentSlideData.subtitle}
                </p>
                <h2 className={`${styles.heroTitle} ${introClass(styles.introTitle)}`} style={introStyle(360)}>
                  {currentSlideData.title}
                </h2>
                <p className={`${styles.heroDescription} ${introClass()}`} style={introStyle(440)}>
                  {currentSlideData.description}
                </p>
              </div>

              <div className={`${styles.heroMobileNavigation} ${introClass(styles.introButtons)}`} style={introStyle(520)}>
                <HeroDots count={slides.length} current={currentSlide} onSelect={handleSlideChange} />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Partner brands */}
      <section className={styles.partnersSection} aria-label="Brand partners">
        <div className={`${styles.partnersContainer} ${styles.reveal} ${styles.revealSoft}`} data-reveal>
          <div className={styles.sliderWrapper}>
            <div className={styles.sliderTrack}>
              {marqueeBrands.map((brand, index) => {
                const isClone = index >= brands.length;
                return (
                  <a
                    key={index}
                    href={brand.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.partnerLogoLink}
                    aria-hidden={isClone || undefined}
                    tabIndex={isClone ? -1 : undefined}
                  >
                    <img
                      src={brand.logo}
                      alt={isClone ? '' : brand.name}
                      className={styles.partnerLogo}
                      loading="lazy"
                      decoding="async"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statSection} aria-label="Marinc in numbers">
        <div className={styles.statContainer}>
          {stats.map((stat) => (
            <div key={stat.label} className={`${styles.statItem} ${styles.reveal} ${styles.revealStat}`} data-reveal>
              <span className={styles.statNumber}>{stat.number}</span>
              <span className={`label-mono ${styles.statLabel}`}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesContainer}>
          <div className={styles.sectionHeading} data-reveal>
            <span className={`label-mono ${styles.eyebrow} ${styles.revealChild} ${styles.revealHeading}`}>
              What we offer
            </span>
            <h2 className={`${styles.servicesTitle} ${styles.revealChild} ${styles.revealHeading}`}>
              Our services
            </h2>
          </div>

          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.id} className={`${styles.reveal} ${styles.revealService}`} data-reveal>
                <Link to={service.link} className={styles.serviceCard}>
                  <div className={styles.serviceImageWrapper}>
                    <img
                      src={service.image}
                      alt=""
                      className={styles.serviceImage}
                      loading="lazy"
                      decoding="async"
                      width={400}
                      height={300}
                    />
                  </div>
                  <div className={styles.serviceContent}>
                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                    <p className={styles.serviceDescription}>{service.description}</p>
                    <span className={`label-mono ${styles.serviceMore}`}>
                      Browse products <span className={styles.serviceArrow} aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular products */}
      <div className={`${styles.reveal} ${styles.revealSoft}`} data-reveal>
        <PopularProductsCarousel />
      </div>

      {/* Why Marinc */}
      <section className={styles.whySection}>
        <div className={styles.whyContainer} data-reveal>
          <div className={`${styles.whyText} ${styles.revealChild} ${styles.fromLeft}`}>
            <span className={`label-mono ${styles.eyebrow}`}>Why Marinc</span>
            <h2 className={styles.whyTitle}>Built on trust, backed by expertise</h2>

            <ul className={styles.whyList}>
              {whyChoosePoints.map((point, index) => (
                <li
                  key={point}
                  className={`${styles.whyItem} ${styles.revealChild} ${styles.revealItemUp}`}
                  style={{ '--reveal-delay': `${300 + index * 120}ms` }}
                >
                  <span className={styles.whyCheck} aria-hidden="true">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.whyImageWrapper} ${styles.revealChild} ${styles.fromRight}`}>
            <img
              src={WhyImage}
              alt="Marinc Systems team at work"
              className={styles.whyImage}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;