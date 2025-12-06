/**
 * Contenu de la landing page SecureID
 * Tous les textes centralisés pour faciliter i18n future
 */

export const LANDING_CONTENT = {
  hero: {
    title: {
      line1: "Parce qu'il est",
      line2: 'votre monde.',
    },
    subtitle:
      "Un lien invisible qui veille sur lui quand vos yeux ne le peuvent pas.",
    cta: 'Activer sa protection',
  },

  shield: {
    title: 'Le Bouclier Invisible',
    description: {
      line1:
        "Dans la cour de récréation, dans la foule, ou sur le chemin de l'école...",
      highlight: 'SecureID veille sur lui quand vos yeux ne le peuvent pas.',
    },
  },

  promises: {
    sectionTitle: 'Trois promesses pour votre tranquillité',
    cards: [
      {
        id: 'identity',
        title: "L'Identité",
        description: "S'il s'égare, il n'est plus un inconnu.",
        highlight: 'Il est votre fils.',
        imageAlt: 'Enfant joyeux - Identité protégée',
        color: 'orange' as const,
      },
      {
        id: 'medical',
        title: 'Le Médical',
        description: 'Ses allergies et besoins vitaux parlent pour lui.',
        highlight: 'Sa santé, toujours avec lui.',
        imageAlt: 'Trousse médicale - Santé protégée',
        color: 'rose' as const,
      },
      {
        id: 'link',
        title: 'Le Lien',
        description: 'Un lien invisible qui ne rompt jamais.',
        highlight: 'Le chemin le plus court vers votre voix.',
        imageAlt: 'Lien invisible - Communication',
        color: 'indigo' as const,
      },
    ],
  },

  testimonials: {
    sectionTitle: 'Ils nous font confiance',
    items: [
      {
        id: 'aminata',
        name: 'Aminata K.',
        city: 'Ouagadougou',
        quote:
          "Maintenant je pars travailler l'esprit tranquille. Je sais que si quelque chose arrive, les informations de mon fils sont là.",
        bgColor: 'amber' as const,
      },
      {
        id: 'ibrahim',
        name: 'Ibrahim S.',
        city: 'Bobo-Dioulasso',
        quote:
          "Le bracelet a sauvé du temps précieux. Les infirmiers ont pu voir ses allergies immédiatement et agir vite.",
        bgColor: 'orange' as const,
      },
    ],
  },

  cta: {
    title: "Parce qu'un parent ne devrait jamais avoir à chercher son enfant",
    subtitle:
      'Rejoignez les centaines de familles burkinabé qui ont choisi la tranquillité.',
    button: 'Activer sa protection maintenant',
  },

  footer: {
    tagline:
      "Protégez ce qui compte le plus. Un lien invisible qui veille sur vos enfants.",
    sections: {
      info: {
        title: 'Informations',
        links: [
          { label: 'Activer un bracelet', href: '/login' },
          { label: 'Se connecter', href: '/login' },
          { label: 'À propos', href: '#' },
        ],
      },
      contact: {
        title: 'Contact',
      },
    },
    copyright: 'SecureID. Protégez ce qui compte le plus.',
  },

  stickyBar: {
    cta: 'ACTIVER SA PROTECTION',
  },
} as const;
