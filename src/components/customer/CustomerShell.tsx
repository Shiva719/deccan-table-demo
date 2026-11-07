"use client";
import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Brand } from "@/components/shared/Brand";
import { useStore } from "@/lib/store/store";
import type { ReactNode } from "react";
export function CustomerShell({
  children,
  hero = false,
}: {
  children: ReactNode;
  hero?: boolean;
}) {
  const { state } = useStore();
  return (
    <>
      <div className="top-strip">
        A LITTLE TASTE OF HYDERABAD · MADE FRESH, SERVED WITH HEART
      </div>
      <header className="customer-header">
        <div className="wrap">
          <div className="header-row">
            <Link href="/menu" aria-label="The Deccan Table menu">
              <Brand />
            </Link>
            <div className="header-actions">
              <span className="open-pill">
                ●{" "}
                {state.restaurant.open
                  ? "OPEN FOR GOOD FOOD"
                  : "CURRENTLY CLOSED"}
              </span>
              <Link className="cart-link" href="/cart" aria-label="Open cart">
                <ShoppingBag size={18} />
                <span>{state.cart.reduce((s, c) => s + c.quantity, 0)}</span>
              </Link>
            </div>
          </div>
          {hero && (
            <section className="menu-hero">
              <div className="eyebrow">GOOD FOOD. GOOD MOOD.</div>
              <h1>
                Discover your next
                <br />
                <em>favourite.</em>
              </h1>
              <p>
                From South Indian comfort classics to flavour-packed favourites.
                <br className="desktop" /> Made fresh. Made with heart. Made for
                you.
              </p>
              <div className="hero-meta">
                <span>✦ Freshly prepared</span>
                <span>✦ Made to order</span>
                <span>✦ A little something for everyone</span>
              </div>
              <span className="hero-seal" aria-hidden="true">
                DT<small>EST. HYDERABAD</small>
              </span>
            </section>
          )}
        </div>
      </header>
      <main className="wrap customer-main">{children}</main>
      <footer>
        <Brand />
        <p>Good food brings people together.</p>
        <small>Local demo · No real payments are processed</small>
        <br />
        <Link href="/credits">Food photography & credits</Link>
      </footer>
    </>
  );
}
export function BackLink() {
  return (
    <Link href="/menu" className="back-link">
      <ArrowLeft size={16} /> Back to menu
    </Link>
  );
}
