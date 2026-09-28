// Curated from the agency's public blog on 2026-09-28.
// Reading notes, not full translations or updated legal advice.
// Never publish old journal_articles demo rows without source verification.
export const verifiedJournal = [
  {
    "slug": "permis-dhabiter-et-certificat-de-conformite-au-maroc",
    "publishedAt": "2020-06-30",
    "sourceUrl": "https://www.marrakechrealty.com/permis-dhabiter-et-certificat-de-conformite-au-maroc/",
    "fr": {
      "title": "Permis d’habiter et conformité",
      "category": "Construction",
      "lead": "Le blog de l’agence présente les documents de fin de construction et les démarches abordées à l’époque pour un logement neuf ou un projet de construction."
    },
    "en": {
      "title": "Occupancy permits and compliance",
      "category": "Construction",
      "lead": "The agency’s article introduces completion documents and the procedures discussed at the time for a new home or construction project."
    }
  },
  {
    "slug": "les-frais-de-notaire-lors-dune-transaction-immobiliere-au-maroc",
    "publishedAt": "2020-06-23",
    "sourceUrl": "https://www.marrakechrealty.com/les-frais-de-notaire-lors-dune-transaction-immobiliere-au-maroc/",
    "fr": {
      "title": "Comprendre les frais de notaire",
      "category": "Budget d’achat",
      "lead": "Un éclairage sur le rôle du notaire et les différentes composantes des frais d’acquisition. Les montants et taux de cette archive sont à faire confirmer pour votre projet."
    },
    "en": {
      "title": "Understanding notary costs",
      "category": "Purchase costs",
      "lead": "An introduction to the notary’s role and the different components of purchase costs. Any amounts and rates in this archive need checking for your own project."
    }
  },
  {
    "slug": "peut-on-acheter-une-villa-au-maroc-en-tant-quetranger-non-resident",
    "publishedAt": "2020-06-19",
    "sourceUrl": "https://www.marrakechrealty.com/peut-on-acheter-une-villa-au-maroc-en-tant-quetranger-non-resident/",
    "fr": {
      "title": "Préparer un achat en tant que non-résident",
      "category": "Acheter depuis l’étranger",
      "lead": "Cet article aborde la préparation d’un achat depuis l’étranger, les visites et les questions administratives et financières à examiner avant d’avancer."
    },
    "en": {
      "title": "Planning a purchase as a non-resident",
      "category": "Buying from abroad",
      "lead": "This article discusses preparing a purchase from abroad, arranging viewings and the administrative and financial questions to examine before proceeding."
    }
  },
  {
    "slug": "quelles-sont-les-conditions-suspensives-dun-compromis-de-vente-au-maroc",
    "publishedAt": "2020-06-10",
    "sourceUrl": "https://www.marrakechrealty.com/quelles-sont-les-conditions-suspensives-dun-compromis-de-vente-au-maroc/",
    "fr": {
      "title": "Le compromis et ses conditions suspensives",
      "category": "Étapes d’achat",
      "lead": "Un article consacré à une étape entre l’accord sur le bien et la vente définitive : le compromis et les conditions qui peuvent accompagner l’engagement des parties."
    },
    "en": {
      "title": "The preliminary agreement and its conditions",
      "category": "Buying process",
      "lead": "An article about a stage between agreeing on a property and completing the sale: the preliminary agreement and the conditions attached to the parties’ commitments."
    }
  },
  {
    "slug": "vna-une-condition-essentielle-pour-lachat-de-certains-terrains-au-maroc",
    "publishedAt": "2020-06-08",
    "sourceUrl": "https://www.marrakechrealty.com/vna-une-condition-essentielle-pour-lachat-de-certains-terrains-au-maroc/",
    "fr": {
      "title": "Terrain : comprendre la question de la VNA",
      "category": "Terrain",
      "lead": "L’agence aborde la vocation non agricole dans le contexte de certains achats de terrains par des étrangers. Un sujet à examiner avec les professionnels chargés du dossier."
    },
    "en": {
      "title": "Land purchases: understanding the VNA question",
      "category": "Land",
      "lead": "The agency discusses non-agricultural designation in the context of certain land purchases by foreign buyers. A topic to review with the professionals handling the transaction."
    }
  },
  {
    "slug": "quelle-est-la-fiscalite-immobiliere-au-maroc",
    "publishedAt": "2020-06-01",
    "sourceUrl": "https://www.marrakechrealty.com/quelle-est-la-fiscalite-immobiliere-au-maroc/",
    "fr": {
      "title": "Les questions fiscales d’un projet immobilier",
      "category": "Fiscalité",
      "lead": "Une archive consacrée à la fiscalité immobilière marocaine. À utiliser pour identifier les questions à poser, et non comme un barème fiscal actuel."
    },
    "en": {
      "title": "Tax questions when buying property",
      "category": "Tax",
      "lead": "An archive about Moroccan property taxation. Use it to identify questions to ask, not as a current schedule of tax rates."
    }
  }
] as const;

export function journalArticles(locale: "fr" | "en" = "fr") {
  return verifiedJournal.map(a => ({
    slug: a.slug, publishedAt: a.publishedAt, sourceUrl: a.sourceUrl,
    ...a[locale],
  }));
}
export function journalDate(date: string, locale: "fr" | "en") {
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(date));
}

