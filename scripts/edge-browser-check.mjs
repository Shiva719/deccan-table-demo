import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const base =
  process.env.DEMO_ORIGIN || "http://localhost:3000/deccan-table-demo";
const b = await chromium.launch({
  channel: process.platform === "win32" ? "msedge" : undefined,
  headless: true,
});
const c = await b.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const p = await c.newPage();
const v = await c.newPage();
const results = [];
const pass = (s) => {
  console.log("PASS", s);
  results.push(s);
};
async function go(page, path) {
  await page.goto(base + path);
  await page.waitForLoadState("networkidle");
}
const read = () =>
  p.evaluate(() => JSON.parse(localStorage.getItem("deccan-table-demo-v1")));
try {
  await go(p, "/menu");
  await p.getByRole("button", { name: "Replay welcome" }).click();
  assert.equal(await p.locator(".logo-intro").isVisible(), false);
  pass("Reduced-motion welcome and replay respect the preference");
  const first = p.locator(".dish-card").first();
  await first.getByRole("button", { name: "About dish" }).click();
  await p.getByRole("dialog").waitFor();
  await p.keyboard.press("Escape");
  await p.getByRole("dialog").waitFor({ state: "detached" });
  assert.equal(
    await first
      .getByRole("button", { name: "About dish" })
      .evaluate((el) => el === document.activeElement),
    true,
  );
  pass("Accessible modal Escape closes and returns keyboard focus");
  await p.route("**/images/dishes/dosa.webp", (route) =>
    route.request().url().includes("dosa.webp")
      ? route.abort()
      : route.continue(),
  );
  await p.reload();
  await p.locator(".dish-card").first().locator(".photo-placeholder").waitFor();
  await go(v, "/vendor/menu");
  await v
    .getByRole("button", { name: "Edit Masala Dosa", exact: true })
    .click();
  await v.locator("input[type=file]").setInputFiles({
    name: "too-big.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.alloc(800000),
  });
  await v.getByText("Choose a JPEG, PNG or WebP image under 700 KB.").waitFor();
  await v
    .locator("input[type=file]")
    .setInputFiles("public/images/dishes/dosa.jpg");
  await v.getByRole("button", { name: "Save dish", exact: true }).click();
  const restored = p.locator(".dish-card").first().locator("img");
  await restored.waitFor();
  await restored.evaluate((el) => el.decode());
  assert.ok(await restored.evaluate((el) => el.naturalWidth > 0));
  pass(
    "Broken image fallback, upload size validation and valid replacement recover live",
  );
  await first.getByRole("button", { name: "Add", exact: true }).click();
  await first.getByRole("button", { name: "Decrease Masala Dosa" }).click();
  await first.getByRole("button", { name: "Add", exact: true }).waitFor();
  assert.equal((await read()).cart.length, 0);
  pass("Quantity zero removes the item and clears the cart");
  await first.getByRole("button", { name: "Add", exact: true }).click();
  await go(v, "/vendor/settings");
  await v.getByRole("checkbox", { name: "Accept customer orders" }).uncheck();
  await v.getByRole("button", { name: "Save settings" }).click();
  await p.getByRole("button", { name: "Increase Masala Dosa" }).waitFor();
  assert.equal(
    await p.getByRole("button", { name: "Increase Masala Dosa" }).isDisabled(),
    true,
  );
  await go(p, "/cart");
  await p
    .getByRole("textbox", { name: "Your name" })
    .fill("Cancellation check");
  await p.getByRole("button", { name: "Place demo order" }).click();
  await p.getByRole("alert").filter({ hasText: "currently closed" }).waitFor();
  assert.equal((await read()).orders.length, 0);
  await v.getByRole("checkbox", { name: "Accept customer orders" }).check();
  await v.getByRole("button", { name: "Save settings" }).click();
  await p.getByRole("button", { name: "Place demo order" }).click();
  await p.waitForURL(/\/order\/\?id=[a-f0-9-]+$/);
  await go(v, "/vendor/orders");
  v.once("dialog", (d) => d.accept());
  await v.getByRole("button", { name: "Cancel", exact: true }).click();
  await p.locator(".status.Cancelled").waitFor();
  assert.equal(
    await p.getByRole("button", { name: "Collect 50 points" }).isDisabled(),
    true,
  );
  pass(
    "Closed restaurant rejects checkout; eligible cancellation updates tracking and blocks rewards",
  );
  await go(v, "/vendor/settings");
  v.once("dialog", (d) => d.dismiss());
  await v.getByRole("button", { name: "Reset Demo Data" }).click();
  assert.equal((await read()).orders.length, 1);
  v.once("dialog", (d) => d.accept());
  await v.getByRole("button", { name: "Reset Demo Data" }).click();
  await v.waitForLoadState("networkidle");
  await p.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("deccan-table-demo-v1")).orders.length ===
      0,
  );
  assert.equal((await read()).menu[0].image, "/images/dishes/dosa.webp");
  pass(
    "Reset dismissal preserves data; confirmed reset restores seed across tabs",
  );
  await go(p, "/order/?id=not-found");
  await p
    .getByRole("heading", { name: "Order not found on this browser." })
    .waitFor();
  await go(p, "/credits");
  assert.equal(await p.locator(".credit-row").count(), 30);
  pass("Unknown order state and all thirty accessible photo credit entries");
  await writeFile(
    "test-results/edge-results.json",
    JSON.stringify({ passed: results }, null, 2),
  );
} finally {
  await b.close();
}
