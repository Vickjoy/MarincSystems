import { API_BASE_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import styles from './Home.module.css';
import PopularProductsCarousel from '../components/PopularProductsCarousel';
import EatonLogo from '../assets/Eatonn.webp';
import AlcatelLogo from '../assets/Alcatel.webp';
import AvayaLogo from '../assets/Avaya.webp';
import CiscoLogo from '../assets/Cisco.webp';
import SiemonLogo from '../assets/Siemon.webp';
import UbiquitiLogo from '../assets/Ubiquiti.webp';
import GiganetLogo from '../assets/giganet.jpeg';
import HikvisionLogo from '../assets/hikvision.png';

// Hero images
import FireImage from '../assets/Fire.png';
import EImage from '../assets/E.png';
import FImage from '../assets/F.png';
import UbiquitiProductImage from '../assets/ubiquiti.png';
import CiscoProductImage from '../assets/Cisco.png';
import GImage from '../assets/G.png';
import AImage from '../assets/A.png';
import BImage from '../assets/B.png';

// Service images
import FireAlarmImage from '../assets/FireAlarm.jpeg';
import SolarImage from '../assets/Solar.jpeg';
import VoIPImage from '../assets/VoIP.jpeg';
import IPImage from '../assets/IP.jpeg';
import StructuredCablingImage from '../assets/StructuredCabling.jpeg';

// "Why Marinc" image (reuses an existing office/service image — swap for a dedicated
// asset later if you have one; WHY.jpg from the old parallax section works fine here)
import WhyImage from '../assets/WHY.jpg';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  const permanentSlides = [
    {
      id: 1,
      displayMode: 'standard',
      subtitle: 'Protect What Matters Most',
      title: 'Advanced Fire Alarm & Detection Systems',
      description: 'Reliable fire panels, detectors, and alarms designed for fast detection, instant alerts, and full safety control ensuring complete fire protection and compliance.',
      images: [FireImage, EImage, FImage],
      link: '/category/addressable-fire-alarm-detection-systems',
      bgClass: 'heroSlide1',
      buttonText: 'Explore Products',
    },
    {
      id: 2,
      displayMode: 'standard',
      subtitle: 'Power Your Digital Infrastructure',
      title: 'Enterprise Networking Solutions',
      description: 'High-performance access points, routers, and switches built for secure, scalable, and reliable connectivity. Designed to support seamless communication and business continuity.',
      images: [UbiquitiProductImage, CiscoProductImage, GImage],
      link: '/category/ubiquiti-products',
      bgClass: 'heroSlide2',
      buttonText: 'Explore Products',
    },
    {
      id: 3,
      displayMode: 'standard',
      subtitle: 'Built for Performance & Reliability',
      title: 'Structured Cabling Infrastructure',
      description: 'Certified Cat6, Cat6a, and fiber optic cabling systems engineered for maximum speed, stability, and scalability ensuring your network is future-ready and dependable.',
      images: [AImage, BImage],
      link: '/category/giganet-products',
      bgClass: 'heroSlide3',
      buttonText: 'Explore Products',
    },
  ];

  const services = [
    {
      id: 1,
      image: FireAlarmImage,
      title: 'Fire Alarm & Detection',
      description: 'Fire safety systems with smoke detectors, heat sensors, and panels. Ensure fast detection, real-time alerts, regulatory compliance, and secure operations.',
      link: '/category/addressable-fire-alarm-detection-systems',
    },
    {
      id: 2,
      image: StructuredCablingImage,
      title: 'Structured Cabling',
      description: 'Fiber optics, Cat6/Cat6a cabling, and management systems. Enable seamless communication, high-speed transmission, scalability, and reduced downtime for businesses.',
      link: '/category/giganet-products',
    },
    {
      id: 3,
      image: IPImage,
      title: 'CCTV/IP Camera',
      description: 'HD IP cameras with night vision, motion detection, and cloud storage. Provide continuous monitoring, analytics, and asset protection around-the-clock.',
      link: '/category/hikvision',
    },
    {
      id: 4,
      image: VoIPImage,
      title: 'VoIP & Telephony',
      description: 'VoIP systems with call routing, conferencing, voicemail-to-email, and mobile integration. Improve collaboration, cut costs, and scale communication efficiently.',
      link: '/category/alcatel-lucent-products',
    },
    {
      id: 5,
      image: SolarImage,
      title: 'Solar Energy & Solutions',
      description: 'Solar panels, batteries, and inverters delivering renewable power. Reduce energy costs, achieve independence, and support long-term sustainability goals.',
      link: '/category/solar-power-solutions',
    },
  ];

  const stats = [
    { number: '10+', label: 'Years Experience' },
    { number: '500+', label: 'Projects Delivered' },
    { number: '8', label: 'Trusted Brand Partners' },
    { number: '24/7', label: 'Support Available' },
  ];

  const whyChoosePoints = [
    'Authorized Eaton Distributor — certified partnership with globally trusted brands',
    'Quality Products — we deliver only premium solutions that meet the highest industry standards',
    'Certified Technicians — professional installation and support services guaranteed',
    'Competitive Pricing — best value solutions without compromising on quality',
  ];

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/hero-banners/`);
        const data = await response.json();

        const promotionalSlides = data.map((banner) => ({
          id: `promo-${banner.id}`,
          displayMode: banner.display_mode,
          posterImage: banner.poster_image,
          posterLink: banner.poster_link,
          subtitle: banner.subtitle,
          title: banner.title,
          description: banner.description,
          images: banner.images,
          link: banner.button_link,
          bgClass: banner.background_class || 'heroSlide1',
          buttonText: banner.button_text || 'Explore Products',
        }));

        const allSlides = [...promotionalSlides, ...permanentSlides];
        setSlides(allSlides);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hero banners:', error);
        setSlides(permanentSlides);
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleSlideChange = (index) => {
    if (index !== currentSlide) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsTransitioning(false);
      }, 300);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div>
      {/* Hero Banner */}
      <section className={styles.heroSection}>
        {currentSlideData.displayMode === 'poster' ? (
          <div className={styles.heroPosterContainer}>
            {currentSlideData.posterLink ? (
              <a href={currentSlideData.posterLink} className={styles.heroPosterLink}>
                <img src={currentSlideData.posterImage} alt="Promotional Poster" className={styles.heroPosterImage} />
              </a>
            ) : (
              <img src={currentSlideData.posterImage} alt="Promotional Poster" className={styles.heroPosterImage} />
            )}

            <div className={styles.heroPosterNavigation}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`${styles.heroDot} ${index === currentSlide ? styles.heroDotActive : ''}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.heroContainer}>
            {/* Desktop Layout */}
            <div className={styles.heroContent}>
              <p className={styles.heroSubtitle}>{currentSlideData.subtitle}</p>
              <h1 className={styles.heroTitle}>{currentSlideData.title}</h1>
              <p className={styles.heroDescription}>{currentSlideData.description}</p>

              <div className={styles.heroButtons}>
                <button
                  className={`btn btn--primary ${styles.heroButton}`}
                  onClick={() => (window.location.href = currentSlideData.link)}
                >
                  {currentSlideData.buttonText}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <a href="/contact" className={`btn btn--outline ${styles.heroButtonSecondary}`}>
                  Get a Quote
                </a>
              </div>

              <div className={styles.heroNavigation}>
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlideChange(index)}
                    className={`${styles.heroDot} ${index === currentSlide ? styles.heroDotActive : ''}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className={styles.heroImageContainer}>
              <div className={`${styles.heroImageWrapper} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}>
                <div className={`${styles.heroImagesGrid} ${
                  currentSlideData.images.length === 3 ? styles.threeImages :
                  currentSlideData.images.length === 2 ? styles.twoImages : ''
                }`}>
                  {currentSlideData.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`${currentSlideData.title} - ${idx + 1}`} className={styles.heroImage} />
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className={styles.heroMobileLayout}>
              <div className={styles.heroMobileImages}>
                <div className={`${styles.heroImageWrapper} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}>
                  <div className={`${styles.heroImagesGrid} ${
                    currentSlideData.images.length === 3 ? styles.threeImages :
                    currentSlideData.images.length === 2 ? styles.twoImages : ''
                  }`}>
                    {currentSlideData.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`${currentSlideData.title} - ${idx + 1}`} className={styles.heroImage} />
                    ))}
                  </div>
                </div>
              </div>

              <button
                className={`btn btn--primary ${styles.heroMobileButton}`}
                onClick={() => (window.location.href = currentSlideData.link)}
              >
                {currentSlideData.buttonText}
              </button>

              <div className={styles.heroMobileContent}>
                <p className={styles.heroSubtitle}>{currentSlideData.subtitle}</p>
                <h1 className={styles.heroTitle}>{currentSlideData.title}</h1>
                <p className={styles.heroDescription}>{currentSlideData.description}</p>
              </div>

              <div className={styles.heroMobileNavigation}>
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlideChange(index)}
                    className={`${styles.heroDot} ${index === currentSlide ? styles.heroDotActive : ''}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Partner Brands */}
      <section className={styles.partnersSection}>
        <div className={styles.partnersContainer}>
          <div className={styles.sliderWrapper}>
            <div className={styles.sliderTrack}>
              {[
                { logo: AlcatelLogo, name: 'Alcatel', link: 'https://www.al-enterprise.com/' },
                { logo: AvayaLogo, name: 'Avaya', link: 'https://www.avaya.com/' },
                { logo: CiscoLogo, name: 'Cisco', link: 'https://www.cisco.com/' },
                { logo: EatonLogo, name: 'Eaton', link: 'https://www.eaton.com/' },
                { logo: SiemonLogo, name: 'Siemon', link: 'https://www.siemon.com/' },
                { logo: UbiquitiLogo, name: 'Ubiquiti', link: 'https://www.ui.com/' },
                { logo: GiganetLogo, name: 'Giganet', link: 'https://www.giganet.com.eg/' },
                { logo: HikvisionLogo, name: 'Hikvision', link: 'https://www.hikvision.com/' },
              ].concat([
                { logo: AlcatelLogo, name: 'Alcatel', link: 'https://www.al-enterprise.com/' },
                { logo: AvayaLogo, name: 'Avaya', link: 'https://www.avaya.com/' },
                { logo: CiscoLogo, name: 'Cisco', link: 'https://www.cisco.com/' },
                { logo: EatonLogo, name: 'Eaton', link: 'https://www.eaton.com/' },
                { logo: SiemonLogo, name: 'Siemon', link: 'https://www.siemon.com/' },
                { logo: UbiquitiLogo, name: 'Ubiquiti', link: 'https://www.ui.com/' },
                { logo: GiganetLogo, name: 'Giganet', link: 'https://www.giganet.com.eg/' },
                { logo: HikvisionLogo, name: 'Hikvision', link: 'https://www.hikvision.com/' },
              ]).map((brand, index) => (
                <a key={index} href={brand.link} target="_blank" rel="noopener noreferrer" className={styles.partnerLogoLink}>
                  <img src={brand.logo} alt={brand.name} className={styles.partnerLogo} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stat Strip — new section, no Edge equivalent */}
      <section className={styles.statSection}>
        <div className={styles.statContainer}>
          {stats.map((stat, idx) => (
            <div key={idx} className={styles.statItem}>
              <span className={styles.statNumber}>{stat.number}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Our Services */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesContainer}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>What We Offer</span>
            <h2 className={styles.servicesTitle}>Our Services</h2>
          </div>
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <a key={service.id} href={service.link} className={styles.serviceCard}>
                <div className={styles.serviceImageWrapper}>
                  <img src={service.image} alt={service.title} className={styles.serviceImage} />
                </div>
                <div className={styles.serviceContent}>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Carousel */}
      <PopularProductsCarousel />

      {/* Why Marinc — replaces the old parallax "Why Choose Us" background section */}
      <section className={styles.whySection}>
        <div className={styles.whyContainer}>
          <div className={styles.whyText}>
            <span className={styles.eyebrow}>Why Marinc</span>
            <h2 className={styles.whyTitle}>Built on Trust, Backed by Expertise</h2>
            <ul className={styles.whyList}>
              {whyChoosePoints.map((point, index) => (
                <li key={index} className={styles.whyItem}>
                  <span className={styles.whyCheck}>✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.whyImageWrapper}>
            <img src={WhyImage} alt="Marinc Systems team at work" className={styles.whyImage} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;