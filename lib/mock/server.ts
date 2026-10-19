import type { StorefrontClient } from "@shopify/hydrogen";

import { MOCK_CHECKOUT_MESSAGE } from "@/lib/mock";
import { mockOperation } from "@/lib/mock/catalog";

const CART_MUTATIONS: Record<string, string> = {
  CartAttributesUpdate: "cartAttributesUpdate",
  CartBuyerIdentityUpdate: "cartBuyerIdentityUpdate",
  CartCreate: "cartCreate",
  CartDiscountCodesUpdate: "cartDiscountCodesUpdate",
  CartLinesAdd: "cartLinesAdd",
  CartLinesRemove: "cartLinesRemove",
  CartLinesUpdate: "cartLinesUpdate",
  CartNoteUpdate: "cartNoteUpdate",
};

function operationName(query: string): string {
  return query.match(/\b(?:query|mutation)\s+(\w+)/)?.[1] ?? "anonymous";
}

function cartResponse(operation: string) {
  if (operation === "Cart") return { cart: null };
  const field = CART_MUTATIONS[operation];
  if (!field) return undefined;
  if (operation === "CartBuyerIdentityUpdate") {
    return {
      [field]: {
        cart: null,
        userErrors: [{ code: null, field: null, message: MOCK_CHECKOUT_MESSAGE }],
      },
    };
  }
  return {
    [field]: {
      cart: null,
      userErrors: [{ code: null, field: null, message: MOCK_CHECKOUT_MESSAGE }],
      warnings: [],
    },
  };
}

export function createMockStorefrontClient(
  requestContext: StorefrontClient["requestContext"],
): StorefrontClient {
  return {
    apiUrl: "https://preview.moonbeamnails.local/api/graphql.json",
    graphql: async (doc, ...rest) => {
      const query = typeof doc === "string" ? doc : "";
      const operation = operationName(query);
      const variables = (rest[0] as { variables?: Record<string, unknown> } | undefined)?.variables;
      const data = cartResponse(operation) ?? mockOperation(operation, variables ?? {});
      if (data === undefined) {
        throw new Error(`Preview catalog has no Storefront operation ${operation}.`);
      }
      return { data, headers: new Headers() } as never;
    },
    i18n: requestContext.i18n,
    requestContext,
    storeUrl: "https://preview.moonbeamnails.local",
    type: "public",
  };
}
