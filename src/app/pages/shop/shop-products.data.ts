// ─── PLACEHOLDER PRODUCT DATA ────────────────────────────────────────────────
//
// This file is intentionally sparse — it's a template.
// Replace these 3 example products with your real catalogue.
//
// Fields:
//   id            — your platform's product ID (e.g. Shopify product ID)
//   brand         — brand name
//   name          — full product name
//   shortName     — truncated label for cards / list views
//   supplierPrice — your cost price (keep private — do NOT commit real values)
//   sellPrice     — your retail price
//   marginPct     — gross margin %
//   image         — absolute URL to product image (CDN, Shopify, etc.)
//   routineStep   — skin routine step: 'cleanser' | 'toner' | 'serum' |
//                   'ampoule' | 'moisturizer' | 'eye' | 'spf' | 'mask' |
//                   'treatment'
//   skinTypes     — array of applicable skin types: 'dry' | 'oily' |
//                   'combo' | 'normal' | 'sensitive'
//   bundleScore   — ranking score used by quiz/recommendation logic (0–10)
//   handle        — URL slug (e.g. Shopify product handle)
//   tag?          — optional badge shown on the product card

export interface ShopProduct {
  id: number;
  brand: string;
  name: string;
  shortName: string;
  supplierPrice: number;
  sellPrice: number;
  marginPct: number;
  image: string;
  routineStep: string;
  skinTypes: string[];
  bundleScore: number;
  handle: string;
  tag?: string;
}

// TODO: Replace with your real product catalogue.
// Tip: keep supplier prices in a private repo — never commit them here.
export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 1,
    brand: 'Example Brand',
    name: 'Example Serum 50ml',
    shortName: 'Example Serum 50ml',
    supplierPrice: 0.00,   // TODO: set real cost
    sellPrice: 0.00,        // TODO: set real price
    marginPct: 0,
    image: 'https://placehold.co/400x400?text=Product+1',
    routineStep: 'serum',
    skinTypes: ['dry', 'oily', 'normal', 'sensitive'],
    bundleScore: 10.0,
    handle: 'example-serum-50ml',
    tag: '🌟 Top Serum',
  },
  {
    id: 2,
    brand: 'Example Brand',
    name: 'Example Moisturiser 100ml',
    shortName: 'Example Moisturiser 100ml',
    supplierPrice: 0.00,
    sellPrice: 0.00,
    marginPct: 0,
    image: 'https://placehold.co/400x400?text=Product+2',
    routineStep: 'moisturizer',
    skinTypes: ['dry', 'normal'],
    bundleScore: 9.5,
    handle: 'example-moisturiser-100ml',
    tag: '💧 Best Moisturizer',
  },
  {
    id: 3,
    brand: 'Example Brand',
    name: 'Example SPF50+ Sunscreen 50ml',
    shortName: 'Example SPF50+ Sunscreen 50ml',
    supplierPrice: 0.00,
    sellPrice: 0.00,
    marginPct: 0,
    image: 'https://placehold.co/400x400?text=Product+3',
    routineStep: 'spf',
    skinTypes: ['dry', 'oily', 'normal', 'sensitive'],
    bundleScore: 9.0,
    handle: 'example-spf50-sunscreen-50ml',
    tag: '☀️ Best SPF',
  },
];
