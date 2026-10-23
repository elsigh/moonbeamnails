import { PredictiveSearchProvider } from "@shopify/hydrogen/react";
import { Suspense } from "react";

import { Wordmark } from "@/components/brand/wordmark";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { shopConfig } from "@/lib/config";
import type { MenuItem } from "@/lib/menu/types";

import { NavAccount, NavAccountFallback } from "./account";
import { CartIcon, CartIconFallback } from "./cart";
import { MobileMenu } from "./mobile-menu";
import { QuickLinks } from "./quick-links";
import { SearchModal } from "./search-modal";

export function Nav() {
  const items: MenuItem[] = [
    { id: "nav-shop", items: [], title: "Shop all", url: "/collections/all" },
    { id: "nav-collections", items: [], title: "Collections", url: "/collections" },
  ];
  return (
    <nav
      className="sticky top-0 z-30 w-full bg-background pt-[env(safe-area-inset-top,0px)] transition-shadow duration-250"
      id="nav-outer"
    >
      <Container className="flex h-16 items-center gap-2.5 md:gap-5">
        <MobileMenu items={items} />

        <Link className="flex shrink-0 items-center" href="/">
          <Wordmark />
        </Link>

        <QuickLinks items={items} />

        <div className="flex items-center gap-5 ml-auto">
          {shopConfig.search.isEnabled && (
            <PredictiveSearchProvider
              debounceInMs={300}
              limit={3}
              types={["PRODUCT", "COLLECTION", "QUERY"]}
            >
              <SearchModal />
            </PredictiveSearchProvider>
          )}
          {shopConfig.auth.isEnabled && (
            <Suspense fallback={<NavAccountFallback />}>
              <NavAccount />
            </Suspense>
          )}
          <Suspense fallback={<CartIconFallback />}>
            <CartIcon />
          </Suspense>
        </div>
      </Container>
    </nav>
  );
}
