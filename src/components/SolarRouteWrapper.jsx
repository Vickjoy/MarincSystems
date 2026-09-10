import { API_BASE_URL } from '../config/api';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ComingSoon from './ComingSoon';
import CategoryPage from '../pages/CategoryPage';
import { fetchCategories, fetchSubcategories } from '../utils/api';

/**
 * Smart wrapper that:
 * 1. Checks if the category is solar type
 * 2. If solar AND has products → show CategoryPage
 * 3. If solar AND no products → show ComingSoon
 * 4. If NOT solar → show CategoryPage
 */
const SolarRouteWrapper = () => {
  const { slug } = useParams();
  const [shouldShowComingSoon, setShouldShowComingSoon] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCategory = async () => {
      try {
        console.log('=== Starting category check for slug:', slug);
        
        // Fetch all categories with cache-busting timestamp
        const timestamp = new Date().getTime();
        const categoriesResponse = await fetch(`${API_BASE_URL}/api/categories/?_=${timestamp}`);
        const categories = await categoriesResponse.json();
        console.log('All categories fetched:', categories);
        
        // Find the current category by slug
        const currentCategory = categories.find(cat => cat.slug === slug);
        
        if (!currentCategory) {
          console.warn('❌ Category not found for slug:', slug);
          setShouldShowComingSoon(false);
          setIsLoading(false);
          return;
        }
        
        console.log('✓ Current category found:', {
          id: currentCategory.id,
          name: currentCategory.name,
          slug: currentCategory.slug,
          type: currentCategory.type
        });
        
        // Check if this is a solar category
        const categoryType = String(currentCategory.type || '').toLowerCase();
        const isSolarCategory = categoryType === 'solar' || 
                               categoryType === 'solar_solutions' || 
                               categoryType === 'solar-solutions';
        
        console.log('🔍 Category type check:', {
          rawType: currentCategory.type,
          normalizedType: categoryType,
          isSolarCategory
        });
        
        // If NOT a solar category, always show CategoryPage
        if (!isSolarCategory) {
          console.log('✓ Not a solar category → showing CategoryPage');
          setShouldShowComingSoon(false);
          setIsLoading(false);
          return;
        }
        
        // It IS a solar category - check if it has subcategories/products
        console.log('☀️ Solar category detected → checking for subcategories...');
        
        try {
          // Fetch subcategories with cache-busting
          const subcategoriesResponse = await fetch(
            `${API_BASE_URL}/api/categories/${slug}/subcategories/?_=${timestamp}`
          );
          const subcategories = await subcategoriesResponse.json();
          
          console.log('📦 Subcategories fetched:', subcategories);
          
          const hasSubcategories = Array.isArray(subcategories) && subcategories.length > 0;
          
          console.log('🎯 Solar category decision:', {
            categoryName: currentCategory.name,
            categorySlug: slug,
            subcategoriesIsArray: Array.isArray(subcategories),
            subcategoriesCount: Array.isArray(subcategories) ? subcategories.length : 0,
            hasSubcategories,
            decision: hasSubcategories ? '✓ Show CategoryPage' : '⚠️ Show ComingSoon'
          });
          
          // If solar has subcategories → show CategoryPage
          // If solar has NO subcategories → show ComingSoon
          setShouldShowComingSoon(!hasSubcategories);
          
        } catch (error) {
          console.error('❌ Error fetching subcategories:', error);
          // On error, show ComingSoon for solar categories
          console.log('Error occurred → defaulting to ComingSoon');
          setShouldShowComingSoon(true);
        }
        
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        setShouldShowComingSoon(false);
      } finally {
        setIsLoading(false);
        console.log('=== Category check complete ===\n');
      }
    };

    if (slug) {
      checkCategory();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading...</div>
      </div>
    );
  }

  console.log('🎬 Final render decision:', {
    shouldShowComingSoon,
    component: shouldShowComingSoon ? '⚠️ ComingSoon' : '✓ CategoryPage'
  });

  return shouldShowComingSoon ? <ComingSoon /> : <CategoryPage />;
};

export default SolarRouteWrapper;