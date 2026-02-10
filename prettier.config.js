//  @ts-check

/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const prettierConfig = {
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
  proseWrap: "always",
  overrides: [
    {
      files: ["*.md", "*.mdx"],
      options: {
        proseWrap: "always",
        embeddedLanguageFormatting: "auto",
      },
    },
  ],
};

export default prettierConfig;
