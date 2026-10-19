import type { ProductFilter } from "@shopify/hydrogen";

const CURRENCY = "USD";
const UPDATED_AT = "2026-09-12T15:00:00Z";

const SIZES = ["XS", "S", "M", "L"] as const;
const SHAPES = ["Almond", "Coffin", "Square"] as const;

interface MockProductInput {
  compareAt?: string;
  description: string;
  handle: string;
  id: number;
  price: string;
  title: string;
}

interface MockVariant {
  availableForSale: boolean;
  compareAtPrice: string;
  id: string;
  price: string;
  selectedOptions: Array<{ name: string; value: string }>;
  sku: string;
  title: string;
}

interface MockProduct extends MockProductInput {
  availableForSale: boolean;
  keywords: string;
  variants: MockVariant[];
}

interface MockCollection {
  description: string;
  handle: string;
  id: number;
  productHandles: string[];
  title: string;
}

const SOLD_OUT = new Set<string>();

const PRODUCT_INPUTS: MockProductInput[] = [
  {
    description:
      "Pearl white with a warm moonlight sheen and a tiny gold crescent near the tip. Moonbeam Glow is the set Opal paints when she wants the nails to look lit from the side.",
    handle: "moonbeam-glow",
    id: 1001,
    price: "24.00",
    title: "Moonbeam Glow",
  },
  {
    description:
      "Iridescent pearl that shifts through lavender, blush, and pale silver as the light moves. Opal Shimmer is finished with a clear top coat so the color stays smooth.",
    handle: "opal-shimmer",
    id: 1002,
    price: "26.00",
    title: "Opal Shimmer",
  },
  {
    description:
      "Deep twilight navy with hand-painted silver stars and a small crescent. Starlit Night is the darkest set in the studio, made for evenings.",
    handle: "starlit-night",
    id: 1003,
    price: "24.00",
    title: "Starlit Night",
  },
  {
    description:
      "Soft lilac washed with pearl. Lavender Dream is the quietest color Opal paints, and the shimmer only shows when a hand turns.",
    handle: "lavender-dream",
    id: 1004,
    price: "22.00",
    title: "Lavender Dream",
  },
];

const COLLECTIONS: MockCollection[] = [
  {
    description:
      "Night-sky sets in pearl, opal, lavender, and twilight navy. Each one is painted by hand.",
    handle: "celestial",
    id: 3001,
    productHandles: ["moonbeam-glow", "opal-shimmer", "starlit-night", "lavender-dream"],
    title: "Celestial",
  },
  {
    description:
      "The softer sets: lilac and iridescent pearl for days that do not need a night sky.",
    handle: "lavender",
    id: 3002,
    productHandles: ["lavender-dream", "opal-shimmer"],
    title: "Lavender",
  },
];

const POLICIES = [
  {
    body: "<p>Moonbeam Nails ships press-on sets from the studio. Orders placed before a store is connected to Shopify are previews only, and nothing is charged.</p><p>Once checkout is live, sets ship from the United States. You will get a tracking note when a finished set leaves the studio.</p>",
    handle: "shipping-policy",
    title: "Shipping",
  },
  {
    body: "<p>If a set arrives damaged, or the size you chose does not fit, write to the studio and we will help you exchange it.</p><p>Because the nails are painted by hand, slight differences from the photos are part of the piece. Custom paint is not returnable once it has been worn.</p>",
    handle: "refund-policy",
    title: "Returns",
  },
  {
    body: "<p>Moonbeam Nails keeps only what a shop needs to send an order: a name, an address, and an email. Lindsey, Opal’s parent, looks after the accounts and the mailbox.</p><p>The preview catalog on this site does not store a cart on Shopify.</p>",
    handle: "privacy-policy",
    title: "Privacy",
  },
  {
    body: "<p>Each set is handmade press-on nails for personal wear. Sizes run XS, S, M, and L. Shapes are almond, coffin, and square.</p><p>The pictures on this site show the artwork. Your set is painted by Opal in a small batch, so the shimmer and the tiny stars will be close to the picture, not a print of it.</p>",
    handle: "terms-of-service",
    title: "Terms of service",
  },
];

function money(amount: string) {
  return { amount, currencyCode: CURRENCY };
}

function buildVariants(product: MockProductInput): MockVariant[] {
  const variants: MockVariant[] = [];
  SIZES.forEach((size, sizeIndex) => {
    SHAPES.forEach((shape, shapeIndex) => {
      const idNumber = product.id * 100 + sizeIndex * 10 + shapeIndex;
      variants.push({
        availableForSale: !SOLD_OUT.has(`${product.handle}:${size}:${shape}`),
        compareAtPrice: product.compareAt ?? product.price,
        id: `gid://shopify/ProductVariant/${idNumber}`,
        price: product.price,
        selectedOptions: [
          { name: "Size", value: size },
          { name: "Shape", value: shape },
        ],
        sku: `MBN-${product.handle}-${size}-${shape}`.toUpperCase(),
        title: `${size} / ${shape}`,
      });
    });
  });
  return variants;
}

const PRODUCTS: MockProduct[] = PRODUCT_INPUTS.map((product) => {
  const variants = buildVariants(product);
  const collections = COLLECTIONS.filter((collection) =>
    collection.productHandles.includes(product.handle),
  )
    .map((collection) => collection.title)
    .join(" ");
  return {
    ...product,
    availableForSale: variants.some((variant) => variant.availableForSale),
    keywords:
      `${product.title} ${product.handle} ${product.description} ${collections} press-on nails`.toLowerCase(),
    variants,
  };
});

const PRODUCTS_BY_HANDLE = new Map(PRODUCTS.map((product) => [product.handle, product]));
const PRODUCTS_BY_ID = new Map(
  PRODUCTS.map((product) => [`gid://shopify/Product/${product.id}`, product]),
);

function productByHandle(handle: string): MockProduct | undefined {
  return PRODUCTS_BY_HANDLE.get(handle);
}

function firstAvailable(product: MockProduct): MockVariant {
  return product.variants.find((variant) => variant.availableForSale) ?? product.variants[0];
}

function variantMatches(
  variant: MockVariant,
  selectedOptions: Array<{ name?: string; value?: string }>,
): boolean {
  return selectedOptions.every((selected) =>
    variant.selectedOptions.some(
      (option) =>
        option.name.toLowerCase() === selected.name?.toLowerCase() &&
        option.value.toLowerCase() === selected.value?.toLowerCase(),
    ),
  );
}

function resolveVariant(
  product: MockProduct,
  selectedOptions: Array<{ name?: string; value?: string }> | undefined,
  exact: boolean,
): MockVariant | null {
  if (!selectedOptions?.length) return exact ? null : firstAvailable(product);
  const match = product.variants.find((variant) => variantMatches(variant, selectedOptions));
  if (match) return match;
  return exact ? null : firstAvailable(product);
}

function firstSelectable(product: MockProduct, name: string, value: string): MockVariant {
  return (
    product.variants.find(
      (variant) =>
        variant.availableForSale &&
        variant.selectedOptions.some((option) => option.name === name && option.value === value),
    ) ??
    product.variants.find((variant) =>
      variant.selectedOptions.some((option) => option.name === name && option.value === value),
    ) ??
    firstAvailable(product)
  );
}

function shopifyVariant(product: MockProduct, variant: MockVariant, sku = false) {
  return {
    availableForSale: variant.availableForSale,
    compareAtPrice: money(variant.compareAtPrice),
    components: { nodes: [] },
    groupedBy: { nodes: [] },
    id: variant.id,
    image: null,
    price: money(variant.price),
    product: {
      featuredImage: null,
      handle: product.handle,
      id: `gid://shopify/Product/${product.id}`,
      requiresSellingPlan: false,
      title: product.title,
    },
    requiresComponents: false,
    selectedOptions: variant.selectedOptions,
    sellingPlanAllocations: { nodes: [] },
    ...(sku ? { sku: variant.sku } : {}),
    title: variant.title,
  };
}

function shopifyProduct(product: MockProduct, variant?: MockVariant) {
  const selected = variant ?? firstAvailable(product);
  const descriptionHtml = product.description
    .split("\n")
    .filter(Boolean)
    .map((paragraph) => `<p>${paragraph}</p>`)
    .join("");
  return {
    adjacentVariants: product.variants.map((item) => shopifyVariant(product, item)),
    availableForSale: product.availableForSale,
    category: {
      ancestors: [
        { id: "gid://shopify/TaxonomyCategory/beauty", name: "Beauty" },
        { id: "gid://shopify/TaxonomyCategory/nails", name: "Nails" },
      ],
      id: "gid://shopify/TaxonomyCategory/press-on-nails",
      name: "Press-on nails",
    },
    compareAtPriceRange: {
      maxVariantPrice: money(selected.compareAtPrice),
      minVariantPrice: money(selected.compareAtPrice),
    },
    description: product.description,
    descriptionHtml,
    encodedVariantAvailability: null,
    encodedVariantExistence: null,
    featuredImage: null,
    handle: product.handle,
    id: `gid://shopify/Product/${product.id}`,
    isGiftCard: false,
    media: { edges: [] },
    options: [
      {
        id: `gid://shopify/ProductOption/${product.id}1`,
        name: "Size",
        optionValues: SIZES.map((size) => ({
          firstSelectableVariant: shopifyVariant(product, firstSelectable(product, "Size", size)),
          name: size,
          swatch: null,
        })),
      },
      {
        id: `gid://shopify/ProductOption/${product.id}2`,
        name: "Shape",
        optionValues: SHAPES.map((shape) => ({
          firstSelectableVariant: shopifyVariant(product, firstSelectable(product, "Shape", shape)),
          name: shape,
          swatch: null,
        })),
      },
    ],
    priceRange: {
      maxVariantPrice: money(product.price),
      minVariantPrice: money(product.price),
    },
    selectedOrFirstAvailableVariant: shopifyVariant(product, selected, true),
    seo: {
      description: product.description,
      title: product.title,
    },
    title: product.title,
    updatedAt: UPDATED_AT,
    variants: {
      edges: product.variants.map((item) => ({ node: shopifyVariant(product, item) })),
    },
    variantsCount: { count: product.variants.length },
    vendor: "Moonbeam Nails",
  };
}

function shopifyCard(product: MockProduct) {
  const full = shopifyProduct(product);
  return {
    __typename: "Product" as const,
    availableForSale: full.availableForSale,
    compareAtPriceRange: {
      minVariantPrice: full.compareAtPriceRange.minVariantPrice,
    },
    featuredImage: full.featuredImage,
    handle: full.handle,
    id: full.id,
    isGiftCard: false,
    options: full.options.map((option) => ({
      name: option.name,
      optionValues: option.optionValues.map((value) => ({
        firstSelectableVariant: {
          image: value.firstSelectableVariant.image,
          selectedOptions: value.firstSelectableVariant.selectedOptions,
        },
        name: value.name,
        swatch: null,
      })),
    })),
    priceRange: full.priceRange,
    selectedOrFirstAvailableVariant: {
      selectedOptions: full.selectedOrFirstAvailableVariant.selectedOptions,
    },
    title: full.title,
    vendor: full.vendor,
  };
}

function shopifyCollection(collection: MockCollection) {
  return {
    description: collection.description,
    handle: collection.handle,
    id: `gid://shopify/Collection/${collection.id}`,
    image: null,
    seo: {
      description: collection.description,
      title: collection.title,
    },
    title: collection.title,
    updatedAt: UPDATED_AT,
  };
}

function readFilters(value: unknown): ProductFilter[] {
  return Array.isArray(value) ? (value as ProductFilter[]) : [];
}

function readSelectedOptions(value: unknown): Array<{ name?: string; value?: string }> | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter(
    (option): option is { name?: string; value?: string } =>
      typeof option === "object" && option !== null,
  );
}

function matchesOptionFilters(product: MockProduct, filters: ProductFilter[]): boolean {
  const groups = new Map<string, string[]>();
  for (const filter of filters) {
    const option = filter.variantOption;
    if (!option?.name || !option.value) continue;
    const values = groups.get(option.name) ?? [];
    values.push(option.value.toLowerCase());
    groups.set(option.name, values);
  }
  if (groups.size === 0) return true;
  return product.variants.some((variant) => {
    for (const [name, values] of groups) {
      const selected = variant.selectedOptions.find((option) => option.name === name);
      if (!selected || !values.includes(selected.value.toLowerCase())) return false;
    }
    return true;
  });
}

function matchesPrice(product: MockProduct, filters: ProductFilter[]): boolean {
  const price = Number(product.price);
  return filters.every((filter) => {
    if (!filter.price) return true;
    if (filter.price.min != null && price < filter.price.min) return false;
    if (filter.price.max != null && price > filter.price.max) return false;
    return true;
  });
}

function matchesAvailability(product: MockProduct, filters: ProductFilter[]): boolean {
  return filters.every((filter) => {
    if (filter.available == null) return true;
    return filter.available === product.availableForSale;
  });
}

function matchesQuery(product: MockProduct, query: unknown): boolean {
  const text = typeof query === "string" ? query.trim().toLowerCase() : "";
  if (!text || text === "*") return true;
  return text.split(/\s+/).every((token) => product.keywords.includes(token));
}

function sortProducts(products: MockProduct[], sortKey: unknown, reverse: unknown): MockProduct[] {
  const copy = [...products];
  if (sortKey === "PRICE") {
    copy.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortKey === "TITLE") {
    copy.sort((a, b) => a.title.localeCompare(b.title));
  }
  if (reverse === true) copy.reverse();
  return copy;
}

function paginate<T extends { id: string }>(items: T[], first: unknown, after: unknown) {
  const limit = typeof first === "number" ? first : 50;
  let start = 0;
  if (typeof after === "string" && after) {
    const index = items.findIndex((item) => item.id === after);
    start = index >= 0 ? index + 1 : items.length;
  }
  const slice = items.slice(start, start + limit);
  return {
    edges: slice.map((node) => ({ cursor: node.id, node })),
    pageInfo: {
      endCursor: slice.at(-1)?.id ?? null,
      hasNextPage: start + limit < items.length,
      hasPreviousPage: start > 0,
      startCursor: slice[0]?.id ?? null,
    },
  };
}

function facetFilters(products: MockProduct[]) {
  const amounts = products.map((product) => Number(product.price));
  const min = amounts.length ? Math.floor(Math.min(...amounts)) : 0;
  const max = amounts.length ? Math.ceil(Math.max(...amounts)) : 0;
  const optionGroups = [
    { label: "Size", name: "Size", values: SIZES },
    { label: "Shape", name: "Shape", values: SHAPES },
  ];
  return [
    ...optionGroups.map((group) => ({
      id: `filter.v.option.${group.name.toLowerCase()}`,
      label: group.label,
      presentation: "TEXT" as const,
      type: "LIST" as const,
      values: group.values.map((value) => ({
        count: products.filter((product) =>
          product.variants.some((variant) =>
            variant.selectedOptions.some(
              (option) => option.name === group.name && option.value === value,
            ),
          ),
        ).length,
        id: `filter.v.option.${group.name.toLowerCase()}.${value.toLowerCase()}`,
        input: JSON.stringify({ variantOption: { name: group.name, value } }),
        label: value,
        swatch: null,
      })),
    })),
    {
      id: "filter.v.price",
      label: "Price",
      presentation: null,
      type: "PRICE_RANGE" as const,
      values: [
        {
          count: products.length,
          id: "filter.v.price.range",
          input: JSON.stringify({ price: { max, min } }),
          label: "Price",
          swatch: null,
        },
      ],
    },
  ];
}

function collectionProducts(handle: string): MockProduct[] {
  const collection = COLLECTIONS.find((item) => item.handle === handle);
  if (!collection) return [];
  return collection.productHandles.flatMap((productHandle) => {
    const product = productByHandle(productHandle);
    return product ? [product] : [];
  });
}

export function mockOperation(operation: string, variables: Record<string, unknown>) {
  switch (operation) {
    case "collectionProducts":
      return mockCollectionProducts(variables);
    case "getArticleSitemapPage":
      return {
        articles: { nodes: [], pageInfo: { endCursor: null, hasNextPage: false } },
      };
    case "getBlog":
    case "getBlogArticle":
      return { blog: null };
    case "getCollection":
      return { collection: mockCollectionNode(variables.handle) };
    case "getCollections":
      return { collections: mockCollectionConnection(variables.first, false) };
    case "getCollectionsWithFeaturedImage":
      return { collections: mockCollectionConnection(variables.first, true) };
    case "getPage":
      return { page: null };
    case "getProductByHandle":
    case "getProductByHandleWithBundles":
    case "getProductWithVariants":
      return { product: mockFullProduct(variables.handle) };
    case "getProductVariant":
    case "getProductVariantWithBundles":
      return { product: mockSelectedVariant(variables, false) };
    case "getProductVariantBySelectedOptions":
      return { product: mockSelectedVariant(variables, true) };
    case "getProductsByIds":
      return { nodes: mockNodesByIds(variables.ids) };
    case "getShopPolicies":
      return { shop: mockShopPolicies() };
    case "getSitemapPage":
      return { sitemap: { resources: { items: mockSitemapItems(variables) } } };
    case "getSitemapPagesCount":
      return { sitemap: { pagesCount: { count: mockSitemapCount(variables.type) } } };
    case "PredictiveSearch":
      return { predictiveSearch: mockPredictiveSearch(variables) };
    case "productOptionValues":
      return { nodes: mockOptionValueNodes(variables.ids) };
    case "productRecommendations":
      return { productRecommendations: mockRecommendations(variables.handle) };
    case "searchFacets":
      return { search: mockSearchFacets(variables) };
    case "searchProducts":
      return { search: mockSearchProducts(variables) };
    default:
      return undefined;
  }
}

function mockFullProduct(handle: unknown) {
  const product = typeof handle === "string" ? productByHandle(handle) : undefined;
  return product ? shopifyProduct(product) : null;
}

function mockSelectedVariant(variables: Record<string, unknown>, exact: boolean) {
  const product =
    typeof variables.handle === "string" ? productByHandle(variables.handle) : undefined;
  if (!product) return null;
  const selected = resolveVariant(product, readSelectedOptions(variables.selectedOptions), exact);
  if (exact) {
    return {
      options: shopifyProduct(product).options.map((option) => ({
        name: option.name,
        optionValues: option.optionValues.map((value) => ({ name: value.name })),
      })),
      variantBySelectedOptions: selected ? shopifyVariant(product, selected) : null,
    };
  }
  return {
    selectedOrFirstAvailableVariant: selected ? shopifyVariant(product, selected, true) : null,
  };
}

function mockNodesByIds(ids: unknown) {
  const list = Array.isArray(ids) ? ids : [];
  return list.map((id) => {
    const product = typeof id === "string" ? PRODUCTS_BY_ID.get(id) : undefined;
    return product ? shopifyCard(product) : null;
  });
}

function mockOptionValueNodes(ids: unknown) {
  const list = Array.isArray(ids) ? ids : [];
  return list.map((id) => {
    const product = typeof id === "string" ? PRODUCTS_BY_ID.get(id) : undefined;
    if (!product) return null;
    return {
      __typename: "Product" as const,
      handle: product.handle,
      options: [
        { name: "Size", optionValues: SIZES.map((name) => ({ name })) },
        { name: "Shape", optionValues: SHAPES.map((name) => ({ name })) },
      ],
    };
  });
}

function mockRecommendations(handle: unknown) {
  const current = typeof handle === "string" ? productByHandle(handle) : undefined;
  const sameCollection = COLLECTIONS.find((collection) =>
    collection.productHandles.includes(current?.handle ?? ""),
  );
  const preferred = sameCollection ? collectionProducts(sameCollection.handle) : PRODUCTS;
  return preferred
    .filter((product) => product.handle !== current?.handle)
    .slice(0, 4)
    .map(shopifyCard);
}

function browseProducts(variables: Record<string, unknown>, source: MockProduct[]) {
  const filters = readFilters(variables.filters ?? variables.productFilters);
  const matched = source.filter(
    (product) =>
      matchesQuery(product, variables.query) &&
      matchesPrice(product, filters) &&
      matchesAvailability(product, filters),
  );
  const visible = sortProducts(
    matched.filter((product) => matchesOptionFilters(product, filters)),
    variables.sortKey,
    variables.reverse,
  );
  const page = paginate(visible.map(shopifyCard), variables.first, variables.after);
  return { ...page, productFilters: facetFilters(matched) };
}

function mockSearchProducts(variables: Record<string, unknown>) {
  return browseProducts(variables, PRODUCTS);
}

function mockSearchFacets(variables: Record<string, unknown>) {
  const filters = readFilters(variables.productFilters);
  const matched = PRODUCTS.filter(
    (product) =>
      matchesQuery(product, variables.query) &&
      matchesPrice(product, filters) &&
      matchesAvailability(product, filters) &&
      matchesOptionFilters(product, filters),
  );
  const sample = matched[0];
  return {
    nodes: sample
      ? [
          {
            __typename: "Product" as const,
            priceRange: { minVariantPrice: { currencyCode: CURRENCY } },
          },
        ]
      : [],
    productFilters: facetFilters(matched),
    totalCount: matched.length,
  };
}

function mockCollectionProducts(variables: Record<string, unknown>) {
  const handle = typeof variables.handle === "string" ? variables.handle : "";
  const collection = COLLECTIONS.find((item) => item.handle === handle);
  if (!collection) return { collection: null };
  const { edges, pageInfo, productFilters } = browseProducts(variables, collectionProducts(handle));
  return { collection: { products: { edges, filters: productFilters, pageInfo } } };
}

function mockCollectionNode(handle: unknown) {
  const collection = COLLECTIONS.find((item) => item.handle === handle);
  return collection ? shopifyCollection(collection) : null;
}

function mockCollectionConnection(first: unknown, withProducts: boolean) {
  const limit = typeof first === "number" ? first : COLLECTIONS.length;
  const nodes = COLLECTIONS.slice(0, limit).map((collection) => {
    const base = shopifyCollection(collection);
    if (!withProducts) return base;
    const product = productByHandle(collection.productHandles[0]);
    return {
      ...base,
      products: {
        edges: product
          ? [
              {
                node: {
                  featuredImage: null,
                  id: `gid://shopify/Product/${product.id}`,
                },
              },
            ]
          : [],
      },
    };
  });
  return { edges: nodes.map((node) => ({ node })) };
}

function mockShopPolicies() {
  const byHandle = new Map(POLICIES.map((policy) => [policy.handle, policy]));
  const policy = (handle: string) => byHandle.get(handle) ?? null;
  return {
    contactInformation: null,
    legalNotice: null,
    privacyPolicy: policy("privacy-policy"),
    refundPolicy: policy("refund-policy"),
    shippingPolicy: policy("shipping-policy"),
    termsOfSale: null,
    termsOfService: policy("terms-of-service"),
  };
}

function mockSitemapCount(type: unknown): number {
  if (type === "PRODUCT") return PRODUCTS.length > 0 ? 1 : 0;
  if (type === "COLLECTION") return COLLECTIONS.length > 0 ? 1 : 0;
  return 0;
}

function mockSitemapItems(variables: Record<string, unknown>) {
  if (variables.page !== 1) return [];
  if (variables.type === "PRODUCT") {
    return PRODUCTS.map((product) => ({ handle: product.handle, updatedAt: UPDATED_AT }));
  }
  if (variables.type === "COLLECTION") {
    return COLLECTIONS.map((collection) => ({
      handle: collection.handle,
      updatedAt: UPDATED_AT,
    }));
  }
  return [];
}

function mockPredictiveSearch(variables: Record<string, unknown>) {
  const limit = typeof variables.limit === "number" ? variables.limit : 3;
  const term = typeof variables.term === "string" ? variables.term.trim().toLowerCase() : "";
  const products = PRODUCTS.filter((product) => matchesQuery(product, term)).slice(0, limit);
  const collections = COLLECTIONS.filter((collection) =>
    `${collection.title} ${collection.description}`.toLowerCase().includes(term),
  ).slice(0, limit);
  return {
    articles: [],
    collections: collections.map((collection) => ({
      __typename: "Collection" as const,
      handle: collection.handle,
      id: `gid://shopify/Collection/${collection.id}`,
      image: shopifyCollection(collection).image,
      title: collection.title,
      trackingParameters: "",
    })),
    pages: [],
    products: products.map((product) => {
      const card = shopifyCard(product);
      const variant = firstAvailable(product);
      return {
        __typename: "Product" as const,
        featuredImage: card.featuredImage,
        handle: card.handle,
        id: card.id,
        priceRange: { minVariantPrice: card.priceRange.minVariantPrice },
        selectedOrFirstAvailableVariant: {
          id: variant.id,
          image: card.featuredImage,
          price: card.priceRange.minVariantPrice,
        },
        title: card.title,
        trackingParameters: "",
      };
    }),
    queries: term
      ? [
          {
            __typename: "SearchQuerySuggestion" as const,
            styledText: term,
            text: term,
            trackingParameters: "",
          },
        ]
      : [],
  };
}
