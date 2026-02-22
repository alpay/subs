/**
 * Brandfetch API: search brands and get logo URLs.
 * @see https://docs.brandfetch.com/reference/brand-search-api
 * @see https://docs.brandfetch.com/logo-api/overview
 */

const BRANDFETCH_CLIENT_ID = process.env.EXPO_PUBLIC_BRANDFETCH_CLIENT_ID ?? '1idbRTN3-ZInCQZsa0n';
const SEARCH_BASE = 'https://api.brandfetch.io';
const CDN_BASE = 'https://cdn.brandfetch.io';

export type BrandSearchResult = {
  icon: string | null;
  name: string | null;
  domain: string;
  claimed: boolean;
  brandId: string;
};

/**
 * Search for brands by name.
 * GET /v2/search/{name}?c={clientId}
 */
export async function searchBrands(name: string): Promise<BrandSearchResult[]> {
  const trimmed = name.trim();
  if (!trimmed)
    return [];

  const encoded = encodeURIComponent(trimmed);
  const url = `${SEARCH_BASE}/v2/search/${encoded}?c=${BRANDFETCH_CLIENT_ID}`;
  const res = await fetch(url);

  if (!res.ok)
    throw new Error(`Brandfetch search failed: ${res.status}`);

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Logo API: URL for a brand's default icon by domain (WebP).
 */
export function getLogoUrl(domain: string): string {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').split('/')[0] ?? domain;
  return `${CDN_BASE}/${cleanDomain}?c=${BRANDFETCH_CLIENT_ID}`;
}
