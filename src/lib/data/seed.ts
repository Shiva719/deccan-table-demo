import data from "./menu.json";
import type { DemoState, MenuItem, MenuCategory } from "@/types";
export const categories: MenuCategory[] = [
  "South Indian",
  "Continental",
  "Chinese",
  "North Indian",
  "Biryani & Rice",
  "Snacks",
  "Beverages",
  "Desserts",
];
export function seed(): DemoState {
  return {
    version: 1,
    assetVersion: 1,
    restaurant: {
      name: "THE DECCAN TABLE",
      location: "Hyderabad, Telangana",
      tagline: "A taste of Hyderabad",
      open: true,
    },
    menu: structuredClone(data) as MenuItem[],
    cart: [],
    orders: [],
    wallet: { points: 0, claimedOrders: [], transactions: [], vouchers: [] },
    currentOrderId: null,
    nextToken: 1,
  };
}
