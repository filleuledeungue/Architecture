import { CourseModule } from '../../types/course';

/**
 * Modules 2 à 7 : contenu complet, détaillé et fidèle aux PDF du Pr Mamadou Lamine NDIAYE (ESP Dakar).
 * Tous les modules sont en accès libre.
 */
export const MODULES_2_TO_7: CourseModule[] = [
  {
    id: 'module-2',
    number: 2,
    title: 'Les Mémoires : Lecture, Écriture, Cache & Hiérarchie',
    shortTitle: 'Mémoires & Cache',
    description:
      'Capacité, temps d’accès/cycle, RAM/ROM/Flash, fonctionnement détaillé de la Lecture et de l’Écriture mémoire, cache (Hit/Miss) et pyramide.',
    status: 'available',
    pdfSources: ['2-Memoires.pdf', '1-Architecture de base.pdf'],
    lessons: [
      {
        id: '2-1-caracteristiques-types',
        moduleId: 'module-2',
        number: '2.1',
        title: 'Caractéristiques, RAM & ROM',
        subtitle: 'Capacité, temps d’accès vs temps de cycle, débit et volatilité',
        durationMin: 10,
        pdfReference: '2-Memoires.pdf · Diapos 4 à 5',
        whyItExists:
          'Toutes les mémoires ne se valent pas : certaines gardent les données quand on coupe le courant, d’autres sont ultra-rapides mais s’effacent dès la coupure.',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'L’ardoise effaçable (RAM) vs le livre imprimé (ROM)',
            body:
              'La RAM, c’est comme une ardoise où tu écris très vite tes brouillons, mais quand tu fermes la salle le soir (coupure d’électricité), tout s’efface ! La ROM, c’est un livre imprimé : même sans électricité, les recettes restent gravées dedans.',
          },
          simple: {
            title: 'Version simple',
            body:
              'On évalue une mémoire par sa capacité, le format d’une case (m bits), le temps d’accès, le temps de cycle (intervalle minimal entre 2 accès), le débit et la volatilité. La RAM est volatile et rapide (stockage temporaire) ; la ROM (ROM, PROM, EPROM, EEPROM, Flash) est non volatile et garde le programme.',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              'Avec n bits d’adresse et m bits de données, une mémoire contient 2ⁿ cases de m bits. • Temps d’accès : délai entre le lancement de la requête et la disponibilité de la donnée sur le bus de données. • Temps de cycle : intervalle minimum qui doit séparer deux opérations successives (≥ temps d’accès). • RAM : volatile, lecture/écriture rapide à temps de cycle court. • ROM : non volatile, stockage permanent (ROM, PROM programmable 1 fois, EPROM effaçable aux UV, EEPROM et Flash effaçables électriquement).',
            specs: [
              'Temps de cycle ≥ Temps d’accès (stabilisation électrique entre 2 accès)',
              'RAM : volatile · stockage temporaire · temps de cycle court',
              'ROM / PROM / EPROM / EEPROM / Flash : non volatiles',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Le tableau noir et la stèle gravée',
            body:
              'Tu peux réécrire mille fois sur le tableau noir (RAM), mais il s’efface quand on coupe. Ce qui est gravé dans la pierre (ROM) reste intact sans courant.',
          },
        },
        howItWorks: {
          summary:
            'Chaque opération mémoire mobilise les 3 bus et trois grandeurs temporelles essentielles :',
          steps: [
            {
              label: '1. Temps d’accès',
              detail: 'Temps écoulé entre l’envoi de l’adresse (bleu) et l’apparition de la donnée (rouge).',
              highlightBus: 'address',
            },
            {
              label: '2. Temps de cycle',
              detail: 'Délai minimal avant de pouvoir relancer une deuxième Lecture ou Écriture.',
              highlightBus: 'control',
            },
            {
              label: '3. Débit (octets/s)',
              detail: 'Quantité maximale d’informations lues ou écrites chaque seconde.',
              highlightBus: 'data',
            },
          ],
        },
        checkpoint: {
          id: 'chk-2-1',
          question: 'Quelle affirmation compare correctement le temps d’accès et le temps de cycle ?',
          options: [
            {
              id: 'a',
              label: 'Le temps de cycle est toujours inférieur au temps d’accès',
              isCorrect: false,
              feedback: 'Impossible : il faut d’abord obtenir la donnée puis laisser les circuits se stabiliser.',
            },
            {
              id: 'b',
              label: 'Le temps de cycle est l’intervalle minimum entre deux opérations successives (≥ temps d’accès)',
              isCorrect: true,
              feedback: 'Exact ! C’est la définition exacte de la diapo 4.',
            },
            {
              id: 'c',
              label: 'Le temps de cycle concerne uniquement les disques durs',
              isCorrect: false,
              feedback: 'Toutes les mémoires (RAM, ROM, cache) ont un temps d’accès et un temps de cycle.',
            },
          ],
          hint: 'Relis la différence entre « obtenir une donnée » et « pouvoir relancer une nouvelle opération ».',
        },
        keyTakeaways: [
          '6 caractéristiques clés : Capacité, Format, Temps d’accès, Temps de cycle, Débit, Volatilité.',
          'RAM = volatile, rapide, lecture/écriture temporaire.',
          'ROM / PROM / EPROM / EEPROM / Flash = non volatiles, conservent programme et constantes.',
        ],
        glossaryKeys: ['memoire-principale'],
      },
      {
        id: '2-2-cache-hierarchie',
        moduleId: 'module-2',
        number: '2.2',
        title: 'Mémoire Cache & Hiérarchie Mémoire',
        subtitle: 'La pyramide Vitesse vs Capacité vs Coût (et Hit / Miss)',
        durationMin: 10,
        pdfReference: '2-Memoires.pdf · Diapos 6 à 8',
        whyItExists:
          'Le processeur court beaucoup plus vite que la mémoire RAM principale. Sans mémoire cache intermédiaire, le processeur passerait son temps à attendre ses données.',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'La poche du tablier du cuisinier vs le garde-manger',
            body:
              'Le cuisinier (processeur) garde le sel et les épices dans la poche de son tablier (Mémoire Cache) : il les attrape en 1 seconde (Cache Hit !). S’il n’y en a plus dans sa poche (Cache Miss), il doit marcher jusqu’au grand garde-manger (Mémoire Principale) pour en reprendre.',
          },
          simple: {
            title: 'Version simple',
            body:
              'La mémoire cache est une petite mémoire SRAM très rapide placée entre le processeur et la mémoire principale. Elle conserve les données les plus récentes ou fréquentes. Plus une mémoire est rapide, plus elle coûte cher et plus sa capacité est petite : d’où la pyramide à 5 étages.',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              'Le microprocesseur ignore l’existence du cache et lui adresse toutes ses requêtes. Cas a (Cache Hit) : l’information est dans le cache → réponse immédiate. Cas b (Cache Miss) : le cache interroge la mémoire principale, copie la donnée puis la transmet au processeur. Pyramide du cours : Registres (~1 ns, < 400 o) → Mémoire cache (~5 ns, 8 Ko–4 Mo) → Mémoire principale (~10 ns, jusqu’à 1 Go) → Mémoire d’appui (2–8 Mo) → Mémoire de masse (~5 ms, 200 Go+).',
            specs: [
              'Sommet : Registres (~1 ns, < 400 octets) — ultra-rapide, très coûteux',
              'Mémoire cache SRAM (~5 ns) : réduit l’écart de vitesse CPU / RAM',
              'Base : Mémoire de masse (~5 ms, 200 Go+) — lente mais grande capacité',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Ton bureau d’examen',
            body:
              'Tes 2 stylos sur la table = Registres. Ta trousse ouverte = Mémoire cache. Ton sac à dos par terre = RAM. La bibliothèque de l’ESP = Mémoire de masse.',
          },
        },
        howItWorks: {
          summary:
            'Observe les deux scénarios exacts de la diapo 7 et la pyramide complète de la diapo 8 :',
          steps: [
            {
              label: 'Scénario a : Cache Hit',
              detail: 'Le CPU demande au Cache (1) → donnée trouvée → retour immédiat au CPU (2).',
              highlightBus: 'data',
            },
            {
              label: 'Scénario b : Cache Miss',
              detail: 'Cache interroge Mémoire (2) → Mémoire répond au Cache (3) → Cache livre le CPU (4).',
              highlightBus: 'address',
            },
            {
              label: 'Pyramide Vitesse ↕ Capacité',
              detail: 'Quand on descend vers la mémoire de masse, le temps d’accès augmente mais le coût par octet chute.',
              highlightBus: 'control',
            },
          ],
        },
        simulationId: 'mips-cpi-playground',
        checkpoint: {
          id: 'chk-2-2',
          question: 'Dans la pyramide mémoire du cours, quel étage est le plus rapide et de plus petite capacité ?',
          options: [
            {
              id: 'a',
              label: 'La mémoire principale',
              isCorrect: false,
              feedback: 'Elle est au milieu de la pyramide (~10 ns).',
            },
            {
              id: 'b',
              label: 'Les registres internes du processeur',
              isCorrect: true,
              feedback: 'Exact ! ~1 ns et moins de 400 octets selon la pyramide du cours.',
            },
            {
              id: 'c',
              label: 'La mémoire d’appui',
              isCorrect: false,
              feedback: 'La mémoire d’appui se trouve entre la mémoire principale et la mémoire de masse.',
            },
          ],
          hint: 'Cherche tout en haut (le sommet) de la pyramide de la diapo 8.',
        },
        keyTakeaways: [
          'Le cache SRAM compense la lenteur relative de la mémoire principale.',
          'Hit = 2 échanges rapides CPU ↔ Cache ; Miss = 4 échanges en passant par la mémoire.',
          'Hiérarchie : Registres → Cache → Mémoire principale → Mémoire d’appui → Mémoire de masse.',
        ],
        glossaryKeys: ['memoire-principale', 'unite-centrale'],
      },
      {
        id: '2-3-lecture-ecriture-memoire',
        moduleId: 'module-2',
        number: '2.3',
        title: 'Lecture et Écriture sur la Mémoire',
        subtitle: 'Chronologie exacte sur les 3 bus : Adresses, Données et Commande (R/W, /CS)',
        durationMin: 12,
        pdfReference: '2-Memoires.pdf · Diapo 4 & 1-Architecture de base.pdf · Diapos 3, 8',
        whyItExists:
          'Saviez-vous que le bus de données rouge change complètement de sens selon qu’on lit ou qu’on écrit ? Comprendre la séquence électrique exacte d’une Lecture et d’une Écriture évite toutes les confusions entre RAM, ROM et conflits de bus.',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'Consulter un casier (Lecture) vs Ranger un papier dans un casier (Écriture)',
            body:
              'En Lecture, tu montres le numéro du casier (Bus d’adresses), tu appelles le gardien (/CS), tu lui dis « Ouvre pour que je lise ! » (R/W = 1), et il te tend le papier sur le comptoir (Bus de données : Mémoire → Toi). En Écriture, tu montres le casier, TU poses d’abord le papier sur le comptoir (Bus de données : Toi → Mémoire), et tu dis « Range-le ! » (R/W = 0).',
          },
          simple: {
            title: 'Version simple',
            body:
              'Toute Lecture ou Écriture suit un protocole strict sur les 3 bus. En Lecture (R/W = 1), le CPU fournit l’adresse, le décodeur active /CS = 0 de la puce visée, puis la mémoire place l’octet sur le bus de données pour que le CPU le capture. En Écriture (R/W = 0), le CPU fournit à la fois l’adresse ET la donnée sur le bus de données, puis active l’écriture vers la RAM (impossible sur une ROM !).',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              '• Cycle de Lecture (Read) : (1) L’UC place l’adresse n bits sur le Bus d’adresses ; (2) Le décodeur d’adresse active un unique /CS = 0 ; (3) Le Bus de commande impose R/W = 1 (et /OE = 0) ; (4) Après le temps d’accès t_acc, la mémoire sort de haute impédance et dépose le mot de m bits sur le Bus de données ; (5) L’UC échantillonne la donnée sur front d’horloge puis relâche /CS = 1. • Cycle d’Écriture (Write, RAM uniquement) : (1) L’UC place l’adresse cible ; (2) L’UC dépose la donnée à écrire sur le Bus de données ; (3) Le décodeur active /CS = 0 et le CPU passe R/W = 0 (/WE = 0) ; (4) Les bascules/cellules RAM mémorisent l’octet ; (5) /CS repasse à 1 et on respecte le temps de cycle t_cyc.',
            specs: [
              'Lecture : CPU → Adresse · /CS = 0 · R/W = 1 · Mémoire → Donnée vers CPU',
              'Écriture : CPU → Adresse ET Donnée · /CS = 0 · R/W = 0 · RAM mémorise',
              'ROM : ne possède pas de broche /WE active en mode normal → écriture ignorée',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Le guichet bancaire',
            body:
              'Retirer de l’argent (Lecture) = tu donnes ton numéro de compte, la banque vérifie ta fiche et te remet les billets. Déposer de l’argent (Écriture) = tu donnes ton numéro de compte ET tu poses tes billets sur le comptoir pour que la banque les crédite.',
          },
        },
        howItWorks: {
          summary:
            'Compare les deux séquences matérielles pas à pas et manipule le simulateur ci-dessous :',
          steps: [
            {
              label: '1. Toujours commencer par l’adresse',
              detail: 'Qu’on lise ou qu’on écrive, le CPU impose toujours en premier l’adresse sur le bus bleu et le décodeur réveille une seule puce (/CS = 0).',
              highlightBus: 'address',
            },
            {
              label: '2. Le fil R/W fixe le sens du bus rouge',
              detail: 'R/W = 1 (Lecture) : la mémoire pilote le bus de données rouge. R/W = 0 (Écriture) : c’est le CPU qui pilote le bus rouge.',
              highlightBus: 'control',
            },
            {
              label: '3. Temps d’accès puis Temps de cycle',
              detail: 'Il faut attendre que le signal se stabilise avant de lire (t_acc) et attendre la fin du temps de cycle (t_cyc) avant l’accès suivant.',
              highlightBus: 'data',
            },
          ],
        },
        simulationId: 'memory-rw-cycle',
        checkpoint: {
          id: 'chk-2-3',
          question: 'Lors d’une opération d’Écriture en RAM (R/W = 0), qui dépose l’octet sur le bus de données ?',
          options: [
            {
              id: 'a',
              label: 'La mémoire RAM envoie l’octet vers le processeur',
              isCorrect: false,
              feedback: 'Ça, c’est une Lecture (R/W = 1) ! En Écriture, le processeur envoie la donnée vers la RAM.',
            },
            {
              id: 'b',
              label: 'Le processeur dépose à la fois l’adresse (bus bleu) et la nouvelle donnée (bus rouge)',
              isCorrect: true,
              feedback: 'Exact ! En Écriture, le CPU pilote le bus d’adresses ET le bus de données pendant que /CS=0 et R/W=0.',
            },
            {
              id: 'c',
              label: 'Le décodeur d’adresse fabrique la donnée',
              isCorrect: false,
              feedback: 'Le décodeur active uniquement /CS pour choisir le boîtier, il ne transporte jamais les données.',
            },
          ],
          hint: 'Pose-toi la question : qui connaît la nouvelle valeur qu’on veut enregistrer en RAM ?',
        },
        keyTakeaways: [
          'En Lecture (R/W = 1) : Adresse (CPU → Mem) puis Donnée (Mem → CPU) après le temps d’accès.',
          'En Écriture (R/W = 0) : Adresse + Donnée (CPU → Mem) verrouillées quand /CS = 0.',
          'Les composants non sélectionnés (/CS = 1) gardent leurs broches de données en haute impédance (Hi-Z).',
          'Une ROM ne peut pas être modifiée par une simple écriture CPU.',
        ],
        glossaryKeys: ['bus-adresses', 'bus-donnees', 'bus-commande', 'chip-select'],
      },
    ],
  },
  {
    id: 'module-3',
    number: 3,
    title: 'Le Microprocesseur : UC, UAL, Cycle, CPI/MIPS & CISC/RISC',
    shortTitle: 'Microprocesseur',
    description:
      'Unité de commande et UAL (flags), cycle Recherche–Décodage–Exécution, CPI/MIPS, modes d’adressage et architectures CISC/RISC/DSP/MCU.',
    status: 'available',
    pdfSources: ['3- Processeurs.pdf'],
    lessons: [
      {
        id: '3-1-uc-ual-cycle',
        moduleId: 'module-3',
        number: '3.1',
        title: 'UC, UAL, Flags & Cycle en 3 phases',
        subtitle: 'Comment le processeur lit, décode et exécute une instruction ?',
        durationMin: 12,
        pdfReference: '3- Processeurs.pdf · Diapos 4 à 12',
        whyItExists:
          'Pour comprendre l’assembleur 68HC11 ou PIC16F887, il faut ouvrir le boîtier CPU et voir travailler ensemble l’Unité de Commande (qui orchestre) et l’UAL (qui calcule).',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'Les yeux qui lisent la recette et les mains qui cuisinent',
            body:
              'Dans la tête du cuisinier : son doigt suit la ligne du cahier (le compteur PC), ses yeux lisent la phrase (Registre d’Instruction), son cerveau comprend l’ordre (Décodeur + Séquenceur), et ses deux mains font le mélange ou vérifient si c’est prêt (UAL + Accumulateur + Drapeaux).',
          },
          simple: {
            title: 'Version simple',
            body:
              'Un microprocesseur contient deux cœurs : l’Unité de Commande (PC qui pointe la prochaine instruction, RI, décodeur, séquenceur) et l’Unité de Traitement (UAL, accumulateur, registre d’état avec drapeaux C, AC, S, OV, Z, P). Chaque instruction suit 3 phases : Recherche (Fetch), Décodage, Exécution.',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              '• Unité de Commande : Compteur Ordinal (PC), Registre d’Instruction (RI), Décodeur d’instruction et Séquenceur (génère les signaux de contrôle cadencés par l’horloge). • Unité de Traitement : UAL (opérations arithmétiques/logiques), Accumulateur(s), Registre d’état (flags : C retenue, AC demi-retenue, S signe, OV débordement, Z zéro, P parité), Pointeur de Pile (SP) et Registre d’Index. • Cycle : 1. Recherche (PC → Bus d’adresses → Mem → RI ; PC incrémenté) · 2. Décodage · 3. Exécution (UAL + flags).',
            specs: [
              'Phase 1 : Recherche (Fetch) — lit l’opcode pointé par PC et incrémente PC',
              'Phase 2 : Décodage — le décodeur identifie l’opération et le mode d’adressage',
              'Phase 3 : Exécution — l’UAL calcule et met à jour le registre d’état (flags)',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Un élève au tableau',
            body:
              '1. L’élève lit l’énoncé au tableau (Recherche). 2. Il comprend s’il doit additionner ou soustraire (Décodage). 3. Il écrit le résultat et coche s’il y a une retenue (Exécution).',
          },
        },
        howItWorks: {
          summary:
            'Pendant le cycle en 3 phases, le Compteur Ordinal (PC) avance automatiquement pour préparer l’instruction suivante :',
          steps: [
            {
              label: '1. Recherche (Fetch)',
              detail: 'PC sort sur le bus d’adresses bleu ; l’opcode revient sur le bus rouge vers RI.',
              highlightBus: 'address',
            },
            {
              label: '2. Décodage',
              detail: 'Le décodeur traduit l’opcode binaire pour le séquenceur.',
              highlightBus: 'control',
            },
            {
              label: '3. Exécution',
              detail: 'L’UAL calcule avec les registres et positionne les bits Z, C, V/OV, N/S.',
              highlightBus: 'data',
            },
          ],
        },
        checkpoint: {
          id: 'chk-3-1',
          question: 'Quel registre contient en permanence l’adresse mémoire de la PROCHAINE instruction à exécuter ?',
          options: [
            {
              id: 'a',
              label: 'L’Accumulateur (A)',
              isCorrect: false,
              feedback: 'L’accumulateur stocke les résultats des calculs de l’UAL, pas l’adresse du programme.',
            },
            {
              id: 'b',
              label: 'Le Compteur Ordinal / Program Counter (PC)',
              isCorrect: true,
              feedback: 'Exact ! PC pointe l’adresse de la prochaine instruction et s’incrémente après lecture.',
            },
            {
              id: 'c',
              label: 'Le Registre d’État (CCR / STATUS)',
              isCorrect: false,
              feedback: 'Le registre d’état mémorise les drapeaux (Z, C, N, V), pas le pointeur d’instruction.',
            },
          ],
          hint: 'Ses initiales signifient « Program Counter ».',
        },
        keyTakeaways: [
          'Unité de Commande = PC + RI + Décodeur + Séquenceur.',
          'Unité de Traitement = UAL + Accumulateur + Registre d’état (flags).',
          'Cycle immuable en 3 temps : Recherche → Décodage → Exécution.',
        ],
        glossaryKeys: ['unite-centrale'],
      },
      {
        id: '3-2-cpi-mips-cisc-risc',
        moduleId: 'module-3',
        number: '3.2',
        title: 'CPI, MIPS, Adressage & Philosophie CISC vs RISC',
        subtitle: 'Mesurer la vitesse d’un CPU et comparer les deux grandes architectures',
        durationMin: 14,
        pdfReference: '3- Processeurs.pdf · Diapos 13 à 19',
        whyItExists:
          'Deux processeurs cadencés à la même fréquence n’ont pas la même vitesse réelle si l’un met 4 cycles par instruction et l’autre 1 seul !',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'Le robot multifonction (CISC) vs la chaîne de montage rapide (RISC)',
            body:
              'Un processeur CISC (comme le 68HC11) sait exécuter des gestes très complets en une seule commande, mais certains gestes prennent plusieurs battements d’horloge. Un processeur RISC (comme le PIC16F887) n’a que des gestes simples et calibrés, mais grâce au pipeline il en termine un à chaque battement !',
          },
          simple: {
            title: 'Version simple',
            body:
              'Le CPI (Cycles Par Instruction) est le nombre moyen de cycles d’horloge pour exécuter une instruction. La performance vaut MIPS = F_H(MHz) / CPI. En CISC, des instructions complexes de longueur variable utilisent du microcode ; en RISC, un jeu réduit d’instructions de taille fixe est décodé directement en matériel (logique câblée) pour tourner en 1 cycle grâce au pipeline.',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              '• T_ex = N_instr × CPI × T_horloge, soit MIPS = F_H / (CPI × 10⁶). • CISC (Complex Instruction Set Computer) : grand nombre d’instructions (100–300+), longueur variable (1 à 5 octets), nombreux modes d’adressage, accès mémoire autorisés dans les opérations arithmétiques, décodage microprogrammé → CPI élevé (2 à 12 cycles). • RISC (Reduced Instruction Set Computer) : jeu réduit (ex. 35 instructions sur PIC16F887), format fixe (14 bits), architecture Load/Store (opérations sur registres), décodage câblé, pipeline → CPI ≈ 1 cycle. • DSP (calcul MAC, Harvard) · Microcontrôleur (CPU + RAM + ROM + E/S + Timers/CAN intégrés).',
            specs: [
              'Formule clé : MIPS = Fréquence horloge (MHz) / CPI',
              'CISC (68HC11) : instructions riches, longueur variable, microcodé, Von Neumann',
              'RISC (PIC16F887) : 35 instructions fixes (14b), câblé, pipeline, Harvard',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Le plat sur mesure vs le service express',
            body:
              'CISC prépare un plat complexe en une seule commande (moins de lignes de code, mais temps variable). RISC sert des étapes standardisées à la chaîne : plus de petites lignes, mais un débit régulier et très rapide.',
          },
        },
        howItWorks: {
          summary:
            'Retiens comment CISC et RISC atteignent la performance par deux chemins opposés :',
          steps: [
            {
              label: '1. Formule MIPS = F_H / CPI',
              detail: 'CISC cherche à diminuer le nombre d’instructions N_instr ; RISC cherche à abaisser le CPI vers 1.',
              highlightBus: 'control',
            },
            {
              label: '2. Décodage microprogrammé vs câblé',
              detail: 'Un CPU CISC lit une micro-ROM interne pour dérouler une instruction complexe. Un CPU RISC décode directement en portes logiques rapides.',
              highlightBus: 'address',
            },
            {
              label: '3. Microprocesseur vs Microcontrôleur',
              detail: 'Un microcontrôleur (68HC11, PIC16F887) intègre CPU + mémoires + E/S + timers + CAN sur un seul circuit intégré.',
              highlightBus: 'data',
            },
          ],
        },
        simulationId: 'mips-cpi-playground',
        checkpoint: {
          id: 'chk-3-2',
          question: 'Un processeur tourne à 20 MHz avec un CPI moyen de 4. Combien de MIPS délivre-t-il ?',
          options: [
            {
              id: 'a',
              label: '80 MIPS',
              isCorrect: false,
              feedback: 'Attention, il faut DIVISER F_H par CPI, pas multiplier !',
            },
            {
              id: 'b',
              label: '5 MIPS',
              isCorrect: true,
              feedback: 'Exact ! MIPS = 20 MHz / 4 = 5 millions d’instructions par seconde.',
            },
            {
              id: 'c',
              label: '16 MIPS',
              isCorrect: false,
              feedback: 'On divise la fréquence par le CPI (20 / 4).',
            },
          ],
          hint: 'Applique la formule exacte du cours : MIPS = FH (en MHz) / CPI.',
        },
        keyTakeaways: [
          'MIPS = Fréquence d’horloge (MHz) / CPI.',
          '6 modes d’adressage : Immédiat, Direct, Étendu, Indexé, Inhérent, Relatif.',
          'CISC minimise le nombre d’instructions ; RISC minimise le CPI grâce au format fixe et au pipeline.',
        ],
        glossaryKeys: ['unite-centrale', 'harvard'],
      },
    ],
  },
  {
    id: 'module-4',
    number: 4,
    title: 'Échanges de Données : Scrutation, Interruptions & DMA',
    shortTitle: 'Échanges & Interruptions',
    description:
      'Interfaces d’E/S (commande, données, état), scrutation, fonctionnement détaillé des interruptions (priorités, masquage, contexte) et DMA par vol de cycle.',
    status: 'available',
    pdfSources: ['4- Echanges de donnees.pdf', '6- Exemple d architecture RISC-PIC16F887.pdf'],
    lessons: [
      {
        id: '4-1-scrutation-dma',
        moduleId: 'module-4',
        number: '4.1',
        title: 'Interfaces E/S, Scrutation & DMA (Vol de cycle)',
        subtitle: 'Dialoguer avec les périphériques lents ou transférer des blocs sans le CPU',
        durationMin: 12,
        pdfReference: '4- Echanges de donnees.pdf · Diapos 4 à 6, 8 à 9',
        whyItExists:
          'Les périphériques (clavier, capteur, disque) sont des milliers de fois plus lents que le processeur. Comment éviter de gaspiller des millions de cycles CPU à attendre ?',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'Aller voir la porte toutes les 5 secondes vs le livreur autonome',
            body:
              'En Scrutation, tu ouvres la porte toutes les 5 secondes pour voir si ton colis est arrivé : tu ne peux plus travailler ! En mode DMA, le livreur a reçu tes consignes une seule fois et range directement les cartons dans l’entrepôt sans déranger le chef cuisinier.',
          },
          simple: {
            title: 'Version simple',
            body:
              'Toute interface E/S possède 3 registres : commande, données et état. En Scrutation (Polling), le CPU lit en boucle le registre d’état jusqu’à ce que le périphérique soit prêt. En DMA (Direct Memory Access), le CPU configure un contrôleur DMA (adresses, sens, compteur) qui transfère directement les données entre périphérique et mémoire par vol de cycle.',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              '• Interface E/S : Registre de commande (sens/mode), Registre(s) de données, Registre d’état (prêt/erreur). • Scrutation : mode programmé bloquant où le CPU boucle sur le bit d’état ; simple mais gaspille le temps processeur. • DMA : le CPU initialise (périphérique, sens, 1re et dernière adresse), puis le contrôleur DMA utilise son registre d’adresse, son registre de donnée, son compteur et sa logique câblée. Pour chaque mot, il prend les bus par « vol de cycle », incrémente l’adresse, décrémente le compteur, et émet une IT DMA quand compteur = 0.',
            specs: [
              'Interface E/S : 3 registres (Commande, Données, État)',
              'Scrutation : le CPU attend activement dans une boucle',
              'DMA : vol de cycle CPU → transfert direct Mémoire ↔ Périphérique + IT finale',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Le guichet vs le virement automatique',
            body:
              'Scrutation = demander toutes les 10 secondes « mon transfert est arrivé ? ». DMA = un virement automatique direct entre comptes sans mobiliser le responsable.',
          },
        },
        howItWorks: {
          summary:
            'Retiens les deux extrêmes : la scrutation (le CPU fait tout) et le DMA (le CPU délègue tout un bloc) :',
          steps: [
            {
              label: '1. Les 3 registres d’interface',
              detail: 'Commande (configurer sens/mode), État (lire si prêt/erreur), Données (échanger l’octet).',
              highlightBus: 'control',
            },
            {
              label: '2. Limite de la Scrutation',
              detail: 'Le CPU reste bloqué dans la boucle d’attente : si un autre événement arrive ailleurs, il peut le manquer.',
              highlightBus: 'address',
            },
            {
              label: '3. Vol de cycle DMA (Diapo 9)',
              detail: 'Le contrôleur DMA emprunte les bus quelques cycles pour transférer directement en mémoire, puis avertit le CPU par IT DMA.',
              highlightBus: 'data',
            },
          ],
        },
        checkpoint: {
          id: 'chk-4-1',
          question: 'Quel est le principal inconvénient du mode par scrutation (polling) ?',
          options: [
            {
              id: 'a',
              label: 'Il nécessite un contrôleur DMA externe coûteux',
              isCorrect: false,
              feedback: 'La scrutation est purement logicielle, elle n’a pas besoin de contrôleur DMA.',
            },
            {
              id: 'b',
              label: 'Le microprocesseur gaspille son temps à interroger en boucle le registre d’état au lieu de traiter d’autres tâches',
              isCorrect: true,
              feedback: 'Exact ! En scrutation, le CPU est bloqué tant que l’interface n’est pas prête.',
            },
            {
              id: 'c',
              label: 'Il ne fonctionne jamais avec un registre de données',
              isCorrect: false,
              feedback: 'Le CPU lit bien le registre de données une fois que le registre d’état indique qu’il est prêt.',
            },
          ],
          hint: 'Que fait le CPU tant que le bit « Prêt » du registre d’état vaut 0 ?',
        },
        keyTakeaways: [
          'Toute interface E/S possède 3 registres : Commande, Données et État.',
          'Scrutation = attente active bloquante dans une boucle.',
          'DMA = le CPU reste libre pendant le transfert, mais ses accès mémoire sont limités durant le vol de cycle.',
        ],
        glossaryKeys: ['interface-es', 'bus-commande'],
      },
      {
        id: '4-2-interruptions-detaillees',
        moduleId: 'module-4',
        number: '4.2',
        title: 'Les Interruptions en détail (Principe, Priorités & Contexte)',
        subtitle: 'Fonctionnement matériel complet, masquage et mise en œuvre sur 68HC11 & PIC16F887',
        durationMin: 15,
        pdfReference: '4- Echanges de donnees.pdf · Diapos 6–7 & 6- PIC16F887.pdf · Diapos 38–42',
        whyItExists:
          'Plutôt que d’interroger un capteur mille fois par seconde, il est infiniment plus efficace de laisser le CPU travailler normalement et d’être prévenu instantanément dès qu’un événement survient !',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'La sonnette de la boutique avec un marque-page',
            body:
              'Tu lis tranquillement ton livre (Programme Principal). Quand un client appuie sur la sonnette (Interruption), tu poses ton marque-page sur ta ligne exacte (sauvegarde de PC sur la Pile), tu vas servir le client (routine ISR), tu éteins la sonnette (remise à 0 du drapeau !), puis tu reprends ta lecture exactement au marque-page.',
          },
          simple: {
            title: 'Version simple',
            body:
              'Une interruption est un signal asynchrone envoyé par un périphérique (bouton, Timer, ADC, USART) pour suspendre le programme principal, exécuter une fonction prioritaire (routine d’interruption / ISR), puis reprendre exactement où le CPU s’était arrêté. Chaque interruption possède deux bits : un drapeau (Flag qui passe à 1 quand l’événement arrive) et un bit de validation (Enable pour l’autoriser ou la masquer).',
          },
          technical: {
            title: 'Version technique complète du cours',
            body:
              'Déroulement exact d’une interruption (PIC16F887 Diapo 40–41 & 68HC11) : (1) L’événement matériel lève le Drapeau (ex. INTF, T0IF, RCIF, ADIF = 1). (2) Avant l’instruction suivante, le CPU teste si la source est validée (bit Enable local + masque global : GIE=1 sur PIC, ou CCR bit I=0 sur 68HC11). (3) Si oui : PC est empilé sur la Pile, les autres interruptions sont inhibées (GIE←0 sur PIC ; I←1 sur 68HC11). (4) Le CPU saute au Vecteur d’interruption (adresse fixe 0x0004 sur PIC16F887 ; vecteurs $FFC0–$FFFF sur 68HC11). (5) Pièges majeurs : le Flag reste à 1 après traitement → il faut impérativement le remettre à 0 dans l’ISR ; sur PIC16F887, seul PC est empilé automatiquement → il faut sauvegarder W et STATUS en RAM (alors que le 68HC11 empile tous ses registres). (6) RETFIE (PIC) ou RTI (68HC11) dépile PC et réautorise les interruptions.',
            specs: [
              'Conditions sur PIC16F887 : Flag=1 ET Bit Enable=1 (ex. INTE, T0IE) ET GIE=1 (+ PEIE=1 si périphérique)',
              'Vecteur d’interruption PIC16F887 : 0x0004 · Retour par RETFIE (remet GIE=1)',
              '68HC11 : empile tout le contexte · Masques I (CLI/SEI pour IRQ) et X (XIRQ non masquable après mise à 0) · Retour par RTI',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Les urgences à l’hôpital',
            body:
              'Un médecin consulte un patient (Niveau 0). Un cas urgent arrive (Niveau 2), puis un accident grave arrive (Niveau 3). Le médecin traite d’abord le Niveau 3, finit le Niveau 2, et seulement après s’occupe d’un petit rhume (Niveau 1) avant de reprendre sa consultation normale.',
          },
        },
        howItWorks: {
          summary:
            'Retiens les 4 mécanismes fondamentaux des interruptions avant de manipuler la simulation ci-dessous :',
          steps: [
            {
              label: '1. Paire Drapeau (Flag) + Validation (Enable)',
              detail: 'Sans validation (Enable=1 et GIE=1), le drapeau se lève quand même, mais le CPU n’est pas interrompu.',
              highlightBus: 'control',
            },
            {
              label: '2. Priorités & Préemption (Diapo 7)',
              detail: 'Une interruption plus prioritaire (Niveau 3) interrompt une interruption moins prioritaire (Niveau 2), tandis qu’un Niveau 1 attend.',
              highlightBus: 'address',
            },
            {
              label: '3. Sauvegarde contexte & RAZ du Drapeau',
              detail: 'Toujours remettre le Flag à 0 avant RETFIE/RTI, sinon le CPU replonge immédiatement dans l’interruption en boucle infinie !',
              highlightBus: 'data',
            },
          ],
        },
        deepDiveSections: [
          {
            title: 'Cycle complet d’une Interruption (Étape par étape)',
            subtitle: 'Comparaison directe entre PIC16F887 (RISC) et Motorola 68HC11 (CISC)',
            accent: 'amber',
            paragraphs: [
              '1. Déclenchement matériel : un front sur RB0/INT, un débordement de Timer0 (T0IF), une fin de conversion ADC (ADIF) ou une réception série (RCIF) met son drapeau à 1.',
              '2. Arbitrage & Masquage : à la fin de l’instruction en cours, le CPU vérifie le masque global (GIE=1 sur PIC ; bit I=0 dans CCR sur 68HC11). Les interruptions non masquables (RESET, ou XIRQ sur 68HC11 quand X=0) passent quoi qu’il arrive.',
              '3. Empilement du contexte : le 68HC11 sauvegarde automatiquement PC, IY, IX, A, B et CCR sur la pile SP. À l’inverse, le PIC16F887 n’empile QUE PC dans sa pile matérielle à 8 niveaux : le programmeur doit sauvegarder W et STATUS en RAM (zone commune 70h–7Fh) au début de l’ISR et les restaurer avant RETFIE.',
              '4. Fin & Retour : on remet obligatoirement le Flag à 0 (ex. BCF INTCON, INTF), puis RETFIE (PIC) ou RTI (68HC11) restaure PC et réactive les interruptions.',
            ],
          },
        ],
        simulationId: 'interrupt-flow',
        checkpoint: {
          id: 'chk-4-2',
          question: 'Sur le PIC16F887, que se passe-t-il si tu oublies de remettre le drapeau d’interruption (ex. INTF ou T0IF) à 0 avant RETFIE ?',
          options: [
            {
              id: 'a',
              label: 'Le PIC le remet automatiquement à 0 à la fin de RETFIE',
              isCorrect: false,
              feedback: 'Non ! Comme précisé à la diapo 41 du cours, le drapeau reste à l’état haut même après le traitement.',
            },
            {
              id: 'b',
              label: 'L’interruption se redéclenche immédiatement en boucle dès la sortie de la routine',
              isCorrect: true,
              feedback: 'Exact ! Dès que RETFIE remet GIE=1, le PIC voit que Flag=1 et Enable=1, donc il resaute aussitôt à l’adresse 0x0004.',
            },
            {
              id: 'c',
              label: 'Le programme principal tourne deux fois plus vite',
              isCorrect: false,
              feedback: 'Le programme principal est au contraire bloqué dans la routine d’interruption.',
            },
          ],
          hint: 'Relis les deux remarques importantes de la diapo 41 du PDF PIC16F887.',
        },
        keyTakeaways: [
          'Une interruption est asynchrone, déclenchée par un Flag=1 si Enable=1 et masque global ouvert.',
          'Sur PIC16F887 : vecteur unique 0x0004, seul PC est empilé automatiquement (sauvegarder W et STATUS !).',
          'Toujours effacer le drapeau (Flag ← 0) avant RETFIE / RTI pour éviter la boucle infinie.',
          'Les priorités permettent à un niveau élevé (ex. Niveau 3) de préempter un niveau inférieur (Niveau 2).',
        ],
        glossaryKeys: ['interface-es', 'bus-commande'],
      },
    ],
  },
  {
    id: 'module-5',
    number: 5,
    title: 'Architecture CISC : Le Motorola 68HC11 en détail',
    shortTitle: 'CISC · 68HC11',
    description:
      'Principe de fonctionnement CISC microprogrammé, registres A/B/D/IX/IY/SP/PC/CCR, jeu d’instructions complet et périphériques du 68HC11.',
    status: 'available',
    pdfSources: [
      '5- Exemple d architecture CISC-68HC11.pdf',
      '68hc11 Instruction Memo.pdf',
      'jeu_d_instruction_68hc11.pdf',
    ],
    lessons: [
      {
        id: '5-1-68hc11-principe-architecture',
        moduleId: 'module-5',
        number: '5.1',
        title: 'Principe CISC & Architecture interne du 68HC11',
        subtitle: 'Comment fonctionne un processeur CISC, ses modes MODA/MODB et ses registres',
        durationMin: 15,
        pdfReference: '5- 68HC11.pdf · Diapos 4 à 9',
        whyItExists:
          'Le Motorola 68HC11 illustre parfaitement l’approche CISC : offrir au programmeur des instructions très puissantes (même sur 16 bits ou directement sur la mémoire) pour écrire des programmes compacts.',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'Le couteau suisse complet avec deux mains A et B qui s’unissent en D',
            body:
              'Le 68HC11 fonctionne comme un chef très polyvalent qui utilise un grand atelier unique de 65 536 tiroirs ($0000 à $FFFF). Il a deux poches de 8 bits (A et B) qu’il peut fusionner en une grande poche D de 16 bits, et deux doigts pointeurs (IX et IY) pour parcourir les tableaux.',
          },
          simple: {
            title: 'Version simple',
            body:
              'Le 68HC11 range tout (programme, variables RAM, réglages EEPROM et broches de sortie) dans un seul grand tableau d’adresses de 65 536 cases ($0000 à $FFFF). Pour travailler vite, il utilise des petites mémoires internes très rapides appelées registres : deux mains de calcul (A et B, qu’on peut coller pour former D sur 16 bits), deux pointeurs (IX et IY) et un carnet d’état (CCR). Comme c’est un processeur CISC, une seule instruction peut directement calculer avec une case mémoire sans étape intermédiaire.',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              '• Principe CISC 68HC11 : instructions de 1 à 5 octets (opcode 8b ou préfixe 16b + opérande/adresse) prenant 2 à 41 cycles d’horloge E selon la complexité (ex. IDIV). • Modes au RESET (MODB/MODA) : UC seul (1/0, autonome), Étendu (1/1, bus externes mais perd Ports B & C), Bootstrap (0/0, télécharge en RAM par SCI), Special Test (0/1). • Registres : A (8b), B (8b), D = A:B (16b), IX (16b), IY (16b), SP (16b), PC (16b), CCR (8b : S X H I N Z V C). • Cartographie MC68HC11E9/A8 : RAM ($0000–$00FF), Registres E/S ($1000–$103F), EEPROM ($B600–$B7FF), ROM ($E000–$FFFF).',
            specs: [
              'CCR (8 bits) : S(7) Ignorer STOP · X(6) Masque XIRQ · H(5) Demi-retenue BCD · I(4) Masque IRQ · N(3) Négatif · Z(2) Zéro · V(1) Débordement · C(0) Retenue',
              'D = A (bits 15..8) : B (bits 7..0) — permet additions/divisions 16 bits',
              'Bus d’adresses 16 bits (64 Ko) · Big-Endian (poids fort à l’adresse basse M)',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Deux carnets côte à côte',
            body:
              'A et B sont deux carnets de 8 bits : tu peux travailler sur un petit nombre dans A, ou ouvrir les deux carnets ensemble en double-page (D) pour manipuler un grand nombre de 16 bits.',
          },
        },
        howItWorks: {
          summary:
            'Voici comment s’enchaîne l’exécution CISC à l’intérieur du 68HC11 :',
          steps: [
            {
              label: '1. Lecture d’instructions de taille variable',
              detail: 'Une instruction courte (INCA) ne prend qu’1 octet en mémoire ; une instruction qui vise une adresse 16 bits en prend 3 ou 4. PC avance automatiquement de la bonne taille.',
              highlightBus: 'address',
            },
            {
              label: '2. Calcul direct sur une case mémoire',
              detail: 'Grâce au principe CISC, ADDA $50 va directement lire le nombre rangé dans la case $0050 et l’ajoute à A en une seule commande.',
              highlightBus: 'data',
            },
            {
              label: '3. Mise à jour des témoins du CCR',
              detail: 'Après chaque calcul, le processeur allume ou éteint ses témoins lumineux (Z si le résultat vaut 0, C s’il y a une retenue, N s’il est négatif) pour préparer les sauts conditionnels.',
              highlightBus: 'control',
            },
          ],
        },
        deepDiveSections: [
          {
            title: 'Les mémoires de travail du 68HC11 (Où range-t-on quoi ?)',
            subtitle: 'Registres internes du CPU + RAM, EEPROM, ROM et zone des ports',
            accent: 'blue',
            paragraphs: [
              '1. Les registres de travail (dans la tête du CPU, accès instantané) : A et B sont les deux petites mains de 8 bits pour calculer ; D (16 bits) colle A et B ensemble pour manipuler des nombres jusqu’à 65 535 ; IX et IY sont deux marque-pages (pointeurs 16 bits) pour parcourir un tableau ; SP pointe le haut de la Pile ; PC retient l’adresse de la prochaine ligne de programme.',
              '2. La RAM interne (256 octets, adresses $0000 à $00FF) : c’est l’ardoise brouillon du 68HC11. On y range les variables temporaires et la Pile (SP). Elle est très rapide mais s’efface dès que l’alimentation est coupée.',
              '3. L’EEPROM interne (512 octets, adresses $B600 à $B7FF) : c’est un petit carnet persistant. Les valeurs enregistrées (étalonnage, réglages, mots de passe) restent gardées même sans électricité.',
              '4. La ROM / EPROM (8 Ko, adresses $E000 à $FFFF) : c’est le livre imprimé qui contient le programme permanent et les adresses de démarrage (vecteurs d’interruption et Reset).',
              '5. Les registres de périphériques ($1000 à $103F) : 64 cases spéciales branchées directement sur les pattes du composant (ex. PORTB en $1004 allume les LEDs, DDRC en $1007 règle le sens du PORTC).',
            ],
          },
          {
            title: 'Les 8 témoins du Registre d’état CCR (Condition Code Register)',
            subtitle: 'Comment le 68HC11 retient le résultat de la dernière opération',
            accent: 'amber',
            paragraphs: [
              'Bit 0 — C (Retenue / Carry) : passe à 1 quand une addition dépasse 255 (ou qu’une soustraction emprunte).',
              'Bit 1 — V (Débordement / oVerflow) : passe à 1 en calcul signé si le résultat sort de [-128 ; +127].',
              'Bit 2 — Z (Zéro) : passe à 1 dès que le résultat du calcul vaut exactement 0.',
              'Bit 3 — N (Négatif) : vaut 1 si le nombre est négatif (bit de gauche égal à 1).',
              'Bit 4 — I (Masque IRQ) : à 1, il bloque les interruptions normales ; à 0 (via CLI), il les laisse passer.',
              'Bit 5 — H (Demi-retenue) : retenue du bit 3 vers le bit 4 (calcul décimal BCD). Bits 6 (X) et 7 (S) : contrôlent XIRQ et l’instruction STOP.',
            ],
          },
        ],
        checkpoint: {
          id: 'chk-5-1',
          question: 'Que se passe-t-il si tu exécutes LDAA #$12 puis LDAB #$34 sur le 68HC11 ?',
          options: [
            {
              id: 'a',
              label: 'Le registre double D vaut $1234',
              isCorrect: true,
              feedback: 'Exact ! D est la juxtaposition de A (poids fort) et B (poids faible) → D = $1234.',
            },
            {
              id: 'b',
              label: 'Le registre D vaut $46 (somme de 12 et 34)',
              isCorrect: false,
              feedback: 'Non, D juxtapose les octets A et B, il ne les additionne pas.',
            },
            {
              id: 'c',
              label: 'B écrase la valeur de A',
              isCorrect: false,
              feedback: 'A et B sont deux accumulateurs 8 bits indépendants.',
            },
          ],
          hint: 'Rappelle-toi la structure D = [A : B] sur 16 bits.',
        },
        keyTakeaways: [
          '68HC11 = CISC Von Neumann (64 Ko unifiés) avec instructions de 1 à 5 octets.',
          'Mémoires de travail : registres internes (A, B, D, IX, IY, SP), RAM ($0000–$00FF), EEPROM ($B600–$B7FF) et ROM ($E000–$FFFF).',
          'MODA/MODB fixent le mode au Reset (UC seul, Étendu, Bootstrap, Special Test).',
        ],
        glossaryKeys: ['von-neumann', 'cartographie-memoire'],
      },
      {
        id: '5-2-68hc11-jeu-instructions',
        moduleId: 'module-5',
        number: '5.2',
        title: 'Jeu d’instructions fondamental & le plus utilisé (68HC11)',
        subtitle: 'Comprendre chaque instruction simplement : ce qu’elle fait, pourquoi on l’utilise et exemples concrets',
        durationMin: 16,
        pdfReference: '5- 68HC11.pdf · Diapos 18 à 26 + Mémo d’instructions 68HC11',
        whyItExists:
          'En apparence, le 68HC11 possède plus de 100 instructions. En pratique, une petite vingtaine de verbes d’action revient dans 95 % des exercices et programmes.',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'La boîte à outils du mécanicien bien classée par famille',
            body:
              'Au lieu d’apprendre 150 outils par cœur, classe-les en 5 gestes simples : (1) Prendre et poser (LDAA / STAA), (2) Calculer et compter (ADDA / SUBA / INCA / DECA), (3) Allumer ou éteindre un fil précis (BSET / BCLR), (4) Comparer et répéter une boucle (CMPA + BNE / BEQ), (5) Mettre de côté dans le sac (PSHA / PULA).',
          },
          simple: {
            title: 'Version simple',
            body:
              'Une instruction s’écrit toujours comme une phrase courte : « VERBE + DONNÉE OU ADRESSE ». Le préfixe indique comment lire la valeur : # veut dire « prends ce nombre directement » (Immédiat), $ veut dire « nombre en hexadécimal », % veut dire « en binaire ». Sans #, le processeur va chercher le contenu de la case mémoire indiquée.',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              '• 6 modes d’adressage : Inhérent (pas d’opérande, ex. INCA), Immédiat (LDAA #$20), Direct 8b page zéro $00–$FF (LDAA $20), Étendu 16b (LDAA $1024), Indexé offset + IX/IY (LDAA $10,X), Relatif -128..+127 (BNE LOOP). • Directives d’assemblage (lues par le compilateur, pas par le CPU) : ORG (adresse de départ), EQU (donner un surnom lisible à une adresse), FCB/FDB/FCC (constantes 8b/16b/texte), RMB (réserver N octets en RAM), END.',
            specs: [
              'Piège n°1 : LDAA #$10 met le nombre 16 dans A ; LDAA $10 lit ce qui se trouve dans la case RAM $0010 !',
              'BSET / BCLR / BRSET / BRCLR agissent directement sur une case mémoire ou un port en mode Direct ou Indexé',
              'Astuce Mémo DUT : maîtriser LD/ST, ADD/ADC/SUB, ASL/ASR, BCC/BCS/BEQ/BNE, PSHA/PULA (ou PHA/PLA)',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : La différence entre #20 et $20',
            body:
              'LDAA #$20 veut dire « mets le billet de 20 dans ta main A ». LDAA $20 veut dire « va ouvrir la boîte n°20 et prends ce qu’il y a dedans » ! Oublier le # est l’erreur la plus fréquente en 68HC11.',
          },
        },
        howItWorks: {
          summary:
            'Retiens cette méthode simple en 3 étapes pour écrire n’importe quel petit programme 68HC11 :',
          steps: [
            {
              label: '1. Donner des surnoms lisibles (EQU & ORG)',
              detail: 'PORTB EQU $1004 évite de retenir le numéro $1004. ORG $2000 indique à l’assembleur de ranger le code à partir de l’adresse $2000.',
              highlightBus: 'address',
            },
            {
              label: '2. Prendre → Calculer → Envoyer (LDAA / ADDA / STAA)',
              detail: 'On met un nombre dans A (LDAA), on fait un calcul dessus (ADDA, SUBA, ANDA…), puis on envoie le résultat vers la RAM ou les LEDs (STAA).',
              highlightBus: 'data',
            },
            {
              label: '3. Décider & Répéter (DECA / CMPA + BNE / BEQ)',
              detail: 'Après un calcul ou une comparaison, le CPU regarde le CCR (drapeaux Z ou C) et saute vers une étiquette pour boucler.',
              highlightBus: 'control',
            },
          ],
          courseNoteWarning: {
            title: 'Coquilles signalées dans le PDF 5 (Diapos 19 & 22)',
            detail:
              'Diapo 19 écrit « FDB, FDD, FCC » au lieu de FCB (1 octet), FDB (2 octets) et FCC (chaîne). Diapo 22 écrit « NZVD » au lieu de NZVC pour SUBD. Enfin dans certains anciens sujets, PHA/PLA sont utilisés comme alias de PSHA/PULA (notre Labo 68HC11 accepte les deux !).',
          },
        },
        deepDiveSections: [
          {
            title: 'Comment lire facilement une instruction 68HC11 ?',
            subtitle: 'Les 3 symboles à repérer avant de regarder la liste des instructions',
            accent: 'amber',
            paragraphs: [
              '• Le préfixe # (dièse) signifie « valeur directe » : LDAA #$05 met tout simplement le nombre 5 dans A. Sans #, LDAA $05 va ouvrir le tiroir mémoire n°05 et lit ce qui est caché dedans.',
              '• Les bases des nombres : $ devant un nombre = Hexadécimal (ex. $0F = 15) ; % devant un nombre = Binaire (ex. %00001111) ; rien = Décimal normal (ex. 15).',
              '• Les lettres à la fin du verbe indiquent quel registre travaille : la lettre A (ex. LDAA, ADDA, STAA, INCA) concerne la main A ; la lettre B concerne la main B ; D concerne les deux collées (16 bits) ; X ou Y concernent les pointeurs IX ou IY.',
            ],
          },
          {
            title: '1. Prendre, Poser & Sauvegarder (Transfert et Pile)',
            subtitle: 'Les instructions de base pour déplacer des données entre registres, RAM et LEDs',
            accent: 'blue',
            instructions: [
              {
                mnemonic: 'LDAA / LDAB',
                family: 'Prendre (8 bits)',
                action: 'Met un nombre ou le contenu d’une case mémoire dans la main A (ou B).',
                flags: 'Met à jour N, Z (V=0)',
                example: 'LDAA #$0F  |  LDAA $50',
                usageNote: 'LDAA #$0F met la valeur 15 dans A. LDAA $50 lit ce qui est stocké à l’adresse RAM $0050 et le copie dans A.',
              },
              {
                mnemonic: 'STAA / STAB',
                family: 'Poser (8 bits)',
                action: 'Copie le contenu de la main A (ou B) dans une case RAM ou vers un port de sortie.',
                flags: 'Met à jour N, Z (V=0)',
                example: 'STAA PORTB  |  STAA $60',
                usageNote: 'C’est l’instruction qui envoie ton résultat vers les LEDs (PORTB) ou le sauvegarde en RAM ($60).',
              },
              {
                mnemonic: 'LDD / STD / LDX / LDY',
                family: 'Prendre / Poser (16 bits)',
                action: 'Même principe que LDAA/STAA, mais déplace 2 octets d’un coup dans D, IX ou IY.',
                flags: 'Met à jour N, Z (V=0)',
                example: 'LDD #$1234  |  LDX #$1000',
                usageNote: 'Pratique pour manipuler un grand nombre (D) ou placer un pointeur au début d’un tableau ou des ports ($1000).',
              },
              {
                mnemonic: 'TAB / TBA / XGDX',
                family: 'Copier entre mains',
                action: 'TAB copie A dans B ; TBA copie B dans A ; XGDX échange le contenu de D et de IX.',
                flags: 'Met à jour N, Z (TAB/TBA)',
                example: 'TAB  |  XGDX',
                usageNote: 'Utile pour mettre une copie de A à l’abri dans B sans passer par la RAM.',
              },
              {
                mnemonic: 'PSHA / PULA (PHA / PLA)',
                family: 'Sac à dos (Pile SP)',
                action: 'PSHA pose A tout en haut de la Pile ; PULA reprend la dernière valeur posée dans A.',
                flags: 'Aucun',
                example: 'PSHA ... PULA',
                usageNote: 'Indispensable quand tu as besoin de la main A pour un autre calcul et veux retrouver sa valeur juste après.',
              },
            ],
          },
          {
            title: '2. Calculer, Modifier un fil & Boucler (Arithmétique, Bits et Sauts)',
            subtitle: 'Tout ce qu’il faut pour faire des compteurs, tests et boucles sur 68HC11',
            accent: 'emerald',
            instructions: [
              {
                mnemonic: 'ADDA / ADCA / SUBA',
                family: 'Addition / Soustraction',
                action: 'Ajoute (ou soustrait) un nombre ou une case mémoire à la main A, et garde le résultat dans A.',
                flags: 'H, N, Z, V, C',
                example: 'ADDA #$03  |  SUBA #$01',
                usageNote: 'ADDA #$03 fait A = A + 3. ADCA ajoute en plus l’ancienne retenue C (utile pour additionner des grands nombres sur plusieurs octets).',
              },
              {
                mnemonic: 'INCA / DECA',
                family: 'Compter +1 / -1',
                action: 'Ajoute 1 (INCA) ou enlève 1 (DECA) directement à la main A.',
                flags: 'N, Z, V (pas C)',
                example: 'DECA  |  BNE BOUCLE',
                usageNote: 'C’est le duo n°1 pour faire une boucle de comptage : à chaque tour on fait DECA, et quand A atteint 0 le drapeau Z passe à 1.',
              },
              {
                mnemonic: 'CMPA / CBA',
                family: 'Comparer sans modifier',
                action: 'Compare A avec un nombre (CMPA) ou avec B (CBA) en faisant une soustraction fictive : A reste intact !',
                flags: 'N, Z, V, C',
                example: 'CMPA #$0A  |  BEQ EGAL',
                usageNote: 'Sert uniquement à positionner les drapeaux (Z=1 si égal) juste avant un saut conditionnel BEQ ou BNE.',
              },
              {
                mnemonic: 'ANDA / ORAA / EORA',
                family: 'Masques binaires',
                action: 'Applique ET (ANDA), OU (ORAA) ou OU-Exclusif (EORA) bit par bit sur A.',
                flags: 'N, Z (V=0)',
                example: 'ANDA #$0F  |  ORAA #$80',
                usageNote: 'ANDA #$0F met les 4 bits de gauche à 0 et garde les 4 de droite ; ORAA #$80 allume le bit 7 sans toucher aux autres ; EORA inverse des bits.',
              },
              {
                mnemonic: 'BSET / BCLR',
                family: 'Allumer / Éteindre des bits',
                action: 'Met à 1 (BSET) ou à 0 (BCLR) les bits marqués par 1 dans le masque, directement sur une case mémoire ou un port.',
                flags: 'N, Z (V=0)',
                example: 'BSET PORTB, #%00110001',
                usageNote: 'Gros avantage du CISC : pas besoin de charger PORTB dans A ! BSET allume d’un coup les LEDs 5, 4 et 0.',
              },
              {
                mnemonic: 'BRSET / BRCLR',
                family: 'Tester un bit et sauter',
                action: 'Regarde si certains bits d’un port ou registre sont à 1 (BRSET) ou à 0 (BRCLR) et saute vers l’étiquette si c’est vrai.',
                flags: 'Aucun',
                example: 'BRCLR ADCTL, #$80, ATTENTE',
                usageNote: 'Très utilisé pour attendre qu’un périphérique finisse son travail en une seule ligne (scrutation).',
              },
              {
                mnemonic: 'ASLA / LSRA / ROLA',
                family: 'Décaler les bits',
                action: 'Décale tous les bits de A d’un cran vers la gauche (× 2) ou vers la droite (÷ 2).',
                flags: 'N, Z, V, C',
                example: 'ASLA  |  LSRA',
                usageNote: 'Très rapide pour multiplier ou diviser par 2, ou faire défiler un chenillard de LEDs.',
              },
              {
                mnemonic: 'BRA / BEQ / BNE / BCC / BCS',
                family: 'Sauts & Conditions',
                action: 'Saute à une étiquette : toujours (BRA), si égal/zéro Z=1 (BEQ), si différent Z=0 (BNE), si retenue C=0 (BCC) ou C=1 (BCS).',
                flags: 'Aucun',
                example: 'BNE BOUCLE  |  BRA FIN',
                usageNote: 'Permet de répéter un bloc tant que le compteur n’est pas arrivé à 0, ou de choisir entre deux chemins.',
              },
              {
                mnemonic: 'JSR / BSR / RTS / RTI',
                family: 'Sous-programmes & IT',
                action: 'JSR/BSR appelle un petit sous-programme (ex. temporisation) en retenant l’adresse de retour ; RTS revient à l’appelant.',
                flags: 'RTI restaure tout',
                example: 'JSR TEMPO  |  RTS',
                usageNote: 'Évite de réécrire dix fois le même morceau de code. RTI s’utilise à la fin d’une routine d’interruption.',
              },
            ],
          },
        ],
        simulationId: 'link-lab-68hc11',
        checkpoint: {
          id: 'chk-5-2',
          question: 'Quelle différence y a-t-il entre LDAA #$10 et LDAA $10 sur le 68HC11 ?',
          options: [
            {
              id: 'a',
              label: 'Aucune, les deux mettent la valeur hexadécimale 10 dans A',
              isCorrect: false,
              feedback: 'Attention ! Le symbole # change complètement le mode d’adressage.',
            },
            {
              id: 'b',
              label: 'LDAA #$10 charge le nombre $10 (16) dans A ; LDAA $10 lit l’octet rangé à l’adresse RAM $0010',
              isCorrect: true,
              feedback: 'Bravo ! # = adressage Immédiat (la donnée est là) ; sans # = adressage Direct (c’est une adresse).',
            },
            {
              id: 'c',
              label: 'LDAA $10 multiplie A par 10',
              isCorrect: false,
              feedback: 'LDAA ne fait jamais de multiplication : c’est un chargement depuis la mémoire.',
            },
          ],
          hint: 'Repère la différence entre mode Immédiat (#) et mode Direct.',
        },
        keyTakeaways: [
          '6 modes d’adressage : Inhérent, Immédiat (#), Direct ($xx), Étendu ($xxxx), Indexé (off,X), Relatif.',
          'Directives (ORG, EQU, FCB, FDB, FCC, RMB, END) guident l’assembleur sans produire d’instructions CPU.',
          'Maîtriser LDAA/STAA, ADDA/SUBA/CMPA, INCA/DECA, BSET/BCLR/BRCLR, BNE/BEQ/BCC/BCS et PSHA/PULA.',
        ],
        glossaryKeys: ['decodeur-adresse', 'espace-adressable'],
      },
      {
        id: '5-3-68hc11-peripheriques',
        moduleId: 'module-5',
        number: '5.3',
        title: 'Périphériques du 68HC11 : Ports (DDR), CAN & Série SCI',
        subtitle: 'Configurer les entrées/sorties, convertir une tension et communiquer en RS232',
        durationMin: 12,
        pdfReference: '5- 68HC11.pdf · Diapos 10 à 17',
        whyItExists:
          'Un microcontrôleur n’est utile que s’il pilote des broches physiques (LEDs, relais, capteurs analogiques et PC via liaison série).',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'Les 5 portes de la maison, la balance électronique et le téléphone',
            body:
              'Le 68HC11 a 5 portes (Ports A à E) : la porte B ne sert qu’à sortir (LEDs), la porte E ne sert qu’à écouter des mesures continues (CAN), la porte C choisit pour chaque broche si elle entre ou sort grâce au concierge DDRC, et la porte D parle au PC par téléphone (liaison série SCI).',
          },
          simple: {
            title: 'Version simple',
            body:
              'Les registres de périphériques résident entre $1000 et $103F. • Ports A–E : PORTB ($1004) est toujours en sortie ; PORTE ($100A) toujours en entrée (partagé avec le CAN) ; PORTC ($1003) et PORTD ($1008) ont un registre de direction DDRC/DDRD (0=Entrée, 1=Sortie). • CAN 8 bits (8 canaux sur PORTE) : piloté par ADCTL ($1030), résultats dans ADR1–ADR4. • Liaison série SCI : TXD=PD1, RXD=PD0, réglée par BAUD, SCCR1, SCCR2, SCSR et SCDR.',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              '• Ports : PORTA ($1000, Timer/PA) ; PORTB ($1004, 8 sorties fixes) ; PORTC ($1003, DDRC $1007 : 0=E, 1=S ; PORTCL $1005 verrouillé sur STRA) ; PORTD ($1008, 6 bits PD0..PD5, DDRD $1009) ; PORTE ($100A, 8 entrées). • CAN 8 bits : OPTION.ADPU ($1039) alimente le CAN ; ADCTL ($1030) : CCF (fin conv.), SCAN (1=continu), MUX (1=salve 4 voies, 0=1 voie), CD..CA ; résultats dans ADR1..ADR4 ($1031–$1034). • SCI asynchrone (MAX232 pour RS232) : SCDR ($102F), BAUD ($102B), SCCR1 ($102C, M=0 → 8b), SCCR2 ($102D, TE/RE/TIE/RIE), SCSR ($102E, TDRE=émission vide, RDRF=réception pleine, OR, FE).',
            specs: [
              'Sens DDR (68HC11) : 0 = Entrée, 1 = Sortie (INVERSE du TRIS du PIC !)',
              'CAN : BRCLR ADCTL, #$80, ATTENTE attend que CCF (bit 7) passe à 1',
              'SCI : dès que TE ou RE=1, PD1=TXD (sortie) et PD0=RXD (entrée) ignorent DDRD',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Attention au sens 0 et 1 entre 68HC11 et PIC !',
            body:
              'Moyen mnémotechnique d’examen : sur 68HC11 (DDR), 1 = Sortie (comme Output/ON), 0 = Entrée. Sur PIC (TRIS), 1 ressemble à I (Input = Entrée) et 0 ressemble à O (Output = Sortie) !',
          },
        },
        howItWorks: {
          summary:
            'Retiens ces trois schémas de programmation rapides sur 68HC11 :',
          steps: [
            {
              label: '1. Configurer un port bidirectionnel (DDR)',
              detail: 'Mettre 1 dans DDRC/DDRD pour une sortie, 0 pour une entrée. PORTB est déjà en sortie câblée.',
              highlightBus: 'control',
            },
            {
              label: '2. Lire le Convertisseur A/N (ADCTL)',
              detail: 'Allumer ADPU (OPTION), écrire canal dans ADCTL, attendre CCF=1 (bit 7) puis lire ADR1 ($1031).',
              highlightBus: 'data',
            },
            {
              label: '3. Envoyer/Recevoir sur SCI',
              detail: 'Attendre TDRE=1 avant d’écrire dans SCDR ; attendre RDRF=1 avant de lire SCDR.',
              highlightBus: 'address',
            },
          ],
          courseNoteWarning: {
            title: 'Coquille signalée dans le PDF 5 (Diapos 13 & 17)',
            detail:
              'La diapo 13 titre « PORT D » juste avant le CAN alors que le CAN est bien connecté au PORT E (PE0–PE7, cf. diapos 5, 12 et 14). La diapo 17 écrit « IDEI » au lieu de IDLE dans SCSR.',
          },
        },
        simulationId: 'link-lab-68hc11',
        checkpoint: {
          id: 'chk-5-3',
          question: 'Sur le 68HC11, quelle valeur écrire dans DDRC ($1007) pour mettre PC0..PC3 en SORTIE et PC4..PC7 en ENTRÉE ?',
          options: [
            {
              id: 'a',
              label: '%00001111 ($0F)',
              isCorrect: true,
              feedback: 'Exact ! Sur 68HC11, DDR bit = 1 signifie Sortie et bit = 0 signifie Entrée.',
            },
            {
              id: 'b',
              label: '%11110000 ($F0)',
              isCorrect: false,
              feedback: 'Attention, ça c’est la convention TRIS du PIC16F887 (1=Entrée, 0=Sortie) ! Sur 68HC11 c’est l’inverse.',
            },
            {
              id: 'c',
              label: 'Il n’y a pas de registre DDRC sur le 68HC11',
              isCorrect: false,
              feedback: 'DDRC réside bien à l’adresse $1007.',
            },
          ],
          hint: 'Vérifie la règle DDRD/DDRC du cours : 0 = Entrée, 1 = Sortie.',
        },
        keyTakeaways: [
          'DDR (68HC11) : 1 = Sortie, 0 = Entrée (PORTB = sortie fixe, PORTE = entrée fixe).',
          'CAN 8 bits : ADCTL ($1030), fin de conversion CCF (bit 7), résultats ADR1–ADR4.',
          'SCI : BAUD, SCCR1, SCCR2 (TE/RE), SCSR (TDRE/RDRF) et SCDR.',
        ],
        glossaryKeys: ['interface-es', 'cartographie-memoire'],
      },
    ],
  },
  {
    id: 'module-6',
    number: 6,
    title: 'Architecture RISC : Le Microcontrôleur PIC16F887 en détail',
    shortTitle: 'RISC · PIC16F887',
    description:
      'Principe RISC Harvard & Pipeline, registre W, les 4 banques RP1:RP0, jeu complet des 35 instructions ({W,F?d}) et périphériques (ANSEL, Timer0, ADC, USART).',
    status: 'available',
    pdfSources: [
      '6- Exemple d architecture RISC-PIC16F887.pdf',
      '10189630.pdf',
      'TP_Systeme_Embarque_L2GE.pdf',
    ],
    lessons: [
      {
        id: '6-1-pic-principe-harvard-banques',
        moduleId: 'module-6',
        number: '6.1',
        title: 'Principe RISC, Pipeline Harvard & Les 4 Banques (RP1:RP0)',
        subtitle: 'Comment le PIC exécute 1 instruction par cycle et pourquoi il découpe sa RAM en 4 banques',
        durationMin: 16,
        pdfReference: '6- PIC16F887.pdf · Diapos 4 à 11',
        whyItExists:
          'Pourquoi le PIC16F887 n’a-t-il que 35 instructions et oblige-t-il à changer de banque sans arrêt ? Tout découle du format fixe de 14 bits de son architecture RISC Harvard !',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'La chaîne de montage à 2 postes et l’armoire à 4 tiroirs',
            body:
              'Le PIC16F887 est comme une usine ultra-rapide avec deux tapis roulants séparés (Harvard) : pendant qu’un ouvrier exécute l’ordre actuel, son collègue lit déjà l’ordre suivant (Pipeline !). Tous les calculs passent par sa main unique W. Et comme ses fiches d’ordre sont courtes, sa mémoire de données est rangée dans une armoire à 4 tiroirs (Banques 0, 1, 2, 3) : il faut d’abord ouvrir le bon tiroir avec RP1 et RP0 !',
          },
          simple: {
            title: 'Version simple',
            body:
              'Le PIC16F887 est un microcontrôleur RISC à architecture Harvard : 8 K mots de 14 bits pour le programme (Flash) et 368 octets de RAM pour les données. Grâce au pipeline à 2 étages, chaque instruction s’exécute en 1 cycle machine Tcy = 4 Tosc (2 cycles seulement pour un saut GOTO/CALL). L’instruction ne codant que 7 bits d’adresse RAM (00h–7Fh), il faut choisir la banque (0 à 3) via les bits RP1:RP0 du registre STATUS.',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              '• Principe RISC & Pipeline : 35 instructions orthogonales de 14 bits ; décodage câblé ; cycle instruction Q1–Q4 (Tcy = 4·Tosc, soit 5 MIPS à Fosc = 20 MHz). • Harvard : Bus Programme 14b + PC 13b (pages de 2K) + Pile matérielle dédiée à 8 niveaux (invisible en RAM) séparés du Bus Données 8b. • Registre W (Working) : passage obligé de toute constante et opération arithmétique. • 4 Banques via STATUS<6:5> = RP1:RP0 (00=B0, 01=B1, 10=B2, 11=B3) : Banque 0 (PORTA..E, TMR0, INTCON, PIR1, ADRESH, ADCON0) · Banque 1 (TRISA..E, OPTION_REG, PIE1, ADRESL, ADCON1) · Banque 2 (EEDAT, EEADR) · Banque 3 (ANSEL 188h, ANSELH 189h). Zone commune 70h–7Fh accessible dans les 4 banques. • Adressage indirect : pointeur 9 bits = IRP (STATUS<7>) : FSR (04h) utilisé via le registre fictif INDF (00h).',
            specs: [
              'Banque 0 (RP1=0, RP0=0) : PORTA..PORTE, INTCON, ADCON0, TMR0',
              'Banque 1 (RP1=0, RP0=1) : TRISA..TRISE (1=Entrée, 0=Sortie), OPTION_REG, ADCON1',
              'Banque 3 (RP1=1, RP0=1) : ANSEL / ANSELH (0=Numérique, 1=Analogique au Reset !)',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : L’immeuble à 4 étages identiques',
            body:
              'Les numéros de porte (05h, 06h, 08h) sont les mêmes à chaque étage ! L’ascenseur (RP1:RP0) décide si la porte 08h est PORTD (étage 0) ou TRISD (étage 1). Les escaliers de secours (70h–7Fh) sont les seuls accessibles depuis tous les étages !',
          },
        },
        howItWorks: {
          summary:
            'Retiens cette séquence d’initialisation en 3 étapes qui revient dans presque tous les TP L2GE :',
          steps: [
            {
              label: '1. Banque 3 (RP1=1, RP0=1) → ANSEL = 0',
              detail: 'Au démarrage, les broches RA/RB/RE sont en mode analogique (ANSEL=FFh) : il faut mettre ANSEL=0 pour lire des boutons numériques.',
              highlightBus: 'control',
            },
            {
              label: '2. Banque 1 (RP1=0, RP0=1) → TRISx',
              detail: 'Configurer le sens des ports : 1 = Entrée (bouton), 0 = Sortie (LED).',
              highlightBus: 'address',
            },
            {
              label: '3. Banque 0 (RP1=0, RP0=0) → PORTx',
              detail: 'Revenir en Banque 0 pour lire PORTA/PORTB ou piloter PORTD dans la boucle principale.',
              highlightBus: 'data',
            },
          ],
          courseNoteWarning: {
            title: 'Erreur détectée dans le polycopié 10189630 (p. 28)',
            detail:
              'Dans la macro BANK0 du document 10189630, il est écrit deux fois « bcf STATUS, RP0 » au lieu de « bcf STATUS, RP0 » et « bcf STATUS, RP1 ». Pense toujours à effacer les DEUX bits RP1 et RP0 pour revenir en Banque 0 depuis la Banque 2 ou 3 !',
          },
        },
        deepDiveSections: [
          {
            title: 'Les mémoires de travail du PIC16F887 (À quoi sert chaque mémoire ?)',
            subtitle: 'Le registre W, la RAM en 4 tiroirs (SFR, GPR, zone commune), la Flash, l’EEPROM et la Pile',
            accent: 'blue',
            paragraphs: [
              '1. Le registre de travail W (Working Register, 8 bits) : c’est la seule « main » du PIC ! Contrairement au 68HC11 qui a A et B, le PIC n’a que W. Tu ne peux jamais écrire directement un nombre fixe dans une case mémoire : tu le mets d’abord dans W, puis tu le déposes dans la case.',
              '2. La RAM Données (368 octets répartis en 4 tiroirs / Banques) : elle contient deux sortes de cases. Les SFR (Special Function Registers) sont les boutons de commande du matériel (PORTA, TRISA, STATUS, ANSEL…). Les GPR (General Purpose Registers) sont tes cases brouillon pour ranger tes propres variables (compteur, temporisation…). Comme l’ardoise RAM est effacée au redémarrage, elle sert uniquement au travail en cours.',
              '3. La zone commune 70h–7Fh (16 octets de RAM) : ce sont 16 cases spéciales accessibles quel que soit le tiroir (Banque 0, 1, 2 ou 3) ouvert ! On s’en sert beaucoup pour sauvegarder W lors d’une interruption.',
              '4. La mémoire Programme Flash (8 K mots de 14 bits) : totalement séparée de la RAM (architecture Harvard). C’est là que ton programme compilé reste gravé même sans courant.',
              '5. L’EEPROM Données (256 octets) : un petit carnet persistant accessible via les registres de Banque 2/3 pour garder des réglages (ex. seuil de température, score) quand on éteint le montage.',
              '6. La Pile matérielle (8 niveaux) : une petite pile isolée de la RAM, réservée uniquement à retenir jusqu’à 8 adresses de retour quand le programme utilise CALL ou reçoit une interruption.',
            ],
          },
          {
            title: 'Comment fonctionne le Pipeline & le cycle Tcy du PIC16F887 ?',
            subtitle: 'Pourquoi chaque instruction prend 1 cycle (et 2 pour un saut)',
            accent: 'emerald',
            paragraphs: [
              '1. Horloge divisée par 4 (Tcy = 4 × Tosc) : chaque instruction est exécutée en 4 petits temps (lire le code, lire les données, calculer dans l’UAL, écrire le résultat). Avec un quartz à 20 MHz, le PIC exécute 5 millions d’instructions par seconde.',
              '2. Pipeline à 2 étages : pendant que le processeur exécute une instruction dans son UAL, il lit déjà la suivante dans la mémoire Programme grâce aux deux bus séparés Harvard.',
              '3. Cas des sauts (GOTO, CALL, RETURN) : quand le programme saute ailleurs, l’instruction qui avait été pré-lue juste après ne sert plus à rien ; le processeur l’ignore et recharge la nouvelle cible → le saut prend 2 cycles au lieu d’un.',
            ],
          },
        ],
        simulationId: 'link-lab-pic16f887',
        checkpoint: {
          id: 'chk-6-1',
          question: 'Tu veux configurer PORTD en sortie avec CLRF TRISD, mais tu as laissé RP1=0 et RP0=0. Que se passe-t-il en réalité ?',
          options: [
            {
              id: 'a',
              label: 'TRISD passe bien à 0 car l’assembleur change de banque tout seul',
              isCorrect: false,
              feedback: 'L’instruction machine ne code que les 7 bits bas (08h) ! Sans BSF STATUS, RP0, le CPU reste en Banque 0.',
            },
            {
              id: 'b',
              label: 'Tu effaces par erreur PORTD (Banque 0, même offset 08h) au lieu de TRISD (Banque 1)',
              isCorrect: true,
              feedback: 'Exact ! C’est l’erreur classique sur PIC : même offset 08h, mais mauvais tiroir (Banque 0 au lieu de Banque 1).',
            },
            {
              id: 'c',
              label: 'Le PIC déclenche un Reset matériel immédiat',
              isCorrect: false,
              feedback: 'Non, le matériel écrit silencieusement à l’adresse 008h (PORTD).',
            },
          ],
          hint: 'PORTD est à 008h (Banque 0) et TRISD à 088h (Banque 1). Quel registre sélectionne la banque ?',
        },
        keyTakeaways: [
          'Architecture RISC Harvard : Bus Programme 14 bits et Bus Données 8 bits indépendants, pipeline 2 étages.',
          'Mémoires de travail : main unique W, RAM 368 octets (SFR + GPR + zone commune 70h–7Fh), Flash 8K×14b, EEPROM 256 octets et Pile matérielle 8 niveaux.',
          '4 Banques pilotées par STATUS<6:5> = RP1:RP0 : toujours vérifier le tiroir avant TRISx, PORTx ou ANSEL !',
          'Zone commune 70h–7Fh et FSR/INDF permettent l’accès multi-banque et les tableaux.',
        ],
        glossaryKeys: ['harvard', 'bus-donnees'],
      },
      {
        id: '6-2-pic-jeu-instructions',
        moduleId: 'module-6',
        number: '6.2',
        title: 'Jeu des 35 instructions du PIC16F887 (Expliqué simplement)',
        subtitle: 'Comprendre la règle W vs F et maîtriser concrètement les instructions des TP L2GE',
        durationMin: 16,
        pdfReference: '6- PIC16F887.pdf · Diapos 15 à 18',
        whyItExists:
          'Bonne nouvelle : le PIC16F887 n’a que 35 instructions au total ! Si tu comprends le rôle de la main W et du choix final « , W » ou « , F », tout devient limpide.',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'La règle d’or « Main W » vs « Case F »',
            body:
              'Sur le PIC, il n’y a qu’une seule main W (Working). Pour déplacer un nombre dans un tiroir F, tu dois d’abord le mettre dans ta main W (MOVLW) puis le poser dans F (MOVWF). Et quand tu fais un calcul sur F, le petit choix « ,W » ou « ,F » décide si tu gardes le résultat dans ta main (W) ou si tu le ranges dans le tiroir (F) !',
          },
          simple: {
            title: 'Version simple',
            body:
              'Dans le PIC16F887, la lettre W désigne toujours ta main de travail, la lettre F désigne une case mémoire (comme PORTA ou un compteur), et la lettre K (ou L pour Literal) désigne un nombre fixe écrit dans le code (comme 0x0F). Quand une instruction demande « , W » ou « , F » à la fin, tu choisis simplement où ranger le résultat : dans ta main W ou dans la case F !',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              '• Convention {W, F ? d} : dans ADDWF F,d / MOVF F,d / INCF F,d / DECFSZ F,d, d=0 (écrit ,W) place le résultat dans W sans modifier F ; d=1 (écrit ,F) écrase F avec le résultat. • Règles clés : (a) Pas d’écriture directe constante → RAM : toujours MOVLW K puis MOVWF F. (b) Toujours écrire MOVF PORTA, W pour copier un port dans W. (c) SUBLW K calcule K − W (et non W − K). (d) BTFSC / BTFSS / DECFSZ / INCFSZ prennent 1 cycle si aucun saut, 2 cycles si l’instruction suivante est sautée.',
            specs: [
              'W (d = 0) → résultat gardé dans le registre de travail W (la case F reste intacte)',
              'F (d = 1) → résultat rangé directement dans la case mémoire F',
              'Durée : 1 Tcy partout, sauf sauts/retours/skips pris qui durent 2 Tcy',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Le piège du « ,W » oublié dans MOVF',
            body:
              'Écrire « MOVF PORTA, W » veut dire « lis PORTA et mets-le dans ma main W ». Si tu oublies « , W », le PIC lit PORTA et le remet dans PORTA : W ne reçoit rien !',
          },
        },
        howItWorks: {
          summary:
            'Voici les 3 réflexes de base pour écrire tes programmes PIC16F887 sans hésiter :',
          steps: [
            {
              label: '1. Mettre une valeur fixe dans une case : MOVLW puis MOVWF',
              detail: 'Exemple : MOVLW 0x0F met 15 dans ta main W, puis MOVWF TRISA recopie ta main dans TRISA.',
              highlightBus: 'data',
            },
            {
              label: '2. Allumer ou éteindre 1 seul bit : BSF / BCF',
              detail: 'BSF STATUS, RP0 met le bit RP0 à 1 (ouvre la Banque 1) ; BCF STATUS, RP0 le remet à 0.',
              highlightBus: 'control',
            },
            {
              label: '3. Tester un bouton ou compter : BTFSC / DECFSZ',
              detail: 'BTFSC PORTD, 0 teste la broche RD0 et saute la ligne suivante si RD0 vaut 0 !',
              highlightBus: 'address',
            },
          ],
        },
        deepDiveSections: [
          {
            title: 'Comment décoder les noms bizarres du PIC en 5 secondes ?',
            subtitle: 'Les 4 lettres magiques : L (nombre fixe), W (ta main), F (une case), B (un seul bit)',
            accent: 'blue',
            paragraphs: [
              '• L = Literal (un nombre fixe écrit dans le code, ex. 0x0F). Ainsi MOVLW 0x0F signifie « Move Literal to W » = mets le nombre 0x0F dans ma main W.',
              '• W = Working (ta main de travail) et F = File (n’importe quelle case mémoire : PORTA, TRISD, ou une variable comme COMPTEUR). Ainsi MOVWF TRISD signifie « Move W to F » = pose ce que j’ai dans ma main W dans la case TRISD.',
              '• Le choix final « , W » ou « , F » : sur des instructions comme INCF COMPTEUR, F ou MOVF PORTA, W, la lettre après la virgule te dit où poser le résultat. Exemple : INCF COMPTEUR, F ajoute 1 à COMPTEUR et le range dans COMPTEUR ; INCF COMPTEUR, W calcule COMPTEUR + 1 mais le range dans W sans changer COMPTEUR !',
              '• B = Bit (un seul interrupteur sur 8, numéroté de 0 à 7). BSF = Bit Set F (mettre à 1), BCF = Bit Clear F (mettre à 0), BTFSC/BTFSS = tester ce bit et sauter l’instruction suivante.',
            ],
          },
          {
            title: '1. Déplacer des nombres & Calculer (Constantes et Cases RAM)',
            subtitle: 'Les instructions les plus utilisées pour lire des ports, masquer des bits et compter',
            accent: 'emerald',
            instructions: [
              {
                mnemonic: 'MOVLW K',
                family: 'Mettre un nombre dans W',
                action: 'Met directement le nombre fixe K dans ta main de travail W.',
                flags: 'Aucun',
                example: "MOVLW B'00001111'  |  MOVLW 0x20",
                usageNote: 'Point de départ obligatoire avant de remplir n’importe quel registre (TRIS, ADCON, variable…).',
              },
              {
                mnemonic: 'MOVWF F',
                family: 'Poser W dans une case',
                action: 'Copie ce qu’il y a dans ta main W vers la case mémoire ou le port F.',
                flags: 'Aucun',
                example: 'MOVWF TRISA  |  MOVWF PORTD',
                usageNote: 'Sert juste après MOVLW (pour configurer un port) ou pour allumer les LEDs de PORTD.',
              },
              {
                mnemonic: 'MOVF F, d',
                family: 'Lire une case',
                action: 'Lit la case F. Avec « , W », met sa valeur dans W. Avec « , F », teste juste si F vaut 0.',
                flags: 'Z (passe à 1 si vaut 0)',
                example: 'MOVF PORTA, W',
                usageNote: 'Toujours écrire « , W » quand tu veux lire les boutons d’un port d’entrée dans W !',
              },
              {
                mnemonic: 'CLRF F / CLRW',
                family: 'Mettre à zéro',
                action: 'Efface complètement la case F (CLRF) ou ta main W (CLRW) en y mettant 0.',
                flags: 'Z = 1',
                example: 'CLRF ANSEL  |  CLRF TRISD',
                usageNote: 'Ultra-pratique pour passer PORTA en numérique (CLRF ANSEL) ou mettre toutes les broches en sortie (CLRF TRISD).',
              },
              {
                mnemonic: 'ADDLW / SUBLW / ANDLW / IORLW',
                family: 'Calcul avec un nombre',
                action: 'Additionne, soustrait (K − W), fait un ET (ANDLW) ou un OU (IORLW) entre W et un nombre K, puis garde le résultat dans W.',
                flags: 'C, DC, Z',
                example: 'ANDLW 0x0F',
                usageNote: 'ANDLW 0x0F garde uniquement les 4 bits de droite (ex. boutons RA0..RA3) et efface les 4 de gauche.',
              },
              {
                mnemonic: 'ADDWF / SUBWF / INCF / DECF',
                family: 'Calcul sur une case',
                action: 'Calcule W + F, F − W, F + 1 ou F − 1, puis range le résultat dans W (avec ,W) ou dans F (avec ,F).',
                flags: 'C, DC, Z',
                example: 'INCF FSR, F  |  ADDWF COMPTEUR, W',
                usageNote: 'INCF FSR, F fait avancer ton pointeur d’une case dans un tableau en RAM.',
              },
              {
                mnemonic: 'DECFSZ / INCFSZ F, d',
                family: 'Boucle de répétition',
                action: 'Enlève 1 à la case F (DECFSZ) ; si le résultat tombe à 0, saute l’instruction juste en dessous !',
                flags: 'Aucun',
                example: 'DECFSZ CPT, F  |  GOTO BOUCLE',
                usageNote: 'C’est l’outil n°1 pour répéter une action N fois ou fabriquer une temporisation (ex. attendre 5 ms en TP2/TP3).',
              },
              {
                mnemonic: 'SWAPF / RLF / RRF F, d',
                family: 'Échanger / Décaler',
                action: 'SWAPF inverse les 4 bits de gauche et les 4 de droite. RLF/RRF décale les bits d’un cran via la retenue C.',
                flags: 'C (pour RLF/RRF)',
                example: 'SWAPF PORTD, W',
                usageNote: 'SWAPF est très utile en TP4 (LCD 4 bits) pour envoyer les 4 bits bas juste après les 4 bits hauts.',
              },
            ],
          },
          {
            title: '2. Agir sur 1 seul bit & Diriger le programme',
            subtitle: 'Ouvrir les banques, tester un bouton et appeler des sous-programmes',
            accent: 'amber',
            instructions: [
              {
                mnemonic: 'BSF F, b',
                family: 'Mettre 1 bit à 1',
                action: 'Met uniquement le bit numéro b (de 0 à 7) de la case F à 1 sans toucher aux 7 autres bits.',
                flags: 'Aucun',
                example: 'BSF STATUS, RP0  |  BSF ADCON0, GO',
                usageNote: 'Sert à ouvrir une Banque (RP0/RP1), allumer une seule LED précise ou lancer une mesure ADC.',
              },
              {
                mnemonic: 'BCF F, b',
                family: 'Mettre 1 bit à 0',
                action: 'Met uniquement le bit numéro b de la case F à 0 sans toucher aux autres.',
                flags: 'Aucun',
                example: 'BCF STATUS, RP0  |  BCF INTCON, INTF',
                usageNote: 'Sert à refermer une Banque, éteindre une seule LED ou effacer un drapeau d’interruption.',
              },
              {
                mnemonic: 'BTFSC F, b',
                family: 'Tester si bit = 0',
                action: 'Regarde le bit b : s’il vaut 0, saute l’instruction suivante ! S’il vaut 1, exécute la ligne suivante normalement.',
                flags: 'Aucun',
                example: 'BTFSC PORTD, 0  |  GOTO MODE_NUIT',
                usageNote: '« Skip if Clear » : très utilisé pour tester un interrupteur (TP3 Jour/Nuit) ou attendre la fin de l’ADC (GO=0).',
              },
              {
                mnemonic: 'BTFSS F, b',
                family: 'Tester si bit = 1',
                action: 'Regarde le bit b : s’il vaut 1, saute l’instruction suivante ! Sinon, exécute la ligne suivante.',
                flags: 'Aucun',
                example: 'BTFSS PIR1, RCIF  |  GOTO ATTENTE',
                usageNote: '« Skip if Set » : permet d’attendre qu’un événement soit prêt (drapeau passé à 1).',
              },
              {
                mnemonic: 'GOTO L / CALL L',
                family: 'Aller ailleurs',
                action: 'GOTO saute définitivement à l’étiquette L. CALL va exécuter un sous-programme L puis reviendra au retour.',
                flags: 'Aucun',
                example: 'CALL TEMPO  |  GOTO BOUCLE',
                usageNote: 'CALL retient l’adresse de retour dans la Pile 8 niveaux pour pouvoir revenir juste après.',
              },
              {
                mnemonic: 'RETURN / RETLW K / RETFIE',
                family: 'Revenir',
                action: 'RETURN revient d’un CALL. RETLW K revient avec le nombre K dans W. RETFIE termine une interruption.',
                flags: 'RETFIE remet GIE=1',
                example: 'RETLW 0x3F  |  RETFIE',
                usageNote: 'RETLW sert à créer des tables de correspondance (chiffre → segments en TP2). RETFIE réactive les interruptions.',
              },
            ],
          },
        ],
        simulationId: 'link-lab-pic16f887',
        checkpoint: {
          id: 'chk-6-2',
          question: 'Dans le code « BTFSC PORTD, 0 » suivi de « GOTO MODE_NUIT », quand est-ce que le PIC exécute GOTO MODE_NUIT ?',
          options: [
            {
              id: 'a',
              label: 'Quand le bit RD0 de PORTD vaut 1',
              isCorrect: true,
              feedback: 'Exact ! BTFSC saute (ignore) l’instruction suivante si le bit est à 0 (Clear). Donc si RD0 = 1, il ne saute pas et exécute bien GOTO MODE_NUIT !',
            },
            {
              id: 'b',
              label: 'Quand le bit RD0 de PORTD vaut 0',
              isCorrect: false,
              feedback: 'Attention au sens de Skip if Clear : si RD0 = 0, l’instruction GOTO MODE_NUIT est sautée !',
            },
            {
              id: 'c',
              label: 'Toujours, quel que soit RD0',
              isCorrect: false,
              feedback: 'BTFSC est un test conditionnel de bit.',
            },
          ],
          hint: 'Décompose l’acronyme : Bit Test F, Skip if Clear (saute l’instruction suivante si le bit vaut 0).',
        },
        keyTakeaways: [
          'Règle {W,F?d} : d=0 (W) range le résultat dans W ; d=1 (F) le réécrit dans F.',
          'Toujours passer par W (MOVLW / MOVWF) pour initialiser un registre avec une constante.',
          'BSF, BCF, BTFSC, BTFSS sont les 4 outils centraux des TP (banques, boutons, drapeaux).',
          'DECFSZ + GOTO crée les boucles ; CALL + RETLW crée les tables de conversion (ex. 7 segments).',
        ],
        glossaryKeys: ['harvard', 'unite-centrale'],
      },
      {
        id: '6-3-pic-peripheriques',
        moduleId: 'module-6',
        number: '6.3',
        title: 'Périphériques PIC16F887 : Ports/ANSEL, Timer0, ADC & USART',
        subtitle: 'Comprendre la configuration matérielle des TP2 à TP5 L2GE',
        durationMin: 14,
        pdfReference: '6- PIC16F887.pdf · Diapos 13–14, 19–37',
        whyItExists:
          'Tous les TP L2GE (7 segments, feux tricolores, afficheur LCD, thermomètre TMP36 et RS232) reposent directement sur ces 4 périphériques internes du PIC16F887.',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'Le portier (TRIS/ANSEL), le chronomètre (Timer0), la règle graduée (ADC) et le talkie-walkie (USART)',
            body:
              'ANSEL ouvre les volets numériques. Timer0 compte les battements comme un chronomètre qui sonne quand il arrive à 255 (T0IF). L’ADC mesure une tension analogique (comme la température du TMP36) sur une règle de 0 à 1023. Et l’USART envoie les lettres une par une sur RC6/TX et les reçoit sur RC7/RX.',
          },
          simple: {
            title: 'Version simple',
            body:
              '• Ports & ANSEL : 36 broches sur 5 ports (A–E) ; ANSEL/ANSELH = 0 pour le numérique, TRISx (1=E, 0=S). • Timer0 : compteur 8 bits incrémenté par Fosc/4 (T0CS=0) ou RA4 (T0CS=1) avec prédiviseur PSA/PS2:0 dans OPTION_REG ; lève T0IF au débordement. • ADC 10 bits (14 canaux) : piloté par ADCON0 (canal CHS, GO/DONE, ADON) et ADCON1 (ADFM justification droite/gauche) → résultat sur ADRESH:ADRESL. • USART RS232 : RC6/TX et RC7/RX (TRISC mis en entrée !), vitesse via SPBRG + BRGH, buffers TXREG/RCREG et drapeaux PIR1.TXIF/RCIF.',
          },
          technical: {
            title: 'Version technique du cours',
            body:
              '• Timer0 (Banque 0 TMR0, Banque 1 OPTION_REG) : T0CS (0=Fosc/4, 1=RA4/T0CKI), T0SE (front), PSA (0=prescaler affecté au Timer0, 1=au WDT), PS<2:0> (rapport 1:2 à 1:256). • ADC 10 bits (ADCON1 en B1, ADCON0 en B0) : pas q = (Vref+ − Vref−) / 1024 ; attendre temps d’acquisition 12 µs, mettre GO/DONE=1, attendre GO/DONE=0 (ou ADIF=1), lire ADRESH:ADRESL (ADFM=1 justifié à droite). • EUSART asynchrone : trame 1 Start (0) + 8/9 bits LSB d’abord + 1 Stop (1). Configurer RC6 et RC7 en ENTRÉE dans TRISC (Diapo 27). RCREG est une FIFO à 2 niveaux (erreur OERR si 3e octet arrive avant lecture → reset via CREN=0 puis CREN=1 ; erreur FERR si bit STOP=0).',
            specs: [
              'Timer0 : T_deb = (4 / Fosc) × Prescaler × (256 − TMR0_init)',
              'ADC 10 bits : résultat dans [0..1023] ; TP5 : T(°C) = (mV − 500) / 10',
              'USART : RC6/TX et RC7/RX configurés en entrée par TRISC ; TXIF=1 quand TXREG vide ; RCIF=1 quand octet reçu',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Pourquoi RC6/TX se configure en entrée dans TRISC ?',
            body:
              'C’est une règle stricte de la datasheet Microchip reprise dans la diapo 27 : en configurant TRISC<7:6> = 11, le module matériel USART prend automatiquement le contrôle exclusif des broches RC6 (en sortie TX) et RC7 (en entrée RX).',
          },
        },
        howItWorks: {
          summary:
            'Retiens les 3 séquences matérielles exactes des diapos 23, 24 et 31–35 :',
          steps: [
            {
              label: '1. Mesure ADC (TP5 Thermomètre)',
              detail: 'ADCON1 (réf/ADFM) → ANSEL & TRIS → ADCON0 (canal + horloge + ADON=1) → attendre 12 µs → GO=1 → attendre GO=0 → lire ADRESH:ADRESL.',
              highlightBus: 'data',
            },
            {
              label: '2. Temporisation Timer0 (Projet 1)',
              detail: 'Régler OPTION_REG (T0CS=0, PSA=0, PS2:0) → charger TMR0 → attendre INTCON.T0IF=1 → effacer T0IF.',
              highlightBus: 'control',
            },
            {
              label: '3. Série USART (Projet 2)',
              detail: 'TRISC6=1, TRISC7=1 → TXSTA (SYNC=0, BRGH=1, TXEN=1) → SPBRG → RCSTA (SPEN=1, CREN=1) → tester TXIF / RCIF.',
              highlightBus: 'address',
            },
          ],
        },
        checkpoint: {
          id: 'chk-6-3',
          question: 'Pour lancer et lire une conversion analogique-numérique (ADC) sur le PIC16F887, à quoi sert le bit GO/DONE dans ADCON0 ?',
          options: [
            {
              id: 'a',
              label: 'À passer les broches de PORTA en numérique',
              isCorrect: false,
              feedback: 'C’est le rôle du registre ANSEL (Banque 3), pas de GO/DONE.',
            },
            {
              id: 'b',
              label: 'On le met à 1 pour démarrer la conversion, et le matériel le remet à 0 dès qu’elle est terminée',
              isCorrect: true,
              feedback: 'Exact ! Il suffit ensuite de tester BTFSC ADCON0, GO (ou attendre ADIF=1) avant de lire ADRESH:ADRESL.',
            },
            {
              id: 'c',
              label: 'À choisir le baudrate de la liaison série USART',
              isCorrect: false,
              feedback: 'Le baudrate de l’USART est réglé par SPBRG et BRGH.',
            },
          ],
          hint: 'Relis les étapes 6 et 7 de la programmation ADC sur la diapo 23.',
        },
        keyTakeaways: [
          'Toujours mettre ANSEL/ANSELH = 0 en Banque 3 pour utiliser des entrées/sorties numériques.',
          'Timer0 = compteur 8 bits (TMR0) + prédiviseur dans OPTION_REG + drapeau T0IF dans INTCON.',
          'ADC 10 bits = ADCON1 + ADCON0 (12 µs acquisition, GO/DONE=1) → ADRESH:ADRESL.',
          'USART = RC6/RC7 en entrée dans TRISC, SPBRG + BRGH, buffers TXREG/RCREG, flags TXIF/RCIF.',
        ],
        glossaryKeys: ['interface-es', 'harvard'],
      },
    ],
  },
  {
    id: 'module-7',
    number: 7,
    title: 'Synthèse Comparative : CISC (68HC11) vs RISC (PIC16F887)',
    shortTitle: 'Comparatif Final',
    description:
      'Même algorithme écrit côte à côte en 68HC11 et PIC16F887, comparé en fonctionnement interne, jeu d’instructions, taille de code et cycles.',
    status: 'available',
    pdfSources: ['5- 68HC11.pdf', '6- PIC16F887.pdf'],
    lessons: [
      {
        id: '7-1-comparatif-cisc-risc',
        moduleId: 'module-7',
        number: '7.1',
        title: 'Duel côte à côte : CISC (68HC11) vs RISC (PIC16F887)',
        subtitle: 'Principe, jeu d’instructions et même programme traduit dans les deux langages',
        durationMin: 12,
        pdfReference: 'Synthèse Modules 3, 5 et 6',
        whyItExists:
          'Voir le même problème résolu dans les deux langages assembleurs permet de fixer définitivement la différence entre philosophie CISC et philosophie RISC.',
        levels: {
          kid: {
            title: 'Analogie du quotidien',
            analogyTag: 'Deux façons d’écrire et d’exécuter la même recette',
            body:
              'Le chef 68HC11 (CISC) utilise des mots riches et travaille directement dans un grand tableau unique, sans tiroirs à ouvrir. Le chef PIC16F887 (RISC) n’a que 35 ordres très courts et doit penser à ouvrir le bon tiroir (Banque 1 puis Banque 0), mais chaque pas s’exécute à une cadence régulière de 1 cycle !',
          },
          simple: {
            title: 'Version simple',
            body:
              'Pour configurer un port en sortie et y envoyer la somme 5 + 3 : le 68HC11 écrit sur $1004 (PORTB) sans changer de banque, avec une instruction par étape et des opérations directes sur constantes. Le PIC16F887 doit passer en Banque 1 pour TRISD, revenir en Banque 0, passer par W (MOVLW / ADDLW / MOVWF), mais profite de son architecture Harvard et d’un cycle fixe.',
          },
          technical: {
            title: 'Version technique comparée',
            body:
              '• 68HC11 (CISC, Von Neumann, Big-Endian) : LDAA #$05 · ADDA #$03 · STAA $1004 (3 instructions de taille variable, bus unique 16b adresses / 8b données, plusieurs cycles E par instruction, pas de banques, context-save automatique complet en IT). • PIC16F887 (RISC, Harvard, 35 instructions 14b) : BSF STATUS,RP0 · CLRF TRISD · BCF STATUS,RP0 · MOVLW .5 · ADDLW .3 · MOVWF PORTD (6 instructions fixes de 14 bits, pipeline 2 étages, 1 Tcy = 4 Tosc hors saut, 4 banques RP1:RP0).',
            specs: [
              '68HC11 : 3 instructions · Pas de banques · DDR (1=Sortie, 0=Entrée)',
              'PIC16F887 : 6 instructions (avec Banque 1→0) · 1 Tcy/instr · TRIS (0=Sortie, 1=Entrée)',
              'Mémoire : 68HC11 unifiée 64 Ko ($0000–$FFFF) vs PIC Harvard 8K×14b Prog + 4 banques RAM',
            ],
          },
          alternativeAnalogy: {
            title: 'Autre analogie : Écrire un résumé vs une liste à puces',
            body:
              'CISC fait moins de phrases mais chaque phrase est plus dense et prend plus de temps à décoder. RISC écrit plus de petites lignes simples, mais un lecteur matériel les exécute en un seul battement.',
          },
        },
        howItWorks: {
          summary:
            'Compare ces deux extraits que tu peux copier et tester immédiatement dans nos Labos 68HC11 et PIC16F887 :',
          steps: [
            {
              label: 'Côté 68HC11 (CISC)',
              detail: 'LDAA #$05 ; ADDA #$03 ; STAA $1004 (PORTB en sortie fixe sans DDR !).',
              highlightBus: 'data',
            },
            {
              label: 'Côté PIC16F887 (RISC)',
              detail: 'BSF STATUS,RP0 ; CLRF TRISD ; BCF STATUS,RP0 ; MOVLW .5 ; ADDLW .3 ; MOVWF PORTD.',
              highlightBus: 'control',
            },
            {
              label: 'Ce qui change au matériel',
              detail: '68HC11 = 1 bus partagé ; PIC = bus Programme 14b + bus Données 8b séparés.',
              highlightBus: 'address',
            },
          ],
        },
        deepDiveSections: [
          {
            title: 'Tableau récapitulatif d’examen : CISC (68HC11) vs RISC (PIC16F887)',
            subtitle: 'Les 7 critères clés à connaître par cœur',
            accent: 'blue',
            instructions: [
              {
                mnemonic: 'Architecture',
                family: 'Bus & Mémoires',
                action: '68HC11 : Von Neumann (64 Ko) | PIC : Harvard (8K×14b + RAM)',
                example: '1 bus partagé vs 2 bus séparés',
                usageNote: 'Le PIC évite le goulot d’étranglement grâce à ses deux bus séparés.',
              },
              {
                mnemonic: 'Jeu d’instructions',
                family: 'Taille & Décodage',
                action: '68HC11 : >100 instr. (1–5 octets) | PIC : 35 instr. (14 bits fixes)',
                example: 'Microcodé vs Logique câblée',
                usageNote: 'RISC facilite le pipeline à 2 étages et l’exécution en 1 cycle.',
              },
              {
                mnemonic: 'Registres calculs',
                family: 'Accumulateurs',
                action: '68HC11 : A, B, D (16b), IX, IY | PIC : W unique (8b) + FSR',
                example: 'ADDA $50 vs MOVF 0x50,W + ADDWF...',
                usageNote: 'Sur PIC, presque tout passe obligatoirement par W.',
              },
              {
                mnemonic: 'Organisation RAM',
                family: 'Adressage',
                action: '68HC11 : linéaire sans banques | PIC : 4 banques (RP1:RP0)',
                example: 'STAA $1004 vs BSF STATUS,RP0...',
                usageNote: 'Toujours vérifier RP1:RP0 et ANSEL sur PIC16F887.',
              },
              {
                mnemonic: 'Direction E/S',
                family: 'DDR vs TRIS',
                action: '68HC11 DDR : 1=Sortie, 0=Entrée | PIC TRIS : 0=Sortie, 1=Entrée',
                example: 'DDRC=$0F vs TRISA=0x0F',
                usageNote: 'Attention à cette inversion classique en contrôle écrit !',
              },
              {
                mnemonic: 'Interruptions',
                family: 'Contexte',
                action: '68HC11 : empile tout + RTI | PIC : empile PC seul + RETFIE',
                example: 'Vecteurs $FFC0–$FFFF vs 0x0004',
                usageNote: 'Sur PIC, sauvegarder W et STATUS manuellement en RAM (70h–7Fh).',
              },
            ],
          },
        ],
        checkpoint: {
          id: 'chk-7-1',
          question: 'Pourquoi le programme PIC16F887 demande-t-il souvent plus de lignes d’assembleur que le 68HC11 pour la même tâche ?',
          options: [
            {
              id: 'a',
              label: 'Parce que le jeu d’instructions est réduit (35 instructions), passe par W et nécessite de changer de banque (RP1:RP0)',
              isCorrect: true,
              feedback: 'Exact ! Moins d’instructions complexes et gestion des banques donnent un code un peu plus long, mais chaque mot fait 14 bits et s’exécute en 1 cycle.',
            },
            {
              id: 'b',
              label: 'Parce que le PIC ne sait pas faire d’addition',
              isCorrect: false,
              feedback: 'Le PIC possède ADDLW et ADDWF !',
            },
            {
              id: 'c',
              label: 'Parce que le PIC n’a pas de mémoire RAM',
              isCorrect: false,
              feedback: 'Le PIC16F887 dispose de 368 octets de RAM répartis sur les 4 banques.',
            },
          ],
          hint: 'Pense au principe même du RISC + à la contrainte des 4 banques.',
        },
        keyTakeaways: [
          '68HC11 = CISC Von Neumann (code compact, pas de banques, instructions riches, DDR 1=S).',
          'PIC16F887 = RISC Harvard (35 instructions, registre W central, 4 banques RP1:RP0, TRIS 0=S).',
          'Tu peux tester les deux architectures en direct dans les onglets Labo 68HC11 et Labo PIC16F887.',
        ],
        glossaryKeys: ['von-neumann', 'harvard'],
      },
    ],
  },
];
