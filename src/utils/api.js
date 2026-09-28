import { API_BASE_URL } from '../config/api';

/* -------------------------------------------------------------------------- */
/*  Auth helper: refresh token and retry request                              */
/* -------------------------------------------------------------------------- */
async function fetchWithAuthRetry(url, options = {}, retry = true) {
  let accessToken = localStorage.getItem('admin_access_token');
  options.headers = options.headers || {};
  // Only add Authorization header if accessToken exists and method is not GET
  if (!options.headers['Authorization'] && accessToken && options.method && options.method !== 'GET') {
    options.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  let response = await fetch(url, options);

  if ((response.status === 401 || response.status === 400) && retry) {
    let errorData = {};
    try {
      errorData = await response.clone().json();
    } catch {
      errorData = {};
    }
    if (
      errorData.code === 'token_not_valid' ||
      errorData.detail === 'Given token not valid for any token type'
    ) {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) {
        const refreshResp = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken })
        });
        const refreshData = await refreshResp.json();
        if (refreshResp.ok && refreshData.access) {
          accessToken = refreshData.access;
          localStorage.setItem('admin_access_token', accessToken);
          options.headers['Authorization'] = `Bearer ${accessToken}`;
          return fetch(url, options);
        } else {
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          throw new Error('Session expired. Please log in again.');
        }
      }
    }
  }
  return response;
}

/* -------------------------------------------------------------------------- */
/*  Cached GET helper: memory cache + shared in-flight request + 429 handling */
/* -------------------------------------------------------------------------- */
const cache = new Map();     // key -> { data, time }
const inflight = new Map();  // key -> Promise

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MAX_WAIT_SECONDS = 10;   // never make the UI wait longer than this on a 429
const MAX_COOLDOWN_SECONDS = 30;

// Throttling is per client IP, so one 429 means every endpoint is blocked.
// While cooling down we don't send new requests (which would only extend the block).
let throttledUntil = 0;

async function cachedGet(key, url, { headers = {}, ttl = 30000, force = false } = {}) {
  const now = Date.now();
  const hit = cache.get(key);

  if (!force && hit && now - hit.time < ttl) return hit.data;
  if (!force && inflight.has(key)) return inflight.get(key);

  const promise = (async () => {
    // In cooldown: serve stale data if we have it, otherwise fail fast
    if (Date.now() < throttledUntil) {
      if (hit) return hit.data;
      throw new Error('Too many requests. Please wait a moment and try again.');
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await fetch(url, { headers, cache: 'no-store' });

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('Retry-After')) || 2 ** attempt;
        throttledUntil = Date.now() + Math.min(retryAfter, MAX_COOLDOWN_SECONDS) * 1000;
        if (retryAfter > MAX_WAIT_SECONDS || attempt === 2) break; // give up, fall back below
        await sleep(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        throw new Error(`Request failed (${response.status}): ${url}`);
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : data.results || [];
      cache.set(key, { data: list, time: Date.now() });
      return list;
    }

    // Throttled: prefer stale data over nothing
    if (hit) return hit.data;
    throw new Error('Too many requests. Please wait a moment and try again.');
  })().finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

/** Clear cached entries whose key starts with the prefix (or everything). */
export const invalidateCache = (prefix = '') => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};
export const invalidateCategoriesCache = () => {
  invalidateCache('categories');
  invalidateCache('subcategories');
};

/* -------------------------------------------------------------------------- */
/*  Example API utility functions (unchanged)                                 */
/* -------------------------------------------------------------------------- */
export const fetchProducts = async (category) => {
  try {
    const response = await fetch(`/api/products?category=${category}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await fetch(`/api/products/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*  Home page data                                                            */
/* -------------------------------------------------------------------------- */
/** Hero banners (cached 60s, deduplicated, 429-safe). Always resolves to an array. */
export const fetchHeroBanners = async ({ force = false } = {}) =>
  cachedGet('banners', `${API_BASE_URL}/api/hero-banners/`, { ttl: 60000, force });

/** Popular products (cached 60s, deduplicated, 429-safe). Always resolves to an array. */
export const fetchPopularProducts = async ({ force = false } = {}) =>
  cachedGet('products:popular', `${API_BASE_URL}/api/products/popular/`, { ttl: 60000, force });

/* -------------------------------------------------------------------------- */
/*  Categories                                                                */
/* -------------------------------------------------------------------------- */
/**
 * Fetch all categories (cached 30s, deduplicated, 429-safe).
 * @param {string} token - Optional admin token
 * @param {{force?: boolean}} opts - force: true bypasses the cache
 */
export const fetchCategories = async (token, { force = false } = {}) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return cachedGet(
    `categories:${token ? 'auth' : 'public'}`,
    `${API_BASE_URL}/api/categories/`,
    { headers, ttl: 30000, force }
  );
};

/**
 * Fetch subcategories for a category (cached 30s, deduplicated, 429-safe).
 */
export const fetchSubcategories = async (categorySlug, token, { force = false } = {}) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return cachedGet(
    `subcategories:${categorySlug}:${token ? 'auth' : 'public'}`,
    `${API_BASE_URL}/api/categories/${categorySlug}/subcategories/`,
    { headers, ttl: 30000, force }
  );
};

export const createCategory = async (name, token, type = 'fire_safety') => {
  try {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/categories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ name, type })
    });
    if (!response.ok) throw new Error('Failed to create category');
    invalidateCategoriesCache();
    return await response.json();
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (id, name, token) => {
  try {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/categories/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to update category');
    invalidateCategoriesCache();
    return await response.json();
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id, token) => {
  try {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/categories/${id}/`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error('Failed to delete category');
    invalidateCategoriesCache();
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*  Subcategories                                                             */
/* -------------------------------------------------------------------------- */
export const createSubcategory = async (categorySlug, name, token) => {
  try {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/categories/${categorySlug}/subcategories/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to create subcategory');
    invalidateCategoriesCache();
    return await response.json();
  } catch (error) {
    console.error('Error creating subcategory:', error);
    throw error;
  }
};

export const updateSubcategory = async (categorySlug, subcategoryId, name, token) => {
  try {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/categories/${categorySlug}/subcategories/${subcategoryId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to update subcategory');
    invalidateCategoriesCache();
    return await response.json();
  } catch (error) {
    console.error('Error updating subcategory:', error);
    throw error;
  }
};

export const deleteSubcategory = async (categorySlug, subcategoryId, token) => {
  try {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/categories/${categorySlug}/subcategories/${subcategoryId}/`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error('Failed to delete subcategory');
    invalidateCategoriesCache();
    return true;
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*  Products                                                                  */
/* -------------------------------------------------------------------------- */
/**
 * Fetch products for a subcategory (public endpoint).
 * Endpoint: /api/subcategories/<slug>/products/
 * ttl 0 = always fresh, but simultaneous calls share one request and 429s are retried.
 */
export const fetchProductsForSubcategory = async (subcategorySlug) => {
  return cachedGet(
    `products:${subcategorySlug}`,
    `${API_BASE_URL}/api/subcategories/${subcategorySlug}/products/`,
    { ttl: 0 }
  );
};

export const createProduct = async (form, token) => {
  try {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('description', form.description);
    if (form.specifications) formData.append('specifications', form.specifications);
    if (form.features) formData.append('features', form.features);
    if (form.documentation) formData.append('documentation', form.documentation);
    if (form.status) formData.append('status', form.status);
    if (form.image && typeof form.image !== 'string') formData.append('image', form.image);
    const endpoint = `${API_BASE_URL}/api/subcategories/${form.subcategory}/products/create/`;
    const response = await fetchWithAuthRetry(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) {
      let errorMsg = 'Failed to add product';
      try {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        errorMsg += ': ' + (errorData.detail || JSON.stringify(errorData));
      } catch (e) {
        // Could not parse error response
      }
      throw new Error(errorMsg);
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id, form, token) => {
  try {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('description', form.description);
    formData.append('subcategory', form.subcategory);
    if (form.specifications) formData.append('specifications', form.specifications);
    if (form.features) formData.append('features', form.features);
    if (form.link) formData.append('link', form.link);
    if (form.image && typeof form.image !== 'string') formData.append('image', form.image);
    if (form.pdf && typeof form.pdf !== 'string') formData.append('pdf', form.pdf);
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/products/${id}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to update product');
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id, token) => {
  try {
    const response = await fetchWithAuthRetry(`${API_BASE_URL}/api/products/${id}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

/* -------------------------------------------------------------------------- */
/*  Blogs                                                                     */
/* -------------------------------------------------------------------------- */
/** Fetch all published blogs */
export const fetchBlogs = async () => {
  try {
    return await cachedGet('blogs', `${API_BASE_URL}/api/blogs/`, { ttl: 30000 });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
};

/** Fetch blogs for footer display; falls back to the main blogs endpoint */
export const fetchFooterBlogs = async () => {
  try {
    try {
      return await cachedGet('blogs:footer', `${API_BASE_URL}/api/blogs/footer/`, { ttl: 30000 });
    } catch {
      return await cachedGet('blogs', `${API_BASE_URL}/api/blogs/`, { ttl: 30000 });
    }
  } catch (error) {
    console.error('Error fetching footer blogs:', error);
    return [];
  }
};

/** Fetch a single blog by slug */
export const fetchBlogBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${slug}/`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Blog not found: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw error;
  }
};