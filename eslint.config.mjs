import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".next-3001/**",
    ".sanity/**",
    "dist/**",
    "out/**",
    "build/**",
    "node_modules/**",
    ".opencode/**",
    "next-env.d.ts",
  ]),
]);
