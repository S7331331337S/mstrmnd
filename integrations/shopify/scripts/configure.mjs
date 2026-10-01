import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const [clientId, origin, functionId] = process.argv.slice(2);
if (!/^[a-f0-9]{32}$/i.test(clientId ?? "")) throw new Error("Pass the Shopify client ID, HTTPS app origin, and optional Function UUID.");
const url = new URL(origin);
if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Use an HTTPS origin without a path.");
if (functionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(functionId)) throw new Error("Function ID must be its deployed UUID.");
const configPath = path.join(root, "shopify.app.toml");
let config = readFileSync(configPath, "utf8").replace(/^client_id = .*$/m, `client_id = ${JSON.stringify(clientId)}`)
  .replace(/^application_url = .*$/m, `application_url = ${JSON.stringify(url.origin + "/shopify/discounts/new")}`)
  .replace(/^redirect_urls = .*$/m, `redirect_urls = [${JSON.stringify(url.origin + "/shopify/discounts/new")}]`);
writeFileSync(configPath, config);
if (functionId) for (const action of ["create", "edit"]) {
  const filename = path.join(root, `extensions/${action}-incentive/discount-schema.json`);
  const schema = JSON.parse(readFileSync(filename, "utf8"));
  schema.inputSchema.properties.functionId.matchValue = functionId;
  writeFileSync(filename, JSON.stringify(schema, null, 2) + "\n");
}
console.log("Public app configuration updated. Client secrets belong only in server environment variables.");
