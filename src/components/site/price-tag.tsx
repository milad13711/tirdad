import { formatToman } from "@/lib/format";

// Shared "price, or struck-through price + sale price" renderer for any
// product with a Course/ToolPackage-style price + salePrice pair.
export function PriceTag({
  price,
  salePrice,
  suffix = " تومان",
  className,
}: {
  price: number;
  salePrice?: number | null;
  suffix?: string;
  className?: string;
}) {
  if (salePrice == null) {
    return (
      <span className={className}>
        {formatToman(price)}
        {suffix}
      </span>
    );
  }
  return (
    <span className={className}>
      <span className="ml-1.5 text-muted-foreground line-through">{formatToman(price)}</span>
      <span>
        {formatToman(salePrice)}
        {suffix}
      </span>
    </span>
  );
}
