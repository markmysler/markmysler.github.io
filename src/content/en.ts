import { EMAIL, GITHUB, LINKEDIN, PATHFINDER, POKEDEX, PUNTO_MEDIO, cvHref, repo } from './links';
import type { Content } from './types';

export const en: Content = {
  lang: 'en',
  meta: {
    title: 'Mark Mysler · The Station',
    description:
      'Backend and security engineer, co-founder and CEO of Punto Medio. Explore a pixel-art station where every room is a project, or read the quick view.',
  },
  headline: 'Backend & security engineer · Co-founder & CEO, Punto Medio',
  location: 'Buenos Aires, Argentina',
  title: {
    tagline: 'A small station inside my head. Every room is something I built.',
    enter: 'Enter the station',
    quick: 'Quick view',
    otherLang: 'Español',
    loading: 'Docking…',
    controls: 'Move with WASD / arrows or click. Press E to interact.',
  },
  hud: {
    contact: 'Contact',
    cv: 'CV',
    inventory: 'Inventory',
    quick: 'Quick view',
    otherLang: 'ES',
    motionOn: 'Motion on',
    motionOff: 'Motion off',
    close: 'Close',
    interact: 'E',
    found: (n, total) => `${n}/${total} found`,
    pickedUp: (name) => `Picked up: ${name}`,
    downloadCv: 'Download CV (PDF)',
    unknown: 'Not found yet',
  },
  rooms: {
    hub: 'Airlock',
    core: 'Punto Medio core',
    corridor: 'Service corridor',
  },
  labels: {
    guide: 'Guide',
    about: 'About',
    directory: 'Map',
    mailbox: 'Comms',
    doorNav: 'Navigation',
    doorArcade: 'Arcade',
    doorVault: 'Vault',
    doorLogs: 'Crew logs',
    pmTable: 'Punto Medio',
    eventbridge: 'EventBridge',
    sqs: 'SQS',
    lambda: 'Lambda',
    clusters: 'Clusters',
    llm: 'LLM',
    evals: 'Evals',
    wikidata: 'Wikidata',
    media: 'Media',
    web: 'Next.js',
    terraform: 'Terraform',
    cognito: 'Cognito',
    database: 'Postgres',
  },
  objects: {
    guide: {
      title: 'Station guide',
      body: [
        'Welcome aboard. This station is my portfolio: each room is a project or a part of how I work as an engineer.',
        'Walk with WASD or the arrow keys, or click (tap on a phone) where you want to go. The route is planned with A*, the same search my Pathfinder project visualizes.',
        'Press E next to anything that glows to read it. Some rooms hold items; they fill your inventory, which doubles as my CV.',
        'In a hurry? The Contact and CV buttons are always in the top corner.',
      ],
    },
    about: {
      title: 'Mark Mysler',
      body: [
        'Backend software engineer from Buenos Aires, Argentina. I co-founded Punto Medio and I am its CEO; I also built most of the platform.',
        'Before that, two and a half years of freelance full-stack work for clients in Argentina and the US, including a public hospital.',
        'I study Computer Engineering at Universidad de Belgrano, hold ISC2 Certified in Cybersecurity, and was a top-10 finalist at the UC Berkeley Innovation Intelligence Hackathon (2026). Native English and Spanish.',
      ],
      tags: ['Python', 'AWS', 'PostgreSQL', 'LLMs', 'Cybersecurity'],
      links: [
        { label: 'LinkedIn', href: LINKEDIN },
        { label: 'GitHub', href: GITHUB },
      ],
    },
    directory: {
      title: 'Station map',
      body: [
        'Online now: Airlock (you are here) and, through the east corridor, the Punto Medio core.',
        'Still sealed: Navigation deck (Pathfinder), Arcade (pokedex-next, snake-ai), Security vault (Damn Vulnerable Containers, wpair-cli), Training bay, Workshop, Crew logs and the Trophy hold.',
        'Sealed doors still tell you what is behind them, with links to the real thing.',
      ],
    },
    mailbox: {
      title: 'Comms',
      body: [
        'Want to talk about a role, a project or Punto Medio? Email is the fastest way to reach me.',
        `${EMAIL} · Buenos Aires (UTC−3) · English and Spanish`,
      ],
      links: [
        { label: 'Email me', href: `mailto:${EMAIL}` },
        { label: 'LinkedIn', href: LINKEDIN },
        { label: 'GitHub', href: GITHUB },
        { label: 'CV (PDF)', href: cvHref('en') },
      ],
    },
    doorNav: {
      title: 'Navigation deck · sealed',
      body: [
        'Behind this door: Pathfinder. Graph-search algorithms (BFS, Dijkstra, A*, contraction hierarchies, ALT and more) race across real OpenStreetMap streets, with a Learn article for each one.',
        'It is an offline-capable PWA in TypeScript, React, MapLibre, deck.gl and Web Workers, tested with Vitest and Playwright.',
      ],
      tags: ['TypeScript', 'React', 'MapLibre', 'PWA'],
      links: [
        { label: 'Open Pathfinder', href: PATHFINDER },
        { label: 'Source', href: repo('pathfinder') },
      ],
    },
    doorArcade: {
      title: 'Arcade · sealed',
      body: [
        'pokedex-next: a Pokémon collection and battle game with case openings, real-time 3v3 PvP and trading, in English and Spanish. All game logic runs server-side on a locked-down Supabase backend (row-level security, private Realtime channels, atomic PostgreSQL functions).',
        'snake-ai: a lab where networks learn to play Snake (genetic algorithm, DQN, LLM agent), with a 9-lesson course.',
      ],
      tags: ['Next.js', 'Supabase', 'PostgreSQL', 'Python'],
      links: [
        { label: 'Play pokedex-next', href: POKEDEX },
        { label: 'snake-ai', href: repo('snake-ai') },
      ],
    },
    doorVault: {
      title: 'Security vault · sealed',
      body: [
        'Damn Vulnerable Containers: a self-hosted offensive-security training platform that runs intentionally vulnerable apps in isolated Docker containers for capture-the-flag practice (Flask, Docker, TypeScript).',
        'wpair-cli: a defensive scanner for CVE-2025-36911, a Google Fast Pair Bluetooth vulnerability (Python).',
        'Credentials on file: ISC2 Certified in Cybersecurity (CC) and Ekoparty Hackademy FOHD.',
      ],
      tags: ['Security', 'Docker', 'Flask', 'Python'],
      links: [
        { label: 'DVC', href: repo('dvc') },
        { label: 'wpair-cli', href: repo('wpair-cli') },
      ],
    },
    doorLogs: {
      title: 'Crew logs · sealed',
      body: [
        'Freelance full-stack developer, Jul 2023 – Jan 2026: AMVP APP (FastAPI, Docker, Nginx, Firebase, Angular); two systems for Hospital General de Agudos Dr. Juan A. Fernández (Django REST + Vue 3, then Nuxt 4 + Supabase); Iconic Virtual Offices in the US (FastAPI, Keycloak, WebSockets, Stripe, GoHighLevel, HubSpot and Zapier).',
        'Robotics and programming teacher for ages 6 to 8 at TecnoKids (2025–2026). English to Spanish news translator at ynet (2020–2023).',
      ],
    },
    pmTable: {
      title: 'Punto Medio',
      body: [
        'Punto Medio shows how different Argentine outlets cover the same story. It groups their coverage into events, sorts it into perspectives, and marks the framing, actors and claims, each tied to the exact source sentence.',
        'I co-founded it in May 2025 and I am the CEO. I also designed and built most of the platform: the pipeline running along the wall behind you, the analysis, and the web and admin apps.',
        'Walk along the line from left to right to follow one article through the system.',
      ],
      tags: ['CEO', 'AWS', 'Python', 'LLMs', 'Next.js'],
      links: [{ label: 'puntomedio.org', href: PUNTO_MEDIO }],
    },
    eventbridge: {
      title: '1 · Schedule',
      body: [
        'Every 15 minutes an EventBridge rule wakes the pipeline up to collect new articles from dozens of Argentine outlets.',
      ],
      tags: ['EventBridge'],
    },
    sqs: {
      title: '2 · Queue',
      body: [
        'Each article to fetch becomes a message on SQS. The queue absorbs bursts and retries, so a slow outlet never blocks the rest.',
      ],
      tags: ['SQS'],
    },
    lambda: {
      title: '3 · Scrape',
      body: [
        'Lambda workers pull from the queue, scrape and clean each article, and store it: raw copies in S3, structured rows in RDS PostgreSQL.',
      ],
      tags: ['Lambda', 'S3', 'RDS'],
    },
    clusters: {
      title: '4 · Cluster into events',
      body: [
        'Articles are embedded and stored in pgvector, then grouped with HDBSCAN, so twenty outlets writing about the same story land in one event.',
      ],
      tags: ['Embeddings', 'pgvector', 'HDBSCAN'],
    },
    llm: {
      title: '5 · Analyze',
      body: [
        'An LLM reads every article and extracts its framing, the actors involved and the claims it makes, each pointing to the exact sentence in the source.',
      ],
      tags: ['LLMs', 'Python'],
    },
    evals: {
      title: '6 · Check the checker',
      body: [
        'An evaluation harness tests the analysis against the source text for neutrality and accuracy, so changes to prompts or models are measured, not guessed.',
      ],
      tags: ['LLM evaluation'],
    },
    wikidata: {
      title: '7 · Link entities',
      body: ['People, organizations and places mentioned in the coverage are linked to Wikidata, so the same actor is recognized across outlets.'],
      tags: ['Wikidata'],
    },
    media: {
      title: '8 · Summaries',
      body: ['Each event also gets generated images and an audio summary.'],
      tags: ['Generative media'],
    },
    web: {
      title: '9 · Publish',
      body: [
        'The Next.js web app shows events and perspectives to readers; a Next.js admin console manages the platform. S3 and CloudFront handle storage and delivery.',
      ],
      tags: ['Next.js', 'CloudFront', 'S3'],
    },
    terraform: {
      title: 'Blueprints',
      body: [
        'All of the infrastructure is code: Terraform, deployed by GitLab CI through OIDC, with no stored cloud credentials anywhere.',
      ],
      tags: ['Terraform', 'GitLab CI', 'OIDC'],
    },
    cognito: {
      title: 'Access control',
      body: ['Sign-in for the platform runs on Amazon Cognito.'],
      tags: ['Cognito'],
    },
    database: {
      title: 'Data core',
      body: [
        'RDS PostgreSQL with pgvector holds articles, embeddings, events and analyses in one place, so similarity search and relational queries share a database.',
      ],
      tags: ['PostgreSQL', 'pgvector', 'RDS'],
    },
  },
  items: {
    keycard: { name: 'CEO keycard · Punto Medio', desc: 'Co-founder and CEO since May 2025.', hint: 'Somewhere in the Punto Medio core.' },
    berkeley: {
      name: 'Hackathon trophy · UC Berkeley',
      desc: 'Top-10 finalist at the UC Berkeley Innovation Intelligence Hackathon (Oct 2026) with Tenure: AI teams for solo founders that live in Telegram and earn autonomy one approved task at a time. Built with Juan Ignacio Llaberia.',
      hint: 'On display in the Airlock.',
    },
    pathfinder: { name: 'Compass · Pathfinder', desc: 'Graph-search algorithms racing on real streets.', hint: 'Navigation deck (sealed).' },
    pokedex: { name: 'Case · pokedex-next', desc: 'Real-time 3v3 PvP and trading.', hint: 'Arcade (sealed).' },
    snake: { name: 'Neural chip · snake-ai', desc: 'GA, DQN and an LLM agent learning Snake.', hint: 'Arcade (sealed).' },
    cc: { name: 'Badge · ISC2 CC', desc: 'Certified in Cybersecurity, Oct 2024.', hint: 'Security vault (sealed).' },
    fohd: { name: 'Badge · Ekoparty FOHD', desc: 'Fundamentals of Hacking and Defense, Jan 2026.', hint: 'Security vault (sealed).' },
    tecnokids: { name: 'Robot kit · TecnoKids', desc: 'Taught robotics and programming to ages 6–8.', hint: 'Training bay (sealed).' },
    logbook: { name: 'Logbook · Freelance', desc: 'Two and a half years of client work.', hint: 'Crew logs (sealed).' },
    ub: { name: 'Student ID · Universidad de Belgrano', desc: 'Computer Engineering, 2025–2029.', hint: 'Trophy hold (sealed).' },
    rotary: { name: 'Medal · Rotary Club Belgrano', desc: 'Academic Excellence Award, Sep 2026.', hint: 'Trophy hold (sealed).' },
    itba: { name: 'Certificate · ITBA', desc: 'Professional Certificate in AI, 2024.', hint: 'Trophy hold (sealed).' },
  },
  quick: {
    contact: 'Contact',
    summaryTitle: 'Summary',
    summary:
      'Backend software engineer and co-founder and CEO of Punto Medio, a news-analysis platform I built on AWS with Python, PostgreSQL and LLMs. Two and a half years of freelance full-stack work for clients in Argentina and the US, including a public hospital. Computer Engineering student at Universidad de Belgrano, ISC2 Certified in Cybersecurity (CC), and a top-10 finalist at the UC Berkeley Innovation Intelligence Hackathon (2026). Native English and Spanish.',
    experienceTitle: 'Experience',
    experience: [
      {
        title: 'Co-founder & CEO',
        org: 'Punto Medio',
        when: 'May 2025 – present',
        summary:
          'Punto Medio (puntomedio.org) shows how different news outlets cover the same story, with every analysis backed by the exact source sentence. I lead the company and built most of the platform.',
        points: [
          'Designed and built a serverless pipeline on AWS (Lambda, SQS, EventBridge, RDS PostgreSQL with pgvector, S3, CloudFront, Cognito) that collects and scrapes articles from dozens of Argentine outlets every 15 minutes.',
          "Built event clustering with embeddings and HDBSCAN, and LLM analysis of every article's framing, actors and claims, checked against the source text by an evaluation harness for neutrality and accuracy.",
          'Added entity linking to Wikidata, plus generated images and audio summaries for each event.',
          'Built the Next.js web app and admin console.',
          'Managed all infrastructure as code with Terraform, deployed by GitLab CI through OIDC with no stored cloud credentials.',
        ],
      },
      {
        title: 'Freelance Full-Stack Developer',
        org: 'Self-employed',
        when: 'Jul 2023 – Jan 2026',
        points: [
          'AMVP APP: backend for a football statistics app for amateur players, a FastAPI REST API deployed with Docker behind Nginx, with Firebase and an Angular (PrimeNG) frontend.',
          'Hospital General de Agudos Dr. Juan A. Fernández: two systems from requirements to deployment, a teaching-room booking platform (Django REST Framework, Vue 3) and a consulting-room scheduling system (Nuxt 4, Supabase).',
          'Iconic Virtual Offices (US): FastAPI backend with Keycloak authentication, PostgreSQL and WebSocket presence tracking; Node.js integrations with HubSpot and Zapier; Stripe checkout synced to GoHighLevel CRM.',
        ],
      },
      {
        title: 'Robotics and Programming Teacher',
        org: 'TecnoKids LATAM',
        when: 'Mar 2025 – Mar 2026',
        points: ['Taught programming and robotics to children aged 6 to 8, from Scratch to robots built with LEGO and ESP32 microcontrollers.'],
      },
      {
        title: 'English–Spanish Translator',
        org: 'ynet',
        when: 'Jan 2020 – Mar 2023',
        points: ["Translated, edited and adapted news articles into Spanish for ynet's Spanish edition."],
      },
    ],
    projectsTitle: 'Projects',
    projects: [
      {
        name: 'Tenure',
        desc: 'UC Berkeley Innovation Intelligence Hackathon, top-10 finalist (Oct 2026). AI teams for solo founders that work in Telegram and earn autonomy one approved task at a time. Built with Juan Ignacio Llaberia.',
        stack: 'LangGraph, OpenRouter, Claude, Supabase',
      },
      {
        name: 'Pathfinder',
        desc: 'Graph-search algorithms (BFS, Dijkstra, A*, contraction hierarchies and more) race across real OpenStreetMap streets, with an article for each algorithm. Offline-capable PWA.',
        stack: 'TypeScript, React, MapLibre, Web Workers, Vitest, Playwright',
        link: { label: 'markmysler.github.io/pathfinder', href: PATHFINDER },
      },
      {
        name: 'pokedex-next',
        desc: 'Pokémon collection and battle game with real-time multiplayer, trading and case openings, in English and Spanish. All game logic runs server-side on a locked-down Supabase backend.',
        stack: 'Next.js, TypeScript, Supabase, PostgreSQL',
        link: { label: 'pokedex-next-rho.vercel.app', href: POKEDEX },
      },
      {
        name: 'Damn Vulnerable Containers',
        desc: 'Self-hosted offensive-security training platform: intentionally vulnerable apps in isolated Docker containers for CTF practice.',
        stack: 'Flask, Docker, TypeScript',
        link: { label: 'github.com/markmysler/dvc', href: repo('dvc') },
      },
      {
        name: 'wpair-cli',
        desc: 'Defensive scanner for CVE-2025-36911, a Google Fast Pair Bluetooth vulnerability.',
        stack: 'Python',
        link: { label: 'github.com/markmysler/wpair-cli', href: repo('wpair-cli') },
      },
      {
        name: 'snake-ai',
        desc: 'A lab where networks learn Snake (genetic algorithm, DQN, LLM agent), with a 9-lesson course.',
        stack: 'Python',
        link: { label: 'github.com/markmysler/snake-ai', href: repo('snake-ai') },
      },
    ],
    educationTitle: 'Education',
    education: [
      'Computer Engineering, Universidad de Belgrano, Buenos Aires · Mar 2025 – 2029 (expected)',
      'Professional Certificate in Artificial Intelligence, ITBA · Apr – Jul 2024',
    ],
    certsTitle: 'Certifications',
    certs: ['ISC2 Certified in Cybersecurity (CC) · Oct 2024', 'Fundamentals of Hacking and Defense (FOHD), Ekoparty Hackademy · Jan 2026'],
    awardsTitle: 'Awards',
    awards: [
      'Finalist (top 10), UC Berkeley Innovation Intelligence Hackathon, SCET and DECODE · Oct 2026',
      'Academic Excellence Award, Rotary Club Belgrano, for one of the best first-year averages in Computer Engineering at Universidad de Belgrano · Sep 2026',
    ],
    skillsTitle: 'Skills',
    skills: [
      ['Languages', 'Python, TypeScript, JavaScript, SQL, C#'],
      ['Backend', 'FastAPI, Django REST Framework, Flask, Node.js, REST APIs, WebSockets, Keycloak'],
      ['Cloud & DevOps', 'AWS (Lambda, SQS, EventBridge, RDS, S3, CloudFront, Cognito), Terraform, Docker, Nginx, GitLab CI, GitHub Actions, Linux'],
      ['Data & AI', 'PostgreSQL, pgvector, Supabase, Firebase, LLMs, LangGraph, embeddings, HDBSCAN, LLM evaluation'],
      ['Frontend', 'React, Next.js, Vue 3, Nuxt, Angular, Tailwind CSS'],
      ['Security', 'Ethical hacking, vulnerability assessment, network security, authentication and access control'],
    ],
    languagesTitle: 'Languages',
    languages: 'Spanish (native), English (native)',
    playCta: 'Prefer to explore? Enter the station',
  },
};
