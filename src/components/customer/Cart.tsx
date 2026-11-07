"use client";
import { orderHref } from "@/lib/utils/paths";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ArrowRight,
  CreditCard,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "@/lib/store/store";
import { cartTotal, createOrder, money, newId } from "@/lib/utils/domain";
import { CustomerShell, BackLink } from "./CustomerShell";
import { Quantity } from "./Menu";
import type { PaymentMethod } from "@/types";
export function Cart() {
  const { state, ready, mutate } = useStore();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentMethod>("counter");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const submission = useRef<string | null>(null);
  return (
    <CustomerShell>
      <BackLink />
      {!ready ? (
        <p>Loading cart…</p>
      ) : !state.cart.length ? (
        <div className="empty-state">
          <ShoppingBag size={42} />
          <h1>A little empty, a lot of possibility.</h1>
          <p>Your next favourite is waiting on the menu.</p>
          <Link className="button" href="/menu">
            Explore the menu <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <>
          <p className="eyebrow">GOOD THINGS ARE COMING</p>
          <h1>Your delicious decisions.</h1>
          <div className="checkout-layout">
            <section className="panel">
              <h2>Your order</h2>
              {state.cart.map((c) => {
                const m = state.menu.find((m) => m.id === c.menuItemId);
                return m ? (
                  <div className="cart-row" key={c.menuItemId}>
                    <div>
                      <h3>{m.name}</h3>
                      <small>
                        {money(m.price)} each
                        {(!m.available || m.archived) &&
                          " · Unavailable · remove to continue"}
                      </small>
                    </div>
                    <Quantity id={m.id} disabled={!m.available || m.archived} />
                    <strong>{money(m.price * c.quantity)}</strong>
                  </div>
                ) : null;
              })}
              <div className="grand-total">
                <span>Total</span>
                <span>{money(cartTotal(state))}</span>
              </div>
              <p className="muted">
                Demo prices. No additional taxes or fees are added.
              </p>
            </section>
            <form
              className="panel checkout-form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (lock.current) return;
                lock.current = true;
                setBusy(true);
                submission.current ??= newId();
                const data = new FormData(e.currentTarget);
                let id = "";
                const ok = await mutate((s) => {
                  id = createOrder(s, {
                    customerName: String(data.get("name")),
                    table: String(data.get("table")),
                    notes: String(data.get("notes")),
                    payment,
                    submissionId: submission.current!,
                  }).id;
                });
                if (ok) router.push(orderHref(id));
                else {
                  setBusy(false);
                  lock.current = false;
                }
              }}
            >
              <h2>Almost there.</h2>
              <label>
                Your name
                <input
                  name="name"
                  required
                  maxLength={60}
                  placeholder="What should we call you?"
                  autoComplete="given-name"
                />
              </label>
              <label>
                Table number <small>(optional)</small>
                <input name="table" maxLength={20} placeholder="e.g. 04" />
              </label>
              <label>
                Order notes <small>(optional)</small>
                <textarea
                  name="notes"
                  maxLength={400}
                  placeholder="Anything you’d like us to know?"
                />
              </label>
              <fieldset>
                <legend>Payment preference</legend>
                <label className="pay-choice">
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "counter"}
                    onChange={() => setPayment("counter")}
                  />
                  <Banknote size={20} />
                  Pay at Counter
                </label>
                <label className="pay-choice">
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "online-demo"}
                    onChange={() => setPayment("online-demo")}
                  />
                  <CreditCard size={20} />
                  Online Payment — Demo
                </label>
              </fieldset>
              <p className="muted">
                <ShieldCheck size={14} />{" "}
                {payment === "online-demo"
                  ? "Simulated only. No transaction occurs and no card details are collected."
                  : "Pay at the counter when you collect your food."}
              </p>
              <button className="button full" disabled={busy} type="submit">
                {busy ? "Placing your order…" : "Place demo order"}{" "}
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </>
      )}
    </CustomerShell>
  );
}
