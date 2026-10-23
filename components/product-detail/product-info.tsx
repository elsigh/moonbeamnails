import { cn } from "cn";
import type { ComponentProps } from "react";

import { isColorOption } from "@/lib/product";
import type { OptionGroupState } from "@/lib/product/types";

import { ColorPicker } from "./color-picker";
import { OptionPicker } from "./option-picker";

interface ProductInfoOptionsProps extends ComponentProps<"div"> {
  compact?: boolean;
  hideImages?: boolean;
  include?: "all" | "choices" | "single";
  onSelectValue?: (optionName: string, value: string) => void;
  options: OptionGroupState[];
}

function ProductInfoOptions({
  compact = false,
  hideImages,
  include = "all",
  onSelectValue,
  options,
  className,
  ...props
}: ProductInfoOptionsProps) {
  // Shopify emits a synthetic Title/Default Title option for products with no variant axes — hide it.
  const isShopifyDefaultOption = (opt: OptionGroupState) =>
    opt.name === "Title" && opt.values.length === 1 && opt.values[0]?.name === "Default Title";
  const isSingleValueOption = (opt: OptionGroupState) => opt.values.length === 1;
  const renderable = options.filter((opt) => !isShopifyDefaultOption(opt));
  const visible = renderable.filter((opt) =>
    include === "all"
      ? true
      : include === "single"
        ? isSingleValueOption(opt)
        : !isSingleValueOption(opt),
  );
  if (visible.length === 0) return null;

  const colorOptions = visible.filter((opt) => !isSingleValueOption(opt) && isColorOption(opt));
  const otherOptions = visible.filter((opt) => !isSingleValueOption(opt) && !isColorOption(opt));
  const shownSingleOptions = visible.filter(isSingleValueOption);
  return (
    <div data-slot="product-info-options" className={className} {...props}>
      <div className={cn("grid", compact ? "gap-2.5" : "gap-5")}>
        {shownSingleOptions.map((option) => (
          <p key={option.name} className="text-sm font-medium text-foreground/70">
            {option.name}: <span className="text-foreground">{option.values[0]?.name}</span>
          </p>
        ))}

        {colorOptions.map((option) => (
          <ColorPicker
            key={option.name}
            hideImages={hideImages}
            onSelectValue={onSelectValue}
            option={option}
          />
        ))}

        {otherOptions.map((option) => (
          <OptionPicker
            compact={compact}
            key={option.name}
            onSelectValue={onSelectValue}
            option={option}
          />
        ))}
      </div>
    </div>
  );
}

interface ProductInfoDescriptionProps extends ComponentProps<"div"> {
  descriptionHtml: string;
}

function ProductInfoDescription({
  descriptionHtml,
  className,
  ...props
}: ProductInfoDescriptionProps) {
  if (!descriptionHtml) return null;
  return (
    <div data-slot="product-info-description" className={className} {...props}>
      <div
        className="prose prose-sm text-foreground/80"
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />
    </div>
  );
}

export { ProductInfoDescription, ProductInfoOptions };
