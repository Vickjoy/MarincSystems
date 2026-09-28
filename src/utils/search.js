import {
    fetchCategories,
    fetchSubcategories,
    fetchProductsForSubcategory,
  } from './api';
  import { isSolarType } from './zones';
  
  /**
   * Product search.
   * Builds an in-memory index of every product once (categories -> subcategories
   * -> products), reuses it for 10 minutes, and matches on name, brand, SKU,
   * description, features and subcategory. Requests go out in small batches so
   * the API's rate limit isn't tripped.
   */
  
  const INDEX_TTL = 10 * 60 * 1000;
  let indexCache = { data: null, time: 0 };
  let indexPromise = null;
  
  async function inBatches(items, size, worker) {
    const out = [];
    for (let i = 0; i < items.length; i += size) {
      const chunk = items.slice(i, i + size);
      out.push(...(await Promise.all(chunk.map(worker))));
    }
    return out;
  }
  
  async function buildIndex() {
    const allCategories = await fetchCategories();
    const categories = allCategories.filter((c) => !isSolarType(c.type));
  
    const subGroups = await inBatches(categories, 4, async (cat) => {
      try {
        const subs = await fetchSubcategories(cat.slug);
        return subs.map((s) => ({ ...s, _categoryName: cat.name }));
      } catch (err) {
        console.error(`Search index: subcategories failed for ${cat.slug}`, err);
        return [];
      }
    });
    const subcategories = subGroups.flat();
  
    const productGroups = await inBatches(subcategories, 4, async (sub) => {
      try {
        const products = await fetchProductsForSubcategory(sub.slug);
        return products.map((p) => ({
          ...p,
          _subcategoryName: sub.name,
          _categoryName: sub._categoryName,
        }));
      } catch (err) {
        console.error(`Search index: products failed for ${sub.slug}`, err);
        return [];
      }
    });
  
    const unique = new Map();
    productGroups.flat().forEach((p) => {
      if (p && p.id != null && !unique.has(p.id)) unique.set(p.id, p);
    });
    return [...unique.values()];
  }
  
  async function getIndex() {
    const fresh = indexCache.data && Date.now() - indexCache.time < INDEX_TTL;
    if (fresh) return indexCache.data;
    if (indexPromise) return indexPromise;
  
    indexPromise = buildIndex()
      .then((data) => {
        if (data.length > 0) indexCache = { data, time: Date.now() };
        return data;
      })
      .finally(() => {
        indexPromise = null;
      });
    return indexPromise;
  }
  
  const norm = (v) => String(v || '').toLowerCase();
  
  /** Every word typed must appear somewhere in the product. Name hits rank first. */
  export async function searchProducts(query) {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
  
    const index = await getIndex();
  
    const scored = [];
    for (const p of index) {
      const name = norm(p.name);
      const brand = norm(p.brand);
      const sku = norm(p.sku);
      const rest = [
        p.description,
        p.features,
        p._subcategoryName,
        p._categoryName,
        p.subcategory_detail?.name,
      ]
        .map(norm)
        .join(' ');
      const haystack = `${name} ${brand} ${sku} ${rest}`;
  
      if (!terms.every((t) => haystack.includes(t))) continue;
  
      let score = 0;
      terms.forEach((t) => {
        if (name.includes(t)) score += 10;
        if (brand.includes(t) || sku.includes(t)) score += 5;
      });
      if (name.startsWith(terms[0])) score += 5;
      scored.push({ p, score });
    }
  
    return scored.sort((a, b) => b.score - a.score).map((s) => s.p);
  }