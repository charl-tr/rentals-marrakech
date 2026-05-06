// Quartiers éditoriaux — uniquement utilisés par le script de seed.
// L'app lit depuis Supabase (table `neighborhoods`).

export interface NeighborhoodSeed {
  slug: string;
  name: string;
  city: "Marrakech" | "Essaouira";
  tagline: string;
  paragraphs: string[];
  highlights: { label: string; description: string }[];
  imageHero: string;
}

export const neighborhoodsSeed: Record<string, NeighborhoodSeed> = {
  palmeraie: {
    slug: "palmeraie",
    name: "Palmeraie",
    city: "Marrakech",
    tagline:
      "Cent mille palmiers, des villas à perte de vue, et le silence qu'on cherche tous.",
    paragraphs: [
      "Plantée au IXe siècle par les Almoravides pour irriguer la jeune cité, la Palmeraie est devenue, depuis les années 80, le quartier d'élection des amateurs de grandes propriétés. Sur près de 13 000 hectares à dix minutes du centre de Marrakech, elle abrite aujourd'hui hôtels-palaces (Selman, Royal Palm, Mansour Eddahbi), villas d'architecte et résidences confidentielles.",
      "L'esprit du lieu : des routes ocres bordées d'oliviers, des murs en pisé qui se confondent avec la terre, des piscines à débordement face aux sommets de l'Atlas. La Palmeraie n'est pas un quartier, c'est une géographie — vaste, paisible, et résolument tournée vers la maison. On y vient pour vivre dans un parc, pas pour habiter en ville.",
      "Notre département Palmeraie, conduit par Idriss El Amrani, suit en permanence une trentaine de propriétés — vendues sous mandat exclusif, restaurées par les meilleurs architectes du Maroc, et confiées à nos clients après visites privatives.",
    ],
    highlights: [
      { label: "Selman Marrakech", description: "Palace équestre Jacques Garcia" },
      { label: "Royal Palm", description: "Beachcomber, golf 18 trous Cabell Robinson" },
      { label: "Mansour Eddahbi", description: "Centre des conférences, expositions" },
      { label: "Jardin Majorelle", description: "12 minutes en voiture" },
      { label: "Médina (Bab Doukkala)", description: "10 minutes" },
      { label: "Aéroport Marrakech-Menara", description: "20 minutes" },
    ],
    imageHero:
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=2400&q=85",
  },
  medina: {
    slug: "medina",
    name: "Médina",
    city: "Marrakech",
    tagline:
      "Mille riads, un patio par maison, et les plus belles restaurations du Maroc.",
    paragraphs: [
      "Inscrite au patrimoine mondial de l'UNESCO en 1985, la médina de Marrakech reste l'un des plus grands ensembles urbains musulmans encore habité. Six cents hectares ceinturés de remparts du XIIe siècle, mille riads recensés, et une économie touristique-résidentielle qui a redonné vie à des centaines de maisons à patio.",
      "L'esprit du lieu : on entre par une ruelle sans signe, on pousse une porte de cèdre cloutée, et on se retrouve dans un patio aux orangers, sous un ciel découpé. Le riad est l'antithèse de la villa : centripète, intime, organisé autour de l'eau et du silence. C'est un mode de vie autant qu'une typologie d'architecture.",
      "Notre département Médina, conduit par Camille Decourt, suit les restaurations conduites par les maâlems de Marrakech — zellige, tadelakt poli à la pierre d'agate, plâtre sculpté, cèdre du Moyen-Atlas. Riads rénovés clés en main et riads à restaurer pour amateurs de chantiers.",
    ],
    highlights: [
      { label: "Place Jemaa el-Fna", description: "Cœur historique, classée UNESCO" },
      { label: "Souks", description: "Semmarine, teinturiers, ferronniers" },
      { label: "Medersa Ben Youssef", description: "École coranique restaurée" },
      { label: "Musée Yves Saint Laurent", description: "Près du Jardin Majorelle" },
      { label: "Palais Bahia", description: "Joyau de l'art andalou" },
      { label: "Mamounia", description: "Palace mythique, 1923" },
    ],
    imageHero:
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=2400&q=85",
  },
  hivernage: {
    slug: "hivernage",
    name: "Hivernage",
    city: "Marrakech",
    tagline:
      "Le quartier des palaces, à pied du Mamounia, à dix minutes de la médina.",
    paragraphs: [
      "Conçu dans les années 1920 sous le Protectorat français comme quartier d'hiver pour expatriés européens, l'Hivernage a conservé son identité résidentielle haut de gamme. Avenues larges, immeubles bas, palaces (Royal Mansour, Mamounia, Sofitel), restaurants étoilés (Le Comptoir Darna, Azar), et théâtre royal.",
      "L'esprit du lieu : la commodité urbaine sans renoncer au calme. On y achète des appartements de standing dans des résidences sécurisées, ou des villas plus petites mais centrales. Public ciblé : pieds-à-terre marocains de week-end, familles d'expatriés, investisseurs locatifs.",
      "Notre département Hivernage, conduit par Léna Vasconcelos, couvre à la fois les appartements neufs en résidence sécurisée et l'investissement locatif (rendements net 4 à 5 %).",
    ],
    highlights: [
      { label: "Royal Mansour", description: "Palace de la couronne, 53 riads privés" },
      { label: "La Mamounia", description: "1923, 8 hectares de jardins" },
      { label: "Théâtre Royal", description: "Architecture Tuomanen" },
      { label: "Place du 16 Novembre", description: "Restaurants, cafés" },
      { label: "Médina (Bab Jdid)", description: "12 minutes à pied" },
      { label: "Aéroport", description: "10 minutes en voiture" },
    ],
    imageHero:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=2400&q=85",
  },
  targa: {
    slug: "targa",
    name: "Targa",
    city: "Marrakech",
    tagline:
      "Le quartier-jardin des familles d'expatriés, deux pas de l'école française.",
    paragraphs: [
      "Targa s'est développé dans les années 90 comme quartier résidentiel familial à l'ouest du Guéliz. Vastes terrains, villas-jardins, écoles internationales (Renoir, Lycée Victor Hugo), commerces de proximité — l'antithèse de la médina, en somme : grande respiration, voiture nécessaire mais distances brèves.",
      "L'architecture y est éclectique : villas traditionnelles à zellige et tadelakt à côté de constructions contemporaines, lignes plus épurées. Les terrains de 600 à 1 200 m² sont la norme, avec piscine et jardin paysagé.",
      "C'est notre quartier de prédilection pour les familles francophones qui posent leurs valises trois ou cinq ans. Loyers et prix d'achat plus accessibles qu'à l'Hivernage ou Palmeraie, sans renoncer au standing.",
    ],
    highlights: [
      { label: "École Française Renoir", description: "Maternelle au CM2" },
      { label: "Lycée Victor Hugo", description: "Collège et lycée français" },
      { label: "Carré Eden Mall", description: "Restaurants, cinéma" },
      { label: "Royal Tennis Club", description: "Clubs et écoles de tennis" },
      { label: "Centre Marrakech (Guéliz)", description: "8 minutes en voiture" },
      { label: "Médina (Bab Doukkala)", description: "15 minutes" },
    ],
    imageHero:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2400&q=85",
  },
  amelkis: {
    slug: "amelkis",
    name: "Amelkis",
    city: "Marrakech",
    tagline:
      "Domaine golfique premium, sécurité 24/7, Atlas en horizon permanent.",
    paragraphs: [
      "Domaine résidentiel sécurisé construit autour du golf 18 trous d'Amelkis (Cabell Robinson, 1995), Amelkis a redéfini ce que signifiait habiter à Marrakech : portes contrôlées, conciergerie, écoles voisines, club-house, et la possibilité de vivre dans un domaine fermé tout en jouissant d'un panorama exceptionnel sur l'Atlas.",
      "Trois générations de programmes y cohabitent : les premières villas (années 90, architecture marocaine traditionnelle), la phase 2 (2010, plus contemporaine) et les programmes neufs des années 2020 (épuré, domotique, basse consommation). Notre département Amelkis suit en permanence les biens à vendre intra-muros.",
      "Conduit par Idriss El Amrani, ce département traite essentiellement villas individuelles et programmes neufs, avec une expertise particulière sur les questions de copropriété et d'accès green-fee.",
    ],
    highlights: [
      { label: "Golf d'Amelkis", description: "18 trous, par 72, signé Cabell Robinson" },
      { label: "Royal Golf Marrakech", description: "9 trous historiques (1923)" },
      { label: "Club-house Amelkis", description: "Restaurant, piscine, fitness" },
      { label: "Centre Marrakech", description: "12-14 minutes" },
      { label: "Aéroport Menara", description: "15 minutes" },
      { label: "Vue Atlas", description: "Visible 6 mois par an" },
    ],
    imageHero:
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=2400&q=85",
  },
  diabat: {
    slug: "diabat",
    name: "Diabat",
    city: "Essaouira",
    tagline:
      "Une plage infinie, le vent des alizés, l'île de Mogador en toile de fond.",
    paragraphs: [
      "Petit village côtier à 6 km au sud d'Essaouira, Diabat est devenu en vingt ans la destination résidentielle haut de gamme du sud marocain. Plage de cinq kilomètres ouverte sur l'océan, alizés permanents (paradis du surf, kitesurf, yoga), et vue panoramique sur l'île de Mogador et les remparts d'Essaouira.",
      "On y construit des villas contemporaines à la lecture du paysage : façades en pierre d'Essaouira, bois flotté blanchi, toitures-terrasses face au couchant. Les terrains de 1 000 à 3 000 m² sont encore disponibles, sous titres fonciers garantis.",
      "Notre département Essaouira, conduit par Hamza Bennouna, traite Diabat et l'ensemble du bord de mer : Sidi Kaouki, Ghazoua, Moulay Bouzerktoun. Volume modeste (5 à 10 transactions/an) mais ticket moyen élevé.",
    ],
    highlights: [
      { label: "Plage de Diabat", description: "5 km de sable, surf, kitesurf" },
      { label: "Île de Mogador", description: "Patrimoine UNESCO, vue panoramique" },
      { label: "Médina d'Essaouira", description: "10 minutes en voiture" },
      { label: "Sofitel Mogador", description: "Voisin direct" },
      { label: "Golf de Mogador", description: "Gary Player Signature, 18 trous" },
      { label: "Aéroport Essaouira-Mogador", description: "15 minutes" },
    ],
    imageHero:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=2400&q=85",
  },
};
