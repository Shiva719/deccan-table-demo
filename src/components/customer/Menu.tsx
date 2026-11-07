"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, RotateCcw, Plus, Minus, Leaf } from "lucide-react";
import { categories } from "@/lib/data/seed";
import { useStore } from "@/lib/store/store";
import { changeQuantity, cartTotal, money } from "@/lib/utils/domain";
import type { MenuItem } from "@/types";
import { CustomerShell } from "./CustomerShell";
import { DishPhoto } from "./DishPhoto";
import { Brand } from "@/components/shared/Brand";
import { Modal } from "@/components/shared/Modal";
export function Quantity({
  id,
  disabled = false,
}: {
  id: string;
  disabled?: boolean;
}) {
  const { state, mutate } = useStore();
  const q = state.cart.find((c) => c.menuItemId === id)?.quantity ?? 0;
  return q ? (
    <div className="stepper">
      <button
        aria-label={"Decrease " + state.menu.find((m) => m.id === id)?.name}
        onClick={() => void mutate((s) => changeQuantity(s, id, -1))}
      >
        <Minus size={14} />
      </button>
      <b>{q}</b>
      <button
        disabled={disabled || q >= 99}
        aria-label={"Increase " + state.menu.find((m) => m.id === id)?.name}
        onClick={() => void mutate((s) => changeQuantity(s, id, 1))}
      >
        <Plus size={14} />
      </button>
    </div>
  ) : (
    <button
      className="add-button"
      disabled={disabled}
      onClick={() => void mutate((s) => changeQuantity(s, id, 1))}
    >
      {disabled ? (
        "Unavailable"
      ) : (
        <>
          Add <Plus size={14} />
        </>
      )}
    </button>
  );
}
export function Menu() {
  const { state, ready } = useStore();
  const [category, setCategory] = useState("All dishes");
  const [search, setSearch] = useState("");
  const [about, setAbout] = useState<MenuItem | null>(null);
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem("deccan-intro");
    } catch {}
    if (!seen && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const start = setTimeout(() => {
        setIntro(true);
        try {
          sessionStorage.setItem("deccan-intro", "1");
        } catch {}
      }, 0);
      const end = setTimeout(() => setIntro(false), 1600);
      return () => {
        clearTimeout(start);
        clearTimeout(end);
      };
    }
  }, []);
  const dishes = state.menu.filter(
    (m) =>
      !m.archived &&
      (category === "All dishes" || m.category === category) &&
      (m.name + " " + m.description)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const count = state.cart.reduce((s, c) => s + c.quantity, 0);
  return (
    <CustomerShell hero>
      {intro && (
        <div className="logo-intro">
          <Brand />
        </div>
      )}
      <div className="menu-tools">
        <label className="search-box">
          <Search size={18} />
          <input
            type="search"
            aria-label="Search dishes"
            placeholder="What are you craving today?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <button
          className="text-button"
          onClick={() => {
            setIntro(true);
            setTimeout(() => setIntro(false), 1600);
          }}
        >
          <RotateCcw size={14} /> Replay welcome
        </button>
      </div>
      <nav className="category-list" aria-label="Menu categories">
        {["All dishes", ...categories].map((c) => (
          <button
            key={c}
            aria-pressed={c === category}
            className={c === category ? "active" : ""}
            onClick={() => setCategory(c)}
          >
            {c === "All dishes" && <Leaf size={14} />} {c}
          </button>
        ))}
      </nav>
      <div className="section-heading">
        <div>
          <p className="eyebrow">A MENU FULL OF POSSIBILITIES</p>
          <h2>
            {category === "All dishes" ? "All-time favourites" : category}
          </h2>
          <p>Choose your cravings. We’ll take care of the rest.</p>
        </div>
        <span>{dishes.length} dishes</span>
      </div>
      {!ready ? (
        <p role="status">Preparing your menu…</p>
      ) : (
        <div className="dish-grid">
          {dishes.map((dish, i) => (
            <article
              className={"dish-card " + (!dish.available ? "unavailable" : "")}
              key={dish.id}
            >
              <DishPhoto dish={dish} priority={i < 3} />
              <div className="dish-body">
                <div className="dish-title">
                  <h3 aria-label={dish.name}>
                    <i
                      aria-label={
                        dish.vegetarian ? "Vegetarian" : "Non-vegetarian"
                      }
                      className={
                        "diet-dot " + (!dish.vegetarian ? "nonveg" : "")
                      }
                    />
                    {dish.name}
                  </h3>
                  <strong>{money(dish.price)}</strong>
                </div>
                <p>{dish.description}</p>
                <div className="dish-actions">
                  <button
                    className="text-button"
                    onClick={() => setAbout(dish)}
                  >
                    About dish →
                  </button>
                  <Quantity
                    id={dish.id}
                    disabled={!dish.available || !state.restaurant.open}
                  />
                </div>
              </div>
            </article>
          ))}
          {!dishes.length && (
            <div className="empty-state">
              <Search />
              <h2>No dishes found</h2>
              <p>Try another search or category.</p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All dishes");
                }}
              >
                Show all dishes
              </button>
            </div>
          )}
        </div>
      )}
      <div className="notice">
        · A taste of what’s possible. This is a local ordering demo. Your order
        travels to the vendor dashboard in this browser.
      </div>
      {count > 0 && (
        <div className="sticky-cart">
          <Link href="/cart">
            <span>
              <b>
                {count} {count === 1 ? "item" : "items"} in your cart
              </b>
              <small>A delicious decision.</small>
            </span>
            <strong>{money(cartTotal(state))}</strong>
            <span>
              View cart <ArrowRight size={18} />
            </span>
          </Link>
        </div>
      )}
      {about && (
        <Modal title={about.name} onClose={() => setAbout(null)}>
          <p>{about.description}</p>
          <p className="muted">
            {about.vegetarian ? "Vegetarian" : "Non-vegetarian"} ·{" "}
            {about.category}. Please ask the counter about allergens and dietary
            needs.
          </p>
          <div className="between">
            <strong>{money(about.price)}</strong>
            <Quantity
              id={about.id}
              disabled={!about.available || !state.restaurant.open}
            />
          </div>
        </Modal>
      )}
    </CustomerShell>
  );
}
