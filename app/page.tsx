import type { Metadata } from "next";
import { Suspense } from "react";

import { Hero } from "@/components/brand/hero";
import { ProductCard } from "@/components/product-card/product-card";
import { ProductsGridSkeleton } from "@/components/product/products-grid";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { getCollectionResults } from "@/lib/collections/server";
import { shopConfig } from "@/lib/config";
import { isMockCatalog } from "@/lib/mock";
import { getSearchIndexProducts } from "@/lib/product/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

const SIZES = [
  { body: "A smaller nail bed, including many kids' hands.", name: "XS" },
  { body: "Short nails and narrower fingers.", name: "S" },
  { body: "The size most hands start with.", name: "M" },
  { body: "A longer nail bed or a wider finger.", name: "L" },
];

const SHAPES = [
  { body: "A soft taper with a rounded tip.", name: "Almond" },
  { body: "Straight sides that taper at the end.", name: "Coffin" },
  { body: "A flat tip with even sides.", name: "Square" },
];

export async function generateMetadata(): Promise<Metadata> {
  const title = "Handmade press-on nails";
  const description = shopConfig.site.description;
  return {
    title: { absolute: `${shopConfig.site.name} — ${title}` },
    description,
    alternates: buildAlternates({ pathname: "/" }),
    openGraph: buildOpenGraph({
      title: shopConfig.site.name,
      description,
      url: "/",
      type: "website",
    }),
  };
}

export default function HomePage() {
  return (
    <Page className="pt-0">
      <Sections>
        <Hero />
        <Container>
          <div className="grid gap-10">
            <Suspense fallback={<ProductsGridSkeleton count={4} />}>
              <CelestialSets />
            </Suspense>
            <Sizing />
            <MadeByOpal />
          </div>
        </Container>
      </Sections>
    </Page>
  );
}

async function CelestialSets() {
  const celestial = await getCollectionResults({ handle: "celestial" });
  const featured = celestial.products.length > 0;
  const products = featured
    ? celestial.products.slice(0, 4)
    : (await getSearchIndexProducts({ limit: 4 })).products;
  if (products.length === 0) return null;
  const href = featured ? "/collections/celestial" : "/collections/all";
  const title = featured ? "Celestial Collection" : "The sets";
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
        <Link
          href={href}
          className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>
      {isMockCatalog() ? (
        <p className="max-w-2xl text-sm text-muted-foreground">
          Moonbeam Glow, Opal Shimmer, Starlit Night, and Lavender Dream.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            loading={index < 4 ? "eager" : "lazy"}
            outOfStockText="Out of Stock"
            product={product}
            quickShopText="Choose"
          />
        ))}
      </div>
    </div>
  );
}

function Sizing() {
  return (
    <section id="sizing" className="grid scroll-mt-24 gap-5">
      <div className="grid gap-2.5">
        <h2 className="font-display text-3xl sm:text-4xl">How sizing works</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every set is the same artwork in four lengths and three shapes. Pick the length that
          covers the nail bed, then the silhouette you want to wear.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-4 rounded-xl bg-secondary p-5">
          <h3 className="font-display text-2xl">Sizes</h3>
          <ul className="grid gap-4">
            {SIZES.map((size) => (
              <li key={size.name} className="grid grid-cols-[3rem_1fr] gap-4">
                <span className="font-display text-xl text-foreground">{size.name}</span>
                <span className="text-sm text-muted-foreground">{size.body}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 rounded-xl bg-accent p-5">
          <h3 className="font-display text-2xl">Shapes</h3>
          <ul className="grid gap-4">
            {SHAPES.map((shape) => (
              <li key={shape.name} className="grid gap-1">
                <span className="font-display text-xl">{shape.name}</span>
                <span className="text-sm text-muted-foreground">{shape.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function MadeByOpal() {
  return (
    <section className="grid gap-4 rounded-xl border border-border bg-card p-5 md:grid-cols-[0.8fr_1.2fr] md:p-10">
      <h2 className="font-display text-3xl sm:text-4xl">Made by Opal</h2>
      <div className="grid gap-4 text-sm leading-6 text-muted-foreground">
        <p>
          Opal paints every Moonbeam Nails set by hand, in a small batch. She is twelve. The
          crescents, stars, and pearl washes are brushed on, then sealed so they stay smooth under a
          clear top coat.
        </p>
        <p>
          Press them on at home with glue or tabs. Lindsey, Opal's parent, looks after the shop and
          the mailbox. When the studio is connected to Shopify, checkout opens on these same pages.
        </p>
      </div>
    </section>
  );
}
