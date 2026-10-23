import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";

import {
  ProductColorCarousel,
  ProductColorGrid,
  ProductDetailSection,
  ProductDetailSkeleton,
  ProductPurchase,
} from "@/components/product-detail/product-detail-section";
import { RecentlyViewedRecorder } from "@/components/product-detail/recently-viewed";
import { RelatedProductsSection } from "@/components/product/related-products-section";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { shopConfig } from "@/lib/config";
import { getProduct, getProductHandles } from "@/lib/product/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { PLACEHOLDER_HANDLE } from "@/lib/static-params";

async function buildProductMetadata(handle: string, canonicalPath: string): Promise<Metadata> {
  const product = await getProduct({
    handle,
  });
  if (!product) notFound();
  const images = product.featuredImage
    ? [
        {
          url: product.featuredImage.url,
          width: product.featuredImage.width,
          height: product.featuredImage.height,
          alt: product.featuredImage.altText,
        },
      ]
    : ["/og-default.png"];
  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: buildAlternates({
      pathname: canonicalPath,
    }),
    openGraph: buildOpenGraph({
      title: product.seo.title,
      description: product.seo.description,
      url: canonicalPath,
      images,
    }),
    twitter: {
      card: "summary_large_image",
      title: product.seo.title,
      description: product.seo.description,
      images,
    },
  };
}

export async function generateStaticParams() {
  try {
    const handles = await getProductHandles();
    return handles.length > 0
      ? handles.map((handle) => ({ handle }))
      : [{ handle: PLACEHOLDER_HANDLE }];
  } catch {
    return [{ handle: PLACEHOLDER_HANDLE }];
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  if (handle === PLACEHOLDER_HANDLE) return {};
  return buildProductMetadata(handle, `/products/${handle}`);
}

export default function ProductPage({ params, searchParams }: PageProps<"/products/[handle]">) {
  return (
    <Page className="pt-0">
      <Container className="bg-background">
        <Sections>
          <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductFrame
              colorCarousel={<ProductColorCarousel params={params} searchParams={searchParams} />}
              colorGrid={<ProductColorGrid params={params} searchParams={searchParams} />}
              params={params}
              purchase={<ProductPurchase params={params} searchParams={searchParams} />}
            />
          </Suspense>
        </Sections>
      </Container>
    </Page>
  );
}

async function ProductFrame({
  colorCarousel,
  colorGrid,
  params,
  purchase,
}: {
  colorCarousel: ReactNode;
  colorGrid: ReactNode;
  params: PageProps<"/products/[handle]">["params"];
  purchase: ReactNode;
}) {
  const { handle } = await params;
  if (handle === PLACEHOLDER_HANDLE) notFound();
  const product = await getProduct({
    handle,
  });
  if (!product) notFound();

  return (
    <>
      <RecentlyViewedRecorder
        product={{
          featuredImage: product.featuredImage,
          handle: product.handle,
          id: product.id,
          price: product.price,
          title: product.title,
        }}
      />
      <ProductDetailSection
        colorCarousel={colorCarousel}
        colorGrid={colorGrid}
        product={product}
        purchase={purchase}
      />
      {shopConfig.pdp.relatedProducts.isEnabled ? (
        <RelatedProductsSection handle={handle} limit={4} />
      ) : null}
    </>
  );
}
