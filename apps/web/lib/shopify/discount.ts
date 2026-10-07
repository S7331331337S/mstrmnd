import { z } from "zod";

export const discountSchema = z.object({
  title: z.string().trim().min(1).max(80),
  percentage: z.number().finite().min(0.1).max(50),
  minimumSubtotal: z.number().finite().min(0).max(1000000),
  currencyCode: z.string().regex(/^[A-Z]{3}$/),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().nullable(),
}).refine((v) => !v.endsAt || Date.parse(v.endsAt) > Date.parse(v.startsAt), {
  message: "End time must be later than start time.", path: ["endsAt"],
});
export type DiscountDraft = z.infer<typeof discountSchema>;
export function previewDiscount(subtotal: number, draft: DiscountDraft) {
  const eligible = Number.isFinite(subtotal) && subtotal >= draft.minimumSubtotal;
  const savings = eligible ? Math.round(subtotal * draft.percentage) / 100 : 0;
  return { eligible, savings, total: Math.max(0, subtotal - savings) };
}
export function discountGid(value: string) {
  if (/^\d+$/.test(value)) return `gid://shopify/DiscountAutomaticNode/${value}`;
  if (/^gid:\/\/shopify\/(DiscountNode|DiscountAutomaticNode)\/\d+$/.test(value)) return value;
  throw new Error("Invalid automatic discount ID.");
}
