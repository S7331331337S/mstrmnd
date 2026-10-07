// Copied into the CLI-generated discount Function by scripts/scaffold.mjs.
// Pure runtime: no network, clock, filesystem, or mutable state.
export type Input = {
  cart: { cost: { subtotalAmount: { amount: string; currencyCode: string } } };
  discount: { discountClasses: string[]; metafield?: { value: string } | null };
};
export function cartLinesDiscountsGenerateRun(input: Input) {
  const empty = { operations: [] };
  if (!input.discount.discountClasses.includes("ORDER")) return empty;
  let config;
  try { config = JSON.parse(input.discount.metafield?.value ?? "null"); } catch { return empty; }
  if (!config || config.version !== 1 || typeof config.percentage !== "number" ||
      !Number.isFinite(config.percentage) || config.percentage < 0.1 || config.percentage > 50 ||
      typeof config.minimumSubtotal !== "number" || !Number.isFinite(config.minimumSubtotal) ||
      config.minimumSubtotal < 0 || config.minimumSubtotal > 1000000 ||
      config.currencyCode !== input.cart.cost.subtotalAmount.currencyCode) return empty;
  const subtotal = Number(input.cart.cost.subtotalAmount.amount);
  if (!Number.isFinite(subtotal) || subtotal <= 0 || subtotal < config.minimumSubtotal) return empty;
  return { operations: [{ orderDiscountsAdd: {
    candidates: [{ message: `${config.percentage}% MSTRMND incentive`,
      targets: [{ orderSubtotal: { excludedCartLineIds: [] } }],
      value: { percentage: { value: String(config.percentage) } } }],
    selectionStrategy: "FIRST",
  } }] };
}
