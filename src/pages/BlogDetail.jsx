import { API_BASE_URL } from '../config/api';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './BlogDetail.module.css';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/blogs/${slug}/`)
      .then(res => {
        if (!res.ok) throw new Error('Blog not found');
        return res.json();
      })
      .then(data => {
        setBlog(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    return `${API_BASE_URL}/media/${imageUrl}`;
  };

  // Parse content to detect headings
  const parseContent = (content) => {
    if (!content) return [];
    
    const lines = content.split('\n');
    const parsedContent = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        parsedContent.push({ type: 'empty', content: '', key: `empty-${index}` });
        return;
      }
      
      // Check if line is a heading
      const isHeading = trimmedLine.endsWith(':') || 
                       (trimmedLine === trimmedLine.toUpperCase() && 
                        trimmedLine.length < 100 && 
                        trimmedLine.length > 3 &&
                        !trimmedLine.includes('.'));
      
      if (isHeading) {
        parsedContent.push({ 
          type: 'heading', 
          content: trimmedLine, 
          key: `heading-${index}` 
        });
      } else {
        parsedContent.push({ 
          type: 'paragraph', 
          content: trimmedLine, 
          key: `para-${index}` 
        });
      }
    });
    
    return parsedContent;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBox}>
          <h2>Oops! Blog not found</h2>
          <p>The article you're looking for doesn't exist.</p>
          <Link to="/" className={styles.homeButton}>Return Home</Link>
        </div>
      </div>
    );
  }

  const parsedContent = parseContent(blog.content);
  const heroImageUrl = getFullImageUrl(blog.image);

  return (
    <div className={styles.blogPage}>
      {/* Hero Section - Using Original Image */}
      <section className={styles.hero}>
        <div className={styles.heroImageContainer}>
          <img 
            src={heroImageUrl} 
            alt={blog.title}
            className={styles.heroImage}
            loading="eager"
            fetchpriority="high"
          />
        </div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.heroInner}>
            <div className={styles.dateTag}>
              {new Date(blog.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <h1 className={styles.blogTitle}>{blog.title}</h1>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <article className={styles.articleContent}>
            {blog.excerpt && (
              <p className={styles.excerpt}>{blog.excerpt}</p>
            )}

            <div className={styles.divider}></div>

            <div className={styles.mainContent}>
              {parsedContent.map((item) => {
                if (item.type === 'heading') {
                  return <h3 key={item.key} className={styles.heading}>{item.content}</h3>;
                } else if (item.type === 'paragraph') {
                  return <p key={item.key} className={styles.paragraph}>{item.content}</p>;
                } else {
                  return <div key={item.key} className={styles.gap}></div>;
                }
              })}
            </div>

            {blog.source_name && (
              <div className={styles.sourceBox}>
                <span className={styles.sourceLabel}>Source:</span>
                <a 
                  href={blog.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.sourceLink}
                >
                  {blog.source_name} →
                </a>
              </div>
            )}
          </article>

          <Link to="/" className={styles.backButton}>
            <span className={styles.backIcon}>←</span>
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;