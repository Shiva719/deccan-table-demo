import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const b = await chromium.launch({
  channel: process.platform === "win32" ? "msedge" : undefined,
  headless: true,
});
const p = await b.newPage();
const origin =
  process.env.DEMO_ORIGIN || "http://localhost:3000/deccan-table-demo";
const checked = [];
try {
  await p.goto(origin + "/menu");
  await p
    .locator(".dish-card")
    .first()
    .getByRole("button", { name: "Add", exact: true })
    .click();
  await p.getByRole("button", { name: "Decrease Masala Dosa" }).waitFor();
  await p.goto(origin + "/cart");
  await p
    .getByRole("textbox", { name: "Your name" })
    .fill("Mobile layout check");
  await p.getByRole("button", { name: "Place demo order" }).click();
  await p.waitForURL(/\/order\/.*$/);
  const id = (
    await p.evaluate(() =>
      JSON.parse(localStorage.getItem("deccan-table-demo-v1")),
    )
  ).currentOrderId;
  for (const width of [320, 390, 768, 1440]) {
    await p.setViewportSize({ width, height: 900 });
    for (const route of [
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
      await p.goto(origin + route);
      await p.waitForLoadState("networkidle");
      const dims = await p.evaluate(() => ({
        inner: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      assert.ok(
        dims.scroll <= dims.inner + 1,
        JSON.stringify({ route, width, ...dims }),
      );
      checked.push({ width, route });
      if (
        width === 390 &&
        [
          "/menu",
          "/vendor",
          "/order/play/?id=" + encodeURIComponent(id),
        ].includes(route)
      ) {
        await p.screenshot({
          path:
            "test-results/" +
            (route === "/menu"
              ? "menu"
              : route === "/vendor"
                ? "vendor"
                : "games") +
            "-mobile-viewport.png",
        });
      }
    }
    console.log("PASS all ten routes at", width);
  }
  await writeFile(
    "test-results/responsive-results.json",
    JSON.stringify({ checked }, null, 2),
  );
} finally {
  await b.close();
}
