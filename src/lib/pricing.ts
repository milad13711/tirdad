import "server-only";
import { prisma } from "@/lib/db";
import { productKey, type ProductType } from "@/lib/product-key";

export interface EffectivePrice {
  effectivePrice: number;
  onSale: boolean;
  saleEndsAt: Date | null;
}

// Resolves what a specific visitor (by IP) should actually pay right now.
// - No salePrice set -> full price, no sale.
// - salePrice set, no saleCountdownHours -> permanent blanket discount,
//   same for everyone, no timer.
// - salePrice set AND saleCountdownHours set -> a 24h-style countdown that
//   starts the first time THIS ip is seen on THIS product (not a single
//   global deadline — each new visitor gets their own window), tracked in
//   PriceCountdownView. Once their window elapses, price reverts to full
//   for them specifically.
// Called identically at display time (course/tool detail pages) and at
// checkout time (payments/request) so what's shown is what's charged.
export async function getEffectivePrice(
  params: {
    type: ProductType;
    id: string;
    price: number;
    salePrice: number | null;
    saleCountdownHours: number | null;
  },
  ip: string | null,
): Promise<EffectivePrice> {
  if (params.salePrice == null) {
    return { effectivePrice: params.price, onSale: false, saleEndsAt: null };
  }
  if (params.saleCountdownHours == null) {
    return { effectivePrice: params.salePrice, onSale: true, saleEndsAt: null };
  }
  if (!ip) {
    // Can't track a countdown without an IP (e.g. a server-to-server call)
    // — fail open with the discount rather than penalizing the visitor.
    return { effectivePrice: params.salePrice, onSale: true, saleEndsAt: null };
  }

  const key = productKey(params.type, params.id);
  const view = await prisma.priceCountdownView.upsert({
    where: { productKey_ip: { productKey: key, ip } },
    create: { productKey: key, ip },
    update: {},
  });

  const saleEndsAt = new Date(view.firstSeenAt.getTime() + params.saleCountdownHours * 60 * 60 * 1000);
  if (saleEndsAt.getTime() <= Date.now()) {
    return { effectivePrice: params.price, onSale: false, saleEndsAt: null };
  }
  return { effectivePrice: params.salePrice, onSale: true, saleEndsAt };
}
