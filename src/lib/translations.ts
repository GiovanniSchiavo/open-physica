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
    formulae: "Formulae",
    formulaeTitle: "Useful formulae for this exercise:",
    formulaeButton: "Formulae",
    // Page actions
    copyMarkdown: "Copy Markdown",
    open: "Open",
    openIn: "Open in",
    flashcards: "Flashcards",
    flashcardsTopic: "Topic deck",
    flashcardsCourse: "Course deck",
    // Flashcards page
    flashcardsDescription:
      "Theoretical questions for oral-exam preparation, in study or interactive mode.",
    flashcardsScopeLabel: "Scope",
    flashcardsScopeTopic: "Topic",
    flashcardsScopeCourse: "Course",
    flashcardsCourseLabel: "Course",
    flashcardsTopicLabel: "Topic",
    flashcardsTopicAll: "Entire course",
    flashcardsTopicScopeHint:
      "Topic scope includes the selected topic and all its descendants.",
    flashcardsLoadDeck: "Load deck",
    flashcardsModeLabel: "Method",
    flashcardsModeStudy: "Study",
    flashcardsModeInteractive: "Interactive",
    flashcardsNoTopic: "No topic found",
    flashcardsNoCards: "No flashcards found for this selection yet.",
    flashcardsQuestion: "Question",
    flashcardsAnswer: "Answer",
    flashcardsFlip: "Flip card",
    flashcardsSkip: "Skip",
    flashcardsPass: "Discard",
    flashcardsConfirm: "Confirm",
    flashcardsRemaining: "Remaining",
    flashcardsConfirmed: "Discarded",
    flashcardsPassed: "Correct",
    flashcardsPassedTag: "Correct",
    flashcardsEnterGame: "Start test",
    flashcardsEnterGameDescription:
      "Start an isolated interactive session in a focused dialog.",
    flashcardsCloseGame: "Close game mode",
    flashcardsCompletedTitle: "Deck completed",
    flashcardsCompletedDescription:
      "All cards were confirmed and removed from the current session.",
    flashcardsRestart: "Restart deck",
    flashcardsViewReport: "See report",
    flashcardsResultsTitle: "Session results",
    flashcardsResultsPassed: "Correct",
    flashcardsResultsNotPassed: "Discarded",
    flashcardsPassedHighlightHint:
      "Cards you confirmed are highlighted in study mode.",
    flashcardsRetakeAll: "Retake all cards",
    flashcardsRetakePassedOnly: "Retake discarded cards",
    // Write
    writeNavLink: "Write a new page",
    writePagesTitle: "Pages in Progress",
    writeAddPage: "Add page",
    writeNoPages: "No pages found",
    writeCreateFirst: "Create your first page",
    writePage: "Page",
    writeSelectPage: "Select a page from the sidebar, or create a new one.",
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
    formulae: "Formule",
    formulaeTitle: "Formule utili per questo esercizio:",
    formulaeButton: "Formulario",
    // Page actions
    copyMarkdown: "Copia Markdown",
    open: "Apri",
    openIn: "Apri in",
    flashcards: "Flashcards",
    flashcardsTopic: "Mazzo argomento",
    flashcardsCourse: "Mazzo corso",
    // Flashcards page
    flashcardsDescription:
      "Domande teoriche per preparazione orale, in modalita studio o interattiva.",
    flashcardsScopeLabel: "Ambito",
    flashcardsScopeTopic: "Argomento",
    flashcardsScopeCourse: "Corso",
    flashcardsCourseLabel: "Corso",
    flashcardsTopicLabel: "Argomento",
    flashcardsTopicAll: "Intero corso",
    flashcardsTopicScopeHint:
      "L'ambito argomento include il topic selezionato e tutti i suoi discendenti.",
    flashcardsLoadDeck: "Carica mazzo",
    flashcardsModeLabel: "Metodo",
    flashcardsModeStudy: "Studio",
    flashcardsModeInteractive: "Interattivo",
    flashcardsNoTopic: "Nessun argomento trovato",
    flashcardsNoCards: "Nessuna flashcard disponibile per questa selezione.",
    flashcardsQuestion: "Domanda",
    flashcardsAnswer: "Risposta",
    flashcardsFlip: "Gira card",
    flashcardsSkip: "Salta",
    flashcardsPass: "Scarta",
    flashcardsConfirm: "Conferma",
    flashcardsRemaining: "Rimanenti",
    flashcardsConfirmed: "Scartate",
    flashcardsPassed: "Superate",
    flashcardsPassedTag: "Superata",
    flashcardsEnterGame: "Inizia test",
    flashcardsEnterGameDescription:
      "Avvia una sessione interattiva isolata in una finestra dedicata.",
    flashcardsCloseGame: "Chiudi modalita gioco",
    flashcardsCompletedTitle: "Mazzo completato",
    flashcardsCompletedDescription:
      "Hai confermato tutte le carte e non ne restano nella sessione.",
    flashcardsRestart: "Ricomincia",
    flashcardsViewReport: "Vedi resoconto",
    flashcardsResultsTitle: "Risultati sessione",
    flashcardsResultsPassed: "Superate",
    flashcardsResultsNotPassed: "Scartate",
    flashcardsPassedHighlightHint:
      "Le card confermate sono evidenziate in modalita studio.",
    flashcardsRetakeAll: "Riprova tutte le card",
    flashcardsRetakePassedOnly: "Riprova solo le card scartate",
    // Write
    writeNavLink: "Scrivi una nuova pagina",
    writePagesTitle: "Pagine in Lavorazione",
    writeAddPage: "Aggiungi pagina",
    writeNoPages: "Nessuna pagina trovata",
    writeCreateFirst: "Crea la tua prima pagina",
    writePage: "Pagina",
    writeSelectPage:
      "Seleziona una pagina dalla barra laterale, o creane una nuova.",
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
    locale: lang,
  };
}
