"use client";
import { orderHref, normalizedPath } from "@/lib/utils/paths";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store/store";
export function DemoNav() {
  const { state } = useStore();
  const path = normalizedPath(usePathname());
  return (
    <nav className="demo-nav" aria-label="Demo navigation">
      <Link href="/" className="demo-label">
        DEMO ONLY
      </Link>
      <Link href="/menu" aria-current={path === "/menu" ? "page" : undefined}>
        Customer menu
      </Link>
      <Link
        href="/vendor"
        aria-current={path.startsWith("/vendor") ? "page" : undefined}
      >
        Vendor dashboard
      </Link>
      {state.currentOrderId && (
        <Link href={orderHref(state.currentOrderId)}>Current order</Link>
      )}
    </nav>
  );
}
