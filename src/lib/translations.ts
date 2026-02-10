/**
 * Simple translations for components.
 */

type Locale = "en" | "it";

const translations = {
  en: {
    // Statement types
    definition: "Definition",
    notation: "Notation",
    axiom: "Axiom",
    postulate: "Postulate",
    theorem: "Theorem",
    lemma: "Lemma",
    proposition: "Proposition",
    corollary: "Corollary",
    law: "Law",
    principle: "Principle",
    ansatz: "Ansatz",
    conjecture: "Conjecture",
    // Exercise
    examBadge: "Exam",
    showSolution: "Show Solution",
    showFormulae: "Show Formulae",
    formulae: "Formulae",
    formulaeTitle: "Useful formulae for this exercise:",
    formulaeButton: "Formulae",
    formulaeHint: "Click to view formulae",
    // Page actions
    copyMarkdown: "Copy Markdown",
    open: "Open",
    openIn: "Open in",
  },
  it: {
    // Statement types
    definition: "Definizione",
    notation: "Notazione",
    axiom: "Assioma",
    postulate: "Postulato",
    theorem: "Teorema",
    lemma: "Lemma",
    proposition: "Proposizione",
    corollary: "Corollario",
    law: "Legge",
    principle: "Principio",
    ansatz: "Ansatz",
    conjecture: "Congettura",
    // Exercise
    examBadge: "Esame",
    showSolution: "Mostra Soluzione",
    showFormulae: "Mostra Formule",
    formulae: "Formule",
    formulaeTitle: "Formule utili per questo esercizio:",
    formulaeButton: "Formulario",
    formulaeHint: "Clicca per vedere le formule",
    // Page actions
    copyMarkdown: "Copia Markdown",
    open: "Apri",
    openIn: "Apri in",
  },
} as const;

export function getTranslations(locale: string) {
  const lang = (locale === "it" ? "it" : "en") as Locale;
  const t = translations[lang];

  return {
    t: (key: string) => {
      const keys = key.split(".");
      let value: unknown = t;
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key; // Fallback to key if not found
        }
      }
      return typeof value === "string" ? value : key;
    },
    raw: (key: string) => {
      const keys = key.split(".");
      let value: unknown = t;
      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return null;
        }
      }
      return value;
    },
    locale: lang,
  };
}
