import { Suspense } from "react";
import { OrderRoute } from "@/components/customer/OrderRoute";
export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="wrap customer-main">
          <p role="status">Loading your order...</p>
        </main>
      }
    >
      <OrderRoute play />
    </Suspense>
  );
}
