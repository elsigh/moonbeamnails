import { cn } from "cn";
import type { ComponentProps } from "react";

export function Mark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-5 text-primary", className)}
      fill="none"
      viewBox="0 0 32 32"
      {...props}
    >
      <path d="M20.2 6.4a9.2 9.2 0 1 0 0 19.2 7.2 7.2 0 1 1 0-19.2Z" fill="currentColor" />
    </svg>
  );
}
