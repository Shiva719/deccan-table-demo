"use client";
import { orderHref, normalizedPath } from "@/lib/utils/paths";
import { LogoSettings } from "./LogoSettings";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  BarChart3,
  Settings,
  ArrowUpRight,
  Volume2,
  VolumeX,
  Plus,
  Download,
  Pencil,
  Trash2,
  Search,
  ChefHat,
} from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { Modal } from "@/components/shared/Modal";
import { useStore, resetStorage } from "@/lib/store/store";
import {
  dailyReport,
  money,
  indiaTime,
  indiaDay,
  statuses,
  transition,
  newId,
} from "@/lib/utils/domain";
import { categories } from "@/lib/data/seed";
import type { MenuItem, Order, OrderStatus } from "@/types";
const nav = [
  { path: "/vendor", name: "Overview", icon: LayoutDashboard },
  { path: "/vendor/orders", name: "Live orders", icon: ClipboardList },
  { path: "/vendor/menu", name: "Menu studio", icon: UtensilsCrossed },
  { path: "/vendor/reports", name: "Daily insights", icon: BarChart3 },
  { path: "/vendor/settings", name: "Settings", icon: Settings },
];
function useOrderSound() {
  const { state } = useStore();
  const [on, setOn] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    const ids = new Set(state.orders.map((o) => o.id));
    if (
      seen.current &&
      state.orders.some((o) => !seen.current!.has(o.id)) &&
      on &&
      audio.current?.state === "running"
    ) {
      const ctx = audio.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
    seen.current = ids;
  }, [state.orders, on]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  return {
    on,
    toggle: async () => {
      if (!on) {
        try {
          audio.current ??= new AudioContext();
          await audio.current.resume();
          setOn(true);
        } catch {
          setOn(false);
        }
      } else setOn(false);
    },
  };
}
function OrderCard({ order }: { order: Order }) {
  const { mutate } = useStore();
  const next: Partial<Record<OrderStatus, OrderStatus>> = {
    New: "Preparing",
    Preparing: "Ready",
    Ready: "Completed",
  };
  return (
    <article className="vendor-order">
      <div className="between">
        <div>
          <h3>
            {order.token} <small>✦ {order.customerName}</small>
          </h3>
          <small className="muted">
            ID {order.id.slice(0, 8)} · {indiaTime(order.createdAt)} IST
            {order.table && " · Table " + order.table}
          </small>
        </div>
        <span className={"status " + order.status}>{order.status}</span>
      </div>
      <p>{order.items.map((i) => i.quantity + " · " + i.name).join(" · ")}</p>
      {order.notes && <div className="order-note">Note: {order.notes}</div>}
      <div className="between">
        <div>
          <strong>{money(order.total)}</strong>
          <small className="muted block">
            {order.payment === "counter"
              ? "Pay at Counter"
              : "Online Payment — Demo (simulated)"}
          </small>
        </div>
        <div className="actions">
          {["New", "Preparing"].includes(order.status) && (
            <button
              className="button danger small"
              onClick={() => {
                if (confirm("Cancel order " + order.token + "?"))
                  void mutate((s) => transition(s, order.id, "Cancelled"));
              }}
            >
              Cancel
            </button>
          )}
          {next[order.status] && (
            <button
              className="button small"
              onClick={() =>
                void mutate((s) => transition(s, order.id, next[order.status]!))
              }
            >
              Mark {next[order.status]}
            </button>
          )}
          <Link
            className="text-button"
            href={orderHref(order.id)}
            aria-label={"Track " + order.token}
          >
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}
function Metrics() {
  const { state } = useStore();
  const r = dailyReport(state);
  return (
    <div className="metrics">
      {[
        { label: "Orders today", value: r.total },
        ...statuses.map((s) => ({
          label: s + " orders",
          value: r.byStatus[s],
        })),
        { label: "Completed order value", value: money(r.value) },
      ].map((m) => (
        <div className="metric" key={m.label}>
          <div className="between">
            <span>{m.label}</span>
            <ClipboardList size={17} />
          </div>
          <strong>{m.value}</strong>
          <small>Today · Asia/Kolkata</small>
        </div>
      ))}
    </div>
  );
}
function Overview() {
  const { state } = useStore();
  const today = dailyReport(state);
  return (
    <>
      <div className="vendor-welcome">
        <div>
          <p className="eyebrow">A LITTLE CLARITY. A BETTER SERVICE.</p>
          <h2>A great service starts here.</h2>
          <p>Keep your kitchen in sync and every order moving.</p>
        </div>
        <ChefHat size={62} />
      </div>
      <Metrics />
      <div className="vendor-columns">
        <section className="panel">
          <div className="between">
            <h2>Latest orders</h2>
            <Link href="/vendor/orders" className="text-button">
              All orders →
            </Link>
          </div>
          {state.orders.length ? (
            state.orders
              .slice(0, 5)
              .map((o) => <OrderCard key={o.id} order={o} />)
          ) : (
            <EmptyOrders />
          )}
        </section>
        <div>
          <section className="panel">
            <h2>Quick actions</h2>
            <div className="quick-grid">
              {nav.slice(1).map((n) => (
                <Link key={n.path} href={n.path}>
                  <n.icon size={24} />
                  <strong>{n.name}</strong>
                  <small>Open workspace →</small>
                </Link>
              ))}
            </div>
          </section>
          <section className="panel">
            <h2>Kitchen pulse</h2>
            <StatusBars counts={today.byStatus} total={today.total} />
          </section>
        </div>
      </div>
    </>
  );
}
function EmptyOrders() {
  return (
    <div className="empty-state">
      <ClipboardList size={32} />
      <h3>Your next order starts here.</h3>
      <p>Place an order from the customer menu to see it appear.</p>
      <Link className="button" href="/menu">
        Open customer menu
      </Link>
    </div>
  );
}
function Orders() {
  const { state } = useStore();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const list = state.orders.filter(
    (o) =>
      (filter === "All" || o.status === filter) &&
      (
        o.token +
        " " +
        o.id +
        " " +
        o.customerName +
        " " +
        o.items.map((i) => i.name).join(" ")
      )
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="tabs">
        {["All", ...statuses].map((s) => (
          <button
            key={s}
            aria-pressed={s === filter}
            className={s === filter ? "active" : ""}
            onClick={() => setFilter(s)}
          >
            {s}{" "}
            <span>
              {state.orders.filter((o) => s === "All" || o.status === s).length}
            </span>
          </button>
        ))}
      </div>
      <section className="panel">
        <label className="search-box">
          <Search size={18} />
          <input
            aria-label="Search orders"
            type="search"
            placeholder="Search order, customer or dish…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        {list.length ? (
          list.map((o) => <OrderCard key={o.id} order={o} />)
        ) : (
          <EmptyOrders />
        )}
      </section>
    </>
  );
}
function DishEditor({
  dish,
  onClose,
}: {
  dish: MenuItem;
  onClose: () => void;
}) {
  const { mutate } = useStore();
  const [value, setValue] = useState(dish);
  const [busy, setBusy] = useState(false);
  const [imageError, setImageError] = useState("");
  return (
    <Modal
      title={dish.name ? "Edit " + dish.name : "Add something delicious"}
      onClose={onClose}
    >
      <form
        className="dish-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const ok = await mutate((s) => {
            if (
              !value.name.trim() ||
              !Number.isFinite(value.price) ||
              value.price < 1
            )
              throw new Error("Enter a dish name and valid price.");
            const i = s.menu.findIndex((m) => m.id === value.id);
            if (i >= 0) s.menu[i] = value;
            else s.menu.push(value);
          });
          setBusy(false);
          if (ok) onClose();
        }}
      >
        <div className="form-grid">
          <label>
            Dish name
            <input
              required
              maxLength={70}
              value={value.name}
              onChange={(e) => setValue({ ...value, name: e.target.value })}
            />
          </label>
          <label>
            Price (₹)
            <input
              required
              type="number"
              min="1"
              max="99999"
              step="1"
              value={value.price || ""}
              onChange={(e) =>
                setValue({ ...value, price: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Category
            <select
              value={value.category}
              onChange={(e) =>
                setValue({
                  ...value,
                  category: e.target.value as MenuItem["category"],
                })
              }
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Dietary classification
            <select
              value={value.vegetarian ? "veg" : "nonveg"}
              onChange={(e) =>
                setValue({ ...value, vegetarian: e.target.value === "veg" })
              }
            >
              <option value="veg">Vegetarian</option>
              <option value="nonveg">Non-vegetarian</option>
            </select>
          </label>
        </div>
        <label>
          Description
          <textarea
            required
            maxLength={600}
            value={value.description}
            onChange={(e) =>
              setValue({ ...value, description: e.target.value })
            }
          />
        </label>
        <label>
          Food photograph <small>(JPEG, PNG or WebP; up to 700 KB)</small>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (
                !["image/jpeg", "image/png", "image/webp"].includes(
                  file.type,
                ) ||
                file.size > 700000
              ) {
                setImageError("Choose a JPEG, PNG or WebP image under 700 KB.");
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                setValue((v) => ({ ...v, image: String(reader.result) }));
                setImageError("");
              };
              reader.readAsDataURL(file);
            }}
          />
        </label>
        {imageError && <p role="alert">{imageError}</p>}
        <div className="actions">
          <button
            type="button"
            className="button soft"
            onClick={() => setValue({ ...value, image: "" })}
          >
            Use labelled placeholder
          </button>
          <label className="check-label">
            <input
              type="checkbox"
              checked={value.available}
              onChange={(e) =>
                setValue({ ...value, available: e.target.checked })
              }
            />
            Available to order
          </label>
        </div>
        <button type="submit" className="button gold full" disabled={busy}>
          {busy ? "Saving…" : "Save dish"}
        </button>
      </form>
    </Modal>
  );
}
function MenuStudio() {
  const { state, mutate } = useStore();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const list = state.menu.filter(
    (m) => !m.archived && m.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="between studio-tools">
        <label className="search-box">
          <Search size={18} />
          <input
            type="search"
            aria-label="Search menu studio"
            placeholder="Find a dish…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button
          className="button gold"
          onClick={() =>
            setEditing({
              id: newId(),
              name: "",
              description: "",
              price: 0,
              category: "South Indian",
              image: "",
              vegetarian: true,
              available: true,
              archived: false,
            })
          }
        >
          <Plus size={17} />
          Add dish
        </button>
      </div>
      <section className="panel">
        <div className="between">
          <h2>Dish collection</h2>
          <span className="muted">{list.length} dishes</span>
        </div>
        {list.map((m) => (
          <article className="menu-editor-row" key={m.id}>
            <div>
              <h3 aria-label={m.name}>
                <i
                  className={"diet-dot " + (!m.vegetarian ? "nonveg" : "")}
                  aria-label={m.vegetarian ? "Vegetarian" : "Non-vegetarian"}
                />
                {m.name}
              </h3>
              <small>
                {m.category} · {money(m.price)}
              </small>
              <p>{m.description}</p>
            </div>
            <div className="actions">
              <button
                className={"availability " + (!m.available ? "off" : "")}
                onClick={() =>
                  void mutate((s) => {
                    const item = s.menu.find((x) => x.id === m.id);
                    if (item) item.available = !item.available;
                  })
                }
              >
                {m.available ? "Available" : "Unavailable"}
              </button>
              <button
                className="icon-button"
                aria-label={"Edit " + m.name}
                onClick={() => setEditing(m)}
              >
                <Pencil size={17} />
              </button>
              <button
                className="icon-button danger"
                aria-label={"Archive " + m.name}
                onClick={() => {
                  if (
                    confirm(
                      "Archive " +
                        m.name +
                        "? Existing order details will be kept.",
                    )
                  )
                    void mutate((s) => {
                      const item = s.menu.find((x) => x.id === m.id);
                      if (item) {
                        item.archived = true;
                        item.available = false;
                      }
                    });
                }}
              >
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        ))}
        {!list.length && <p>No dishes found.</p>}
      </section>
      {editing && (
        <DishEditor dish={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
function StatusBars({
  counts,
  total,
}: {
  counts: Record<string, number>;
  total: number;
}) {
  return (
    <div className="status-bars">
      {statuses.map((s) => (
        <div key={s}>
          <div className="between">
            <span>{s}</span>
            <b>{counts[s] ?? 0}</b>
          </div>
          <div className="bar-track">
            <i
              style={{
                width: (total ? ((counts[s] ?? 0) / total) * 100 : 0) + "%",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
function csvCell(value: unknown) {
  const s = String(value);
  return (
    '"' + (/^[=+@\-\t\r]/.test(s) ? "'" : "") + s.replaceAll('"', '""') + '"'
  );
}
function Reports() {
  const { state } = useStore();
  const r = dailyReport(state);
  const dishes = new Map<string, number>();
  r.orders
    .filter((o) => o.status !== "Cancelled")
    .forEach((o) =>
      o.items.forEach((i) =>
        dishes.set(i.name, (dishes.get(i.name) ?? 0) + i.quantity),
      ),
    );
  const hours = Array.from({ length: 24 }, (_, h) => ({
    h,
    count: r.orders.filter(
      (o) =>
        Number(
          new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            hourCycle: "h23",
          }).format(new Date(o.createdAt)),
        ) === h,
    ).length,
  }));
  const max = Math.max(1, ...hours.map((h) => h.count));
  function exportCsv() {
    const rows = [
      [
        "Token",
        "Order ID",
        "Customer",
        "Table",
        "Status",
        "Created at (IST)",
        "Payment",
        "Items",
        "Total INR",
      ],
      ...r.orders.map((o) => [
        o.token,
        o.id,
        o.customerName,
        o.table,
        o.status,
        new Date(o.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        o.payment,
        o.items.map((i) => i.quantity + " x " + i.name).join("; "),
        o.total,
      ]),
    ];
    const blob = new Blob(
      ["\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8;" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "deccan-orders-" + indiaDay() + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  return (
    <>
      <div className="actions report-actions">
        <button className="button gold" onClick={exportCsv}>
          <Download size={17} />
          Export today’s CSV
        </button>
      </div>
      <Metrics />
      <div className="vendor-columns">
        <section className="panel">
          <h2>Orders throughout the day</h2>
          <p className="muted">Orders placed by hour · India Standard Time</p>
          <div
            className="daily-chart"
            role="img"
            aria-label={hours
              .map((x) => x.h + ":00 " + x.count + " orders")
              .join(", ")}
          >
            {hours.map((x) => (
              <div key={x.h} title={x.h + ":00 · " + x.count + " orders"}>
                <span style={{ height: (x.count / max) * 140 + "px" }} />
                <small>{x.h % 4 === 0 ? x.h + "h" : ""}</small>
              </div>
            ))}
          </div>
          <h2>Order flow</h2>
          <StatusBars counts={r.byStatus} total={r.total} />
        </section>
        <section className="panel">
          <h2>Most ordered dishes</h2>
          <p className="muted">Today · excludes cancelled orders</p>
          {[...dishes]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, n]) => (
              <div className="summary-row" key={name}>
                <span>{name}</span>
                <strong>{n}</strong>
              </div>
            ))}
          {!dishes.size && (
            <p className="muted">
              Place your first order to see popular dishes.
            </p>
          )}
          <div className="summary-row">
            <span>Completed order value</span>
            <strong>{money(r.value)}</strong>
          </div>
        </section>
      </div>
    </>
  );
}
function RestaurantSettings() {
  const { state, mutate } = useStore();
  const [saved, setSaved] = useState(false);
  return (
    <>
      <LogoSettings />
      <section className="panel">
        <h2>Restaurant profile</h2>
        <form
          className="dish-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const ok = await mutate((s) => {
              s.restaurant.location = String(data.get("location")).trim();
              s.restaurant.open = data.get("open") === "on";
            });
            if (ok) setSaved(true);
          }}
        >
          <div className="form-grid">
            <label>
              Restaurant name
              <input value={state.restaurant.name} readOnly />
            </label>
            <label>
              Location
              <input
                name="location"
                required
                maxLength={100}
                defaultValue={state.restaurant.location}
              />
            </label>
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              name="open"
              defaultChecked={state.restaurant.open}
            />
            Accept customer orders
          </label>
          <button className="button gold" type="submit">
            Save settings
          </button>
          {saved && <p role="status">Restaurant settings saved.</p>}
        </form>
      </section>
      <section className="panel">
        <h2>About this workspace</h2>
        <p>
          Orders, menus and rewards are stored in this browser and synchronized
          across tabs on the same origin. No authentication, Firebase, WhatsApp
          or payment service is connected.
        </p>
        <p className="muted">
          For an Android walkthrough, use the laptop’s network URL. The phone
          has its own separate demo storage; use both customer and vendor views
          on that phone to show live updates.
        </p>
      </section>
      <section className="panel">
        <h2>Start fresh</h2>
        <p>
          Reset the menu, orders, cart, restaurant settings and rewards on this
          browser.
        </p>
        <button
          className="button danger"
          onClick={() => {
            if (
              confirm(
                "Reset ALL demo data? This removes every local order, menu edit, cart and reward.",
              )
            )
              resetStorage();
          }}
        >
          Reset Demo Data
        </button>
      </section>
    </>
  );
}
export function Vendor() {
  const path = normalizedPath(usePathname());
  const { state, ready } = useStore();
  const sound = useOrderSound();
  const active = nav.find((n) => n.path === path) ?? nav[0];
  return (
    <div className="vendor-app">
      <header className="vendor-header">
        <Link href="/vendor">
          <Brand />
        </Link>
        <div className="header-actions">
          <span className="live-label">✦ Workspace active</span>
          <button
            className="sound-button"
            onClick={() => void sound.toggle()}
            aria-label={
              sound.on ? "Mute incoming orders" : "Enable incoming order sound"
            }
          >
            {sound.on ? <Volume2 size={18} /> : <VolumeX size={18} />}
            <span>{sound.on ? "Sound on" : "Sound off"}</span>
          </button>
          <Link className="button gold small" href="/menu">
            Customer menu <ArrowUpRight size={16} />
          </Link>
        </div>
      </header>
      <div className="vendor-layout">
        <aside className="vendor-sidebar">
          <p className="eyebrow">WORKSPACE</p>
          <nav aria-label="Vendor workspace">
            {nav.map((n) => (
              <Link
                key={n.path}
                href={n.path}
                aria-current={n.path === path ? "page" : undefined}
                className={n.path === path ? "active" : ""}
              >
                <n.icon size={19} />
                {n.name}
                {n.path === "/vendor/orders" &&
                  state.orders.filter((o) => o.status === "New").length > 0 && (
                    <b>
                      {state.orders.filter((o) => o.status === "New").length}
                    </b>
                  )}
              </Link>
            ))}
          </nav>
          <div className="sidebar-note">
            <ChefHat size={30} />
            <strong>Made for smoother service.</strong>
            <p>A fresh menu. A happy kitchen. Every order, in sync.</p>
          </div>
        </aside>
        <main className="vendor-main">
          <div className="vendor-notice">
            LOCAL DEMO · Data stays in this browser. No real payments or kitchen
            integrations.
          </div>
          <div className="vendor-page-title">
            <div>
              <p className="eyebrow">THE DECCAN TABLE · VENDOR STUDIO</p>
              <h1>
                {active.name === "Overview"
                  ? "Your restaurant, at a glance."
                  : active.name}
              </h1>
              <p>
                {active.name === "Overview"
                  ? "A fresh perspective on today’s service."
                  : "Everything you need for a smooth service."}
              </p>
            </div>
            <span className="date-chip">{indiaDay()} · IST</span>
          </div>
          {!ready ? (
            <p role="status">Loading workspace…</p>
          ) : path === "/vendor/orders" ? (
            <Orders />
          ) : path === "/vendor/menu" ? (
            <MenuStudio />
          ) : path === "/vendor/reports" ? (
            <Reports />
          ) : path === "/vendor/settings" ? (
            <RestaurantSettings />
          ) : (
            <Overview />
          )}
        </main>
      </div>
    </div>
  );
}
