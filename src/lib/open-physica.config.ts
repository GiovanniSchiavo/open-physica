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
      en: "Collaborative collection of lecture notes - Physics UNIPD",
      it: "Raccolta di appunti collaborativa - Fisica UNIPD",
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
    },
  ],
};
export default config;
