import { cn } from "cn";

import { shopConfig } from "@/lib/config";

import { Mark } from "./mark";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
      <Mark />
      <span className="font-display text-lg leading-none tracking-tight sm:text-xl">
        {shopConfig.site.name}
      </span>
    </span>
  );
}
