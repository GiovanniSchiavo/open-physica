"use client";

import { useParams } from "next/navigation";
import { resolveLocale } from "@/lib/locale";

export function useLocale() {
  const params = useParams();
  const lang = typeof params?.lang === "string" ? params.lang : undefined;
  return resolveLocale(lang);
}
