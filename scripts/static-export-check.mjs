import { chromium } from "@playwright/test";
import sharp from "sharp";
import assert from "node:assert/strict";
import { readFile, stat, writeFile } from "node:fs/promises";
const base = "http://localhost:4173/deccan-table-demo";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const errors = [];
const requests = [];
try {
  for (const path of [
    "out/index.html",
    "out/order/index.html",
    "out/order/play/index.html",
    "out/.nojekyll",
  ])
    assert.ok(await stat(path));
  const html = await readFile("out/menu/index.html", "utf8");
  assert.ok(html.includes("/deccan-table-demo/_next/"));
  const page = await browser.newPage({ reducedMotion: "reduce" });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  for (const route of [
    "/",
    "/menu/",
    "/vendor/",
    "/vendor/orders/",
    "/vendor/menu/",
    "/vendor/reports/",
    "/vendor/settings/",
    "/order/?id=missing",
    "/order/play/?id=missing",
  ]) {
    const r = await page.goto(base + route);
    assert.equal(r.status(), 200);
    await page.waitForLoadState("networkidle");
  }
  await page.goto(base + "/menu/");
  const images = page.locator(".dish-card img");
  await images.first().waitFor();
  assert.equal(await images.count(), 30);
  for (const img of await images.all()) {
    assert.match(
      new URL(await img.getAttribute("src"), base).pathname,
      /^\/deccan-table-demo\/images\//,
    );
  }
  await page.goto(base + "/vendor/menu/");
  await page
    .getByRole("button", { name: "Edit Masala Dosa", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Dish name" }).fill("Unsaved draft");
  await page
    .locator("dialog input[type=file]")
    .evaluate((el) => el.dispatchEvent(new Event("cancel", { bubbles: true })));
  assert.equal(
    await page.getByRole("textbox", { name: "Dish name" }).inputValue(),
    "Unsaved draft",
  );
  assert.equal(await page.getByRole("dialog").isVisible(), true);
  await page.keyboard.press("Escape");
  await page.goto(base + "/vendor/settings/");
  const png = await sharp({
    create: { width: 80, height: 80, channels: 4, background: "#d8af70" },
  })
    .png()
    .toBuffer();
  await page
    .getByLabel("Upload restaurant or hotel logo")
    .setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: png });
  await page
    .getByText(
      "Logo saved. Your customer menu and vendor dashboard are updated.",
    )
    .waitFor();
  await page.goto(base + "/menu/");
  await page
    .locator(".customer-header")
    .getByAltText("Restaurant logo", { exact: true })
    .waitFor();
  await page.reload();
  await page
    .locator(".customer-header")
    .getByAltText("Restaurant logo", { exact: true })
    .waitFor();
  assert.equal(
    requests.some((u) => u.includes("/_next/image?")),
    false,
  );
  assert.deepEqual(errors, []);
  const result = {
    passed: [
      "Direct static deep links and query URLs",
      "Repository-prefixed scripts and all thirty dish image sources",
      "No Next.js image optimization endpoint",
      "File picker cancellation preserves editor draft",
      "Logo upload and persistence across static pages",
    ],
    errors,
  };
  await writeFile(
    "test-results/static-export-results.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
