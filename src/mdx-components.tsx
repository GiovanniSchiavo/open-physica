import * as FilesComponents from "fumadocs-ui/components/files";
import * as StepsComponents from "fumadocs-ui/components/steps";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
import * as AccordionComponents from "./components/accordion";
import { Callout, CalloutTitle } from "./components/mdx/callout";
import { ExerciseCards } from "./components/mdx/exercise-cards";
import { Formulae } from "./components/mdx/formulae";
import { ImageGrid } from "./components/mdx/image-grid";
import { ImageZoom } from "./components/mdx/image-zoom";
import { Mermaid } from "./components/mdx/mermaid";
import { Solution } from "./components/mdx/solution";
import { Statement, StatementTitle } from "./components/mdx/statement";
import { Video } from "./components/mdx/video";
import type { ImageZoomProps } from "./components/mdx/image-zoom";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(
  components?: MDXComponents,
  locale?: string,
): MDXComponents {
  return {
    ...defaultMdxComponents,
    Callout,
    CalloutTitle,

    Solution: (props) => <Solution {...props} locale={locale} />,
    ExerciseCards,
    Formulae: (props) => <Formulae {...props} locale={locale} />,

    Mermaid,
    ImageGrid,
    Statement: (props) => <Statement {...props} locale={locale} />,
    StatementTitle,
    Video,
    TypeTable,
    img: (props) => <ImageZoom {...(props as ImageZoomProps)} />,
    ...AccordionComponents,
    ...FilesComponents,
    ...StepsComponents,
    ...TabsComponents,
    ...components,
  };
}
