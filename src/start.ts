import { redirect } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";

const { rewrite: rewriteMdxPath } = rewritePath(
  "/:lang/docs{/*path}.mdx",
  "/:lang/llms.mdx/docs{/*path}",
);
const { rewrite: rewriteAcceptPath } = rewritePath(
  "/:lang/docs{/*path}",
  "/:lang/llms.mdx/docs{/*path}",
);

const llmMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url);
  const mdxPath = rewriteMdxPath(url.pathname);

  if (mdxPath) {
    throw redirect(new URL(mdxPath, url));
  }

  if (isMarkdownPreferred(request)) {
    const acceptPath = rewriteAcceptPath(url.pathname);
    if (acceptPath) {
      throw redirect(new URL(acceptPath, url));
    }
  }

  const result = await next();
  const response = result.response;
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (import.meta.env.PROD) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return {
    ...result,
    response: new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }),
  };
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [llmMiddleware],
  };
});
