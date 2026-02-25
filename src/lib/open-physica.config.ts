type LocalizedString = { [key: string]: string };

type LinkItem = {
  type?: "menu";
  text: LocalizedString;
  url?: string;
  active?: string;
  items?: Array<LinkItem>;
};

export type Config = {
  site: {
    title: string;
  };
  github: {
    owner: string;
    repo: string;
  };
  hero: {
    title: LocalizedString;
    description: LocalizedString;
    primaryCta: {
      text: LocalizedString;
      href: LocalizedString;
    };
    secondaryCta: {
      text: LocalizedString;
      href: LocalizedString;
    };
  };
  links: Array<LinkItem>;
};

const config: Config = {
  site: {
    title: "OpenPhysica",
  },
  github: {
    owner: "GiovanniSchiavo",
    repo: "open-physica",
  },
  hero: {
    title: {
      en: "OpenPhysica",
      it: "OpenPhysica",
    },
    description: {
      en: "Collaborative collection of lecture notes",
      it: "Raccolta di appunti collaborativa",
    },
    primaryCta: {
      text: {
        en: "Go to notes",
        it: "Vai agli appunti",
      },
      href: {
        en: "/docs",
        it: "/docs",
      },
    },
    secondaryCta: {
      text: {
        en: "Contributing",
        it: "Contribuire",
      },
      href: {
        en: "/docs/contributing",
        it: "/docs/contributing",
      },
    },
  },
  links: [
    {
      type: "menu",
      text: {
        en: "Courses",
        it: "Corsi",
      },
      items: [
        {
          text: {
            en: "Physics 2",
            it: "Fisica 2",
          },
          url: "/docs/physics-2",
          active: "nested-url",
        },
        {
          text: {
            en: "Mathematical Analysis 2",
            it: "Analisi Matematica 2",
          },
          url: "/docs/mathematical-analysis-2",
          active: "nested-url",
        },
      ],
    },
    {
      text: {
        en: "Flashcards",
        it: "Flashcards",
      },
      url: "/flashcards",
    },
    {
      text: {
        en: "Contributing",
        it: "Contribuisci",
      },
      url: "/docs/contributing",
      active: "nested-url",
    },
  ],
};
export default config;
