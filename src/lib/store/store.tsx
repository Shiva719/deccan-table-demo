"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { seed } from "@/lib/data/seed";
import type { DemoState } from "@/types";
const KEY = "deccan-table-demo-v1";
export function parseState(raw: string): DemoState {
  let v = JSON.parse(raw) as DemoState;
  // v0 used the same records but did not yet include the reward ledger or archive flag.
  if (
    (v as { version: number }).version === 0 &&
    Array.isArray(v.menu) &&
    Array.isArray(v.orders) &&
    Array.isArray(v.cart)
  ) {
    v = {
      ...seed(),
      ...v,
      version: 1,
      assetVersion: v.assetVersion,
      wallet: { ...seed().wallet, ...v.wallet },
      menu: v.menu.map((m) => ({
        ...m,
        archived: m.archived ?? false,
        image: m.image ?? "",
      })),
      nextToken: Math.max(
        v.nextToken ?? 1,
        v.orders.length + 1,
        ...v.orders.map((o) => Number(o.token?.replace(/^DT-/, "")) + 1 || 1),
      ),
    };
  }

  if (v.version !== 1) throw new Error("Unsupported demo data version.");
  if (
    !Array.isArray(v.menu) ||
    !Array.isArray(v.orders) ||
    !Array.isArray(v.cart) ||
    !v.restaurant ||
    !v.wallet ||
    !Array.isArray(v.wallet.claimedOrders) ||
    !Array.isArray(v.wallet.transactions) ||
    !Array.isArray(v.wallet.vouchers) ||
    !Number.isFinite(v.wallet.points) ||
    v.wallet.points < 0 ||
    !Number.isInteger(v.nextToken) ||
    v.nextToken < 1
  )
    throw new Error("Invalid saved demo data.");
  if (
    v.menu.some(
      (m) =>
        !m.id ||
        typeof m.name !== "string" ||
        typeof m.description !== "string" ||
        !Number.isFinite(m.price) ||
        m.price < 1 ||
        typeof m.available !== "boolean",
    ) ||
    v.orders.some(
      (o) =>
        !o.id ||
        !Array.isArray(o.items) ||
        !Number.isFinite(o.total) ||
        !["New", "Preparing", "Ready", "Completed", "Cancelled"].includes(
          o.status,
        ) ||
        !Number.isFinite(Date.parse(o.createdAt)),
    ) ||
    v.cart.some(
      (c) =>
        !c.menuItemId ||
        !Number.isInteger(c.quantity) ||
        c.quantity < 1 ||
        c.quantity > 99,
    )
  )
    throw new Error("Invalid records in saved demo data.");
  // Early demo saves predate the local photographs. Upgrade images only once;
  // retain menu edits, uploaded photos, orders, cart and rewards.
  if (!v.assetVersion) {
    const photos = new Map(seed().menu.map((item) => [item.id, item.image]));
    v.menu = v.menu.map((item) =>
      !item.image && photos.has(item.id)
        ? { ...item, image: photos.get(item.id)! }
        : item,
    );
    v.assetVersion = 1;
  }
  return v;
}
interface Store {
  state: DemoState;
  ready: boolean;
  error: string;
  clearError: () => void;
  mutate: (fn: (draft: DemoState) => void) => Promise<boolean>;
}
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(seed);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const loaded = parseState(raw);
          if (JSON.parse(raw).version === 0 || !JSON.parse(raw).assetVersion)
            localStorage.setItem(KEY, JSON.stringify(loaded));
          setState(loaded);
        } else {
          const initial = seed();
          localStorage.setItem(KEY, JSON.stringify(initial));
          setState(initial);
        }
      } catch {
        setError(
          "Saved demo data could not be loaded. It has been preserved. Open vendor settings to reset it, or retry with browser storage enabled.",
        );
      }
      setReady(true);
    }
    load();
    function sync(e: StorageEvent) {
      if (e.key === KEY || e.key === null) load();
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const mutate = useCallback(async (fn: (draft: DemoState) => void) => {
    const run = () => {
      try {
        const raw = localStorage.getItem(KEY);
        const draft = raw ? parseState(raw) : seed();
        fn(draft);
        localStorage.setItem(KEY, JSON.stringify(draft));
        setState(draft);
        setError("");
        return true;
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Unable to save. Check browser storage.",
        );
        return false;
      }
    };
    // Web Locks serialize edits from multiple tabs on supported browsers.
    if (navigator.locks) return navigator.locks.request(KEY, run);
    return run();
  }, []);
  return (
    <Context.Provider
      value={{ state, ready, error, clearError: () => setError(""), mutate }}
    >
      {children}
      {error && (
        <div className="error-toast" role="alert">
          {error}
          <button onClick={() => setError("")} aria-label="Dismiss error">
            ?
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("StoreProvider missing");
  return value;
}
export function resetStorage() {
  localStorage.setItem(KEY, JSON.stringify(seed()));
  window.location.reload();
}
