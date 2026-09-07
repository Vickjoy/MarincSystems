import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ComingSoon.module.css';
import ComingSoonImage from '../assets/ComingSoon.jpg';

const ComingSoon = () => {
  return (
    <div className={styles.container}>
      {/* Animated background elements */}
      <div className={styles.backgroundAnimations}>
        <div className={`${styles.blob} ${styles.blob1}`}></div>
        <div className={`${styles.blob} ${styles.blob2}`}></div>
        <div className={`${styles.blob} ${styles.blob3}`}></div>
      </div>

      {/* Main content container */}
      <div className={styles.mainContent}>
        <div className={styles.gridContainer}>
          
          {/* Left side - Image with overlay */}
          <div className={styles.imageSection}>
            <div className={styles.imageWrapper}>
              {/* Actual solar image */}
              <div className={styles.imageContainer}>
                <img 
                  src={ComingSoonImage} 
                  alt="Solar Energy Solutions" 
                  className={styles.image}
                />
                
                {/* Light gradient overlay - minimal */}
                <div className={styles.imageOverlay}></div>
                
                {/* Sparkle effects */}
                <div className={styles.sparkle1}>✨</div>
                <div className={styles.sparkle2}>✨</div>
                <div className={styles.sparkle3}>⚡</div>
              </div>
              
              {/* Eye-catching floating badge */}
              <div className={styles.floatingBadge}>
                <div className={styles.badgeGlow}></div>
                <div className={styles.badgeContent}>
                  <span className={styles.badgeIcon}>🌟</span>
                  <p className={styles.badgeText}>Clean Energy Future</p>
                  <span className={styles.badgeIcon}>🌟</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className={styles.contentSection}>
            <div className={styles.launchBadge}>
              <span className={styles.launchText}>LAUNCHING SOON</span>
            </div>

            <h1 className={styles.mainTitle}>
              Solar Power
              <span className={styles.titleGradient}>Solutions</span>
            </h1>

            <p className={styles.description}>
              We're working hard to bring you the best solar energy solutions. 
              Our innovative products and services will revolutionize the way you power your life.
            </p>

            {/* Features grid */}
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>☀️</div>
                <p className={styles.featureText}>Solar Panels</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔋</div>
                <p className={styles.featureText}>Battery Storage</p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>⚡</div>
                <p className={styles.featureText}>Inverters</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className={styles.buttonsContainer}>
              <Link to="/" className={styles.homeButton}>
                <span className={styles.buttonIcon}>🏠</span>
                <span>Back to Home</span>
              </Link>
              <Link to="/contact" className={styles.contactButton}>
                <span className={styles.buttonIcon}>✉️</span>
                <span>Get Notified</span>
              </Link>
            </div>

            {/* Notification text */}
            <p className={styles.notificationText}>
              ⚡ Want to be notified when we launch? Contact us today!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div className={styles.waveContainer}>
        <svg className={styles.wave} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C300,80 600,80 900,40 C1050,20 1150,60 1200,80 L1200,120 L0,120 Z" fill="currentColor"></path>
        </svg>
      </div>
    </div>
  );
};

export default ComingSoon;