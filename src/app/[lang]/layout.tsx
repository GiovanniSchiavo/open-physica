import { Provider } from "@/components/provider";
import { i18n } from "@/lib/i18n";
import { isSupportedLocale } from "@/lib/locale";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../global.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  ),
};

export const dynamicParams = false;

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export default async function LangLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;

  if (!isSupportedLocale(lang)) notFound();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <Provider lang={lang}>{children}</Provider>
      </body>
    </html>
  );
}
