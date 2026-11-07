import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import { BASE_PATH } from "./src/lib/utils/paths";
// Next development resources must explicitly allow the laptop's LAN host.
function localNetworkHosts(): string[] {
  try {
    return Object.values(networkInterfaces()).flatMap((entries) =>
      (entries ?? [])
        .filter((n) => n.family === "IPv4" && !n.internal)
        .map((n) => n.address),
    );
  } catch {
    return [];
  }
}
const config: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
  devIndicators: false,
  allowedDevOrigins: [
    ...localNetworkHosts(),
    ...(process.env.DEMO_ALLOWED_ORIGINS?.split(",").filter(Boolean) ?? []),
  ],
};
export default config;
