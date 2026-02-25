/** @type {import("prettier").Config} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
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

export default config;
