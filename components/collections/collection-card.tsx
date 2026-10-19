import { cn } from "cn";
import Image from "next/image";

import { NailSetArt } from "@/components/brand/nail-set";
import { Link } from "@/components/ui/link";
import type { CollectionWithThumbnail } from "@/lib/collections/types";

export interface CollectionCardProps {
  className?: string;
  collection: CollectionWithThumbnail;
  viewCollectionLabel: string;
}

export function CollectionCard({
  className,
  collection,
  viewCollectionLabel,
}: CollectionCardProps) {
  const { handle, thumbnail, title } = collection;

  return (
    <Link
      aria-label={`${viewCollectionLabel}: ${title}`}
      className={cn("flex flex-col h-full overflow-hidden", className)}
      href={`/collections/${handle}`}
    >
      <div data-slot="collection-card-image" className="relative aspect-square overflow-hidden">
        {thumbnail ? (
          <Image
            alt={thumbnail.altText || title}
            className="object-cover"
            fill
            sizes="100vw"
            src={thumbnail.url}
          />
        ) : (
          <NailSetArt title={title} />
        )}
      </div>
      <h2
        data-slot="collection-card-title"
        className="py-2.5 font-display text-base font-medium text-foreground line-clamp-1"
      >
        {title}
      </h2>
    </Link>
  );
}
