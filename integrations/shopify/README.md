# MSTRMND Discount Studio — Sidekick pilot

A Shopify adapter in the existing Next.js app. Sidekick opens create/edit pages; the merchant configures, previews, reviews and confirms an automatic order discount. No autonomous save tool is exposed.

## Preview

Run `pnpm --filter @mstrmnd/web dev` from the repository root. Open `/shopify/discounts/new?demo=1`. Preview mode never calls Shopify or returns a fake GID to Sidekick. The session trace is memory-only, not durable analytics.

## Included

- Monochrome mobile editor: percentage, minimum subtotal, scheduling, cart preview, confirmation, cancellation, errors and success.
- Create/edit app-link registrations, Function UUID matching, edit GID mapping and success/cancel handoff.
- Staff-scoped online token exchange: signature, expiry, audience, issuer and exact pilot-shop allowlist checks before exchange. Tokens stay server-side and are not persisted.
- Admin GraphQL with ownership checks, currency enforcement and app-owned discount configuration.
- Pure Function implementation, queries, fixtures, tests and a CLI scaffold script. Applies 0.1–50% off eligible orders. Invalid configuration/currency fails closed; shipping is unchanged. New discounts do not combine with others.
- No database migration, new agent runtime, billing change or production store change.

## Development-store activation

**Not yet installed, deployed or tested against live Sidekick or checkout.** Shopify authentication endpoints timed out in the build environment. Function scaffolding/WASM compilation and TOML validation remain integration gates.

1. Create/select a Shopify development app/store eligible for Shopify Functions. Install Shopify CLI. Configure the four server variables from `.env.example` on `apps/web`. Never expose the client secret via `NEXT_PUBLIC_*`. The allowlist is a comma-separated list of exact shop hostnames.
2. Configure the public client ID and HTTPS application origin, then scaffold through Shopify CLI:

   ```sh
   node integrations/shopify/scripts/configure.mjs CLIENT_ID https://YOUR_APP_ORIGIN
   node integrations/shopify/scripts/scaffold.mjs
   ```

   The script runs `shopify app generate extension --template discount --flavor typescript`, then copies the implementation. It refuses to overwrite an existing Function. The CLI owns the manifest, schema and generated types. Set the generated manifest API version to `2026-07`. Verify its `src/index.ts` exports both supplied targets. Generated files remain ignored until validated and intentionally adopted into source control.
3. Install generated Function dependencies. From its directory run:

   ```sh
   shopify app function typegen
   shopify app function build
   shopify app function run --input=../../fixtures/cart.json --export=cart-lines-discounts-generate-run
   shopify app function run --input=../../fixtures/delivery.json --export=cart-delivery-options-discounts-generate-run
   ```

   Confirm export names against the generated manifest; compare with the expected fixtures. Release the Function through your development-app workflow and obtain its deployed UUID.
4. Register that UUID, use the same value for server `SHOPIFY_FUNCTION_ID`, and validate:

   ```sh
   node integrations/shopify/scripts/configure.mjs CLIENT_ID https://YOUR_APP_ORIGIN FUNCTION_UUID
   shopify app config validate --path integrations/shopify --json
   ```

   `YOUR_FUNCTION_ID`, the zero client ID and `example.invalid` are intentional unconfigured placeholders, not deployable settings. Use Shopify managed installation for `read_discounts,write_discounts`.
5. Release the app-link registrations and open in Shopify web admin. Test Sidekick create/edit, successful and cancelled handoffs, below/exact threshold carts, scheduling, presentment-currency mismatch and staff without discount permissions. Check Shopify admin before retrying any ambiguous save failure.

Sidekick opens this first-version form; it does not prefill fields through tools. App-link editing is web-admin only. This pilot does not claim App Store readiness or universal plan eligibility.

## Verification

```sh
node --experimental-strip-types --test integrations/shopify/tests/discount.test.mjs
pnpm --filter @mstrmnd/web typecheck
```

Admin operations and both Function input queries validate against Shopify `2026-07`. Input validation does not validate compiled Function output or extension manifests. Complete the live gates before release.

## Official contracts

- https://shopify.dev/docs/apps/build/sidekick/build-app-actions
- https://shopify.dev/docs/apps/build/discounts/build-ui-with-react-router
- https://shopify.dev/docs/apps/build/authentication-authorization/implement-token-exchange
- https://shopify.dev/docs/api/functions/2026-07/discount
- https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/discountAutomaticAppCreate
