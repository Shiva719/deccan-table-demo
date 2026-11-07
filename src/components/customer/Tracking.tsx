"use client";
import { orderHref } from "@/lib/utils/paths";
import Link from "next/link";
import { Bell, Check, Gamepad2, Receipt } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { money } from "@/lib/utils/domain";
import { CustomerShell, BackLink } from "./CustomerShell";
import { Games } from "@/components/games/Games";
import { Rewards } from "@/components/rewards/Rewards";
import type { Order } from "@/types";
export function OrderProgress({ order }: { order: Order }) {
  const steps = ["New", "Preparing", "Ready", "Completed"];
  const current = steps.indexOf(order.status);
  return (
    <>
      <div className="between">
        <div>
          <p className="eyebrow">YOUR ORDER · {order.id.slice(0, 8)}</p>
          <h2>Token {order.token}</h2>
        </div>
        <span className={"status " + order.status}>{order.status}</span>
      </div>
      {order.status === "Cancelled" ? (
        <div className="notice" role="status">
          This order has been cancelled. Please speak with the counter for
          assistance.
        </div>
      ) : (
        <ol className="order-progress">
          {steps.map((s, i) => (
            <li
              key={s}
              className={i <= current ? "done" : ""}
              aria-current={i === current ? "step" : undefined}
            >
              <span>{i < current ? <Check size={16} /> : i + 1}</span>
              {i === 0 ? "Order placed" : s}
            </li>
          ))}
        </ol>
      )}
      {order.status === "Ready" && (
        <div className="ready-banner" role="status" aria-live="polite">
          <Bell />
          Your order is ready! Please collect your food at the counter.
        </div>
      )}
      {order.status === "Completed" && (
        <div className="ready-banner" role="status">
          Enjoy every bite. Your order is completed.
        </div>
      )}
    </>
  );
}
export function Tracking({ id, play = false }: { id: string; play?: boolean }) {
  const { state, ready } = useStore();
  const order = state.orders.find((o) => o.id === id);
  return (
    <CustomerShell>
      <BackLink />
      {!ready ? (
        <p>Loading order…</p>
      ) : !order ? (
        <div className="empty-state">
          <Receipt size={40} />
          <h1>Order not found on this browser.</h1>
          <p>
            Orders are saved on the device and origin where they were placed.
          </p>
          <Link className="button" href="/menu">
            Open menu
          </Link>
        </div>
      ) : (
        <>
          <p className="eyebrow">
            {play
              ? "YOUR TABLE-SIDE PLAYGROUND"
              : "THANK YOU, " + order.customerName.toUpperCase()}
          </p>
          <h1>
            {play ? (
              <>
                Good food takes time.
                <br />
                <em>Good fun doesn’t.</em>
              </>
            ) : (
              "Your order is in!"
            )}
          </h1>
          <p className="lead">
            {play
              ? "A little challenge while the kitchen works its magic."
              : "Freshly made, just for you. Follow your order right here."}
          </p>
          <section className="panel tracking-panel">
            <OrderProgress order={order} />
            {!play && (
              <>
                <div className="order-details">
                  {order.items.map((i) => (
                    <div className="between" key={i.menuItemId}>
                      <span>
                        {i.quantity} · {i.name}
                      </span>
                      <strong>{money(i.price * i.quantity)}</strong>
                    </div>
                  ))}
                </div>
                <div className="grand-total">
                  <span>Total</span>
                  <span>{money(order.total)}</span>
                </div>
                <p className="muted">
                  {order.payment === "counter"
                    ? "Pay at Counter"
                    : "Online Payment — Demo · simulated, no transaction"}
                  {order.table && " · Table " + order.table}
                </p>
                {order.notes && <p>Order notes: {order.notes}</p>}
                <div className="actions">
                  <Link className="button" href={orderHref(id, true)}>
                    <Gamepad2 size={18} />
                    Play while you wait
                  </Link>
                  <Link className="button soft" href={orderHref(id)}>
                    Track order
                  </Link>
                </div>
              </>
            )}
            {play && (
              <Link className="text-button" href={orderHref(id)}>
                View order details →
              </Link>
            )}
          </section>
          <Rewards order={order} />
          {play && <Games />}
        </>
      )}
    </CustomerShell>
  );
}
