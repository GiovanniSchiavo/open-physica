"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AddPageButton({
  lang,
  label,
}: {
  lang: string;
  label: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreate = async () => {
    const res = await fetch("/api/write/pages", { method: "POST" });
    if (!res.ok) return;
    const newId = (await res.json()) as number;
    startTransition(() => {
      router.push(`/${lang}/write/${newId}`);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isPending}
      className="hover:bg-fd-accent w-full rounded-md border px-3 py-2 text-left text-sm font-medium disabled:opacity-50"
    >
      + {label}
    </button>
  );
}
