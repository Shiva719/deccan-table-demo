import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const b = await chromium.launch({ channel: "msedge", headless: true });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
try {
  await p.goto("http://192.168.31.125:3000/deccan-table-demo/menu");
  await p
    .locator(".dish-card")
    .first()
    .getByRole("button", { name: "Add", exact: true })
    .click();
  await p.getByRole("button", { name: "Decrease Masala Dosa" }).waitFor();
  await p.goto("http://192.168.31.125:3000/deccan-table-demo/cart");
  await p.getByRole("textbox", { name: "Your name" }).fill("LAN Demo");
  await p.getByRole("button", { name: "Place demo order" }).click();
  await p.waitForURL(/\/order\/\?id=[a-f0-9-]+$/);
  const info = await p.evaluate(() => ({
    secure: window.isSecureContext,
    uuid: typeof crypto.randomUUID,
    orders: JSON.parse(localStorage.getItem("deccan-table-demo-v1")).orders
      .length,
  }));
  assert.equal(info.orders, 1);
  console.log(
    JSON.stringify({ passed: "LAN HTTP ordering at mobile viewport", ...info }),
  );
} finally {
  await b.close();
}
