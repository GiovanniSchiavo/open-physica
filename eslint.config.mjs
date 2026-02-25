import json from "@eslint/json";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import * as mdx from "eslint-plugin-mdx";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    ".source/**",
    ".claude/**",
    "node_modules/**",
    "next-env.d.ts",
    "_backup/**",
    ".github/**",
  ]),

  ...nextVitals,
  ...nextTs,

  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },
  {
    files: ["**/*.json5"],
    plugins: { json },
    language: "json/json5",
    extends: ["json/recommended"],
  },
  {
    ...mdx.flat,
    processor: mdx.createRemarkProcessor({
      ignoreRemarkConfig: false,
    }),
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
    },
  },
  {
    ...mdx.flatCodeBlocks,
    rules: {
      ...mdx.flatCodeBlocks.rules,
      "no-var": "error",
      "prefer-const": "error",
    },
  },

  // Remove conflicts with Prettier
  eslintConfigPrettier,
]);

export default eslintConfig;
