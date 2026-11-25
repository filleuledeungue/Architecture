import { GlossaryEntry } from '../types/course';

/**
 * Glossaire pédagogique officiel du cours (Module 1 et fondations)
 * Chaque notion est présentée avec une analogie simple, une définition claire et une définition technique.
 */
export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'von-neumann',
    term: 'Architecture de Von Neumann',
    aliases: ['Von Neumann', 'architecture unifiée'],
    moduleRef: 'Module 1 · 1.1',
    kidAnalogy:
      'Une boutique avec une seule porte : le client qui commande et le livreur qui apporte la marchandise doivent attendre leur tour pour passer.',
    simpleDef:
      'Architecture où les instructions du programme et les données partagent la même mémoire principale et le même bus.',
    technicalDef:
      'Modèle classique reliant Unité Centrale, Mémoire Principale (ROM + RAM dans un même espace) et Interfaces E/S via un jeu unique de bus (données, adresses, commande).',
  },
  {
    id: 'harvard',
    term: 'Architecture de Harvard',
    aliases: ['Harvard', 'mémoire séparée'],
    moduleRef: 'Module 1 · 1.1',
    kidAnalogy:
      'Une cuisine à deux passe-plats : un serveur lit les recettes à gauche pendant que le commis prend les ingrédients à droite, sans jamais se bousculer.',
    simpleDef:
      'Architecture qui sépare physiquement la mémoire du programme et la mémoire des données, chacune ayant ses propres bus.',
    technicalDef:
      'Modèle à deux espaces mémoire distincts (Mémoire Programme et Mémoire de Données) dotés de bus indépendants reliés à l’UAL et aux E/S. Utilisée dans les DSP et microcontrôleurs (PIC, AVR).',
  },
  {
    id: 'goulot-etranglement',
    term: 'Goulot d’étranglement',
    aliases: ['goulot d’étranglement de Von Neumann', 'bottleneck'],
    moduleRef: 'Module 1 · 1.1',
    kidAnalogy:
      'Un pont à une seule voie devant le marché Sandaga : même si le moteur du car rapide est puissant, tout le monde doit passer un par un.',
    simpleDef:
      'Ralentissement causé par l’impossibilité de lire une instruction et une donnée en même temps sur un bus unique.',
    technicalDef:
      'Limitation de bande passante inhérente à l’architecture Von Neumann : les cycles de recherche d’instruction (Fetch) et d’accès aux données se disputent le même bus mémoire.',
  },
  {
    id: 'unite-centrale',
    term: 'Unité Centrale (UC)',
    aliases: ['UC', 'microprocesseur', 'CPU'],
    moduleRef: 'Module 1 · 1.2',
    kidAnalogy:
      'Le cuisinier en chef : il lit la recette étape par étape, fait les calculs et donne les ordres à toute la cuisine.',
    simpleDef:
      'Le cerveau du système qui exécute les instructions du programme et coordonne tous les échanges.',
    technicalDef:
      'Composant intégrant l’Unité de Commande (UC) et l’Unité Arithmétique et Logique (UAL/ALU), générant les adresses et les signaux de contrôle pour lire/écrire en mémoire et sur les E/S.',
  },
  {
    id: 'memoire-principale',
    term: 'Mémoire Principale',
    aliases: ['mémoire centrale', 'ROM + RAM'],
    moduleRef: 'Module 1 · 1.2',
    kidAnalogy:
      'Le grand cahier de recettes (ROM) posé à côté de l’ardoise effaçable du plan de travail (RAM).',
    simpleDef:
      'Ensemble des circuits ROM et RAM directement accessibles par le processeur pour stocker le programme et les données.',
    technicalDef:
      'Espace adressable regroupant la mémoire morte (ROM, non volatile, programme/constantes) et la mémoire vive (RAM, volatile, variables et pile) reliées aux bus système.',
  },
  {
    id: 'interface-es',
    term: 'Interface d’Entrée / Sortie (E/S)',
    aliases: ['interfaces E/S', 'périphérique', 'I/O'],
    moduleRef: 'Module 1 · 1.2',
    kidAnalogy:
      'Le guichet d’accueil de la boutique : c’est par là que le cuisinier reçoit les commandes des clients (entrées) et sert les plats (sorties).',
    simpleDef:
      'Circuit intermédiaire qui permet au processeur de communiquer avec le monde extérieur (boutons, LED, capteurs, écran).',
    technicalDef:
      'Coupleur matériel doté de registres (données, commande, état) adaptant les niveaux électriques, les formats et les vitesses entre les bus du microprocesseur et les périphériques.',
  },
  {
    id: 'bus-donnees',
    term: 'Bus de données',
    aliases: ['bus données', 'data bus'],
    moduleRef: 'Module 1 · 1.3',
    busColor: 'data',
    kidAnalogy:
      'Le camion de livraison qui fait l’aller-retour entre le magasin et la cuisine : il transporte les marchandises dans les deux sens.',
    simpleDef:
      'Faisceau de fils bidirectionnel qui transporte les instructions et les valeurs entre le processeur, la mémoire et les E/S.',
    technicalDef:
      'Bus bidirectionnel (généralement 8, 16, 32 ou 64 bits de large) véhiculant les opcodes et opérandes entre l’UC et les dispositifs sélectionnés.',
  },
  {
    id: 'bus-adresses',
    term: 'Bus d’adresses',
    aliases: ['bus adresses', 'address bus'],
    moduleRef: 'Module 1 · 1.3',
    busColor: 'address',
    kidAnalogy:
      'Le numéro exact de la villa sur l’enveloppe : seul le facteur (le processeur) écrit l’adresse pour désigner qui doit répondre.',
    simpleDef:
      'Faisceau de fils unidirectionnel sur lequel le processeur envoie le numéro de la case mémoire ou du périphérique voulu.',
    technicalDef:
      'Bus unidirectionnel (du processeur vers la mémoire et les E/S) de largeur n bits permettant de sélectionner une position parmi 2^n emplacements adressables.',
  },
  {
    id: 'bus-commande',
    term: 'Bus de commande',
    aliases: ['bus commande', 'bus de contrôle', 'control bus'],
    moduleRef: 'Module 1 · 1.3',
    busColor: 'control',
    kidAnalogy:
      'Le feu tricolore et le coup de sifflet du chef d’orchestre : il dit quand on lit, quand on écrit et qui a le droit de parler.',
    simpleDef:
      'Ensemble de quelques fils qui synchronisent les transferts et indiquent le sens de l’opération (lecture ou écriture).',
    technicalDef:
      'Bus regroupant les signaux de synchronisation et de contrôle (horloge, R/W, Reset, IRQ, E/AS, etc.) assurant le cadencement et l’arbitrage sur les bus.',
  },
  {
    id: 'espace-adressable',
    term: 'Espace adressable (2^n)',
    aliases: ['espace adressable', '2^n'],
    moduleRef: 'Module 1 · 1.4',
    busColor: 'address',
    kidAnalogy:
      'Si un immeuble a des numéros de porte à 2 chiffres (de 00 à 99), il peut avoir au maximum 100 appartements.',
    simpleDef:
      'Nombre maximal d’emplacements mémoire distincts que le processeur peut numéroter avec ses n fils d’adresse.',
    technicalDef:
      'Avec un bus d’adresses de largeur n bits, le microprocesseur génère 2^n combinaisons binaires uniques (ex. n = 16 donne 2^16 = 65 536 adresses, soit 64 Kio si chaque adresse pointe 1 octet).',
  },
  {
    id: 'decodeur-adresse',
    term: 'Décodeur d’adresse',
    aliases: ['décodage d’adresse', 'décodeur'],
    moduleRef: 'Module 1 · 1.5',
    busColor: 'address',
    kidAnalogy:
      'Le standardiste qui écoute le début du numéro appelé et ne réveille que le bon service, pour éviter que tout le monde parle en même temps.',
    simpleDef:
      'Circuit logique combinatoire qui lit les bits de poids fort du bus d’adresses et active un seul boîtier à la fois.',
    technicalDef:
      'Logique combinatoire recevant les lignes hautes du bus d’adresses (et parfois des signaux de contrôle) pour générer des signaux Chip Select (/CS) mutuellement exclusifs et prévenir les conflits de bus.',
  },
  {
    id: 'chip-select',
    term: 'Chip Select (CS / /CS)',
    aliases: ['CS', '/CS', 'sélection de boîtier'],
    moduleRef: 'Module 1 · 1.5',
    busColor: 'control',
    kidAnalogy:
      'Taper à la porte d’une seule boutique : tant qu’on n’a pas frappé à sa porte, le commerçant reste silencieux.',
    simpleDef:
      'Broche de réveil d’un circuit mémoire ou E/S : quand elle est active, ce circuit a le droit d’utiliser le bus de données.',
    technicalDef:
      'Signal de validation d’entrée (souvent actif à l’état bas /CS) piloté par le décodeur d’adresse. Lorsque /CS est inactif, les sorties du circuit passent en haute impédance (tri-state).',
  },
  {
    id: 'cartographie-memoire',
    term: 'Cartographie mémoire',
    aliases: ['memory map', 'plan mémoire'],
    moduleRef: 'Module 1 · 1.6',
    kidAnalogy:
      'Le plan de l’immeuble affiché dans le hall : rez-de-chaussée = réception, 2e étage = bureaux, derniers étages = archives.',
    simpleDef:
      'Tableau ou schéma montrant quelle plage d’adresses correspond à la RAM, à la ROM, aux périphériques ou aux zones libres.',
    technicalDef:
      'Répartition complète de l’espace adressable (ex. $0000 à $FFFF pour un bus 16 bits) attribuant à chaque composant matériel une plage d’adresses continue et disjointe.',
  },
];

export function findGlossaryEntry(id: string): GlossaryEntry | undefined {
  return GLOSSARY_ENTRIES.find((entry) => entry.id === id);
}
