import { isMockCatalog, MOCK_CHECKOUT_MESSAGE } from "@/lib/mock";

export function PreviewBanner() {
  if (!isMockCatalog()) return null;
  return (
    <p className="bg-accent px-5 py-2 text-center text-sm text-accent-foreground">
      {`Preview catalog. ${MOCK_CHECKOUT_MESSAGE}`}
    </p>
  );
}
