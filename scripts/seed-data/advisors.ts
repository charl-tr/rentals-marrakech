// Conseillers — uniquement utilisés par le script de seed.
// L'app lit depuis Supabase (table `advisors`).

export interface AdvisorSeed {
  slug: string;
  name: string;
  role: string;
  photo: string;
  phone: string;
  whatsapp: string;
  email: string;
  speciality: string;
  languages: string[];
  yearsExperience: number;
  accessRole: "director" | "advisor";
}

export const advisorsSeed: AdvisorSeed[] = [
  {
    slug: "antoine-gandin",
    name: "Antoine Gandin",
    role: "Fondateur — Direction générale",
    photo: "",
    phone: "+212 524 43 12 00",
    whatsapp: "212524431200",
    email: "antoine@marrakechrealty-test.com", // À remplacer par l'email réel en prod
    speciality:
      "Direction générale, biens d'exception, transactions stratégiques. 25 ans de marché à Marrakech.",
    languages: ["FR", "EN", "AR"],
    yearsExperience: 25,
    accessRole: "director",
  },
  {
    slug: "camille-decourt",
    name: "Camille Decourt",
    role: "Conseillère senior — Médina & Riads",
    photo: "",
    phone: "+212 660 62 94 44",
    whatsapp: "212660629444",
    email: "camille@marrakechrealty-test.com",
    speciality: "Riads de la médina, restauration, maisons d'hôtes",
    languages: ["FR", "EN", "AR"],
    yearsExperience: 14,
    accessRole: "advisor",
  },
  {
    slug: "idriss-el-amrani",
    name: "Idriss El Amrani",
    role: "Conseiller senior — Palmeraie & Villas Marrakech",
    photo: "",
    phone: "+212 660 62 94 45",
    whatsapp: "212660629445",
    email: "idriss@marrakechrealty-test.com",
    speciality: "Villas Palmeraie, Targa, Amelkis, programmes golfiques",
    languages: ["FR", "EN", "AR"],
    yearsExperience: 18,
    accessRole: "advisor",
  },
  {
    slug: "lena-vasconcelos",
    name: "Léna Vasconcelos",
    role: "Conseillère senior — Hivernage & Programmes neufs",
    photo: "",
    phone: "+212 660 62 94 46",
    whatsapp: "212660629446",
    email: "lena@marrakechrealty-test.com",
    speciality: "Appartements de standing, programmes neufs, investissement locatif",
    languages: ["FR", "EN", "PT", "ES"],
    yearsExperience: 9,
    accessRole: "advisor",
  },
  {
    slug: "hamza-bennouna",
    name: "Hamza Bennouna",
    role: "Conseiller senior — Essaouira & Bord de mer",
    photo: "",
    phone: "+212 660 62 94 47",
    whatsapp: "212660629447",
    email: "hamza@marrakechrealty-test.com",
    speciality: "Riads et villas d'Essaouira, terrains, maisons d'hôtes",
    languages: ["FR", "EN", "AR"],
    yearsExperience: 12,
    accessRole: "advisor",
  },
];
