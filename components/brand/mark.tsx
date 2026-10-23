import { cn } from "cn";
import type { ComponentProps } from "react";

import { Blossom } from "./blossom";

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
        <Blossom />
      </g>
    </svg>
  );
}
