"use client";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store/store";
import { Tracking } from "./Tracking";
export function OrderRoute({ play = false }: { play?: boolean }) {
  const params = useSearchParams();
  const { state } = useStore();
  const id = params.get("id") ?? state.currentOrderId ?? "";
  return <Tracking id={id} play={play} />;
}
