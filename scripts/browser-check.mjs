import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const base =
  process.env.DEMO_ORIGIN || "http://localhost:3000/deccan-table-demo";
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  channel:
    process.env.PLAYWRIGHT_CHANNEL ||
    (process.platform === "win32" ? "msedge" : undefined),
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const customer = await context.newPage();
const vendor = await context.newPage();
const errors = [];
for (const page of [customer, vendor])
  page.on("pageerror", (e) => errors.push(e.message));
const log = [];
function pass(s) {
  console.log("PASS", s);
  log.push(s);
}
const saved = () =>
  customer.evaluate(() =>
    JSON.parse(localStorage.getItem("deccan-table-demo-v1")),
  );
async function go(page, path) {
  await page.goto(base + path);
  await page.waitForLoadState("networkidle");
}
async function checkOverflow(page) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    true,
    "horizontal overflow at " + page.url(),
  );
}
try {
  await go(customer, "/");
  await customer.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await go(vendor, "/vendor/orders");
  await vendor
    .getByRole("button", { name: "Enable incoming order sound" })
    .click();
  await customer.goto(base + "/menu", { waitUntil: "domcontentloaded" });
  await customer.locator(".logo-intro").waitFor({ state: "visible" });
  await customer.locator(".logo-intro").waitFor({ state: "detached" });
  assert.equal(await customer.locator(".dish-card").count(), 30);
  pass("Logo reveal and 30 seeded dishes");
  for (const cat of [
    "South Indian",
    "Continental",
    "Chinese",
    "North Indian",
    "Biryani & Rice",
    "Snacks",
    "Beverages",
    "Desserts",
  ]) {
    await customer.getByRole("button", { name: cat, exact: true }).click();
    assert.ok((await customer.locator(".dish-card").count()) > 0);
  }
  await customer
    .getByRole("button", { name: "All dishes", exact: true })
    .click();
  await customer.getByRole("searchbox").fill("fermented rice");
  assert.equal(await customer.locator(".dish-card").count(), 1);
  await customer.getByRole("searchbox").fill("");
  pass("All categories and description search");
  const dosa = customer.locator(".dish-card").filter({
    has: customer.getByRole("heading", { name: "Masala Dosa", exact: true }),
  });
  await dosa.getByRole("button", { name: "About dish" }).click();
  assert.ok(await customer.getByRole("dialog").isVisible());
  await customer.keyboard.press("Escape");
  assert.equal(await customer.getByRole("dialog").count(), 0);
  await dosa.getByRole("button", { name: "Add", exact: true }).click();
  await dosa.getByRole("button", { name: "Increase Masala Dosa" }).click();
  const idli = customer.locator(".dish-card").filter({
    has: customer.getByRole("heading", { name: "Steamed Idli", exact: true }),
  });
  await idli.getByRole("button", { name: "Add", exact: true }).click();
  await customer.waitForFunction(
    () =>
      JSON.parse(localStorage.getItem("deccan-table-demo-v1")).cart.reduce(
        (s, c) => s + c.quantity,
        0,
      ) === 3,
  );
  assert.equal(
    (await saved()).cart.reduce((s, c) => s + c.quantity, 0),
    3,
  );
  await customer.screenshot({
    path: "test-results/menu-desktop.png",
    fullPage: false,
  });
  await customer.getByRole("link", { name: "View cart", exact: false }).click();
  await customer.getByRole("textbox", { name: "Your name" }).fill("Asha Demo");
  await customer.getByRole("textbox", { name: "Table number" }).fill("04");
  await customer
    .getByRole("textbox", { name: "Order notes" })
    .fill("Less spicy, please");
  await customer
    .getByRole("button", { name: "Place demo order" })
    .evaluate((el) => {
      el.click();
      el.click();
    });
  await customer.waitForURL(/\/order\/\?id=[a-f0-9-]+$/);
  let state = await saved();
  assert.equal(state.orders.length, 1);
  assert.equal(state.orders[0].total, 180);
  const id = state.orders[0].id;
  const token = state.orders[0].token;
  await vendor.getByText(token, { exact: false }).first().waitFor();
  pass(
    "Cart, checkout, duplicate prevention and immediate vendor synchronization",
  );
  await vendor.getByRole("button", { name: "Mark Preparing" }).click();
  await customer.locator(".status.Preparing").waitFor();
  await customer.getByRole("link", { name: "Play while you wait" }).click();
  await customer.waitForURL(/\/order\/play\/\?id=/);
  await customer.locator(".memory-grid button").first().click();
  await vendor.getByRole("button", { name: "Mark Ready" }).click();
  await customer
    .getByText(
      "Your order is ready! Please collect your food at the counter.",
      { exact: true },
    )
    .waitFor();
  assert.equal(await customer.locator(".memory-grid .flipped").count(), 1);
  await customer.getByRole("button", { name: "Collect 50 points" }).click();
  await customer.getByRole("button", { name: "Points collected" }).waitFor();
  assert.equal((await saved()).wallet.points, 50);
  pass(
    "Live preparing/ready tracking, uninterrupted game progress, once-only reward claim",
  );
  await customer.bringToFront();
  await customer.getByRole("button", { name: "Shuffle & play again" }).click();
  const known = new Map();
  let guard = 0;
  while (
    (await customer.locator(".memory-grid .matched").count()) < 12 &&
    guard++ < 60
  ) {
    if (guard % 5 === 0) console.log("Memory moves", guard);
    const buttons = customer.locator(".memory-grid button");
    const available = [];
    for (let i = 0; i < 12; i++)
      if (!(await buttons.nth(i).isDisabled())) available.push(i);
    const i = available[0];
    await buttons.nth(i).click();
    const symbol = await buttons.nth(i).textContent();
    known.set(i, symbol);
    let j = available.find((k) => k !== i && known.get(k) === symbol);
    j ??= available.find((k) => k !== i && !known.has(k));
    j ??= available.find((k) => k !== i);
    if (j === undefined) break;
    await buttons.nth(j).click();
    known.set(j, await buttons.nth(j).textContent());
    await customer.waitForTimeout(900);
  }
  assert.equal(await customer.locator(".memory-grid .matched").count(), 12);
  assert.equal(new Set(known.values()).size, 6);
  pass("Food Memory Match completed all six pairs");
  await customer
    .getByRole("button", { name: "Tic-Tac-Toe Beat the bot" })
    .click();
  for (let n = 0; n < 5; n++) {
    const cell = customer.locator(".tic-board button:not(:disabled)").first();
    if (!(await cell.count())) break;
    await cell.click();
  }
  assert.ok(
    await customer
      .locator(".game-panel")
      .getByText(/won|draw/)
      .isVisible(),
  );
  await customer.getByRole("button", { name: "New round" }).click();
  assert.equal(
    await customer.locator(".tic-board button:not(:disabled)").count(),
    9,
  );
  await customer
    .getByRole("button", { name: "Quick Reflex Test your speed" })
    .click();
  await customer.getByRole("button", { name: "Start challenge" }).click();
  await customer.locator(".tap-zone").click();
  await customer
    .getByText("Too soon! Wait for green.", { exact: true })
    .waitFor();
  await customer.getByRole("button", { name: "Start challenge" }).click();
  await customer.locator(".tap-zone.go").waitFor();
  await customer.locator(".tap-zone").click();
  assert.match(await customer.locator(".tap-zone").textContent(), /\d+ ms/);
  pass(
    "Tic-Tac-Toe computer round and restart; reflex early tap, signal and reaction stats",
  );
  await customer.screenshot({
    path: "test-results/games-desktop.png",
    fullPage: true,
  });
  await vendor.getByRole("button", { name: "Mark Completed" }).click();
  await customer.locator(".status.Completed").waitFor();
  await go(vendor, "/vendor/reports");
  await vendor.getByText("₹180", { exact: true }).first().waitFor();
  const download = vendor.waitForEvent("download");
  await vendor.getByRole("button", { name: "Export today’s CSV" }).click();
  const csv = await download;
  assert.match(csv.suggestedFilename(), /deccan-orders/);
  await csv.saveAs("test-results/daily-orders.csv");
  pass("Completed value, daily report and CSV download");
  await go(customer, "/menu");
  await customer
    .locator(".dish-card")
    .first()
    .getByRole("button", { name: "Add", exact: true })
    .click();
  await go(customer, "/cart");
  await customer
    .getByRole("textbox", { name: "Your name" })
    .fill("Second Visit");
  await customer.getByText("Online Payment — Demo", { exact: true }).click();
  await customer.getByRole("button", { name: "Place demo order" }).click();
  await customer.waitForURL(/\/order\/\?id=[a-f0-9-]+$/);
  await go(vendor, "/vendor/orders");
  await vendor.getByRole("button", { name: "Mark Preparing" }).click();
  await vendor.getByRole("button", { name: "Mark Ready" }).click();
  await customer.getByRole("button", { name: "Collect 50 points" }).click();
  await customer
    .getByRole("button", { name: "Unlock ₹50 demo voucher" })
    .click();
  await customer.locator(".voucher").waitFor();
  assert.equal((await saved()).wallet.points, 0);
  assert.equal((await saved()).wallet.vouchers.length, 1);
  assert.equal((await saved()).orders[0].payment, "online-demo");
  pass(
    "Simulated online preference, second eligible claim and 100-point voucher redemption",
  );
  await go(vendor, "/vendor/menu");
  await go(customer, "/menu");
  await vendor
    .getByRole("button", { name: "Edit Masala Dosa", exact: true })
    .click();
  await vendor
    .getByRole("textbox", { name: "Dish name" })
    .fill("Signature Masala Dosa");
  await vendor.getByRole("spinbutton", { name: "Price" }).fill("80");
  await vendor.getByRole("button", { name: "Save dish", exact: true }).click();
  await customer
    .getByRole("heading", { name: "Signature Masala Dosa", exact: true })
    .waitFor();
  assert.equal((await saved()).menu[0].price, 80);
  const row = vendor.locator(".menu-editor-row").filter({
    has: vendor.getByRole("heading", {
      name: "Signature Masala Dosa",
      exact: true,
    }),
  });
  await row.getByRole("button", { name: "Available", exact: true }).click();
  await customer
    .locator(".dish-card")
    .first()
    .getByRole("button", { name: "Unavailable" })
    .waitFor();
  pass("Shared menu edits, price updates and live availability");
  await vendor.getByRole("button", { name: "Add dish", exact: true }).click();
  await vendor.getByRole("textbox", { name: "Dish name" }).fill("QA Special");
  await vendor.getByRole("spinbutton", { name: "Price" }).fill("99");
  await vendor
    .getByRole("textbox", { name: "Description" })
    .fill("A temporary test dish.");
  await vendor
    .getByRole("combobox", { name: /Category/ })
    .selectOption("Desserts");
  await vendor
    .getByRole("combobox", { name: /Dietary classification/ })
    .selectOption("nonveg");
  await vendor
    .locator('input[type="file"]')
    .setInputFiles("public/images/dishes/dosa.jpg");
  await vendor.getByRole("button", { name: "Save dish", exact: true }).click();
  await customer
    .getByRole("heading", { name: "QA Special", exact: true })
    .waitFor();
  vendor.once("dialog", (d) => d.accept());
  await vendor.getByRole("button", { name: "Archive QA Special" }).click();
  await customer
    .getByRole("heading", { name: "QA Special", exact: true })
    .waitFor({ state: "detached" });
  pass("Vendor dish creation and archive synchronize across tabs");
  await go(vendor, "/vendor");
  await vendor.screenshot({
    path: "test-results/vendor-desktop.png",
    fullPage: true,
  });
  for (const width of [320, 390, 768, 1440]) {
    await customer.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/menu",
      "/cart",
      "/order/?id=" + encodeURIComponent(id),
      "/order/play/?id=" + encodeURIComponent(id),
      "/vendor",
      "/vendor/orders",
      "/vendor/menu",
      "/vendor/reports",
      "/vendor/settings",
    ]) {
      await go(customer, path);
      await checkOverflow(customer);
    }
    if (width === 390) {
      await go(customer, "/menu");
      await customer.screenshot({
        path: "test-results/menu-mobile.png",
        fullPage: true,
      });
    }
  }
  pass(
    "All ten routes without horizontal overflow at 320, 390, 768 and 1440 pixels",
  );
  await go(customer, "/menu");
  for (const img of await customer.locator(".dish-photo img").all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((el) => el.decode());
    assert.ok(await img.evaluate((el) => el.naturalWidth > 0));
  }
  pass("Every displayed dish photograph loads");
  await go(customer, "/order/?id=" + encodeURIComponent(id));
  await customer.reload();
  assert.equal((await saved()).orders.length, 2);
  pass("Order and reward persistence after reload");
  const bad = await browser.newContext();
  const bp = await bad.newPage();
  await go(bp, "/");
  await bp.evaluate(() =>
    localStorage.setItem("deccan-table-demo-v1", "corrupt-data"),
  );
  await go(bp, "/menu");
  await bp
    .getByRole("alert")
    .filter({ hasText: "Saved demo data could not be loaded." })
    .waitFor();
  assert.equal(
    await bp.evaluate(() => localStorage.getItem("deccan-table-demo-v1")),
    "corrupt-data",
  );
  await go(bp, "/vendor/settings");
  bp.once("dialog", (d) => d.accept());
  await bp.getByRole("button", { name: "Reset Demo Data" }).click();
  await bp.waitForLoadState("networkidle");
  assert.equal(
    await bp.evaluate(
      () =>
        JSON.parse(localStorage.getItem("deccan-table-demo-v1")).menu.length,
    ),
    30,
  );
  await bad.close();
  pass(
    "Corrupted storage preserved with recoverable error and confirmed reset",
  );
  assert.deepEqual(errors, []);
  pass("No browser runtime errors");
  await writeFile(
    "test-results/browser-results.json",
    JSON.stringify({ passed: log, errors }, null, 2),
  );
} catch (e) {
  await customer.screenshot({
    path: "test-results/failure-customer.png",
    fullPage: true,
  });
  await vendor.screenshot({
    path: "test-results/failure-vendor.png",
    fullPage: true,
  });
  throw e;
} finally {
  await browser.close();
}
