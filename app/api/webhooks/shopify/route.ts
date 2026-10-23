import crypto from "node:crypto";

import { revalidatePath, revalidateTag } from "next/cache";

import { getNumericShopifyId } from "@/lib/shopify/id/server";

const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

function verifyWebhook(body: string, hmacHeader: string | null, secret: string): boolean {
  if (!hmacHeader) return false;

  const expected = crypto.createHmac("sha256", secret).update(body, "utf8").digest();
  const received = Buffer.from(hmacHeader, "base64");

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

function readPayload(body: string): Record<string, unknown> | undefined {
  try {
    const payload = JSON.parse(body);
    return payload && typeof payload === "object" ? payload : undefined;
  } catch {
    return undefined;
  }
}

function stringField(
  payload: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = payload?.[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function productIdTag(payload: Record<string, unknown> | undefined): string | undefined {
  const graphqlId = stringField(payload, "admin_graphql_api_id");
  if (graphqlId) {
    const numericId = getNumericShopifyId(graphqlId);
    return numericId ? `product-${numericId}` : undefined;
  }
  const id = payload?.id;
  if (typeof id === "number" || typeof id === "string") return `product-${id}`;
  return undefined;
}

function invalidateTags(tags: string[]): string[] {
  const unique = [...new Set(tags)];
  for (const tag of unique) {
    revalidateTag(tag, { expire: 0 });
  }
  return unique;
}

function invalidatePaths(paths: Array<string | [string, "page"]>): string[] {
  const unique = new Map<string, string | [string, "page"]>();
  for (const path of paths) {
    unique.set(Array.isArray(path) ? `${path[0]}:${path[1]}` : path, path);
  }
  const invalidated: string[] = [];
  for (const path of unique.values()) {
    if (Array.isArray(path)) {
      revalidatePath(path[0], path[1]);
      invalidated.push(path[0]);
    } else {
      revalidatePath(path);
      invalidated.push(path);
    }
  }
  return invalidated;
}

export async function POST(request: Request) {
  if (!SHOPIFY_WEBHOOK_SECRET) return new Response(null, { status: 404 });

  const body = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");

  if (!verifyWebhook(body, hmacHeader, SHOPIFY_WEBHOOK_SECRET)) {
    console.error("Invalid Shopify webhook signature");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!topic) {
    return Response.json({ error: "Missing topic header" }, { status: 400 });
  }

  const payload = readPayload(body);
  const tags: string[] = [];
  const paths: Array<string | [string, "page"]> = [];

  if (topic.startsWith("products/")) {
    // Publishing a draft is an update, and that product is not yet on the cached list.
    tags.push("products-index");
    paths.push("/", "/collections/all", "/sitemap.xml");

    if (!payload) {
      console.error("[Shopify Webhook] Could not parse products payload");
      tags.push("products");
      paths.push(["/products/[handle]", "page"]);
    } else {
      const handle = stringField(payload, "handle");
      const idTag = productIdTag(payload);
      if (handle) {
        tags.push(`product-${handle}`, `recommendations-${handle}`);
        paths.push(`/products/${handle}`);
      } else {
        // products/delete identifies the product by id, so every product route refreshes on its next visit.
        paths.push(["/products/[handle]", "page"]);
      }
      if (idTag) tags.push(idTag);
      if (!handle && !idTag) tags.push("products");
    }
  }

  if (topic.startsWith("collections/")) {
    tags.push("collections-index");
    paths.push("/collections", "/sitemap.xml");

    if (!payload) {
      console.error("[Shopify Webhook] Could not parse collections payload");
      tags.push("collections");
      paths.push(["/collections/[handle]", "page"]);
    } else {
      const handle = stringField(payload, "handle");
      if (handle) {
        tags.push(`collection-${handle}`);
        paths.push(`/collections/${handle}`);
      } else {
        tags.push("collections");
        paths.push(["/collections/[handle]", "page"]);
      }
    }
  }

  if (topic === "inventory_levels/update") {
    // The payload names an inventory item, not a product, so sold-out state refreshes through the catalog tags.
    tags.push("products", "products-index");
    paths.push("/", "/collections/all", "/sitemap.xml", ["/products/[handle]", "page"]);
  }

  if (topic.startsWith("metaobjects/")) {
    tags.push("metaobjects");
    const handle = stringField(payload, "handle");
    if (handle) tags.push(`metaobject-${handle}`);
    if (!payload) console.error("[Shopify Webhook] Could not parse metaobjects payload");
  }

  const tagsInvalidated = tags.length > 0 ? invalidateTags(tags) : [];
  const pathsInvalidated = paths.length > 0 ? invalidatePaths(paths) : [];

  return Response.json({
    success: true,
    topic,
    tagsInvalidated,
    pathsInvalidated,
  });
}
