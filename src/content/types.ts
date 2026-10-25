export type Lang = 'en' | 'es';

export interface Link {
  label: string;
  href: string;
}

/** Something the player can inspect: a terminal, a machine, a door. */
export interface Entry {
  title: string;
  body: string[];
  tags?: string[];
  links?: Link[];
}

export interface Item {
  name: string;
  desc: string;
  /** Shown in the inventory before the item is found. */
  hint: string;
}

export interface CvRole {
  title: string;
  org: string;
  when: string;
  summary?: string;
  points: string[];
}

export interface CvProject {
  name: string;
  desc: string;
  stack: string;
  link?: Link;
}

export type RoomId = 'hub' | 'nav' | 'workshop' | 'training' | 'arcade' | 'vault' | 'trophy' | 'core' | 'logs' | 'corridor';

export type ObjectId =
  | 'guide'
  | 'about'
  | 'directory'
  | 'mailbox'
  | 'pathfinder'
  | 'learn'
  | 'asciify'
  | 'markov'
  | 'desktopls'
  | 'tecnokids'
  | 'teaching'
  | 'robot'
  | 'pokedex'
  | 'snakeai'
  | 'dvc'
  | 'wpair'
  | 'safe'
  | 'trophies'
  | 'pmTable'
  | 'eventbridge'
  | 'sqs'
  | 'lambda'
  | 'clusters'
  | 'llm'
  | 'evals'
  | 'wikidata'
  | 'media'
  | 'web'
  | 'terraform'
  | 'cognito'
  | 'database'
  | 'amvp'
  | 'hospital'
  | 'iconic'
  | 'ynet'
  | 'snakegame'
  | 'slots'
  | 'chromle'
  | 'simon';

/** Collectibles you win in the mini-games, separate from the CV items. */
export type PrizeId = 'apple' | 'prism' | 'seven' | 'signal';

export type ItemId =
  | 'keycard'
  | 'berkeley'
  | 'pathfinder'
  | 'pokedex'
  | 'snake'
  | 'cc'
  | 'fohd'
  | 'tecnokids'
  | 'logbook'
  | 'ub'
  | 'rotary'
  | 'itba';

export interface Content {
  lang: Lang;
  meta: { title: string; description: string };
  headline: string;
  location: string;
  title: {
    tagline: string;
    enter: string;
    quick: string;
    otherLang: string;
    loading: string;
    controls: string;
  };
  hud: {
    contact: string;
    cv: string;
    inventory: string;
    quick: string;
    otherLang: string;
    motionOn: string;
    motionOff: string;
    close: string;
    interact: string;
    found: (n: number, total: number) => string;
    pickedUp: (name: string) => string;
    downloadCv: string;
    unknown: string;
    map: string;
    mapTitle: string;
    mapHint: string;
    visited: string;
    notVisited: string;
    go: string;
    dash: string;
  };
  demos: {
    nodes: string;
    generation: (gen: number, best: number) => string;
    asciiCaption: string;
    markovCaption: string;
    again: string;
    safePrompt: string;
    safeNote: string;
    safeHint: string;
    safeLabel: string;
    safeTry: string;
    safeSkip: string;
    safeWrong: string;
    safeOpen: string;
    safeAlreadyOpen: string;
  };
  games: {
    start: string;
    again: string;
    won: (prize: string) => string;
    alreadyWon: string;
    score: (score: number, best: number) => string;
    snakeHelp: string;
    snakeGoal: (n: number) => string;
    snakeOver: (score: number) => string;
    chromleHelp: string;
    colors: string[];
    guess: string;
    erase: string;
    hit: string;
    near: string;
    miss: string;
    chromleWin: (tries: number) => string;
    chromleLose: string;
    spin: string;
    slotsHelp: string;
    slotsWin: string;
    slotsPair: string;
    slotsMiss: string;
    spins: (n: number) => string;
    signalHelp: string;
    signalWatch: string;
    signalYourTurn: string;
    signalRound: (n: number) => string;
    signalWin: string;
    signalLost: (n: number) => string;
    up: string;
    down: string;
    left: string;
    right: string;
  };
  prizesTitle: string;
  prizes: Record<PrizeId, Item>;
  rooms: Record<RoomId, string>;
  labels: Partial<Record<ObjectId, string>>;
  objects: Record<ObjectId, Entry>;
  items: Record<ItemId, Item>;
  quick: {
    contact: string;
    summaryTitle: string;
    summary: string;
    experienceTitle: string;
    experience: CvRole[];
    projectsTitle: string;
    projects: CvProject[];
    educationTitle: string;
    education: string[];
    certsTitle: string;
    certs: string[];
    awardsTitle: string;
    awards: string[];
    skillsTitle: string;
    skills: [string, string][];
    languagesTitle: string;
    languages: string;
    playCta: string;
  };
}
