import { mkdir, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

const WRITE_DIR = join(process.cwd(), "content", "write");
const WRITE_DISABLED_MESSAGE = "Write API is disabled in production.";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isWriteEnabled() {
  return process.env.NODE_ENV !== "production";
}

async function getPageIds(): Promise<number[]> {
  const files = await readdir(WRITE_DIR).catch(() => []);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => parseInt(f.replace(".mdx", ""), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);
}

export async function GET() {
  if (!isWriteEnabled()) {
    return new NextResponse(WRITE_DISABLED_MESSAGE, { status: 403 });
  }

  const pages = await getPageIds();
  return NextResponse.json(pages);
}

export async function POST() {
  if (!isWriteEnabled()) {
    return new NextResponse(WRITE_DISABLED_MESSAGE, { status: 403 });
  }

  await mkdir(WRITE_DIR, { recursive: true }).catch(() => {});
  const pages = await getPageIds();
  const nextId = pages.length > 0 ? Math.max(...pages) + 1 : 1;
  await writeFile(
    join(WRITE_DIR, `${nextId}.mdx`),
    `---\ntitle: Pagina ${nextId}\n---\n\n# Pagina ${nextId}\n\nInserisci il tuo contenuto qui.\n`,
  );
  return NextResponse.json(nextId);
}
