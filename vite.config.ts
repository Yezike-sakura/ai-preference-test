import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    allowedHosts: [".lhr.life", ".localhost.run", ".trycloudflare.com"],
  },
});
