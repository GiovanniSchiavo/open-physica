import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  rewrites() {
    return [
      {
        source: "/:lang/docs/:path*.mdx",
        destination: "/:lang/llms.mdx/docs/:path*",
      },
    ];
  },
  onDemandEntries: {
    // Keep fewer route bundles in memory during development.
    maxInactiveAge: 15_000,
    pagesBufferLength: 2,
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withMDX(config);
