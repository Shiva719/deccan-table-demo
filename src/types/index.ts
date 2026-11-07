export type MenuCategory =
  | "South Indian"
  | "Continental"
  | "Chinese"
  | "North Indian"
  | "Biryani & Rice"
  | "Snacks"
  | "Beverages"
  | "Desserts";
export interface Restaurant {
  logo?: string;
  name: string;
  location: string;
  tagline: string;
  open: boolean;
}
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  description: string;
  emoji?: string;
  tag?: string;
  image: string;
  vegetarian: boolean;
  available: boolean;
  archived: boolean;
}
export interface CartItem {
  menuItemId: string;
  quantity: number;
}
export type OrderStatus =
  "New" | "Preparing" | "Ready" | "Completed" | "Cancelled";
export type PaymentMethod = "counter" | "online-demo";
export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}
export interface Order {
  id: string;
  token: string;
  submissionId: string;
  customerName: string;
  table: string;
  notes: string;
  items: OrderItem[];
  total: number;
  payment: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
export interface RewardTransaction {
  id: string;
  type: "claim" | "redeem";
  points: number;
  orderId?: string;
  createdAt: string;
}
export interface RewardWallet {
  points: number;
  claimedOrders: string[];
  transactions: RewardTransaction[];
  vouchers: { code: string; value: number; createdAt: string }[];
}
export interface DemoState {
  version: 1;
  assetVersion?: number;
  restaurant: Restaurant;
  menu: MenuItem[];
  cart: CartItem[];
  orders: Order[];
  wallet: RewardWallet;
  currentOrderId: string | null;
  nextToken: number;
}
