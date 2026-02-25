import { createMdxPlugin } from "fumadocs-mdx/bun";

declare const Bun: {
  plugin: (plugin: unknown) => void;
  sleep: (ms: number) => Promise<void>;
};

Bun.plugin(createMdxPlugin());

/**
 * Bun starts resolving entrypoint imports immediately.
 * Probe one MDX module until the plugin is ready so `?only=frontmatter`
 * imports used by `.source` are available from the first app import.
 */
let ready = false;
for (let attempt = 0; attempt < 50; attempt += 1) {
  try {
    const mod = await import(
      `../content/docs/index.it.mdx?only=frontmatter&__bun_probe=${attempt}`
    );
    if ("frontmatter" in mod) {
      ready = true;
      break;
    }
  } catch {
    // Keep probing until setup completes.
  }

  await Bun.sleep(10);
}

if (!ready) {
  throw new Error("fumadocs-mdx Bun preload did not initialize in time.");
}
