// Articles éditoriaux — uniquement utilisés par le script de seed.
// L'app lit depuis Supabase (table `journal_articles`).

export interface JournalSeed {
  slug: string;
  title: string;
  lead: string;
  category: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  imageHero: string;
  paragraphs: string[];
}

export const articlesSeed: JournalSeed[] = [
  {
    slug: "restaurer-un-riad-medina",
    title: "Restaurer un riad de la médina, sans le dénaturer.",
    lead:
      "Six mois à observer un chantier mené par le maâlem Hassan Benchikhi à Derb Chtouka. Ce qu'on apprend des bons gestes de la restauration marrakchie.",
    category: "Restauration",
    author: "Camille Decourt",
    publishedAt: "2026-04-12",
    readingTime: 8,
    imageHero:
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=2400&q=85",
    paragraphs: [
      "On entre par une ruelle sans signe, on pousse une porte de cèdre cloutée, et le maâlem Hassan Benchikhi est là, accroupi, à mélanger sa première fournée de tadelakt du matin. Le riad qu'il restaure depuis six mois pour un acquéreur français — un riad du XVIIIe siècle, racheté à l'état de ruine partielle — est l'un des plus beaux chantiers que la médina de Marrakech ait connu cette année.",
      "« On ne restaure pas un riad, on le réveille », nous dit Hassan, qui a appris le métier de son père puis de son grand-père. « Tout ce qui n'est pas d'origine doit disparaître ou se faire oublier. Ce qui est d'origine — même cassé, même fragile — doit être consolidé, jamais remplacé. » C'est un principe qu'on retrouve dans toute l'école rbati de la restauration patrimoniale, et que les meilleures agences de Marrakech défendent face aux dérives — fausses moucharabiehs en plâtre coulé, zelliges chinois importés, tadelakt synthétique vendu en sac.",
      "Le chantier de Hassan suit une discipline simple : zellige peint à la main par les ateliers de Fès (compter quatre semaines pour une fontaine de patio), tadelakt poli à la pierre d'agate (six couches successives, chacune pénétrée à la pâte d'olivier), plâtre sculpté par un seul artisan (Mohammed, son neveu, formé à Salé), et boiseries en cèdre du Moyen-Atlas, séché trois ans avant taille.",
      "Les six premières chambres seront livrées en juin. Le hammam et la piscine de patio en septembre. L'acquéreur — un dermatologue bordelais qui a découvert Marrakech en 2019 — viendra s'installer pour Noël. Il a budgété 380 000 € pour la restauration, sur un riad acheté 220 000 €. Pour ce qu'il en sortira — un riad de six suites, restauré dans les règles, vue Koutoubia depuis la terrasse — c'est, comme on dit dans le métier, « un investissement amoureux qui se trouve être aussi un bon investissement tout court ».",
    ],
  },
  {
    slug: "marche-palmeraie-2026",
    title: "Le marché de la Palmeraie en 2026 : le retour des grandes propriétés.",
    lead:
      "Après deux années calmes (2023-2024), la Palmeraie a vu ses transactions repartir au S2 2025. Notre lecture du marché, prix au m², et perspectives.",
    category: "Marché",
    author: "Idriss El Amrani",
    publishedAt: "2026-03-28",
    readingTime: 6,
    imageHero:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=2400&q=85",
    paragraphs: [
      "La Palmeraie a longtemps été le baromètre du marché immobilier de Marrakech. Une trentaine de transactions par an, des biens à plus d'un million d'euros, et une clientèle internationale (FR 45 %, GB 18 %, US 12 %, Maghreb 15 %, autres 10 %) très réactive aux signaux macro-économiques. En 2023 et 2024, la conjonction d'une remontée des taux, d'un recul du tourisme et de quelques arbitrages politiques avait gelé le marché.",
      "Le S2 2025 a marqué le retour. Notre agence a clôturé sept transactions sur le secteur entre juillet et décembre, contre trois sur l'ensemble de l'année 2024. Le ticket moyen s'est même renforcé : 1 750 000 € en 2025 contre 1 280 000 € en 2024 — signe que les acheteurs présents en 2025 cherchent les belles propriétés, pas les opportunités de prix.",
      "Le prix au m² habitable se situe désormais entre 4 200 € et 5 800 € pour les villas d'architecte récentes (post-2015), avec des pointes au-delà de 7 000 € pour les biens d'exception (parc planté important, vue Atlas, signature architecturale). Les villas plus anciennes (années 90 et début 2000), souvent sur de plus grands terrains, se traitent entre 2 800 € et 3 800 €/m² — souvent avec un projet de rénovation à intégrer.",
      "Notre prévision pour 2026 : un marché soutenu sur les villas premium (>1,5 M€), une décompression possible sur les biens entre 600 et 900 k€ qui peinent à trouver acquéreur, et une recherche structurelle du « bien rare » : grandes parcelles, oliviers centenaires, vue dégagée. Les programmes neufs en bordure des golfs (Amelkis, Prestigia) restent une alternative crédible pour qui ne veut pas attendre la perle.",
    ],
  },
  {
    slug: "acheter-essaouira-5-questions",
    title: "Acheter à Essaouira en cinq questions.",
    lead:
      "Bord de mer, fiscalité, types de biens, calendrier de chantier, location saisonnière. Le guide d'Hamza Bennouna pour les acquéreurs primo-Essaouira.",
    category: "Quartier",
    author: "Hamza Bennouna",
    publishedAt: "2026-03-15",
    readingTime: 7,
    imageHero:
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=2400&q=85",
    paragraphs: [
      "Essaouira n'est pas Marrakech avec une plage en plus. C'est un autre Maroc — plus petit, plus calme, avec ses propres règles. Voici les cinq questions que tout primo-acquéreur me pose, et les réponses que je donne.",
      "**1. Faut-il acheter en médina ou hors les murs ?** Les deux marchés sont distincts. La médina UNESCO a ses riads (200 à 800 k€ selon état et taille), traités exclusivement à pied — toute restauration nécessite l'accord de la commission patrimoniale. Hors les murs, on parle villas contemporaines à Diabat, Ghazoua ou Sidi Kaouki (500 k€ à 2 M€), accessibles en voiture, terrains plus généreux.",
      "**2. La fiscalité change-t-elle vs Marrakech ?** Non, le régime national s'applique : 4 % de droits d'enregistrement, 1 % de notaire, 3 % HT d'agence (TVA 20 %). En revanche, les loyers saisonniers d'Essaouira restent taxés moins lourdement qu'à Marrakech grâce à la classification de la commune (zone B vs zone A) — on en gagne environ 0,8 point net.",
      "**3. Combien de temps prend une restauration de riad à Essaouira ?** Plus longtemps qu'à Marrakech, tout simplement parce qu'il y a moins de maâlems disponibles. Compter 9 à 14 mois pour un riad moyen (200-300 m²), contre 6 à 9 mois équivalent à Marrakech. Les meilleurs artisans ont une liste d'attente de 12 à 18 mois.",
      "**4. Le marché de la location saisonnière tient-il ?** Oui, et il s'est même structuré. Diabat et Sidi Kaouki captent les surfeurs et kitesurfeurs européens (mai-octobre, taux d'occupation 65-75 %). La médina capte une clientèle culturelle plus diffuse mais sur l'année (taux d'occupation 50-60 %). Rendements net : 4-6 % selon le bien et la qualité de la conciergerie.",
      "**5. Faut-il y résider à l'année ?** C'est une question de tempérament. Essaouira est une petite ville (75 000 habitants), où on connaît son boulanger en trois semaines. L'hiver est doux mais venteux ; l'été est l'un des plus tempérés du Maroc (alizés permanents, 22-26 °C). Pas d'école française internationale (la plus proche est à Marrakech, 2h30) — pour les familles avec enfants à scolariser, c'est souvent le critère bloquant.",
    ],
  },
  {
    slug: "acheter-riad-questions-avant-tomber-amoureux",
    title: "Acheter un riad : les cinq questions à se poser avant de tomber amoureux.",
    lead:
      "Le syndrome du coup de cœur est le premier piège du marché du riad. Ce que nos conseillers disent à leurs clients dès le premier café.",
    category: "Acheter",
    author: "Camille Decourt",
    publishedAt: "2026-04-05",
    readingTime: 9,
    imageHero:
      "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=2400&q=85",
    paragraphs: [
      "Il y a une règle que je répète à tous mes clients, parfois dès le premier café à l'agence : ne tombez pas amoureux d'un riad au premier rendez-vous. Le coup de cœur à Marrakech est garanti — chaque patio, chaque zellige bien préservé, chaque orange qui pend au-dessus du bassin font leur œuvre. C'est précisément pour ça qu'il faut poser cinq questions avant de signer quoi que ce soit, y compris une promesse d'achat.",
      "**1. Quel est le statut juridique du bien ?** Marrakech connaît trois régimes fonciers : le Titre Foncier (TF), qui est l'équivalent marocain du cadastre français, moderne et sûr ; la Moulkia, qui est un titre coutumier, transmis par actes adoulaires (notaires musulmans) et toujours valable mais moins robuste ; et les biens habous, quasiment impossibles à acquérir en pleine propriété. Un bon riad sans TF peut se négocier. Un riad en habous, laissez tomber.",
      "**2. Qui a réellement restauré ?** La différence entre un riad restauré par un maâlem traditionnel et un riad « rénové vite fait pour la vente » se cache dans les détails. Regardez les zelliges (peints à la main ou imprimés ?), le tadelakt (pierre d'agate et olivier, ou enduit synthétique ?), les plafonds sculptés (bois de cèdre massif ou MDF recouvert ?). Votre conseiller devrait savoir reconnaître en trente secondes.",
      "**3. Quel est l'état technique invisible ?** L'étanchéité des terrasses, le réseau d'évacuation, la mise aux normes électriques (les anciens riads ont souvent 15-20 A pour toute la maison), la plomberie (les canalisations en cuivre tiennent 50 ans, les PER tiennent 25). Demandez un rapport technique avant signature — un architecte-conseil indépendant coûte 3 000-5 000 DH pour une visite complète. C'est l'assurance-vie de votre investissement.",
      "**4. Quelles sont les contraintes patrimoniales ?** La médina est classée UNESCO. Toute modification extérieure (même une couleur de porte) passe par la commission patrimoniale. Intérieur, vous êtes libre — mais certains éléments (zelliges d'époque, moucharabiehs) peuvent être classés individuellement. Votre notaire vérifie ça avant la signature.",
      "**5. Quel est le plan de sortie ?** Achetez-vous pour vivre, pour louer, pour revendre dans cinq ans ? Chacune de ces intentions implique un bien différent. Pour la location saisonnière, la proximité de la place des Épices compte plus qu'une grande surface. Pour vivre, c'est l'inverse. Pour la revente à cinq ans, misez sur l'emplacement premium (Dar El Bacha, Mouassine) et la signature d'un maâlem connu — ces deux critères portent la plus-value.",
      "On fait le point après ces cinq questions. Si le bien coche au moins quatre, on signe. Si deux ou moins, on passe. C'est presque toujours ce qui se passe : sur dix coups de cœur visités, deux deviennent des acquisitions. Et ce sont des acquisitions heureuses.",
    ],
  },
  {
    slug: "palmeraie-mondes-paralleles",
    title: "La Palmeraie et ses mondes parallèles.",
    lead:
      "Derrière les murs qui se ressemblent, trois Palmeraies coexistent : la mondaine, la résidentielle, la retirée. Comment savoir laquelle est pour vous.",
    category: "Quartier",
    author: "Idriss El Amrani",
    publishedAt: "2026-03-28",
    readingTime: 6,
    imageHero:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=2400&q=85",
    paragraphs: [
      "La Palmeraie est le seul quartier de Marrakech où, en trois minutes de voiture, vous changez trois fois d'univers. Les Européens qui arrivent avec l'idée d'une grande zone résidentielle homogène se trompent : il y a trois Palmeraies, et savoir laquelle on cherche est le premier travail d'un acheteur sérieux.",
      "**La Palmeraie mondaine**, d'abord. Elle se concentre autour de la route de Fès et du Circuit de la Palmeraie. Grand hôtels (Selman, Palmeraie Palace), golfs, dîners à thème, événements privés. Les villas y sont souvent récentes (moins de quinze ans), avec parties communes (piscine collective, tennis, spa). Compter 1,2 à 2,5 M€ pour une villa de cinq chambres. Profil type d'acquéreur : actif, fréquente les cercles internationaux, passe six à huit semaines par an à Marrakech. Pas pour ceux qui cherchent le calme absolu.",
      "**La Palmeraie résidentielle**, ensuite. Elle est au nord, au-delà de l'aéroport, vers la route de Casablanca et Marrakech-Oulja. Les villas sont plus anciennes (années 90-2000), souvent sur de plus grandes parcelles (2 000 à 5 000 m²), avec l'intimité que ça suppose — hauts murs, allées privées, gardiennage 24/7. Compter 800 k€ à 1,8 M€. Profil type : famille avec enfants, résidence de 4-6 mois par an, ou expat installé à Marrakech. C'est ici que la Palmeraie prend son sens : on ne fait rien, on vit simplement.",
      "**La Palmeraie retirée**, enfin. La plus difficile à trouver, parce que ses propriétaires ne mettent jamais leur bien sur les portails. Elle est dans les poches les plus discrètes (Dar Tounsi, Ain Itti, Barrage), sur de très grandes parcelles (5 000 à 15 000 m²), avec des maisons d'auteur — riads extérieurs contemporains, villas d'architecte, parfois d'anciens haouz transformés. Compter 2,5 à 8 M€. Ces biens passent par recommandation exclusive, jamais par annonce. Profil d'acquéreur : fortune établie, recherche de retraite ou résidence secondaire hyper-privée.",
      "Comment savoir laquelle est pour vous ? Trois questions : combien de temps passez-vous à Marrakech par an ? Recherchez-vous une communauté ou un isolement ? Et votre budget, tout compris (achat + travaux éventuels + ameublement), est-il inférieur à 1,5 M€, entre 1,5 et 3 M€, ou au-delà de 3 M€ ? Les trois Palmeraies se trient selon ces trois axes.",
      "Un dernier conseil : passez-y un week-end complet avant de vous décider — ou mieux, louez une villa une semaine, puis deux semaines à six mois d'intervalle. Dix jours en Palmeraie en février et dix jours en juillet, ce ne sont pas les mêmes quartiers. Ce qui ravit en hiver (la chaleur qui monte des pierres) peut lasser en été (les moustiques près des bassins). Connaître son futur quartier dans ses deux saisons évite 80 % des regrets.",
    ],
  },
  {
    slug: "fiscalite-non-resident-marrakech",
    title: "Fiscalité non-résident à Marrakech : ce que votre notaire ne vous dit pas toujours.",
    lead:
      "Entre droits d'enregistrement, IR sur la plus-value à la revente et rapatriement des fonds, le parcours fiscal du non-résident est codifié — mais mal vulgarisé.",
    category: "Juridique",
    author: "Antoine Gandin",
    publishedAt: "2026-03-20",
    readingTime: 10,
    imageHero:
      "https://images.unsplash.com/photo-1553603227-2358aabe821e?w=2400&q=85",
    paragraphs: [
      "Quand un client français, belge ou suisse me demande combien coûte « vraiment » un achat à Marrakech, la vraie réponse fait trois étages. Les droits à l'acquisition, d'abord. La fiscalité courante pendant la détention, ensuite. L'imposition à la revente, enfin — la plus méconnue, et celle qui surprend le plus.",
      "**L'acquisition.** Les droits d'enregistrement sont de 4 % pour un bien ancien, 5 % pour un bien neuf sous TVA. La taxe notariale ajoute 0,5 %. La conservation foncière prélève 1 % + 150 DH. Les honoraires de notaire suivent un barème légal — comptez 1 % du prix, dégressif au-delà de deux millions. Les frais divers (copies, timbres, récépissés) pèsent 2 500 à 4 000 DH. Total acquéreur : entre 6,5 % et 7,5 % du prix d'achat. Ces taux sont identiques pour un résident marocain et un non-résident. Pas de discrimination à l'acquisition.",
      "**Pendant la détention.** Un non-résident propriétaire d'un bien à Marrakech paie la taxe urbaine (entre 0,10 % et 0,30 % de la valeur locative annuelle selon la commune) et la taxe d'édilité (10 % de la taxe urbaine). Ces taxes sont perçues par la perception locale, les avis arrivent au courrier en mars-avril. Les loyers encaissés sont soumis à l'Impôt sur le Revenu locatif au taux de 10 % si vous passez par un intermédiaire (agence de gestion), 20 % si vous gérez vous-même. Un bon intermédiaire vous fait économiser les 10 points.",
      "**À la revente.** C'est là que les mauvaises surprises attendent. L'IR sur la plus-value immobilière est de 20 % du gain brut (prix de vente — prix d'achat — frais déductibles). Mais il existe un abattement : 10 % par an à partir de la cinquième année de détention, plafonné à 100 % après dix ans. Concrètement : vendre après trois ans, vous payez 20 % de plus-value. Vendre après sept ans, vous payez 20 % sur 70 % du gain. Vendre après dix ans, vous ne payez plus rien. Le Maroc récompense les détentions longues — c'est un choix fiscal politique, et il est généreux comparé à la France.",
      "**Le rapatriement.** Dernier étage, souvent oublié. Tout non-résident qui vend son bien au Maroc doit déclarer la transaction à l'Office des Changes pour pouvoir rapatrier les fonds. L'obtention de l'autorisation prend 4 à 8 semaines. Votre notaire ou votre conseiller doit gérer ce dossier — demandez-le explicitement au moment de la signature, ne le découvrez pas au moment de vendre.",
      "**Convention fiscale France-Maroc.** Les plus-values réalisées au Maroc sur des biens situés au Maroc sont imposables au Maroc uniquement (article 14 de la convention). Elles ne sont pas re-taxées en France, mais elles doivent être déclarées sur votre avis d'imposition français (formulaire 2047). Pour les loyers perçus au Maroc, même principe : imposés au Maroc, déclarés en France, non ré-imposés (mais ils modifient le taux effectif d'imposition des autres revenus — le fameux système du « taux effectif »).",
      "Ce que je dis toujours à mes clients : l'acquisition elle-même n'est pas l'endroit où on optimise. C'est la durée de détention qui fait toute la différence fiscale. Un bien bien acheté et gardé dix ans peut se revendre avec une plus-value brute de 50 % et ne donner lieu à aucune imposition. Les meilleures histoires immobilières à Marrakech sont toujours des histoires patientes.",
    ],
  },
];
