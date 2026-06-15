export const normalizeKey = (value) => String(value || '').trim().toLowerCase();

export function findCategoryByParam(categories, param) {
  const needle = normalizeKey(param);
  if (!needle) return null;

  return (
    categories.find((c) => {
      const candidates = [c?.id, c?.name, c?.label, c?.slug]
        .filter(Boolean)
        .map(normalizeKey);
      return candidates.includes(needle);
    }) || null
  );
}

export function categoryMatchKeys(category) {
  if (!category) return new Set();
  return new Set(
    [category.id, category.name, category.label, category.slug]
      .filter(Boolean)
      .map(normalizeKey),
  );
}

export function productMatchesCategory(product, category, fallbackParam) {
  const productCategory = normalizeKey(product?.category);
  if (!productCategory) return false;

  const keys = categoryMatchKeys(category);
  if (keys.size > 0) return keys.has(productCategory);

  return productCategory === normalizeKey(fallbackParam);
}

export function categoryDisplayName(category, fallback = '') {
  return category?.name || category?.label || fallback || 'Category';
}

export function categoryRouteParam(category) {
  const label = (category?.name || category?.label || '').trim();
  return (category?.slug || label).trim();
}
