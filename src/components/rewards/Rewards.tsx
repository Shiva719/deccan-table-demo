"use client";
import { Gift, Crown } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { claim, redeem } from "@/lib/utils/domain";
import type { Order } from "@/types";
export function Rewards({ order }: { order: Order }) {
  const { state, mutate } = useStore();
  const wallet = state.wallet;
  const claimed = wallet.claimedOrders.includes(order.id);
  const eligible = ["Ready", "Completed"].includes(order.status);
  return (
    <section className="rewards-card">
      <div className="between">
        <div>
          <p className="eyebrow">THE DECCAN TABLE REWARDS CLUB</p>
          <h2>Little treats. Lovely rewards.</h2>
          <p>Every visit brings you closer to something delicious.</p>
        </div>
        <Crown size={42} />
      </div>
      <div className="points-number">
        {wallet.points}
        <small>POINTS IN YOUR WALLET</small>
      </div>
      <div
        className="reward-track"
        role="progressbar"
        aria-label="Progress toward 100 points"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(100, wallet.points)}
      >
        <div style={{ width: Math.min(100, wallet.points) + "%" }} />
      </div>
      <div className="between reward-copy">
        <span>
          {wallet.points >= 100
            ? "Your next reward is ready"
            : 100 - wallet.points + " points to your next reward"}
        </span>
        <span>100 pts = ₹50 voucher</span>
      </div>
      <div className="actions">
        <button
          className="button gold"
          disabled={claimed || !eligible}
          onClick={() => void mutate((s) => claim(s, order.id))}
        >
          <Gift size={17} />
          {claimed ? "Points collected" : "Collect 50 points"}
        </button>
        <button
          className="button reward-secondary"
          disabled={wallet.points < 100}
          onClick={() => void mutate(redeem)}
        >
          Unlock ₹50 demo voucher
        </button>
      </div>
      <p className="reward-copy" role="status">
        {claimed
          ? "50 points collected for this order."
          : eligible
            ? "Your order is ready. Your points are waiting!"
            : "Your points unlock when the kitchen marks your order Ready."}
      </p>
      {wallet.vouchers.map((v) => (
        <div className="voucher" key={v.code}>
          ₹50 DEMO-ONLY VOUCHER · <strong>{v.code}</strong>
        </div>
      ))}
      <small>
        Saved on this device. Demo vouchers do not change order totals and
        cannot be used as real discounts.
      </small>
    </section>
  );
}
