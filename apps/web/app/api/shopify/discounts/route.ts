import { authenticateShopify, ShopifyError } from "@/lib/shopify/auth";
import { discountGid, discountSchema } from "@/lib/shopify/discount";
import { SHOP, GET_DISCOUNT, CREATE_DISCOUNT, UPDATE_DISCOUNT } from "@/lib/shopify/operations";
export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store" };
type Graphql = Awaited<ReturnType<typeof authenticateShopify>>;
type Existing = { discountNode: null | {
  configuration: null | { id: string; value: string };
  discount: { __typename: string; title: string; startsAt: string; endsAt: string | null; appDiscountType: { functionId: string } };
} };
async function ownedDiscount(graphql: Graphql, id: string) {
  const { discountNode: node } = await graphql<Existing>(GET_DISCOUNT, { id });
  if (!node || node.discount.__typename !== "DiscountAutomaticApp" ||
      node.discount.appDiscountType.functionId !== process.env.SHOPIFY_FUNCTION_ID || !node.configuration)
    throw new ShopifyError("This discount is not managed by MSTRMND.", 404);
  return node;
}
function failure(error: unknown) {
  const status = error instanceof ShopifyError ? error.status : 500;
  return Response.json({ error: error instanceof ShopifyError ? error.message : "The request could not be completed. Check Shopify admin before retrying a save." }, { status, headers });
}
export async function GET(request: Request) {
  try {
    const graphql = await authenticateShopify(request);
    const { shop } = await graphql<{ shop: { currencyCode: string } }>(SHOP);
    const rawId = new URL(request.url).searchParams.get("id");
    if (!rawId) return Response.json({ currencyCode: shop.currencyCode }, { headers });
    let id; try { id = discountGid(rawId); } catch { throw new ShopifyError("Invalid discount ID."); }
    const node = await ownedDiscount(graphql, id);
    const configuration = JSON.parse(node.configuration!.value);
    const draft = discountSchema.parse({ ...configuration, title: node.discount.title,
      startsAt: node.discount.startsAt, endsAt: node.discount.endsAt });
    return Response.json({ draft, currencyCode: shop.currencyCode }, { headers });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) throw new ShopifyError("JSON required.", 415);
    const graphql = await authenticateShopify(request);
    const text = await request.text();
    if (text.length > 8192) throw new ShopifyError("Request too large.", 413);
    let body; try { body = JSON.parse(text); } catch { throw new ShopifyError("Invalid JSON."); }
    if (body?.confirmed !== true) throw new ShopifyError("Confirm the discount before saving.");
    const parsed = discountSchema.safeParse(body.draft);
    if (!parsed.success) throw new ShopifyError(parsed.error.issues[0].message);
    const draft = parsed.data;
    const { shop } = await graphql<{ shop: { currencyCode: string } }>(SHOP);
    if (shop.currencyCode !== draft.currencyCode) throw new ShopifyError("Discount currency must match the shop currency.");
    let id: string | undefined;
    if (body.id !== undefined) {
      try { id = discountGid(body.id); } catch { throw new ShopifyError("Invalid discount ID."); }
    }
    const existing = id ? await ownedDiscount(graphql, id) : null;
    const configuration = JSON.stringify({ version: 1, percentage: draft.percentage,
      minimumSubtotal: draft.minimumSubtotal, currencyCode: draft.currencyCode });
    const metafield = existing
      ? { id: existing.configuration!.id, value: configuration }
      : { namespace: "$app:mstrmnd", key: "cart-incentive", type: "json", value: configuration };
    const discount = { title: draft.title, startsAt: draft.startsAt, endsAt: draft.endsAt,
      ...(!id ? { functionId: process.env.SHOPIFY_FUNCTION_ID, discountClasses: ["ORDER"],
        combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: false } } : {}),
      metafields: [metafield] };
    const data = await graphql<{ result: { automaticAppDiscount: null | { discountId: string }; userErrors: { message: string }[] } }>(
      id ? UPDATE_DISCOUNT : CREATE_DISCOUNT, { ...(id ? { id } : {}), discount });
    if (data.result.userErrors.length) throw new ShopifyError(data.result.userErrors.map((e) => e.message).join(" "));
    if (!data.result.automaticAppDiscount) throw new ShopifyError("No discount returned. Check Shopify admin before retrying.", 502);
    return Response.json({ id: data.result.automaticAppDiscount.discountId }, { headers });
  } catch (error) { return failure(error); }
}
