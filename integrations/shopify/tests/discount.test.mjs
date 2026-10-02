import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cartLinesDiscountsGenerateRun as run } from '../function/cart_lines_discounts_generate_run.ts';
import { cartDeliveryOptionsDiscountsGenerateRun as delivery } from '../function/cart_delivery_options_discounts_generate_run.ts';
import { discountSchema, discountGid, previewDiscount } from '../../../apps/web/lib/shopify/discount.ts';
import { verifyShopifyToken, authenticateShopify } from '../../../apps/web/lib/shopify/auth.ts';
import { createHmac } from 'node:crypto';
const fixture = () => JSON.parse(readFileSync(new URL('../fixtures/cart.json', import.meta.url)));
const expected = JSON.parse(readFileSync(new URL('../fixtures/expected.json', import.meta.url)));
const withConfig = (config) => { const input = fixture(); input.discount.metafield.value = JSON.stringify({ version: 1, percentage: 10, minimumSubtotal: 100, currencyCode: 'USD', ...config }); return input; };
test('qualifying cart emits the documented order-discount shape', () => assert.deepEqual(run(fixture()), expected));
test('threshold is inclusive and below-threshold carts do not discount', () => {
  const input = fixture(); input.cart.cost.subtotalAmount.amount = '100.00'; assert.deepEqual(run(input), expected);
  input.cart.cost.subtotalAmount.amount = '99.99'; assert.deepEqual(run(input), { operations: [] });
});
test('configuration corruption, unsafe percentages and currency mismatch fail closed', () => {
  for (const config of [ { percentage: 51 }, { percentage: 0 }, { percentage: '10' }, { percentage: null },
    { minimumSubtotal: -1 }, { minimumSubtotal: '100' }, { version: 2 }, { currencyCode: 'EUR' }]) {
    assert.deepEqual(run(withConfig(config)), { operations: [] });
  }
  const input = fixture(); input.discount.metafield.value = '{broken'; assert.deepEqual(run(input), { operations: [] });
  input.discount.metafield = null; assert.deepEqual(run(input), { operations: [] });
});
test('wrong class, invalid subtotal, and zero carts never discount; shipping unchanged', () => {
  const input = fixture(); input.discount.discountClasses = ['SHIPPING']; assert.deepEqual(run(input), { operations: [] });
  for (const amount of ['0', '-1', 'NaN']) { const cart = withConfig({ minimumSubtotal: 0 }); cart.cart.cost.subtotalAmount.amount = amount; assert.deepEqual(run(cart), { operations: [] }); }
  assert.deepEqual(delivery(), { operations: [] });
});
const draft = { title: 'Incentive', percentage: 10, minimumSubtotal: 100, currencyCode: 'USD', startsAt: '2026-10-01T12:00:00Z', endsAt: null };
test('draft validation rejects invalid ranges, blank names, and reversed dates', () => {
  for (const value of [{ percentage: 51 }, { title: ' ' }, { minimumSubtotal: -1 }, { endsAt: '2026-09-01T12:00:00Z' }]) assert.equal(discountSchema.safeParse({ ...draft, ...value }).success, false);
  assert.equal(discountSchema.safeParse(draft).success, true);
  assert.deepEqual(previewDiscount(150, draft), { eligible: true, savings: 15, total: 135 });
});
test('discount identifiers cannot name another Shopify resource', () => {
  assert.equal(discountGid('12'), 'gid://shopify/DiscountAutomaticNode/12');
  assert.throws(() => discountGid('gid://shopify/Product/12'));
});
const secret = 'test-only-signing-secret';
function token(overrides = {}, signature = secret) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const claims = Buffer.from(JSON.stringify({ aud: 'pilot-client', iss: 'https://pilot.myshopify.com/admin', dest: 'https://pilot.myshopify.com', sub: '123', exp: now + 60, nbf: now - 1, ...overrides })).toString('base64url');
  const data = `${header}.${claims}`;
  return `${data}.${createHmac('sha256', signature).update(data).digest('base64url')}`;
}
test('signed Shopify identity verified; expiry, audience, issuer, signature and SSRF rejected', async () => {
  assert.deepEqual(await verifyShopifyToken(token(), 'pilot-client', secret), { shop: 'pilot.myshopify.com', userId: '123' });
  for (const claims of [{ aud: 'other' }, { exp: 1 }, { nbf: 9999999999 }, { sub: '' },
    { dest: 'https://evil.example', iss: 'https://evil.example/admin' },
    { iss: 'https://other.myshopify.com/admin' },
    { dest: 'https://pilot.myshopify.com:8443' }, { iss: 'http://pilot.myshopify.com/admin' }]) {
    await assert.rejects(verifyShopifyToken(token(claims), 'pilot-client', secret));
  }
  await assert.rejects(verifyShopifyToken(token({}, 'wrong'), 'pilot-client', secret));
});
test('missing auth and non-pilot shops are rejected before any outgoing request', async () => {
  process.env.SHOPIFY_CLIENT_ID = 'pilot-client'; process.env.SHOPIFY_CLIENT_SECRET = secret;
  process.env.SHOPIFY_FUNCTION_ID = 'fixture-function'; process.env.SHOPIFY_ALLOWED_SHOPS = 'other.myshopify.com';
  await assert.rejects(authenticateShopify(new Request('https://app.test/api')), (e) => e.status === 401);
  await assert.rejects(authenticateShopify(new Request('https://app.test/api', { headers: { authorization: `Bearer ${token()}` } })), (e) => e.status === 403);
});
