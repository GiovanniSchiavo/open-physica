import {
  rehypeCode,
  remarkMdxFiles,
  remarkMdxMermaid,
} from "fumadocs-core/mdx-plugins";
import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import lastModified from "fumadocs-mdx/plugins/last-modified";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { z } from "zod";

const codeTheme =
  process.env.NODE_ENV === "development"
    ? "github-dark"
    : { light: "catppuccin-latte", dark: "catppuccin-mocha" };

// Extended frontmatter schema with badges and exercise metadata
const extendedFrontmatterSchema = frontmatterSchema.extend({
  // Badges applicable to all pages (shown in page header)
  badges: z.array(z.string()).optional(),
  // Sidebar-specific configuration
  sidebar: z
    .object({
      // Badges to show in sidebar (shorter versions, optional - falls back to badges)
      badges: z.array(z.string()).optional(),
    })
    .optional(),
  // Exercise-specific metadata
  exercise: z
    .object({
      difficulty: z.number().min(1).max(4).optional().default(1),
      exam: z.boolean().optional().default(false),
    })
    .optional(),
});

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: extendedFrontmatterSchema,
    // Include markdown sources; flashcard data files are handled below.
    files: ["**/*.md", "**/!(*flashcards.*).mdx"],
    async: true,
  },
});

export const flashcardData = defineCollections({
  type: "doc",
  dir: "content/docs",
  files: ["**/flashcards.*.mdx"],
  async: true,
  schema: z.object({
    flashcards: z.literal(true),
  }),
});

export default defineConfig({
  plugins: [lastModified()],

  mdxOptions: {
    remarkCodeTabOptions: {
      parseMdx: true,
    },
    // remarkMath MUST be first to process $$ before MDX parses {} as JSX
    remarkPlugins: (v) => [remarkMath, ...v, remarkMdxMermaid, remarkMdxFiles],
    rehypePlugins: (v) => [
      [rehypeKatex, { strict: false }],
      ...v,
      [
        rehypeCode,
        {
          inline: "tailing-curly-colon",
          theme: codeTheme,
        },
      ],
    ],
  },
});
