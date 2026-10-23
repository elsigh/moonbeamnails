import { cn } from "cn";
import type { ComponentProps } from "react";

const BLOSSOM_PETAL =
  "M0 0.05C0.42-0.35 0.62-1.55 0.48-2.55C0.28-3.05 0.12-2.85 0-3.45C-0.12-2.85-0.28-3.05-0.48-2.55C-0.62-1.55-0.42-0.35 0 0.05Z";

const MOON_PATH =
  "M5.8 16a9.2 9.2 0 1 1 18.4 0 9.2 9.2 0 1 1-18.4 0M11.5 16a7.7 7.7 0 1 1 15.4 0 7.7 7.7 0 1 1-15.4 0";

export function Mark({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-5 text-primary", className)}
      fill="none"
      viewBox="0 0 32 32"
      {...props}
    >
      <path d={MOON_PATH} fill="currentColor" fillRule="evenodd" />
      <g transform="translate(20.2 21)">
        {["0", "72", "144", "216", "288"].map((angle) => (
          <path
            key={angle}
            d={BLOSSOM_PETAL}
            fill="#f3b7c9"
            transform={`rotate(${angle}) scale(1.05)`}
          />
        ))}
        <circle cx="0" cy="0" fill="#fff0f5" r="0.55" />
      </g>
    </svg>
  );
}
