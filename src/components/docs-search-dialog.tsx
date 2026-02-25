"use client";

import { useDocsSearch } from "fumadocs-core/search/client";
import { useOnChange } from "fumadocs-core/utils/use-on-change";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from "fumadocs-ui/components/dialog/search";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import type {
  SearchLink,
  SharedProps,
  TagItem,
} from "fumadocs-ui/contexts/search";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

interface DocsSearchDialogProps extends SharedProps {
  links?: SearchLink[];
  type?: "fetch" | "static";
  defaultTag?: string;
  tags?: TagItem[];
  api?: string;
  delayMs?: number;
  allowClear?: boolean;
  footer?: ReactNode;
}

const ALL_TAG_VALUE = "__all__";

export function DocsSearchDialog({
  defaultTag,
  tags = [],
  api,
  delayMs,
  type = "fetch",
  allowClear = false,
  links = [],
  footer,
  ...props
}: DocsSearchDialogProps) {
  const { locale } = useI18n();
  const [tag, setTag] = useState<string | undefined>(() => {
    if (defaultTag) return defaultTag;
    if (allowClear) return undefined;
    return tags[0]?.value;
  });

  const { search, setSearch, query } = useDocsSearch(
    type === "fetch"
      ? {
          type: "fetch",
          api,
          locale,
          tag,
          delayMs,
        }
      : {
          type: "static",
          from: api,
          locale,
          tag,
          delayMs,
        },
  );

  const defaultItems = useMemo(() => {
    if (links.length === 0) return null;
    return links.map(([name, link]) => ({
      type: "page" as const,
      id: name,
      content: name,
      url: link,
    }));
  }, [links]);

  useOnChange(defaultTag, (value) => {
    if (value) {
      setTag(value);
      return;
    }

    if (allowClear) {
      setTag(undefined);
      return;
    }

    setTag(tags[0]?.value);
  });

  const hasTags = tags.length > 0;
  const allLabel = locale === "it" ? "Tutte le sezioni" : "All sections";
  const selectValue = tag ?? ALL_TAG_VALUE;

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          {hasTags && (
            <select
              value={selectValue}
              onChange={(event) => {
                const nextTag = event.currentTarget.value;
                setTag(nextTag === ALL_TAG_VALUE ? undefined : nextTag);
              }}
              className="border-fd-border bg-fd-secondary text-fd-muted-foreground h-8 max-w-44 shrink-0 rounded-md border px-2 text-xs focus-visible:outline-none"
              aria-label={
                locale === "it" ? "Filtra per sezione" : "Filter by section"
              }
            >
              {allowClear && <option value={ALL_TAG_VALUE}>{allLabel}</option>}
              {tags.map((currentTag) => (
                <option key={currentTag.value} value={currentTag.value}>
                  {currentTag.name}
                </option>
              ))}
            </select>
          )}
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          items={query.data !== "empty" ? query.data : defaultItems}
        />
      </SearchDialogContent>
      <SearchDialogFooter>{footer}</SearchDialogFooter>
    </SearchDialog>
  );
}
