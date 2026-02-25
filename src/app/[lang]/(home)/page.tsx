import { Hero } from "@/components/home/hero";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <main className="flex flex-col overflow-hidden">
      <Hero lang={lang} />
    </main>
  );
}
