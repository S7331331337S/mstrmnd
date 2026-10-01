import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const target = path.join(root, "extensions/mstrmnd-cart-incentive");
if (existsSync(target)) throw new Error("Function extension already exists. Refusing to overwrite it.");
const generated = spawnSync("shopify", ["app", "generate", "extension", "--path", root,
  "--template", "discount", "--flavor", "typescript", "--name", "mstrmnd-cart-incentive"], { stdio: "inherit" });
if (generated.error || generated.status !== 0) process.exit(generated.status || 1);
// The CLI owns extension configuration, schema and generated types.
for (const file of readdirSync(path.join(root, "function"))) cpSync(path.join(root, "function", file), path.join(target, "src", file));
// Starter tests describe the starter discount rather than this incentive.
rmSync(path.join(target, "src/cart_lines_discounts_generate_run.test.ts"), { force: true });
rmSync(path.join(target, "src/cart_delivery_options_discounts_generate_run.test.ts"), { force: true });
console.log("Function generated. Run Shopify function typegen/build, then the fixture tests described in README.md.");
