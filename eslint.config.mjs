//  @ts-check
import json from "@eslint/json";
import { tanstackConfig } from "@tanstack/eslint-config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import * as mdx from "eslint-plugin-mdx";
import { defineConfig, globalIgnores } from "eslint/config";

const mdxFlatLanguageOptions =
  /** @type {import("eslint").Linter.LanguageOptions} */ (
    mdx.flat.languageOptions ?? {}
  );
const mdxFlatParserOptions =
  /** @type {import("eslint").Linter.ParserOptions} */ (
    mdxFlatLanguageOptions.parserOptions ?? {}
  );

export default defineConfig([
  globalIgnores([
    ".source/**",
    ".tanstack/**",
    ".output/**",
    ".nitro/**",
    ".vinxi/**",
    ".wrangler/**",
    "dist/**",
    "dist-ssr/**",
    "node_modules/**",
    ".vscode/**",
  ]),

  ...tanstackConfig,

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
    languageOptions: {
      ...mdxFlatLanguageOptions,
      parserOptions: {
        ...mdxFlatParserOptions,
        ignoreRemarkConfig: false,
      },
    },
    processor: mdx.createRemarkProcessor({
      lintCodeBlocks: false,
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
