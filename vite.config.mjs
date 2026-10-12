/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [
    react({
      // Source files use the .js extension for JSX
      include: /\.(js|jsx)$/,
      babel: { plugins: ["babel-plugin-styled-components"] },
    }),
  ],
  // Keep the CRA variable names so existing .env files and Vercel
  // environment variables work unchanged
  envPrefix: "REACT_APP_",
  resolve: {
    // Absolute imports from src, as configured in jsconfig.json
    alias: [
      {
        find: /^(components|config|hooks|layout|module|pages|styles|utils)\//,
        replacement: `${src}/$1/`,
      },
      { find: /^(store|App)$/, replacement: `${src}/$1` },
    ],
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: { loader: { ".js": "jsx" } },
  },
  server: { port: 3000 },
  // Same output folder as CRA, so the Vercel project settings still apply
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        // Vendor chunks change rarely, so browsers keep them cached
        // across deploys
        manualChunks(id) {
          if (/node_modules\/@?firebase\//.test(id)) return "firebase";
          if (
            /node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|@remix-run)\//.test(
              id
            )
          )
            return "react";
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    // CRA's Jest preset reset mocks between tests; tests rely on it
    mockReset: true,
  },
});
