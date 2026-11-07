import Link from "next/link";
import {
  ArrowUpRight,
  UtensilsCrossed,
  LayoutDashboard,
  ScanLine,
  ClipboardCheck,
  Gamepad2,
  Gift,
  ArrowRight,
} from "lucide-react";
import { Brand } from "@/components/shared/Brand";
export default function Home() {
  return (
    <main className="landing">
      <header className="wrap header-row">
        <Brand />
        <span className="open-pill">THE LOCAL DEMO</span>
      </header>
      <section className="wrap landing-hero">
        <div>
          <p className="eyebrow">THOUGHTFULLY MADE. JOYFULLY SERVED.</p>
          <h1>
            A better table.
            <br />A happier kitchen.
            <br />
            <em>One lovely experience.</em>
          </h1>
          <p className="lead">
            Meet the modern restaurant experience, with a little Deccan soul.
            Order, follow your food, and turn the wait into a little moment of
            joy.
          </p>
          <div className="actions">
            <Link className="button gold" href="/menu">
              <UtensilsCrossed size={19} />
              Open Customer Menu
              <ArrowUpRight size={18} />
            </Link>
            <Link className="button landing-secondary" href="/vendor">
              <LayoutDashboard size={19} />
              Open Vendor Dashboard
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="landing-meta">
            · No sign-in needed <span>✦ No real payments</span> · Made for your
            next big idea
          </div>
        </div>
        <div className="landing-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="table-stamp">
            <UtensilsCrossed size={60} />
            <strong>
              THE
              <br />
              DECCAN
              <br />
              TABLE
            </strong>
            <span>GOOD FOOD. GOOD MOOD.</span>
          </div>
          <div className="floating-label">
            <ScanLine size={22} />
            <span>
              From scan to served.<small>Seamlessly connected.</small>
            </span>
          </div>
        </div>
      </section>
      <section className="walkthrough">
        <div className="wrap">
          <p className="eyebrow">TAKE IT FOR A SPIN</p>
          <h2>A whole service. In a few clicks.</h2>
          <p className="lead">
            Keep the customer menu and vendor dashboard open in two tabs in the
            same browser.
          </p>
          <div className="walkthrough-grid">
            {[
              {
                icon: ScanLine,
                title: "01 · Find your favourite",
                copy: "Browse all eight categories, read about a dish, and add a few favourites to your cart.",
              },
              {
                icon: ClipboardCheck,
                title: "02 · Send it to the kitchen",
                copy: "Enter a name, choose Pay at Counter and place your demo order. Find the token in Live orders.",
              },
              {
                icon: Gamepad2,
                title: "03 · Make the wait fun",
                copy: "Mark the order Preparing in the vendor tab. Return to tracking and try all three mini-games.",
              },
              {
                icon: Gift,
                title: "04 · Serve a little delight",
                copy: "Mark Ready to see the live notification. Claim 50 points, then mark Completed and explore Daily insights.",
              },
            ].map((s) => (
              <article key={s.title}>
                <s.icon size={25} />
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </article>
            ))}
          </div>
          <div className="landing-tip">
            <strong>Make it yours.</strong>
            <p>
              Edit a dish or toggle its availability in Menu studio, then watch
              the customer menu update. Place a second order to collect 100
              points and unlock a demo ₹50 voucher.
            </p>
            <Link href="/menu">
              Let’s start with something delicious <ArrowRight size={18} />
            </Link>
          </div>
          <p className="muted">
            Browser-local demo: tabs on the same device and origin share data. A
            laptop and phone have separate data. No cloud, WhatsApp, real
            payments or authentication are connected.
          </p>
        </div>
      </section>
      <footer>
        <Brand />
        <p>Good food brings people together.</p>
        <Link href="/credits">Food photography & credits</Link>
      </footer>
    </main>
  );
}
