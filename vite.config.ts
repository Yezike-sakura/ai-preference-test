import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: [".lhr.life", ".localhost.run", ".trycloudflare.com"],
  },
});
