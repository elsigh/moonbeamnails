const EXAMPLE_DOMAIN = "your-store.myshopify.com";
const EXAMPLE_TOKEN = "your-storefront-access-token-here";

// Unset or example Shopify credentials serve the preview catalog in lib/mock.
export function isMockCatalog(): boolean {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.trim();
  const shopId = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID?.trim();
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  if (!domain || !shopId || !token) return true;
  return domain === EXAMPLE_DOMAIN || token === EXAMPLE_TOKEN;
}

export const MOCK_CHECKOUT_MESSAGE =
  "Cart and checkout open once Moonbeam Nails is connected to Shopify.";
