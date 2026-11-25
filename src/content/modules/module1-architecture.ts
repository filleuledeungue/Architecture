import { CourseModule } from '../../types/course';

/**
 * Module 1 : Architecture de base des systèmes à processeurs
 * Fidèle au support de cours PDF 1 (Pr Mamadou Lamine NDIAYE, ESP Dakar)
 */
export const MODULE_1: CourseModule = {
  id: 'module-1',
  number: 1,
  title: 'Architecture de base des systèmes à processeurs',
  shortTitle: 'Architecture de base',
  description:
    'Comprendre les modèles Von Neumann et Harvard, les 3 blocs fonctionnels, le rôle des 3 bus, l’espace adressable 2^n, le décodage d’adresse et la cartographie mémoire.',
  status: 'available',
  pdfSources: ['1-Architecture de base.pdf'],
  lessons: [
    {
      id: '1-1-von-neumann-harvard',
      moduleId: 'module-1',
      number: '1.1',
      title: 'Von Neumann vs Harvard',
      subtitle: 'Comment organiser le programme et les données autour du processeur ?',
      durationMin: 10,
      pdfReference: '1-Architecture de base.pdf · Diapos 2 à 6',
      whyItExists:
        'Un processeur a besoin de deux choses pour travailler : des instructions (ce qu’il doit faire) et des données (les nombres sur lesquels il travaille). Faut-il tout ranger dans une même grande salle, ou séparer les deux ?',
      levels: {
        kid: {
          title: 'Analogie du quotidien',
          analogyTag: 'La boutique du quartier vs la cuisine à 2 passe-plats',
          body:
            'Imagine une petite boutique à Dakar avec UNE seule porte : si un client entre pour demander un prix et qu’un livreur sort en même temps avec un carton, ils se bloquent dans l’encadrement ! C’est Von Neumann. Maintenant imagine une cuisine avec DEUX fenêtres : à gauche on lit la recette, à droite on prend les ingrédients en même temps. Personne ne se gêne : c’est Harvard !',
        },
        simple: {
          title: 'Version simple',
          body:
            'Dans l’architecture de Von Neumann, le programme et les données partagent la même mémoire et le même chemin (bus). C’est simple et économique, mais le processeur ne peut pas lire une instruction et une donnée au même instant : c’est le goulot d’étranglement. Dans l’architecture de Harvard, la mémoire programme et la mémoire de données sont séparées avec leurs propres bus : le processeur peut lire les deux simultanément.',
        },
        technical: {
          title: 'Version technique du cours',
          body:
            'L’architecture de Von Neumann relie l’Unité Centrale, une Mémoire Principale unique (contenant ROM + RAM) et les interfaces d’E/S via un bus partagé unique, créant un goulot d’étranglement mémoire. L’architecture de Harvard découple la Mémoire Programme et la Mémoire de Données avec des bus dédiés vers l’UAL et les E/S : on gagne en bande passante et en parallélisme (fetch + accès donnée), au prix d’une plus grande complexité matérielle. Elle est utilisée dans les DSP et les microcontrôleurs (ex. Microchip PIC, Atmel AVR).',
          specs: [
            'Von Neumann : 1 espace mémoire unifié (ROM + RAM) · 1 jeu de bus partagé',
            'Harvard : 2 espaces séparés (Programme vs Données) · 2 jeux de bus indépendants',
            'Exemples cours Harvard : DSP, microcontrôleurs PIC (Microchip) et AVR (Atmel)',
          ],
        },
        alternativeAnalogy: {
          title: 'Autre façon de voir les choses : Le bus Dakar Dem Dikk',
          body:
            'Von Neumann, c’est une route à une seule voie alternée : les voitures qui montent doivent attendre que celles qui descendent aient fini de passer. Harvard, c’est une autoroute à deux voies séparées : la voie « Instructions » roule en continu pendant que la voie « Données » roule aussi sans attendre.',
        },
      },
      howItWorks: {
        summary:
          'Observe ci-dessous la différence en temps réel : à gauche (Von Neumann), chaque accès donnée oblige l’instruction suivante à patienter ; à droite (Harvard), les deux flux avancent en parallèle.',
        steps: [
          {
            label: '1. Recherche d’instruction (Fetch)',
            detail:
              'Le processeur demande la prochaine instruction. En Von Neumann, il monopolise le bus unique.',
            highlightBus: 'address',
          },
          {
            label: '2. Collision / Attente (Goulot)',
            detail:
              'Si le processeur doit aussi lire ou écrire une donnée au même cycle, Von Neumann met la requête en file d’attente.',
            highlightBus: 'data',
          },
          {
            label: '3. Parallélisme Harvard',
            detail:
              'En Harvard, le bus Programme transporte l’instruction pendant que le bus Données transporte l’opérande simultanément.',
            highlightBus: 'control',
          },
        ],
        courseNoteWarning: {
          title: 'Note de vigilance sur le PDF du cours (Diapo 6)',
          detail:
            'Dans le polycopié original, la diapo 6 est titrée par erreur « 2. Architecture de Von Neumann » alors que la diapo 5 porte déjà le titre « 2. Architecture de Harvard ». Retiens bien : Von Neumann = mémoire unique (diapo 4 & 6), Harvard = deux mémoires séparées (diapo 5).',
        },
      },
      simulationId: 'von-neumann-harvard',
      checkpoint: {
        id: 'chk-1-1',
        question:
          'Pourquoi dit-on que l’architecture de Von Neumann souffre d’un « goulot d’étranglement » ?',
        options: [
          {
            id: 'a',
            label: 'Parce qu’elle n’a pas de mémoire RAM',
            isCorrect: false,
            feedback:
              'Presque ! Von Neumann possède bien de la RAM et de la ROM, réunies dans la même mémoire principale.',
          },
          {
            id: 'b',
            label:
              'Parce que les instructions et les données se partagent un même bus et ne peuvent pas circuler en même temps',
            isCorrect: true,
            feedback:
              'Exact ! Comme tout passe par le même bus unique, le processeur doit alterner entre lire une instruction et accéder aux données.',
          },
          {
            id: 'c',
            label: 'Parce qu’elle est réservée uniquement aux microcontrôleurs PIC',
            isCorrect: false,
            feedback:
              'Attention, c’est l’inverse : les microcontrôleurs PIC utilisent l’architecture Harvard !',
          },
        ],
        hint: 'Pense à la boutique avec une seule porte : que se passe-t-il quand deux personnes veulent passer en même temps ?',
      },
      keyTakeaways: [
        'Von Neumann : une seule mémoire principale (programme + données) et un seul jeu de bus partagé.',
        'Le partage du bus crée le goulot d’étranglement de Von Neumann.',
        'Harvard : mémoire programme et mémoire de données physiquement séparées avec deux jeux de bus indépendants.',
        'Harvard est très répandue dans les DSP et microcontrôleurs (PIC, AVR).',
      ],
      glossaryKeys: ['von-neumann', 'harvard', 'goulot-etranglement'],
    },
    {
      id: '1-2-blocs-fondamentaux',
      moduleId: 'module-1',
      number: '1.2',
      title: 'Les 3 blocs d’un système à processeur',
      subtitle: 'Unité centrale, Mémoire principale et Interfaces d’Entrée / Sortie',
      durationMin: 8,
      pdfReference: '1-Architecture de base.pdf · Diapo 2',
      whyItExists:
        'Avant d’étudier les détails internes d’un 68HC11 ou d’un PIC, il faut identifier les trois grandes briques qui composent n’importe quel ordinateur ou système embarqué.',
      levels: {
        kid: {
          title: 'Analogie du quotidien',
          analogyTag: 'Le cuisinier, son plan de travail et le guichet',
          body:
            'Dans un restaurant, il y a 3 équipes : (1) le cuisinier qui réfléchit et prépare (Unité Centrale), (2) le cahier de recettes + le plan de travail où sont posés les bols (Mémoire Principale), et (3) le guichet où arrivent les commandes des clients et d’où sortent les plats chauds (Interfaces E/S).',
        },
        simple: {
          title: 'Version simple',
          body:
            'Tout système à processeur s’articule autour de trois blocs reliés par des bus : l’Unité Centrale qui exécute les calculs et contrôle l’ensemble, la Mémoire Principale (ROM + RAM) qui stocke le programme et les variables, et les Interfaces d’Entrée/Sortie qui dialoguent avec le monde extérieur.',
        },
        technical: {
          title: 'Version technique du cours',
          body:
            'Selon le schéma synoptique du cours, un système à microprocesseur réunit : (1) l’Unité Centrale (microprocesseur), (2) la Mémoire Principale regroupant mémoire morte (ROM, non volatile) et mémoire vive (RAM, volatile), et (3) les Interfaces d’Entrée/Sortie connectant les capteurs et actionneurs via des registres adaptés.',
          specs: [
            'Unité Centrale : séquence les instructions et traite les données',
            'Mémoire Principale : ROM (programme/constantes) + RAM (données temporaires)',
            'Interfaces E/S : adaptation électrique et logique vers les périphériques',
          ],
        },
        alternativeAnalogy: {
          title: 'Autre analogie : Un atelier de couture à Médina',
          body:
            'Le tailleur = l’Unité Centrale. Son mètre et son carnet de mesures posés sur la table = la Mémoire Principale. La porte d’entrée où le client dépose le tissu et récupère le boubou = l’Interface E/S.',
        },
      },
      howItWorks: {
        summary:
          'Chaque bloc a un rôle précis et ne se substitue jamais aux autres lors de l’exécution d’un programme.',
        steps: [
          {
            label: 'Bloc 1 : Unité Centrale (UC)',
            detail:
              'Lit l’instruction depuis la mémoire, la décode et effectue l’opération arithmétique ou logique correspondante.',
            highlightBus: 'control',
          },
          {
            label: 'Bloc 2 : Mémoire Principale (ROM + RAM)',
            detail:
              'Conserve le code binaire du programme (ROM) et les valeurs modifiées pendant l’exécution (RAM).',
            highlightBus: 'address',
          },
          {
            label: 'Bloc 3 : Interfaces E/S',
            detail:
              'Transforment les signaux des boutons, claviers ou capteurs en données lisibles par l’UC, et pilotent LED, moteurs ou afficheurs.',
            highlightBus: 'data',
          },
        ],
      },
      checkpoint: {
        id: 'chk-1-2',
        question:
          'Dans un système embarqué (par exemple un feu tricolore), quel bloc permet au processeur de commander les ampoules LED et de lire le bouton piéton ?',
        options: [
          {
            id: 'a',
            label: 'La mémoire ROM uniquement',
            isCorrect: false,
            feedback: 'La ROM sert à conserver le programme, pas à piloter directement le matériel extérieur.',
          },
          {
            id: 'b',
            label: 'L’interface d’Entrée / Sortie (E/S)',
            isCorrect: true,
            feedback:
              'Bravo ! C’est exactement le rôle des interfaces E/S : relier le processeur aux capteurs (entrées) et actionneurs (sorties).',
          },
          {
            id: 'c',
            label: 'L’Unité Arithmétique et Logique (UAL)',
            isCorrect: false,
            feedback:
              'L’UAL fait les calculs à l’intérieur du processeur, mais elle passe par les interfaces E/S pour parler au monde extérieur.',
          },
        ],
        hint: 'Cherche le bloc qui joue le rôle de « guichet » entre le processeur et le monde extérieur.',
      },
      keyTakeaways: [
        'Un système à processeur repose sur 3 blocs : Unité Centrale, Mémoire Principale et Interfaces E/S.',
        'La Mémoire Principale réunit la ROM (programme permanent) et la RAM (données temporaires).',
        'Les Interfaces E/S assurent la communication avec les périphériques externes.',
      ],
      glossaryKeys: ['unite-centrale', 'memoire-principale', 'interface-es'],
    },
    {
      id: '1-3-trois-bus',
      moduleId: 'module-1',
      number: '1.3',
      title: 'Les 3 Bus : Données, Adresses, Commande',
      subtitle: 'Qui transporte quoi, et dans quel sens ?',
      durationMin: 10,
      pdfReference: '1-Architecture de base.pdf · Diapo 3',
      whyItExists:
        'Les trois blocs doivent échanger des milliers de signaux par seconde sans câbler un fil individuel entre chaque paire de composants. On regroupe les fils en autoroutes appelées « bus ».',
      levels: {
        kid: {
          title: 'Analogie du quotidien',
          analogyTag: 'L’adresse sur le colis, le camion et le feu tricolore',
          body:
            'Pour livrer un colis à Dakar : (1) Le numéro de rue en BLEU dit OÙ aller (Bus d’adresses — seul le chef donne l’adresse, dans un seul sens). (2) Le camion rouge fait l’aller-retour avec le colis (Bus de données — dans les deux sens !). (3) Le feu tricolore en ORANGE dit « avance », « lis » ou « écris » (Bus de commande).',
        },
        simple: {
          title: 'Version simple',
          body:
            'Trois bus relient le processeur aux mémoires et E/S : le Bus d’adresses (bleu, unidirectionnel) indique quelle case est visée ; le Bus de données (rouge, bidirectionnel) transporte l’information lue ou écrite ; le Bus de commande (orange) synchronise le transfert et précise s’il s’agit d’une lecture ou d’une écriture.',
        },
        technical: {
          title: 'Version technique du cours',
          body:
            'Un bus est un ensemble de liaisons physiques parallèles partagées : • Bus d’adresses (n fils, unidirectionnel UC → Mémoire/E-S) : sélectionne une case parmi 2^n. • Bus de données (m fils, bidirectionnel UC ⇄ Mémoire/E-S) : transfère instructions et données (8, 16, 32 bits…). • Bus de commande (quelques fils) : assure la synchronisation et le sens du transfert (R/W, horloge, Reset, IRQ…).',
          specs: [
            'Bus d’adresses (Bleu) → Unidirectionnel (émis par le processeur)',
            'Bus de données (Rouge) ⇄ Bidirectionnel (lecture ET écriture)',
            'Bus de commande (Orange) ⇄ Synchronisation, R/W, horloge, interruptions',
          ],
        },
        alternativeAnalogy: {
          title: 'Autre analogie : Commander au marché Tilène',
          body:
            'Tu pointes du doigt l’étal n°14 (Bus d’adresses, un seul sens : toi → marchand). Tu donnes un billet ou tu prends les mangues (Bus de données, deux sens). Et tu dis « combien ça coûte ? » ou « tiens, garde ça » (Bus de commande).',
        },
      },
      howItWorks: {
        summary:
          'Sur tous les schémas de cette plateforme (comme dans le cours), garde ce code couleur et ces flèches de direction en tête :',
        steps: [
          {
            label: 'Bus d’adresses (Bleu · → Unidirectionnel)',
            detail:
              'Le processeur impose toujours l’adresse sur ce bus. Jamais une mémoire RAM n’envoie une adresse au processeur.',
            highlightBus: 'address',
          },
          {
            label: 'Bus de données (Rouge · ⇄ Bidirectionnel)',
            detail:
              'En lecture, la donnée va de la mémoire vers le processeur. En écriture, elle va du processeur vers la mémoire.',
            highlightBus: 'data',
          },
          {
            label: 'Bus de commande (Orange · Synchronisation)',
            detail:
              'Contient les signaux comme R/W (Read/Write), l’horloge et les demandes d’interruption pour éviter toute collision.',
            highlightBus: 'control',
          },
        ],
      },
      checkpoint: {
        id: 'chk-1-3',
        question:
          'Parmi ces trois bus, lequel est strictement UNIDIRECTIONNEL (émis uniquement par le processeur en fonctionnement normal) ?',
        options: [
          {
            id: 'a',
            label: 'Le bus de données (rouge)',
            isCorrect: false,
            feedback:
              'Non, le bus de données doit être bidirectionnel pour permettre à la fois de lire (mémoire → CPU) et d’écrire (CPU → mémoire).',
          },
          {
            id: 'b',
            label: 'Le bus d’adresses (bleu)',
            isCorrect: true,
            feedback:
              'Exact ! C’est toujours le processeur qui choisit la case mémoire ou le périphérique cible : le bus d’adresses est unidirectionnel.',
          },
          {
            id: 'c',
            label: 'Aucun des trois, ils sont tous bidirectionnels',
            isCorrect: false,
            feedback:
              'Vérifie le sens des flèches : seul le bus d’adresses part uniquement du processeur vers les mémoires et E/S.',
          },
        ],
        hint: 'Pose-toi la question : est-ce qu’une mémoire RAM a le droit de choisir une adresse à la place du processeur ?',
      },
      keyTakeaways: [
        'Bus d’adresses (Bleu) : unidirectionnel (UC → Mémoire/E-S), sélectionne la case cible.',
        'Bus de données (Rouge) : bidirectionnel (UC ⇄ Mémoire/E-S), transporte les octets.',
        'Bus de commande (Orange) : quelques lignes de synchronisation (R/W, horloge, contrôle).',
      ],
      glossaryKeys: ['bus-adresses', 'bus-donnees', 'bus-commande'],
    },
    {
      id: '1-4-espace-adressable',
      moduleId: 'module-1',
      number: '1.4',
      title: 'Espace adressable (2ⁿ) et format mémoire',
      subtitle: 'Combien de cases mémoire un processeur peut-il voir ?',
      durationMin: 12,
      pdfReference: '1-Architecture de base.pdf · Diapo 4',
      whyItExists:
        'Les étudiants demandent souvent : « Pourquoi un processeur 16 bits d’adresse s’arrête-t-il à 64 Ko ? ». Tout vient de la relation mathématique directe entre le nombre de fils du bus d’adresses et le nombre maximal de cases.',
      levels: {
        kid: {
          title: 'Analogie du quotidien',
          analogyTag: 'Les interrupteurs qui créent des codes secrets',
          body:
            'Chaque fil du bus d’adresses est comme un interrupteur qui peut être allumé (1) ou éteint (0). Avec 1 fil, tu as 2 codes (0 et 1). Avec 2 fils, 4 codes (00, 01, 10, 11). À chaque fil que tu ajoutes, tu DOUBLES le nombre de boîtes aux lettres que tu peux numéroter !',
        },
        simple: {
          title: 'Version simple',
          body:
            'Si le bus d’adresses possède n fils (n bits), le processeur peut former 2ⁿ combinaisons différentes d’adresses, de 0 jusqu’à 2ⁿ − 1. Si chaque adresse pointe vers 1 octet (8 bits), la capacité maximale adressable vaut 2ⁿ octets. Par exemple, avec 16 fils : 2¹⁶ = 65 536 octets = 64 Kio.',
        },
        technical: {
          title: 'Version technique du cours',
          body:
            'Un bus d’adresses de largeur n bits permet au microprocesseur d’adresser au maximum 2ⁿ emplacements distincts (plage hexadécimale de $0000 à $(2ⁿ−1)). La taille totale adressable vaut (2ⁿ × largeur d’un emplacement). Pour un emplacement de 8 bits (1 octet) et n = 16 : 2¹⁶ = 65 536 octets = 64 Kio ($0000 à $FFFF), typique du 68HC11.',
          specs: [
            'Formule : Nombre d’emplacements = 2ⁿ (pour n fils d’adresse)',
            '1 Kio = 2¹⁰ = 1 024 octets | 1 Mio = 2²⁰ = 1 048 576 octets',
            'Bus 16 bits (68HC11) → 2¹⁶ = 65 536 adresses ($0000–$FFFF)',
          ],
        },
        alternativeAnalogy: {
          title: 'Autre analogie : Les plaques d’immatriculation',
          body:
            'Si une ville n’autorisait que 2 chiffres sur les plaques (00 à 99), elle ne pourrait immatriculer que 10² = 100 voitures. En binaire, chaque chiffre n’a que 2 choix (0 ou 1), donc n chiffres donnent 2ⁿ adresses possibles.',
        },
      },
      howItWorks: {
        summary:
          'Teste ci-dessous avec le calculateur interactif : fais varier le nombre de fils n et observe immédiatement la capacité maximale et l’adresse hexadécimale finale.',
        steps: [
          {
            label: '1. Compter les bits d’adresse (n)',
            detail: 'Chaque broche d’adresse supplémentaire (A0, A1, ..., An-1) multiplie l’espace adressable par 2.',
            highlightBus: 'address',
          },
          {
            label: '2. Multiplier par le format de case (m bits)',
            detail:
              'La plupart des processeurs (comme le 68HC11) rangent 1 octet (8 bits) par adresse. Le PIC16F887, lui, a une mémoire programme à mots de 14 bits !',
            highlightBus: 'data',
          },
          {
            label: '3. Convertir en hexadécimal',
            detail: '1 chiffre hexadécimal regroupe exactement 4 bits : 16 bits d’adresse s’écrivent donc sur 4 chiffres ($0000 à $FFFF).',
            highlightBus: 'control',
          },
        ],
        courseNoteWarning: {
          title: 'Note de vigilance sur le PDF du cours (Diapo 4)',
          detail:
            'En bas de la diapo 4 du polycopié, la phrase « ...2n emplacements et » est coupée à la fin de la page. La suite logique est bien le format des données (nombre d’octets/mots stockés à chaque emplacement).',
        },
      },
      simulationId: 'bus-capacity-playground',
      playgroundTitle: 'Calculateur interactif d’espace adressable 2ⁿ',
      checkpoint: {
        id: 'chk-1-4',
        question:
          'Un microcontrôleur possède un bus d’adresses de 12 fils (A0 à A11) et chaque adresse contient 1 octet. Quelle est sa capacité maximale adressable ?',
        options: [
          {
            id: 'a',
            label: '2 048 octets (2 Kio)',
            isCorrect: false,
            feedback: '2 048 correspond à 2¹¹ (11 fils), il manque un fil !',
          },
          {
            id: 'b',
            label: '4 096 octets (4 Kio)',
            isCorrect: true,
            feedback: 'Exact ! 2¹² = 4 096 emplacements de 1 octet, soit 4 Kio (adresses $000 à $FFF).',
          },
          {
            id: 'c',
            label: '65 536 octets (64 Kio)',
            isCorrect: false,
            feedback: '65 536 correspond à 2¹⁶ (16 fils d’adresse).',
          },
        ],
        hint: 'Calcule 2 puissance 12 : sachant que 2¹⁰ = 1 024, multiplie par 2 deux fois.',
      },
      keyTakeaways: [
        'Avec n lignes d’adresses, on génère 2ⁿ adresses uniques (de 0 à 2ⁿ − 1).',
        'Capacité totale = 2ⁿ × taille d’un mot mémoire.',
        'En informatique, 1 Kio = 1 024 (2¹⁰) et non 1 000.',
      ],
      glossaryKeys: ['espace-adressable', 'bus-adresses'],
    },
    {
      id: '1-5-decodage-adresse',
      moduleId: 'module-1',
      number: '1.5',
      title: 'Le décodage d’adresse',
      subtitle: 'Comment éviter que la ROM, la RAM et les E/S parlent en même temps ?',
      durationMin: 10,
      pdfReference: '1-Architecture de base.pdf · Diapo 8',
      whyItExists:
        'Tous les boîtiers (ROM, RAM, interfaces E/S) sont branchés en parallèle sur le même bus de données rouge. Si deux boîtiers répondent en même temps à une adresse, leurs signaux s’entrechoquent (conflit de bus) et les données sont détruites.',
      levels: {
        kid: {
          title: 'Analogie du quotidien',
          analogyTag: 'Le standardiste qui réveille un seul service',
          body:
            'Imagine une grande maison où 3 personnes dorment dans 3 chambres reliées au même téléphone. Quand le chef appelle, le standardiste (le décodeur d’adresse) regarde les premiers chiffres de l’adresse et tape à UNE SEULE porte (le signal CS). Les deux autres restent silencieux !',
        },
        simple: {
          title: 'Version simple',
          body:
            'Le décodeur d’adresse est un circuit logique qui surveille les bits de poids fort du bus d’adresses. En fonction de la plage d’adresse demandée, il active la broche Chip Select (CS ou /CS) d’un seul composant (soit la RAM, soit la ROM, soit un périphérique), tandis que les autres restent isolés du bus de données.',
        },
        technical: {
          title: 'Version technique du cours',
          body:
            'Le décodeur d’adresses reçoit les bits d’adresse de poids fort (ex. A15..A13) et génère des signaux de sélection (/CS_RAM, /CS_ROM, /CS_IO) mutuellement exclusifs. Les bits de poids faible (ex. A0..A12) sont reliés directement aux boîtiers pour choisir la case précise à l’intérieur du composant sélectionné. Aucun conflit électrique n’est possible car les boîtiers non sélectionnés mettent leurs broches de données en haute impédance (Hi-Z).',
          specs: [
            'Bits de poids fort → Entrent dans le décodeur → Activent 1 seul /CS',
            'Bits de poids faible → Choisissent la case interne dans le boîtier actif',
            'Boîtiers inactifs → Sorties en haute impédance (tri-state) sur le bus de données',
          ],
        },
        alternativeAnalogy: {
          title: 'Autre analogie : Le tri postal par quartier',
          body:
            'Sur une adresse « Plateau, Rue 12 », le mot « Plateau » sert au décodeur pour envoyer le facteur dans le bon quartier. Ensuite, « Rue 12 » sert uniquement dans ce quartier pour trouver la bonne maison.',
        },
      },
      howItWorks: {
        summary:
          'Le découpage d’une adresse en deux parties (sélection de puce + case interne) rend le système modulaire et sans conflit :',
        steps: [
          {
            label: '1. Le CPU place une adresse 16 bits sur le bus bleu',
            detail: 'Par exemple $2045 : les bits hauts indiquent la zone RAM.',
            highlightBus: 'address',
          },
          {
            label: '2. Le décodeur reconnaît la plage et active 1 seul CS',
            detail: 'La ligne orange /CS_RAM passe à l’état actif ; /CS_ROM et /CS_Periph1 restent désactivées.',
            highlightBus: 'control',
          },
          {
            label: '3. Seul le composant sélectionné utilise le bus rouge',
            detail: 'La donnée de la case $0045 de la RAM voyage proprement jusqu’au processeur.',
            highlightBus: 'data',
          },
        ],
      },
      checkpoint: {
        id: 'chk-1-5',
        question:
          'Que se passerait-il si le décodeur d’adresse était défaillant et activait en même temps le /CS de la RAM et celui de la ROM pendant une lecture ?',
        options: [
          {
            id: 'a',
            label: 'Le processeur calculerait la moyenne des deux octets',
            isCorrect: false,
            feedback: 'Les circuits numériques ne calculent pas de moyenne : leurs sorties électriques s’opposent.',
          },
          {
            id: 'b',
            label:
              'Un conflit de bus sur le bus de données (données corrompues et risque de surchauffe)',
            isCorrect: true,
            feedback:
              'Exact ! Deux boîtiers qui imposent simultanément des 0 et des 1 sur le même fil rouge provoquent un conflit de bus.',
          },
          {
            id: 'c',
            label: 'La mémoire doublerait automatiquement sa capacité',
            isCorrect: false,
            feedback: 'Non, la capacité physique reste inchangée ; il faut au contraire que les plages soient strictement disjointes.',
          },
        ],
        hint: 'Que se passe-t-il si deux personnes crient deux chiffres différents en même temps dans le même haut-parleur ?',
      },
      keyTakeaways: [
        'Le décodeur d’adresse lit les bits de poids fort pour activer un seul boîtier via son signal CS (/CS).',
        'Les composants non sélectionnés restent déconnectés du bus de données (haute impédance).',
        'Sans décodage correct, deux composants peuvent écrire en même temps : c’est un conflit de bus.',
      ],
      glossaryKeys: ['decodeur-adresse', 'chip-select'],
    },
    {
      id: '1-6-cartographie-memoire',
      moduleId: 'module-1',
      number: '1.6',
      title: 'Cartographie mémoire ($0000 à $FFFF)',
      subtitle: 'Lire et manipuler le plan mémoire exact du cours',
      durationMin: 12,
      pdfReference: '1-Architecture de base.pdf · Diapo 9',
      whyItExists:
        'Quand tu programmes un microprocesseur comme le 68HC11, tu dois savoir à quelles adresses sont rangés la RAM, la ROM et les périphériques afin de ne jamais écrire un variable dans une zone vide ou dans la ROM.',
      levels: {
        kid: {
          title: 'Analogie du quotidien',
          analogyTag: 'Le plan d’un immeuble de 65 536 étages',
          body:
            'Dans cet immeuble numéroté de $0000 tout en bas jusqu’à $FFFF tout en haut : les 4 premières boîtes ($0000–$0003) sont le Périphérique 1. Ensuite il y a des étages vides jusqu’à $1FFF. De $2000 à $3FFF c’est l’atelier RAM. Puis encore un espace libre, et tout en haut jusqu’à $FFFF c’est la bibliothèque ROM !',
        },
        simple: {
          title: 'Version simple',
          body:
            'La cartographie mémoire est le plan officiel de l’espace d’adressage (ici 64 Kio pour un bus de 16 bits, de $0000 à $FFFF). Sur l’exemple du cours, on trouve : Périphérique 1 ($0000–$0003), un Espace Libre ($0004–$1FFF), la RAM ($2000–$3FFF), un second Espace Libre ($4000–$4FFF), puis la ROM jusqu’à $FFFF.',
        },
        technical: {
          title: 'Version technique du cours',
          body:
            'Pour un bus d’adresses 16 bits (espace adressable $0000–$FFFF = 65 536 octets), le décodeur d’adresse réalise l’allocation suivante (Diapo 9) : • Périphérique 1 : $0000 à $0003 (4 octets) • Espace Libre : $0004 à $1FFF (8 188 octets) • RAM : $2000 à $3FFF (8 192 octets = 8 Kio) • Espace Libre : $4000 à $4FFF • ROM : de la frontière $4FFF/$5000 jusqu’à $FFFF (~44 Kio). Toute adresse pointant un Espace Libre n’active aucun /CS.',
          specs: [
            '$0000 – $0003 : Périphérique 1 (4 octets)',
            '$0004 – $1FFF : Espace Libre (aucun composant câblé)',
            '$2000 – $3FFF : Mémoire RAM (8 192 octets = 8 Kio)',
            '$4000 – $4FFF : Espace Libre · $5000 – $FFFF : Mémoire ROM',
          ],
        },
        alternativeAnalogy: {
          title: 'Autre analogie : Les rayons numérotés d’un entrepôt',
          body:
            'Certains rayons sont déjà occupés (Périphérique 1, RAM, ROM) et d’autres sont laissés libres pour agrandir le système plus tard. Si tu envoies un chariot dans un rayon libre, personne ne répond !',
        },
      },
      howItWorks: {
        summary:
          'Manipule la simulation interactive 3D/2D ci-dessous : saisis ou clique une adresse hexadécimale entre $0000 et $FFFF et observe quel boîtier est sélectionné par le décodeur.',
        steps: [
          {
            label: '1. Choisis une adresse (ex. $0002, $2A10, $4200, $E100)',
            detail: 'L’adresse part du CPU sur le bus d’adresses bleu.',
            highlightBus: 'address',
          },
          {
            label: '2. Observe le décodeur d’adresse',
            detail:
              'Il compare l’adresse aux bornes de la cartographie : s’il trouve une puce correspondante, il active son signal orange CS.',
            highlightBus: 'control',
          },
          {
            label: '3. Vérifie le transfert de données',
            detail:
              'En RAM ou sur Périphérique 1, tu peux lire et écrire. En ROM, seule la lecture fonctionne. En Espace Libre, aucune puce ne répond !',
            highlightBus: 'data',
          },
        ],
        courseNoteWarning: {
          title: 'Précision sur la borne $4FFF (Diapo 9)',
          detail:
            'Le schéma de la diapo 9 indique « $4FFF » à la frontière entre l’espace libre et la ROM. Dans une cartographie réelle sans chevauchement d’adresse, si l’espace libre s’arrête à $4FFF, la ROM démarre à l’octet suivant ($5000). La simulation accepte la zone ROM à partir de $5000 et te signale cette frontière.',
        },
      },
      simulationId: 'address-decoding',
      checkpoint: {
        id: 'chk-1-6',
        question:
          'Selon la cartographie du cours (Diapo 9), à quelle adresse faut-il lire ou écrire pour communiquer avec la RAM ?',
        options: [
          {
            id: 'a',
            label: '$0002',
            isCorrect: false,
            feedback: '$0002 appartient à la plage $0000–$0003 : c’est le Périphérique 1 !',
          },
          {
            id: 'b',
            label: '$2500',
            isCorrect: true,
            feedback: 'Parfait ! $2500 se situe bien entre $2000 et $3FFF, c’est donc la RAM.',
          },
          {
            id: 'c',
            label: '$1000',
            isCorrect: false,
            feedback: '$1000 se situe entre $0004 et $1FFF : c’est un Espace Libre sans mémoire câblée.',
          },
        ],
        hint: 'Vérifie les bornes de la RAM dans le cours : elle commence à $2000 et se termine à $3FFF.',
      },
      keyTakeaways: [
        'La cartographie attribue une plage d’adresses unique et disjointe à chaque composant.',
        'Sur 16 bits d’adresse, l’espace total s’étend de $0000 à $FFFF (65 536 emplacements).',
        'Les espaces libres n’ont aucun circuit câblé : le décodeur n’y active aucun CS.',
        'La ROM contient le programme non volatil ; la RAM stocke les données modifiables.',
      ],
      glossaryKeys: ['cartographie-memoire', 'decodeur-adresse', 'espace-adressable'],
    },
  ],
};
