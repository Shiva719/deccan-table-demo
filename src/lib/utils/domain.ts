import type {
  CartItem,
  DemoState,
  Order,
  OrderStatus,
  PaymentMethod,
} from "@/types";
export function newId(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export const statuses: OrderStatus[] = [
  "New",
  "Preparing",
  "Ready",
  "Completed",
  "Cancelled",
];
export const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export const indiaDay = (date: string | Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
export const indiaTime = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
export function cartTotal(state: DemoState) {
  return state.cart.reduce(
    (sum, c) =>
      sum +
      (state.menu.find((m) => m.id === c.menuItemId)?.price ?? 0) * c.quantity,
    0,
  );
}
export function changeQuantity(state: DemoState, id: string, delta: number) {
  const item = state.menu.find((m) => m.id === id);
  if (
    !item ||
    (delta > 0 && (!item.available || item.archived || !state.restaurant.open))
  )
    throw new Error("This dish is currently unavailable.");
  const current = state.cart.find((c) => c.menuItemId === id)?.quantity ?? 0;
  const quantity = Math.max(0, Math.min(99, current + delta));
  const cart: CartItem[] = state.cart.filter((c) => c.menuItemId !== id);
  if (quantity) cart.push({ menuItemId: id, quantity });
  state.cart = cart;
}
export function createOrder(
  state: DemoState,
  input: {
    customerName: string;
    table: string;
    notes: string;
    payment: PaymentMethod;
    submissionId: string;
  },
  now = new Date(),
): Order {
  const existing = state.orders.find(
    (o) => o.submissionId === input.submissionId,
  );
  if (existing) return existing;
  if (!input.customerName.trim()) throw new Error("Please enter your name.");
  if (!["counter", "online-demo"].includes(input.payment))
    throw new Error("Select a payment preference.");
  if (!state.restaurant.open)
    throw new Error("The restaurant is currently closed.");
  if (!state.cart.length) throw new Error("Your cart is empty.");
  const items = state.cart.map((c) => {
    const m = state.menu.find((m) => m.id === c.menuItemId);
    if (!m || !m.available || m.archived)
      throw new Error("A dish in your cart is unavailable. Please remove it.");
    if (!Number.isInteger(c.quantity) || c.quantity < 1 || c.quantity > 99)
      throw new Error("Invalid quantity");
    return {
      menuItemId: m.id,
      name: m.name,
      price: m.price,
      quantity: c.quantity,
    };
  });
  const order: Order = {
    id: newId(),
    token: "DT-" + String(state.nextToken++).padStart(4, "0"),
    submissionId: input.submissionId,
    customerName: input.customerName.trim().slice(0, 60),
    table: input.table.trim().slice(0, 20),
    notes: input.notes.trim().slice(0, 400),
    payment: input.payment,
    items,
    total: items.reduce((s, i) => s + i.price * i.quantity, 0),
    status: "New",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  state.orders.unshift(order);
  state.cart = [];
  state.currentOrderId = order.id;
  return order;
}
export function transition(state: DemoState, id: string, to: OrderStatus) {
  const order = state.orders.find((o) => o.id === id);
  if (!order) throw new Error("Order not found");
  const allowed: Record<OrderStatus, OrderStatus[]> = {
    New: ["Preparing", "Cancelled"],
    Preparing: ["Ready", "Cancelled"],
    Ready: ["Completed"],
    Completed: [],
    Cancelled: [],
  };
  if (!allowed[order.status].includes(to))
    throw new Error("This status transition is not allowed.");
  order.status = to;
  order.updatedAt = new Date().toISOString();
}
export function claim(state: DemoState, id: string) {
  const o = state.orders.find((o) => o.id === id);
  if (!o || !["Ready", "Completed"].includes(o.status))
    throw new Error("Points unlock when your order is ready.");
  if (state.wallet.claimedOrders.includes(id))
    throw new Error("Points already collected for this order.");
  state.wallet.points += 50;
  state.wallet.claimedOrders.push(id);
  state.wallet.transactions.push({
    id: newId(),
    type: "claim",
    points: 50,
    orderId: id,
    createdAt: new Date().toISOString(),
  });
}
export function redeem(state: DemoState) {
  if (state.wallet.points < 100) throw new Error("You need 100 points.");
  state.wallet.points -= 100;
  const now = new Date().toISOString();
  state.wallet.transactions.push({
    id: newId(),
    type: "redeem",
    points: -100,
    createdAt: now,
  });
  state.wallet.vouchers.push({
    code: "DECCAN-" + newId().slice(0, 8).toUpperCase(),
    value: 50,
    createdAt: now,
  });
}
export function dailyReport(state: DemoState, day = indiaDay()) {
  const orders = state.orders.filter((o) => indiaDay(o.createdAt) === day);
  return {
    orders,
    total: orders.length,
    completed: orders.filter((o) => o.status === "Completed").length,
    cancelled: orders.filter((o) => o.status === "Cancelled").length,
    value: orders
      .filter((o) => o.status === "Completed")
      .reduce((s, o) => s + o.total, 0),
    byStatus: Object.fromEntries(
      statuses.map((s) => [s, orders.filter((o) => o.status === s).length]),
    ),
  };
}
export function outcome(board: string[]): string | null {
  for (const [a, b, c] of [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ])
    if (board[a] && board[a] === board[b] && board[b] === board[c])
      return board[a];
  return board.every(Boolean) ? "draw" : null;
}
export function botMove(board: string[]): number | undefined {
  const empty = board.flatMap((v, i) => (v ? [] : [i]));
  for (const mark of ["O", "X"]) {
    const pick = empty.find((i) => {
      const b = [...board];
      b[i] = mark;
      return outcome(b) === mark;
    });
    if (pick !== undefined) return pick;
  }
  return empty.includes(4)
    ? 4
    : empty[Math.floor(Math.random() * empty.length)];
}
export function shuffle<T>(input: T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const foodSymbols = [
  "\u{1F355}",
  "\u{1F354}",
  "\u{1F35F}",
  "\u{1F369}",
  "\u{1F957}",
  "\u{1F35C}",
] as const;
