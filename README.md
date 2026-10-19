# Moonbeam Nails

The storefront for [Moonbeam Nails](https://moonbeamnails.com), a handmade press-on nail studio. Opal paints the sets. Lindsey, her parent, owns the accounts. The shop is a [Vercel Shop](https://vercel.shop) storefront: Next.js for the site, Shopify for commerce once a store is connected.

You can run the whole catalog before that store exists. With the Shopify variables unset, the site serves a preview catalog of press-on sets from `lib/mock/`. Setting the variables switches every catalog, cart, and checkout call to Shopify. No code change is required, and the preview folder is unused after that.

## Run the preview catalog

Requires pnpm 12 and Node.js 24.

```sh
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Home, collection, and product pages render the preview sets: Moonbeam Glow, Opal Shimmer, Starlit Night, and Lavender Dream, in sizes XS, S, M, and L and shapes almond, coffin, and square. Cart and checkout stay closed until a Shopify store is connected, and the site says so.

Leave `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`, and `NEXT_PUBLIC_SHOPIFY_SHOP_ID` unset. The placeholders in `.env.example` also stay on the preview catalog. For local HTTPS, install [Portless](https://portless.sh) globally with `pnpm add -g portless`, then run `pnpm dev:portless`.

## Connect a Shopify store

Create a store, then install the **Headless** sales channel: Shopify admin → **Settings → Apps and sales channels → Headless**. Create a storefront (or open the existing one) and copy its **public** Storefront API access token. The template sends that token as `X-Shopify-Storefront-Access-Token`. A private Headless token or an Admin API token will not work.

In the Headless channel, allow the Storefront API scopes the catalog, cart, and search need. The full list is in the [Storefront API permissions](https://vercel.shop/docs/reference/storefront-api-permissions) reference.

```sh
cp .env.example .env.local
```

Replace the three placeholders:

```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token-here
NEXT_PUBLIC_SHOPIFY_SHOP_ID=123456789
```

- **Store domain** is the `*.myshopify.com` host, not the public domain.
- **Access token** is the public Storefront API token from the Headless channel.
- **Shop ID** is the number in `gid://shopify/Shop/123456789`, also visible in customer account URLs as `https://shopify.com/<shop-id>/account`.

Restart `pnpm dev`. Catalog, cart, and checkout then come from Shopify. Products and collections you create in Shopify admin replace the preview sets. Prices, availability, and cart totals are Shopify's.

Customer accounts and Shop Agent stay off until you opt in. See the [authentication guide](https://vercel.shop/docs/anatomy/authentication) and the [Shop Agent guide](https://vercel.shop/docs/anatomy/agent).

## Deploy on Vercel

1. Import this repository as a Vercel project.
2. To launch on the preview catalog, leave the three Shopify variables empty. To launch on a live store, add `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`, and `NEXT_PUBLIC_SHOPIFY_SHOP_ID` for Production (and Preview, if preview deployments should hit the store). Vercel inlines `NEXT_PUBLIC_` values at build time, so set them before the deployment build.
3. Deploy. Attach `moonbeamnails.com` under the project’s domains when the DNS is ready. On Vercel, `VERCEL_PROJECT_PRODUCTION_URL` becomes the canonical site URL. A production build outside Vercel uses `https://moonbeamnails.com`.

`pnpm build` succeeds with or without the Shopify variables.

## Where the preview catalog lives

`lib/mock/` is the only preview implementation. `createRequestStorefrontClient` uses it when the Shopify variables are missing and uses Hydrogen’s Storefront client when they are set. Delete `lib/mock/` and that branch once the store is connected and you no longer want the fallback.

Architecture for everything else is the Vercel Shop template: Shopify owns commerce, Next.js owns the app, Eve owns the agent. See `AGENTS.md`.
