import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.moulaytrading.p2pcalculator",
  appName: "Moulay Trading — P2P Calculator",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
