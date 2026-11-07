import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store/store";
import { DemoNav } from "@/components/shared/DemoNav";
export const metadata: Metadata = {
  title: "The Deccan Table | A taste of Hyderabad",
  description: "A complete local QR ordering experience. Good food. Good mood.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <StoreProvider>
          <DemoNav />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
