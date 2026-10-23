import { cn } from "cn";
import { type ReactNode, Suspense } from "react";

import { ProductViewedTracker } from "@/components/analytics/trackers";
import { BundleComponents, BundleParents } from "@/components/product-detail/bundle-components";
import { BuyButtons, PurchaseOptions } from "@/components/product-detail/buy-buttons";
import { BuyWithShopLogo } from "@/components/product-detail/buy-with-shop-logo";
import { ComplementaryProducts } from "@/components/product-detail/complementary-products";
import { GiftCardPurchaseForm } from "@/components/product-detail/gift-card-purchase-form";
import { ProductOpenGraph } from "@/components/product-detail/open-graph";
import {
  ProductForm,
  ProductFormOptions,
  ProductFormPrice,
} from "@/components/product-detail/product-form";
import {
  ProductInfoDescription,
  ProductInfoOptions,
} from "@/components/product-detail/product-info";
import {
  ColorImageCarouselItems,
  ColorImageGrid,
  ProductMedia,
} from "@/components/product-detail/product-media";
import { ProductPrice } from "@/components/product-detail/product-price";
import { ProductSchema } from "@/components/product-detail/schema";
import { BreadcrumbSchema } from "@/components/schema/breadcrumb-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { shopConfig } from "@/lib/config";
import { isMockCatalog, MOCK_CHECKOUT_MESSAGE } from "@/lib/mock";
import {
  defaultSelectedOptions,
  getProductPurchaseOptions,
  getSelectedColorImage,
  getSharedImages,
  hasColorImagePartitioning,
  parseSelectedOptions,
  toProductFormInput,
  toSelectedOptionList,
  toStaticOptionGroups,
} from "@/lib/product";
import { getProduct } from "@/lib/product/server";
import type { ProductDetails, ProductVariant, SelectedOptions } from "@/lib/product/types";
import { fetchProductVariant } from "@/lib/shopify/operations/products/server";

type ProductSearchParams = Promise<Record<string, string | string[] | undefined>>;

export function ProductDetailSection({
  colorCarousel,
  colorGrid,
  product,
  purchase,
}: {
  colorCarousel: ReactNode;
  colorGrid: ReactNode;
  product: ProductDetails;
  purchase: ReactNode;
}) {
  return (
    <>
      <ProductSchema
        product={{
          handle: product.handle,
          title: product.title,
          description: product.description,
          images: product.images,
          vendor: product.vendor,
          currencyCode: product.currencyCode,
          priceRange: product.priceRange,
          offerCount: product.variantsCount,
          availableForSale: product.availableForSale,
          sku: product.defaultVariantSku,
        }}
      />
      <ProductOpenGraph
        availableForSale={product.availableForSale}
        price={product.priceRange.minVariantPrice}
      />
      <BreadcrumbSchema
        items={[
          { name: shopConfig.site.name, path: "/" },
          { name: product.title, path: `/products/${product.handle}` },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-10 lg:items-start lg:gap-5">
        <ProductMediaArea colorCarousel={colorCarousel} colorGrid={colorGrid} product={product} />
        <ProductInfoArea product={product} purchase={purchase} />
      </div>
    </>
  );
}

function ProductMediaArea({
  colorCarousel,
  colorGrid,
  product,
}: {
  colorCarousel: ReactNode;
  colorGrid: ReactNode;
  product: ProductDetails;
}) {
  if (!hasColorImagePartitioning(product.options)) {
    return (
      <ProductMedia
        otherImages={product.images}
        videos={product.videos}
        title={product.title}
        className="lg:col-span-6"
      />
    );
  }

  return (
    <ProductMedia
      otherImages={getSharedImages(product.images, product.options)}
      videos={product.videos}
      title={product.title}
      className="lg:col-span-6"
      desktopSlot={
        // Color image is the LCP slot; a pulsing skeleton flashes harder than an empty image canvas.
        <Suspense fallback={<div className="aspect-[4/5] w-full" />}>{colorGrid}</Suspense>
      }
      mobileSlot={
        <Suspense
          fallback={
            <div className="relative aspect-[4/5] w-full shrink-0 snap-start snap-always overflow-hidden" />
          }
        >
          {colorCarousel}
        </Suspense>
      }
    />
  );
}

export async function ProductColorGrid({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: ProductSearchParams;
}) {
  const product = await productForMedia(params);
  if (!product) return null;
  const image = getSelectedColorImage(product, await selectedOptionsFor(product, searchParams));
  if (!image) return null;
  return <ColorImageGrid images={[image]} title={product.title} />;
}

export async function ProductColorCarousel({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: ProductSearchParams;
}) {
  const product = await productForMedia(params);
  if (!product) return null;
  const image = getSelectedColorImage(product, await selectedOptionsFor(product, searchParams));
  if (!image) return null;
  return <ColorImageCarouselItems images={[image]} title={product.title} />;
}

async function productForMedia(
  params: Promise<{ handle: string }>,
): Promise<ProductDetails | null> {
  const { handle } = await params;
  const product = await getProduct({ handle });
  if (!product || !hasColorImagePartitioning(product.options)) return null;
  return product;
}

async function selectedOptionsFor(
  product: ProductDetails,
  searchParams: ProductSearchParams,
): Promise<SelectedOptions> {
  const resolved = (await searchParams) ?? {};
  return {
    ...defaultSelectedOptions(product),
    ...parseSelectedOptions(product.options, resolved),
  };
}

function ProductInfoArea({ product, purchase }: { product: ProductDetails; purchase: ReactNode }) {
  const { descriptionHtml, handle } = product;
  return (
    <div className="grid gap-10 lg:sticky lg:top-20 lg:col-span-4">
      <div
        className="grid data-[uniform-price=true]:gap-10"
        data-uniform-price={product.hasUniformPricing}
      >
        <div data-slot="product-info-header">
          <h1 className="font-display text-foreground text-3xl sm:text-4xl">{product.title}</h1>
          {product.hasUniformPricing ? (
            <ProductPrice
              amount={product.priceRange.minVariantPrice.amount}
              currencyCode={product.priceRange.minVariantPrice.currencyCode}
              compareAtAmount={product.compareAtPriceRange?.minVariantPrice.amount}
            />
          ) : null}
        </div>
        <ProductInfoOptions include="single" options={toStaticOptionGroups(product)} />
        <Suspense fallback={<PurchaseFallback product={product} />}>{purchase}</Suspense>
      </div>

      {!product.isGiftCard && shopConfig.pdp.bundles.isEnabled ? (
        <BundleRelationships variant={product.defaultVariant} />
      ) : null}

      {!product.isGiftCard && shopConfig.pdp.complementaryProducts.isEnabled ? (
        <Suspense fallback={null}>
          <ComplementaryProducts handle={handle} limit={4} title="Pairs Well With" />
        </Suspense>
      ) : null}

      <ProductInfoDescription descriptionHtml={descriptionHtml} />
    </div>
  );
}

export async function ProductPurchase({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: ProductSearchParams;
}) {
  const { handle } = await params;
  const product = await getProduct({ handle });
  if (!product) return null;
  const resolved = (await searchParams) ?? {};
  const urlOptions = parseSelectedOptions(product.options, resolved);
  const variant =
    Object.keys(urlOptions).length === 0
      ? product.defaultVariant
      : // Uncached: a URL-selected variant's price and stock are read live, and caching each combination multiplies entries by variant count.
        await fetchProductVariant({
          handle: product.handle,
          selectedOptions: toSelectedOptionList({
            ...defaultSelectedOptions(product),
            ...urlOptions,
          }),
        });
  return (
    <>
      <Suspense fallback={null}>
        <ProductViewedTracker
          product={{
            handle: product.handle,
            id: product.id,
            title: product.title,
            vendor: product.vendor,
          }}
          variantPromise={Promise.resolve(variant)}
        />
      </Suspense>
      <ProductInfoContent product={product} selectedVariant={variant} />
    </>
  );
}

// The store is seeded from the URL-resolved variant so server HTML and client state agree on first paint.
function ProductInfoContent({
  product,
  selectedVariant,
}: {
  product: ProductDetails;
  selectedVariant: ProductVariant | undefined;
}) {
  const formProduct = toProductFormInput(product, selectedVariant);
  const fallbackVariant = formProduct.selectedOrFirstAvailableVariant ?? undefined;

  return (
    <ProductForm product={formProduct}>
      <div className="grid gap-10">
        {!product.hasUniformPricing ? (
          <div data-slot="product-info-price">
            <ProductFormPrice fallbackVariant={fallbackVariant} />
          </div>
        ) : null}
        <ProductFormOptions handle={product.handle} />
        {product.isGiftCard ? (
          <GiftCardPurchaseForm />
        ) : (
          <BuyButtons
            fallbackVariant={fallbackVariant}
            availableForSale={product.availableForSale}
            buyWithShop={shopConfig.pdp.buyWithShop.isEnabled && !isMockCatalog()}
            quantityPicker={shopConfig.pdp.quantityPicker.isEnabled}
          />
        )}
        <PreviewCheckoutNote />
      </div>
    </ProductForm>
  );
}

function PurchaseFallback({ product }: { product: ProductDetails }) {
  const hasChoices = product.options.some((option) => option.values.length > 1);
  return (
    <div className="grid gap-10">
      {!product.hasUniformPricing ? <div className="h-7" aria-hidden /> : null}
      {hasChoices ? (
        <ProductInfoOptions include="choices" options={toStaticOptionGroups(product)} hideImages />
      ) : null}
      {product.isGiftCard ? (
        <GiftCardPurchaseFormFallback />
      ) : (
        <BuyButtonsFallback
          allInStock={product.defaultVariant?.availableForSale ?? product.availableForSale}
          showLabel
          variant={product.defaultVariant}
        />
      )}
      <PreviewCheckoutNote />
    </div>
  );
}

function PreviewCheckoutNote() {
  if (!isMockCatalog()) return null;
  return <p className="text-sm text-muted-foreground">{MOCK_CHECKOUT_MESSAGE}</p>;
}

// Bundle relationships are product-level, so keep them in the static shell.
function BundleRelationships({ variant }: { variant: ProductVariant | undefined }) {
  if (!variant) return null;
  if (variant.components.length === 0 && variant.bundleParents.length === 0) return null;
  return (
    <div className="grid gap-5">
      <BundleComponents components={variant.components} title="Bundle Includes" />
      <BundleParents variants={variant.bundleParents} title="Available in Bundles" />
    </div>
  );
}

function GiftCardPurchaseFormFallback() {
  // Match the resolved form's geometry to avoid layout shift.
  return (
    <div className="grid gap-5">
      <div className="grid gap-2.5">
        <div className="grid gap-2.5">
          <Label>Recipient email</Label>
          <Input type="email" disabled placeholder="friend@example.com" />
        </div>
        <div className="grid gap-2.5">
          <Label>Recipient name</Label>
          <Input type="text" disabled placeholder="Friend's name (optional)" />
        </div>
        <div className="grid gap-2.5">
          <Label>Message</Label>
          <Textarea rows={3} disabled placeholder="Write a personal note (optional)" />
        </div>
        <div className="grid gap-3 rounded-lg border p-3">
          <div className="flex items-center justify-between gap-2.5">
            <Label>Schedule for later</Label>
            <span className="inline-flex h-[1.15rem] w-8 items-center rounded-full bg-input opacity-50" />
          </div>
        </div>
      </div>
      <div className="flex h-12 w-full cursor-not-allowed items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground opacity-50">
        Add to Cart
      </div>
    </div>
  );
}

function BuyButtonsFallback({
  allInStock,
  showLabel,
  variant,
}: {
  allInStock: boolean;
  showLabel: boolean;
  variant: ProductVariant | undefined;
}) {
  const { plans, selectedPlan } = getProductPurchaseOptions(variant);
  return (
    <div className="grid gap-2.5">
      {variant ? (
        <PurchaseOptions
          disabled
          plans={plans}
          price={variant.price}
          requiresSellingPlan={variant.requiresSellingPlan}
          selectedPlan={selectedPlan}
        />
      ) : null}
      <div
        className={cn(
          "flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground",
          showLabel && !allInStock && "cursor-not-allowed opacity-50",
        )}
      >
        {showLabel ? (allInStock ? "Add to Cart" : "Sold out") : null}
      </div>
      {shopConfig.pdp.buyWithShop.isEnabled &&
      allInStock &&
      !selectedPlan &&
      !variant?.requiresSellingPlan ? (
        <div className="flex h-12 items-center justify-center rounded-lg bg-shop px-4 text-white">
          <BuyWithShopLogo aria-hidden="true" className="h-auto w-24.5" />
        </div>
      ) : null}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-10 lg:grid-cols-10 lg:items-start lg:gap-5">
      <div className="lg:col-span-6">
        {/* Media blocks stay static; a pulsing skeleton in the LCP slot flashes harder than an empty image canvas. */}
        <div className="-mx-5 aspect-[4/5] w-[calc(100%+2.5rem)] bg-accent lg:mx-0 lg:w-full" />
      </div>
      <div className="grid gap-10 lg:sticky lg:top-20 lg:col-span-4">
        <div>
          <Skeleton className="h-9 w-3/4 sm:h-10" />
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-2.5">
          <Skeleton className="h-12 w-full" />
          {shopConfig.pdp.buyWithShop.isEnabled ? <Skeleton className="h-12 w-full" /> : null}
        </div>
        <div className="grid gap-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
