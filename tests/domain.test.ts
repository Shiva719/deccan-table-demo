import test from "node:test";
import assert from "node:assert/strict";
import { seed } from "../src/lib/data/seed";
import {
  changeQuantity,
  cartTotal,
  createOrder,
  transition,
  dailyReport,
  indiaDay,
  claim,
  redeem,
  outcome,
  botMove,
  shuffle,
} from "../src/lib/utils/domain";
import { parseState } from "../src/lib/store/store";
const input = (id = crypto.randomUUID()) => ({
  customerName: "Asha",
  table: "04",
  notes: "Less spicy",
  payment: "counter" as const,
  submissionId: id,
});
function order() {
  const state = seed();
  changeQuantity(state, "dosa", 2);
  return { state, order: createOrder(state, input()) };
}
test("seed has thirty unique dishes, all eight categories and correct chicken classification", () => {
  const s = seed();
  assert.equal(s.menu.length, 30);
  assert.equal(new Set(s.menu.map((m) => m.id)).size, 30);
  assert.equal(new Set(s.menu.map((m) => m.category)).size, 8);
  assert.equal(
    s.menu.find((m) => m.id === "chickenbiryani")?.vegetarian,
    false,
  );
});
test("cart calculates totals and removes zero quantities", () => {
  const s = seed();
  changeQuantity(s, "dosa", 2);
  changeQuantity(s, "idli", 1);
  assert.equal(cartTotal(s), 180);
  changeQuantity(s, "dosa", -2);
  assert.equal(cartTotal(s), 40);
  assert.equal(s.cart.length, 1);
});
test("cart quantity is bounded at 99", () => {
  const s = seed();
  changeQuantity(s, "dosa", 500);
  assert.equal(s.cart[0].quantity, 99);
  changeQuantity(s, "dosa", -500);
  assert.equal(s.cart.length, 0);
});
test("order snapshots menu prices, empties cart and generates token", () => {
  const { state, order: o } = order();
  assert.equal(o.total, 140);
  assert.equal(o.token, "DT-0001");
  assert.equal(state.cart.length, 0);
  state.menu[0].price = 500;
  assert.equal(o.items[0].price, 70);
  assert.equal(state.currentOrderId, o.id);
});
test("repeated submission returns same order without adding an order", () => {
  const s = seed();
  changeQuantity(s, "idli", 1);
  const i = input();
  const first = createOrder(s, i);
  assert.equal(createOrder(s, i).id, first.id);
  assert.equal(s.orders.length, 1);
  assert.equal(s.nextToken, 2);
});
test("unavailable, archived and closed menu cannot be ordered", () => {
  const s = seed();
  changeQuantity(s, "dosa", 1);
  s.menu[0].available = false;
  assert.throws(() => changeQuantity(s, "dosa", 1));
  assert.throws(() => createOrder(s, input()));
  changeQuantity(s, "dosa", -1);
  assert.equal(s.cart.length, 0);
  s.menu[0].available = true;
  s.menu[0].archived = true;
  assert.throws(() => changeQuantity(s, "dosa", 1));
  s.restaurant.open = false;
  assert.throws(() => changeQuantity(s, "idli", 1));
});
test("empty orders and blank names are rejected", () => {
  const s = seed();
  assert.throws(() => createOrder(s, input()));
  changeQuantity(s, "dosa", 1);
  assert.throws(() => createOrder(s, { ...input(), customerName: "   " }));
});
test("order transitions are sequential and terminal statuses cannot change", () => {
  const { state, order: o } = order();
  assert.throws(() => transition(state, o.id, "Ready"));
  transition(state, o.id, "Preparing");
  transition(state, o.id, "Ready");
  assert.throws(() => transition(state, o.id, "Cancelled"));
  transition(state, o.id, "Completed");
  assert.throws(() => transition(state, o.id, "Preparing"));
});
test("new and preparing orders can be cancelled", () => {
  for (const preparing of [true, false]) {
    const { state, order: o } = order();
    if (preparing) transition(state, o.id, "Preparing");
    transition(state, o.id, "Cancelled");
    assert.equal(o.status, "Cancelled");
    assert.throws(() => claim(state, o.id));
  }
});
test("India day rolls over at 18:30 UTC", () => {
  assert.equal(indiaDay("2026-11-06T18:29:59Z"), "2026-11-06");
  assert.equal(indiaDay("2026-11-06T18:30:00Z"), "2026-11-07");
});
test("daily reports filter by Indian date and count only completed value", () => {
  const s = seed();
  for (const [date, status] of [
    ["2026-11-06T18:29:00Z", "Completed"],
    ["2026-11-06T18:31:00Z", "Completed"],
    ["2026-11-07T10:00:00Z", "Cancelled"],
    ["2026-11-07T11:00:00Z", "New"],
  ] as const) {
    changeQuantity(s, "dosa", 1);
    const o = createOrder(s, input(), new Date(date));
    o.status = status;
  }
  const r = dailyReport(s, "2026-11-07");
  assert.equal(r.total, 3);
  assert.equal(r.completed, 1);
  assert.equal(r.cancelled, 1);
  assert.equal(r.value, 70);
  assert.equal(r.byStatus.New, 1);
});
test("rewards require a ready order and may be collected once", () => {
  const { state, order: o } = order();
  assert.throws(() => claim(state, o.id));
  transition(state, o.id, "Preparing");
  transition(state, o.id, "Ready");
  claim(state, o.id);
  assert.equal(state.wallet.points, 50);
  assert.throws(() => claim(state, o.id));
  transition(state, o.id, "Completed");
  assert.throws(() => claim(state, o.id));
  assert.equal(state.wallet.transactions.length, 1);
});
test("two eligible orders unlock a demo voucher without changing order totals", () => {
  const s = seed();
  for (let n = 0; n < 2; n++) {
    changeQuantity(s, "dosa", 1);
    const o = createOrder(s, input());
    o.status = "Completed";
    claim(s, o.id);
  }
  assert.equal(s.wallet.points, 100);
  redeem(s);
  assert.equal(s.wallet.points, 0);
  assert.equal(s.wallet.vouchers[0].value, 50);
  assert.equal(s.orders[0].total, 70);
  assert.throws(() => redeem(s));
});
test("tic tac toe detects all lines and a draw", () => {
  for (const line of [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]) {
    const b = Array(9).fill("");
    line.forEach((i) => (b[i] = "X"));
    assert.equal(outcome(b), "X");
  }
  assert.equal(outcome(["X", "O", "X", "X", "O", "O", "O", "X", "X"]), "draw");
  assert.equal(outcome(Array(9).fill("")), null);
});
test("bot wins or blocks before choosing an empty square", () => {
  assert.equal(botMove(["O", "O", "", "X", "", "X", "", "", ""]), 2);
  assert.equal(botMove(["X", "X", "", "", "", "", "", "", ""]), 2);
  assert.equal(botMove(Array(9).fill("")), 4);
});
test("shuffle preserves all six memory pairs", () => {
  const deck = shuffle([
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ]);
  assert.equal(deck.length, 12);
  for (const s of "abcdef") assert.equal(deck.filter((c) => c === s).length, 2);
});
test("storage parser accepts current schema and rejects corrupt or unknown schema without discarding data", () => {
  const s = seed();
  assert.equal(parseState(JSON.stringify(s)).menu.length, 30);
  assert.throws(() => parseState("not-json"));
  assert.throws(() => parseState(JSON.stringify({ ...s, version: 99 })));
  assert.throws(() =>
    parseState(JSON.stringify({ ...s, wallet: { points: -1 } })),
  );
});

test("known v0 records migrate without losing orders or menu edits", () => {
  const { state, order: o } = order();
  state.menu[0].price = 88;
  const loaded = parseState(
    JSON.stringify({
      ...state,
      version: 0,
      wallet: { points: 50, claimedOrders: [o.id], vouchers: [] },
    }),
  );
  assert.equal(loaded.version, 1);
  assert.equal(loaded.orders[0].id, o.id);
  assert.equal(loaded.menu[0].price, 88);
  assert.equal(loaded.wallet.points, 50);
  assert.deepEqual(loaded.wallet.transactions, []);
});

test("memory deck uses six distinct foods in exactly two copies", async () => {
  const { foodSymbols } = await import("../src/lib/utils/domain");
  assert.equal(new Set(foodSymbols).size, 6);
  const deck = shuffle([...foodSymbols, ...foodSymbols]);
  for (const symbol of foodSymbols)
    assert.equal(deck.filter((s) => s === symbol).length, 2);
});
test("all thirty menu photographs have local optimized assets and license attribution", async () => {
  const { readFile, stat } = await import("node:fs/promises");
  const credits = JSON.parse(
    await readFile("public/images/dishes/credits.json", "utf8"),
  );
  const s = seed();
  assert.equal(new Set(s.menu.map((m) => m.image)).size, 30);
  for (const m of s.menu) {
    assert.match(m.image, /^\/images\/dishes\/.*\.webp$/);
    assert.ok((await stat("public" + m.image)).size > 1000);
    const c = credits.find((c: { id: string }) => c.id === m.id);
    assert.ok(c.verified && c.license && c.source && c.artist);
  }
});
test("order IDs are unique UUIDs without depending on secure-context randomUUID", async () => {
  const { newId } = await import("../src/lib/utils/domain");
  const ids = Array.from({ length: 100 }, () => newId());
  assert.equal(new Set(ids).size, 100);
  for (const id of ids)
    assert.match(
      id,
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/,
    );
});

test("old placeholder saves receive photos without losing user data", () => {
  const { state, order: o } = order();
  delete state.assetVersion;
  state.menu[0].image = "";
  state.menu[0].name = "My Dosa";
  state.menu[0].price = 99;
  state.menu[1].image = "data:image/png;base64,custom";
  const loaded = parseState(JSON.stringify(state));
  assert.equal(loaded.menu[0].image, "/images/dishes/dosa.webp");
  assert.equal(loaded.menu[0].name, "My Dosa");
  assert.equal(loaded.menu[0].price, 99);
  assert.equal(loaded.menu[1].image, "data:image/png;base64,custom");
  assert.equal(loaded.orders[0].id, o.id);
  loaded.menu[0].image = "";
  assert.equal(parseState(JSON.stringify(loaded)).menu[0].image, "");
});

test("repository paths prefix local assets exactly once and preserve uploaded logos", async () => {
  const { assetPath, BASE_PATH, orderHref, normalizedPath } =
    await import("../src/lib/utils/paths");
  assert.equal(
    assetPath("/images/dishes/dosa.webp"),
    BASE_PATH + "/images/dishes/dosa.webp",
  );
  assert.equal(
    assetPath(BASE_PATH + "/images/dishes/dosa.webp"),
    BASE_PATH + "/images/dishes/dosa.webp",
  );
  assert.equal(
    assetPath("data:image/png;base64,test"),
    "data:image/png;base64,test",
  );
  assert.equal(
    assetPath("https://example.com/photo.jpg"),
    "https://example.com/photo.jpg",
  );
  assert.equal(orderHref("test id"), "/order/?id=test%20id");
  assert.equal(orderHref("abc", true), "/order/play/?id=abc");
  assert.equal(normalizedPath(BASE_PATH + "/vendor/orders/"), "/vendor/orders");
});
