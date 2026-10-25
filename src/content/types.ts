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

export type RoomId = 'hub' | 'core' | 'corridor';

export type ObjectId =
  | 'guide'
  | 'about'
  | 'directory'
  | 'mailbox'
  | 'doorNav'
  | 'doorArcade'
  | 'doorVault'
  | 'doorLogs'
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
  | 'database';

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
  };
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
