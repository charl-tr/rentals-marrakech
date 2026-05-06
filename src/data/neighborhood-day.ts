// ════════════════════════════════════════════════════════════════════
// "Un jour à…" — mini-guide expérientiel par quartier.
// Recommandations triées par moment (matin/midi/après-midi/soir) +
// quelques adresses signature. Hardcodé ici, migrable vers la table
// `neighborhoods` quand on voudra éditer depuis l'admin.
// ════════════════════════════════════════════════════════════════════

export interface DayInLifeSection {
  moment: string;
  title: string;
  description: string;
  place?: string;
}

export interface NeighborhoodDay {
  intro: string;
  schedule: DayInLifeSection[];
  localTips: { label: string; description: string }[];
}

export const DAY_IN_LIFE: Record<string, NeighborhoodDay> = {
  medina: {
    intro:
      "La Médina n'est pas un quartier, c'est un organisme. Elle s'ouvre à qui la suit à son rythme — pas de raccourcis possibles.",
    schedule: [
      {
        moment: "Matin",
        title: "Petit-déjeuner sur votre terrasse",
        description:
          "Vue sur les minarets, café arabe, pain chaud, œufs à la khlii. Les riads restaurés ont tous leur terrasse orientée — un luxe invisible depuis la rue.",
      },
      {
        moment: "Fin de matinée",
        title: "Souks à l'ouverture",
        description:
          "Les artisans ouvrent à 9h. Passez rue Sidi Bouloukat pour les dinandiers, Souk Cherratine pour la maroquinerie. Évitez le post-13h — les cars touristiques arrivent.",
        place: "Souks des dinandiers",
      },
      {
        moment: "Déjeuner",
        title: "Déjeuner chez Nomad",
        description:
          "Rooftop qui surplombe la place des Épices. Carte méditerranéenne-marocaine, ambiance design sans pose. La Cuisine du Maroc nouvelle génération.",
        place: "Rue Souk El-Jeld",
      },
      {
        moment: "Après-midi",
        title: "Musée privé ou hammam",
        description:
          "Musée Boucharouite (tapis d'art) ou Dar El Bacha pour la Confluence des cultures. Ensuite hammam traditionnel aux Bains de Marrakech — le vrai, pas la version touristique.",
      },
      {
        moment: "Apéritif",
        title: "Coucher de soleil à Jemaa el-Fna",
        description:
          "Sur la terrasse du Café de France ou du Kosybar. Pas pour Instagram — pour voir la place s'enflammer dans l'ocre du soir.",
      },
      {
        moment: "Dîner",
        title: "Dîner dans un riad privé",
        description:
          "Dar Yacout, Le Tobsil, ou El Fenn — expériences au calme. La médina la nuit est douce, presque silencieuse dès qu'on quitte la grande place.",
      },
    ],
    localTips: [
      {
        label: "Artisans de confiance",
        description:
          "Maalem Abdelaziz (zellige), Fatima Baskrani (tadelakt), Atelier Belarkam (menuiserie cèdre). Recommandés par nos conseillers pour les rénovations.",
      },
      {
        label: "Transport",
        description:
          "Pas d'accès voiture dans la plupart des derbs. Porteurs et charrettes au service des riads. Les plus centraux : accès piéton uniquement — à anticiper.",
      },
      {
        label: "Sécurité",
        description:
          "La médina est sûre, surtout dans les quartiers résidentiels (Dar El Bacha, Mouassine). Les riads ont toujours un gardien ou un système de digicode côté derb.",
      },
    ],
  },

  palmeraie: {
    intro:
      "La Palmeraie se vit derrière des murs hauts — c'est un archipel de domaines privés entre palmiers et oliveraies. Vingt minutes du centre, un monde à part.",
    schedule: [
      {
        moment: "Matin",
        title: "Baignade dans la piscine de votre villa",
        description:
          "La plupart des villas ont piscine 10-15m, parfois chauffée. Nage avant 9h : air encore frais, lumière rasante, silence absolu.",
      },
      {
        moment: "Brunch",
        title: "Brunch au Beldi Country Club",
        description:
          "Institution discrète à 10 min de la Palmeraie. Rose garden, cuisine franco-marocaine, atmosphère Belle-Époque.",
        place: "Route de la Palmeraie",
      },
      {
        moment: "Après-midi",
        title: "Spa au Selman ou Royal Mansour",
        description:
          "Les deux hôtels de référence pour le wellness à Marrakech. Hammam + massage, café sous les arbres, piscine si le vôtre ne suffit pas.",
      },
      {
        moment: "Fin d'après-midi",
        title: "Balade à cheval ou VTT",
        description:
          "Centre équestre de la Palmeraie ou sentiers VTT (balisés récemment). Petit loop de 1h au milieu des palmiers + oliviers — premier contact avec la campagne marocaine.",
      },
      {
        moment: "Dîner",
        title: "Dîner chez Jnane Tamsna",
        description:
          "Maison d'hôtes gastronomique de Meryanne Loum-Martin. Table d'hôtes, cuisine bio du potager, conversations avec des voyageurs choisis.",
      },
    ],
    localTips: [
      {
        label: "Gardiennage et sécurité",
        description:
          "Service de gardiennage 24/7 standard en Palmeraie — inclus dans la plupart des copropriétés. Accès par portail sécurisé + interphone.",
      },
      {
        label: "Services à domicile",
        description:
          "Personnel de maison (cuisine, ménage, jardinage) facilement disponible. Comptez 15-25 k DH/mois pour un équipage complet.",
      },
      {
        label: "École internationale",
        description:
          "Lycée Louis Massignon et Lycée Victor-Hugo accessibles en 15-20 min. Bus scolaire pour la plupart des villas.",
      },
    ],
  },

  hivernage: {
    intro:
      "L'Hivernage, c'est Marrakech à l'européenne — hôtels 5 étoiles, palais de Congrès, boulevards larges. On y habite comme on vivrait à Nice ou Monte-Carlo — avec le soleil du Maghreb en plus.",
    schedule: [
      {
        moment: "Matin",
        title: "Café sur votre balcon",
        description:
          "Les appartements de l'Hivernage donnent souvent sur des jardins résidentiels ou sur l'Atlas au loin. Service d'immeuble discret : journaux, pressing, conciergerie.",
      },
      {
        moment: "Mi-matinée",
        title: "Marché aux fleurs de la Koutoubia",
        description:
          "10 min à pied. Roses, mimosas, lys marocains — jamais vu, toujours renouvelé.",
      },
      {
        moment: "Déjeuner",
        title: "Déjeuner au Royal Mansour ou La Mamounia",
        description:
          "Les deux restaurants mythiques. Pour le beau monde au déjeuner — réservation nécessaire, dress code assumé.",
      },
      {
        moment: "Après-midi",
        title: "Shopping Avenue Mohammed VI",
        description:
          "Boutiques internationales (Lacoste, Stone Island) + créateurs marocains haut de gamme (Michele Baconnier, Norya Ayron). Plus propre, plus calme que Guéliz.",
      },
      {
        moment: "Soir",
        title: "Apéritif sur rooftop",
        description:
          "Sky Lounge du Delano, ou Sir Anthony à La Mamounia. Le Marrakech cosmopolite se donne rendez-vous là.",
      },
    ],
    localTips: [
      {
        label: "Copropriétés premium",
        description:
          "Les résidences Prestigia, Atlas Dream, Jnane Belle-Île : services hôteliers intégrés, piscine, salle de sport, gardien 24/7.",
      },
      {
        label: "Accès aéroport",
        description:
          "8 minutes en voiture de l'aéroport Ménara. Le plus pratique pour les allers-retours internationaux fréquents.",
      },
      {
        label: "Cible",
        description:
          "Retraités actifs, investisseurs locatifs, cadres en mission. Pas pour familles avec jeunes enfants (peu d'espaces ouverts).",
      },
    ],
  },

  gueliz: {
    intro:
      "Guéliz, c'est la ville nouvelle de 1913 — plan orthogonal, cafés d'angle, Art Déco discret. Les résidents marocains y ont leurs codes. Les expatriés s'y mélangent plus qu'ailleurs.",
    schedule: [
      {
        moment: "Matin",
        title: "Café au Grand Café de la Poste",
        description:
          "Institution 1925 face à la Poste. Croissants, journaux, ambiance brasserie parisienne de la Belle Époque — sans le cliché.",
      },
      {
        moment: "Mi-matinée",
        title: "Musée Yves Saint Laurent",
        description:
          "Architecture de Studio KO, collection haute couture, expos temporaires. Tea room sur place.",
      },
      {
        moment: "Déjeuner",
        title: "Déjeuner léger à L'Annexe",
        description:
          "Carte du jour, produits du marché, salle intime. Habitués locaux, cuisiniers de retour d'un étoilé parisien.",
      },
      {
        moment: "Après-midi",
        title: "Librairie + galeries",
        description:
          "Librairie Chatr (3 étages, français + arabe), Galerie 127 (photographie contemporaine), Galerie Tindouf (tapis d'art).",
      },
      {
        moment: "Soir",
        title: "Dîner chez Azar ou Piccolina",
        description:
          "Azar : moderne marocain, ambiance feutrée. Piccolina : italien authentique, nappes blanches, serveurs qui connaissent leur carte.",
      },
    ],
    localTips: [
      {
        label: "Vie quotidienne",
        description:
          "Tout à pied : commerces, pharmacies, banques, spas. C'est le quartier le plus pratique pour vivre à l'année sans dépendre d'un chauffeur.",
      },
      {
        label: "École et santé",
        description:
          "Lycée français Victor-Hugo à 10 min. Clinique internationale polyclinique du Sud à 5 min. Excellent niveau médical privé.",
      },
      {
        label: "Parking",
        description:
          "Souvent inclus dans l'appartement. Les anciens immeubles ont parfois leur garage souterrain — rare ailleurs.",
      },
    ],
  },

  targa: {
    intro:
      "Targa, c'est la Marrakech résidentielle ouverte — villas-jardins, écoles internationales, familles. Plus récent que la Palmeraie, plus connecté au centre.",
    schedule: [
      {
        moment: "Matin",
        title: "Jogging au Parc de l'Oasis",
        description:
          "Grand parc urbain, sentiers balisés, équipements sport. Très prisé des expats.",
      },
      {
        moment: "Brunch",
        title: "Café-brunch à The Nest",
        description:
          "Coffee shop d'inspiration australienne, wifi, avocado toast, barista qui pèse ses grains. Fréquenté par les entrepreneurs et freelances.",
      },
      {
        moment: "Après-midi",
        title: "Fitness club + piscine",
        description:
          "Targa Golf Resort ou Fitness Zone — clubs privés avec piscine, tennis, golf short. Abonnement mensuel 800-1500 DH.",
      },
      {
        moment: "Soir",
        title: "Dîner en famille à la maison",
        description:
          "La plupart des villas ont leur espace barbecue, cuisine d'été. Targa, c'est le rythme famille, pas le rythme soirée.",
      },
    ],
    localTips: [
      {
        label: "Cible familles",
        description:
          "Lycée français Victor-Hugo + British International School accessibles. Meilleur quartier pour enfants en âge scolaire.",
      },
      {
        label: "Budget entretien",
        description:
          "Villa 400m² + jardin 1000m² : ~10-15 k DH/mois toutes charges (jardinier, ménage, piscine, sécurité).",
      },
      {
        label: "Convivialité",
        description:
          "Communauté expat francophone active, événements entre voisins, WhatsApp groupes d'entraide — moins isolé qu'en Palmeraie.",
      },
    ],
  },

  "essaouira-medina": {
    intro:
      "Essaouira la blanche, la bleue, la venteuse. À trois heures de Marrakech, on change de monde — l'Atlantique remplace l'Atlas, le calme remplace l'agitation.",
    schedule: [
      {
        moment: "Matin",
        title: "Café au Taros, place Moulay Hassan",
        description:
          "Vue sur le port de pêche, le vent des Alizés, les mouettes. Café arabe + msemen au miel. L'Essaouira authentique avant les cars.",
      },
      {
        moment: "Fin de matinée",
        title: "Atelier de sculpture sur thuya",
        description:
          "Médina artisanale — Essaouira est la capitale de la marqueterie en thuya. Visite d'atelier au Sqalat-Sbaâ, commandes possibles.",
      },
      {
        moment: "Déjeuner",
        title: "Poisson grillé au port",
        description:
          "Stands de pêche au port — on choisit son poisson, on le fait griller, on le mange à 50 m de l'Atlantique. Simple, parfait.",
      },
      {
        moment: "Après-midi",
        title: "Plage de Diabat ou Sidi Kaouki",
        description:
          "15-30 min en voiture. Surf, kitesurf, ou marche dans le sable fin. Diabat a inspiré Jimmy Hendrix — le château de Sable y est.",
      },
      {
        moment: "Apéritif",
        title: "Coucher de soleil sur les remparts",
        description:
          "Les remparts UNESCO donnent sur l'océan plein ouest. 20 min avant le soleil, tout s'illumine en rose-ocre. Moment suspendu.",
      },
    ],
    localTips: [
      {
        label: "Climat",
        description:
          "Alizés 70% de l'année — 18-24°C l'été, idéal fuite de la chaleur Marrakech. Pluies rares mais soudaines décembre-février.",
      },
      {
        label: "Vie quotidienne",
        description:
          "Tout à pied dans la médina (3 km²). Voiture utile pour les plages et Ghazoua. Supermarché Marjane 10 min voiture.",
      },
      {
        label: "Communauté",
        description:
          "Mélange unique : pêcheurs locaux, artistes-musiciens, famille d'expats européens. Pas de ségrégation — très rare au Maroc urbain.",
      },
    ],
  },
};

export function getDayInLife(slug: string): NeighborhoodDay | null {
  return DAY_IN_LIFE[slug] ?? null;
}
