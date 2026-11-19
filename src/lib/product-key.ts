export type ProductType = "COURSE" | "TOOL_PACKAGE";

export function productKey(type: ProductType, id: string): string {
  return `${type}:${id}`;
}

export function parseProductKey(key: string): { type: ProductType; id: string } | null {
  const sep = key.indexOf(":");
  if (sep === -1) return null;
  const type = key.slice(0, sep);
  const id = key.slice(sep + 1);
  if (type !== "COURSE" && type !== "TOOL_PACKAGE") return null;
  return { type, id };
}
