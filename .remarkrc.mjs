import {
  remarkCodeTab,
  remarkGfm,
  remarkHeading,
  remarkImage,
  remarkMdxFiles,
  remarkMdxMermaid,
  remarkNpm,
  remarkSteps,
  remarkStructure,
} from "fumadocs-core/mdx-plugins";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import remarkPresetLintConsistent from "remark-preset-lint-consistent";
import remarkPresetLintMarkdownStyleGuide from "remark-preset-lint-markdown-style-guide";
import remarkPresetLintRecommended from "remark-preset-lint-recommended";
import remarkPresetPrettier from "remark-preset-prettier";

const remarkConfig = {
  plugins: [
    // MUST be first: process $$ before MDX parses braces as JSX
    remarkMath,
    // MDX support
    remarkMdx,
    // Lint presets
    remarkPresetLintRecommended,
    remarkPresetLintConsistent,
    remarkPresetLintMarkdownStyleGuide,
    // Fumadocs remark plugins
    remarkGfm,
    remarkImage,
    remarkStructure,
    remarkHeading,
    [remarkCodeTab, { parseMdx: true }],
    remarkSteps,
    remarkNpm,
    remarkMdxMermaid,
    remarkMdxFiles,
    // Disable rules that conflict with Prettier
    remarkPresetPrettier,
  ],
};

export default remarkConfig;
