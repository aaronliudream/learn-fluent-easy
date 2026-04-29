import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.020b75e60e5945059d3628ee6224e3d5",
  appName: "learn-fluent-easy",
  webDir: "dist",
  server: {
    // Hot-reload from the Lovable sandbox preview during development.
    // Remove or comment out the `url` line before producing a production
    // build for the App Store.
    url: "https://020b75e6-0e59-4505-9d36-28ee6224e3d5.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
};

export default config;