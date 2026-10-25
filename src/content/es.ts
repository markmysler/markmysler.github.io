import { EMAIL, GITHUB, LINKEDIN, PATHFINDER, POKEDEX, PUNTO_MEDIO, cvHref, repo } from './links';
import type { Content } from './types';

export const es: Content = {
  lang: 'es',
  meta: {
    title: 'Mark Mysler · La Estación',
    description:
      'Ingeniero backend y de seguridad, cofundador y CEO de Punto Medio. Recorré una estación pixel art donde cada sala es un proyecto, o leé la vista rápida.',
  },
  headline: 'Ingeniero backend y de seguridad · Cofundador y CEO, Punto Medio',
  location: 'Buenos Aires, Argentina',
  title: {
    tagline: 'Una pequeña estación dentro de mi cabeza. Cada sala es algo que construí.',
    enter: 'Entrar a la estación',
    quick: 'Vista rápida',
    otherLang: 'English',
    loading: 'Acoplando…',
    controls: 'Movete con WASD / flechas o con un clic. Tocá E para interactuar.',
  },
  hud: {
    contact: 'Contacto',
    cv: 'CV',
    inventory: 'Inventario',
    quick: 'Vista rápida',
    otherLang: 'EN',
    motionOn: 'Animación sí',
    motionOff: 'Animación no',
    close: 'Cerrar',
    interact: 'E',
    found: (n, total) => `${n}/${total} encontrados`,
    pickedUp: (name) => `Conseguiste: ${name}`,
    downloadCv: 'Descargar CV (PDF)',
    unknown: 'Todavía no encontrado',
  },
  rooms: {
    hub: 'Esclusa',
    core: 'Núcleo de Punto Medio',
    corridor: 'Pasillo de servicio',
  },
  labels: {
    guide: 'Guía',
    about: 'Sobre mí',
    directory: 'Mapa',
    mailbox: 'Contacto',
    doorNav: 'Navegación',
    doorArcade: 'Arcade',
    doorVault: 'Bóveda',
    doorLogs: 'Bitácoras',
    pmTable: 'Punto Medio',
    eventbridge: 'EventBridge',
    sqs: 'SQS',
    lambda: 'Lambda',
    clusters: 'Clusters',
    llm: 'LLM',
    evals: 'Evals',
    wikidata: 'Wikidata',
    media: 'Medios',
    web: 'Next.js',
    terraform: 'Terraform',
    cognito: 'Cognito',
    database: 'Postgres',
  },
  objects: {
    guide: {
      title: 'Guía de la estación',
      body: [
        'Bienvenido a bordo. Esta estación es mi portfolio: cada sala es un proyecto o una parte de cómo trabajo como ingeniero.',
        'Caminá con WASD o las flechas, o hacé clic (o tocá, en el celular) donde quieras ir. La ruta se calcula con A*, la misma búsqueda que muestra mi proyecto Pathfinder.',
        'Tocá E al lado de cualquier cosa que brille para leerla. Algunas salas guardan objetos; llenan tu inventario, que también es mi CV.',
        '¿Estás apurado? Los botones de Contacto y CV están siempre arriba a la derecha.',
      ],
    },
    about: {
      title: 'Mark Mysler',
      body: [
        'Ingeniero de software backend de Buenos Aires, Argentina. Cofundé Punto Medio y soy su CEO; también construí la mayor parte de la plataforma.',
        'Antes, dos años y medio de trabajo freelance full-stack para clientes de Argentina y Estados Unidos, entre ellos un hospital público.',
        'Estudio Ingeniería en Informática en la Universidad de Belgrano, tengo la certificación ISC2 Certified in Cybersecurity y fui finalista (top 10) del UC Berkeley Innovation Intelligence Hackathon (2026). Español e inglés nativos.',
      ],
      tags: ['Python', 'AWS', 'PostgreSQL', 'LLMs', 'Ciberseguridad'],
      links: [
        { label: 'LinkedIn', href: LINKEDIN },
        { label: 'GitHub', href: GITHUB },
      ],
    },
    directory: {
      title: 'Mapa de la estación',
      body: [
        'En línea: la Esclusa (estás acá) y, por el pasillo del este, el núcleo de Punto Medio.',
        'Todavía selladas: cubierta de Navegación (Pathfinder), Arcade (pokedex-next, snake-ai), Bóveda de seguridad (Damn Vulnerable Containers, wpair-cli), Sala de entrenamiento, Taller, Bitácoras y la Sala de trofeos.',
        'Las puertas selladas igual te cuentan qué hay detrás, con links a los proyectos reales.',
      ],
    },
    mailbox: {
      title: 'Contacto',
      body: [
        '¿Querés hablar de un puesto, un proyecto o Punto Medio? El email es la forma más rápida de llegar a mí.',
        `${EMAIL} · Buenos Aires (UTC−3) · español e inglés`,
      ],
      links: [
        { label: 'Escribime', href: `mailto:${EMAIL}` },
        { label: 'LinkedIn', href: LINKEDIN },
        { label: 'GitHub', href: GITHUB },
        { label: 'CV (PDF)', href: cvHref('es') },
      ],
    },
    doorNav: {
      title: 'Cubierta de navegación · sellada',
      body: [
        'Detrás de esta puerta: Pathfinder. Algoritmos de búsqueda en grafos (BFS, Dijkstra, A*, contraction hierarchies, ALT y más) compiten sobre calles reales de OpenStreetMap, con un artículo para cada uno.',
        'Es una PWA que funciona sin conexión, en TypeScript, React, MapLibre, deck.gl y Web Workers, con tests en Vitest y Playwright.',
      ],
      tags: ['TypeScript', 'React', 'MapLibre', 'PWA'],
      links: [
        { label: 'Abrir Pathfinder', href: PATHFINDER },
        { label: 'Código', href: repo('pathfinder') },
      ],
    },
    doorArcade: {
      title: 'Arcade · sellado',
      body: [
        'pokedex-next: un juego de colección y batallas Pokémon con apertura de cajas, PvP 3v3 en tiempo real e intercambios, en español e inglés. Toda la lógica corre en el servidor sobre un backend Supabase protegido (row-level security, canales Realtime privados, funciones atómicas de PostgreSQL).',
        'snake-ai: un laboratorio donde redes aprenden a jugar al Snake (algoritmo genético, DQN, agente LLM), con un curso de 9 lecciones.',
      ],
      tags: ['Next.js', 'Supabase', 'PostgreSQL', 'Python'],
      links: [
        { label: 'Jugar pokedex-next', href: POKEDEX },
        { label: 'snake-ai', href: repo('snake-ai') },
      ],
    },
    doorVault: {
      title: 'Bóveda de seguridad · sellada',
      body: [
        'Damn Vulnerable Containers: una plataforma autoalojada de entrenamiento en seguridad ofensiva que ejecuta aplicaciones intencionalmente vulnerables en contenedores Docker aislados para practicar capture the flag (Flask, Docker, TypeScript).',
        'wpair-cli: un escáner defensivo para CVE-2025-36911, una vulnerabilidad Bluetooth de Google Fast Pair (Python).',
        'Credenciales: ISC2 Certified in Cybersecurity (CC) y FOHD de Ekoparty Hackademy.',
      ],
      tags: ['Seguridad', 'Docker', 'Flask', 'Python'],
      links: [
        { label: 'DVC', href: repo('dvc') },
        { label: 'wpair-cli', href: repo('wpair-cli') },
      ],
    },
    doorLogs: {
      title: 'Bitácoras · sellada',
      body: [
        'Desarrollador full-stack freelance, jul. 2023 – ene. 2026: AMVP APP (FastAPI, Docker, Nginx, Firebase, Angular); dos sistemas para el Hospital General de Agudos Dr. Juan A. Fernández (Django REST + Vue 3, y después Nuxt 4 + Supabase); Iconic Virtual Offices en EE. UU. (FastAPI, Keycloak, WebSockets, Stripe, GoHighLevel, HubSpot y Zapier).',
        'Profesor de robótica y programación para chicos de 6 a 8 años en TecnoKids (2025–2026). Traductor de noticias del inglés al español en ynet (2020–2023).',
      ],
    },
    pmTable: {
      title: 'Punto Medio',
      body: [
        'Punto Medio muestra cómo distintos medios argentinos cubren una misma noticia. Agrupa la cobertura en eventos, la ordena en perspectivas y marca el encuadre, los actores y las afirmaciones, cada uno atado a la oración exacta de la fuente.',
        'Lo cofundé en mayo de 2025 y soy el CEO. También diseñé y construí la mayor parte de la plataforma: el pipeline que corre por la pared detrás tuyo, el análisis y las apps web y de administración.',
        'Recorré la línea de izquierda a derecha para seguir a un artículo por todo el sistema.',
      ],
      tags: ['CEO', 'AWS', 'Python', 'LLMs', 'Next.js'],
      links: [{ label: 'puntomedio.org', href: PUNTO_MEDIO }],
    },
    eventbridge: {
      title: '1 · Agenda',
      body: ['Cada 15 minutos una regla de EventBridge despierta al pipeline para recopilar artículos nuevos de decenas de medios argentinos.'],
      tags: ['EventBridge'],
    },
    sqs: {
      title: '2 · Cola',
      body: ['Cada artículo a buscar se convierte en un mensaje de SQS. La cola absorbe picos y reintentos, así un medio lento nunca frena al resto.'],
      tags: ['SQS'],
    },
    lambda: {
      title: '3 · Extracción',
      body: ['Workers de Lambda toman mensajes de la cola, extraen y limpian cada artículo y lo guardan: la copia cruda en S3 y los datos estructurados en RDS PostgreSQL.'],
      tags: ['Lambda', 'S3', 'RDS'],
    },
    clusters: {
      title: '4 · Agrupar en eventos',
      body: ['Los artículos se convierten en embeddings guardados en pgvector y se agrupan con HDBSCAN, así veinte medios escribiendo sobre la misma noticia terminan en un solo evento.'],
      tags: ['Embeddings', 'pgvector', 'HDBSCAN'],
    },
    llm: {
      title: '5 · Analizar',
      body: ['Un LLM lee cada artículo y extrae su encuadre, los actores involucrados y las afirmaciones que hace, cada una apuntando a la oración exacta de la fuente.'],
      tags: ['LLMs', 'Python'],
    },
    evals: {
      title: '6 · Controlar al controlador',
      body: ['Un sistema de evaluación pone a prueba el análisis contra el texto original, en neutralidad y precisión, así los cambios de prompts o modelos se miden en vez de adivinarse.'],
      tags: ['Evaluación de LLMs'],
    },
    wikidata: {
      title: '7 · Vincular entidades',
      body: ['Las personas, organizaciones y lugares que aparecen en la cobertura se vinculan con Wikidata, así el mismo actor se reconoce en todos los medios.'],
      tags: ['Wikidata'],
    },
    media: {
      title: '8 · Resúmenes',
      body: ['Cada evento también recibe imágenes generadas y un resumen en audio.'],
      tags: ['Medios generativos'],
    },
    web: {
      title: '9 · Publicar',
      body: ['La app web en Next.js les muestra a los lectores los eventos y las perspectivas; una consola de administración en Next.js gestiona la plataforma. S3 y CloudFront se encargan del almacenamiento y la entrega.'],
      tags: ['Next.js', 'CloudFront', 'S3'],
    },
    terraform: {
      title: 'Planos',
      body: ['Toda la infraestructura es código: Terraform, desplegado con GitLab CI mediante OIDC, sin credenciales de nube guardadas en ningún lado.'],
      tags: ['Terraform', 'GitLab CI', 'OIDC'],
    },
    cognito: {
      title: 'Control de acceso',
      body: ['El inicio de sesión de la plataforma corre sobre Amazon Cognito.'],
      tags: ['Cognito'],
    },
    database: {
      title: 'Núcleo de datos',
      body: ['RDS PostgreSQL con pgvector guarda artículos, embeddings, eventos y análisis en un solo lugar, así la búsqueda por similitud y las consultas relacionales comparten base de datos.'],
      tags: ['PostgreSQL', 'pgvector', 'RDS'],
    },
  },
  items: {
    keycard: { name: 'Tarjeta de CEO · Punto Medio', desc: 'Cofundador y CEO desde mayo de 2025.', hint: 'En algún lugar del núcleo de Punto Medio.' },
    berkeley: {
      name: 'Trofeo de hackathon · UC Berkeley',
      desc: 'Finalista (top 10) del UC Berkeley Innovation Intelligence Hackathon (oct. 2026) con Tenure: equipos de IA para fundadores que trabajan solos, que viven en Telegram y ganan autonomía tarea aprobada por tarea aprobada. Hecho con Juan Ignacio Llaberia.',
      hint: 'En exhibición en la Esclusa.',
    },
    pathfinder: { name: 'Brújula · Pathfinder', desc: 'Algoritmos de búsqueda compitiendo en calles reales.', hint: 'Cubierta de navegación (sellada).' },
    pokedex: { name: 'Caja · pokedex-next', desc: 'PvP 3v3 en tiempo real e intercambios.', hint: 'Arcade (sellado).' },
    snake: { name: 'Chip neuronal · snake-ai', desc: 'Algoritmo genético, DQN y un agente LLM aprendiendo Snake.', hint: 'Arcade (sellado).' },
    cc: { name: 'Insignia · ISC2 CC', desc: 'Certified in Cybersecurity, oct. 2024.', hint: 'Bóveda de seguridad (sellada).' },
    fohd: { name: 'Insignia · Ekoparty FOHD', desc: 'Fundamentos de Hacking y Defensa, ene. 2026.', hint: 'Bóveda de seguridad (sellada).' },
    tecnokids: { name: 'Kit de robótica · TecnoKids', desc: 'Enseñé robótica y programación a chicos de 6 a 8 años.', hint: 'Sala de entrenamiento (sellada).' },
    logbook: { name: 'Bitácora · Freelance', desc: 'Dos años y medio de trabajo con clientes.', hint: 'Bitácoras (sellada).' },
    ub: { name: 'Libreta · Universidad de Belgrano', desc: 'Ingeniería en Informática, 2025–2029.', hint: 'Sala de trofeos (sellada).' },
    rotary: { name: 'Medalla · Rotary Club Belgrano', desc: 'Premio a la Excelencia Académica, sep. 2026.', hint: 'Sala de trofeos (sellada).' },
    itba: { name: 'Certificado · ITBA', desc: 'Certificación Profesional en IA, 2024.', hint: 'Sala de trofeos (sellada).' },
  },
  quick: {
    contact: 'Contacto',
    summaryTitle: 'Perfil',
    summary:
      'Ingeniero de software backend, cofundador y CEO de Punto Medio, una plataforma de análisis de noticias que construí sobre AWS con Python, PostgreSQL y LLMs. Dos años y medio de trabajo freelance full-stack para clientes de Argentina y Estados Unidos, entre ellos un hospital público. Estudiante de Ingeniería en Informática en la Universidad de Belgrano, certificado ISC2 Certified in Cybersecurity (CC) y finalista (top 10) del UC Berkeley Innovation Intelligence Hackathon (2026). Español e inglés nativos.',
    experienceTitle: 'Experiencia',
    experience: [
      {
        title: 'Cofundador y CEO',
        org: 'Punto Medio',
        when: 'may. 2025 – actualidad',
        summary:
          'Punto Medio (puntomedio.org) muestra cómo distintos medios cubren una misma noticia, y cada análisis se respalda con la oración exacta de la fuente. Dirijo la empresa y construí la mayor parte de la plataforma.',
        points: [
          'Diseñé y construí un pipeline serverless en AWS (Lambda, SQS, EventBridge, RDS PostgreSQL con pgvector, S3, CloudFront, Cognito) que recopila y extrae artículos de decenas de medios argentinos cada 15 minutos.',
          'Desarrollé la agrupación de noticias en eventos con embeddings y HDBSCAN, y el análisis con LLMs del encuadre, los actores y las afirmaciones de cada artículo, verificado contra el texto original por un sistema de evaluación de neutralidad y precisión.',
          'Implementé la vinculación de entidades con Wikidata y la generación de imágenes y resúmenes en audio para cada evento.',
          'Desarrollé la aplicación web y la consola de administración en Next.js.',
          'Gestioné toda la infraestructura como código con Terraform, desplegada con GitLab CI mediante OIDC, sin credenciales de nube almacenadas.',
        ],
      },
      {
        title: 'Desarrollador Full-Stack Freelance',
        org: 'Independiente',
        when: 'jul. 2023 – ene. 2026',
        points: [
          'AMVP APP: backend de una aplicación de estadísticas de fútbol para jugadores amateurs, una API REST en FastAPI desplegada con Docker detrás de Nginx, con Firebase y un frontend en Angular (PrimeNG).',
          'Hospital General de Agudos Dr. Juan A. Fernández: dos sistemas desde el relevamiento hasta el despliegue, una plataforma de reserva de aulas docentes (Django REST Framework, Vue 3) y un sistema de agenda de consultorios (Nuxt 4, Supabase).',
          'Iconic Virtual Offices (EE. UU.): backend en FastAPI con autenticación Keycloak, PostgreSQL y presencia por WebSockets; integraciones en Node.js con HubSpot y Zapier; checkout de Stripe sincronizado con el CRM GoHighLevel.',
        ],
      },
      {
        title: 'Profesor de Robótica y Programación',
        org: 'TecnoKids LATAM',
        when: 'mar. 2025 – mar. 2026',
        points: ['Enseñé programación y robótica a niños de 6 a 8 años, desde Scratch hasta robots con LEGO y microcontroladores ESP32.'],
      },
      {
        title: 'Traductor Inglés–Español',
        org: 'ynet',
        when: 'ene. 2020 – mar. 2023',
        points: ['Traduje, edité y adapté artículos periodísticos al español para la edición en español de ynet.'],
      },
    ],
    projectsTitle: 'Proyectos',
    projects: [
      {
        name: 'Tenure',
        desc: 'UC Berkeley Innovation Intelligence Hackathon, finalista top 10 (oct. 2026). Equipos de IA para fundadores que trabajan solos, que operan en Telegram y ganan autonomía tarea aprobada por tarea aprobada. Hecho con Juan Ignacio Llaberia.',
        stack: 'LangGraph, OpenRouter, Claude, Supabase',
      },
      {
        name: 'Pathfinder',
        desc: 'Algoritmos de búsqueda en grafos (BFS, Dijkstra, A*, contraction hierarchies y más) compiten sobre calles reales de OpenStreetMap, con un artículo para cada algoritmo. PWA que funciona sin conexión.',
        stack: 'TypeScript, React, MapLibre, Web Workers, Vitest, Playwright',
        link: { label: 'markmysler.github.io/pathfinder', href: PATHFINDER },
      },
      {
        name: 'pokedex-next',
        desc: 'Juego de colección y batallas Pokémon con multijugador en tiempo real, intercambios y apertura de cajas, en español e inglés. Toda la lógica corre en el servidor sobre un backend Supabase protegido.',
        stack: 'Next.js, TypeScript, Supabase, PostgreSQL',
        link: { label: 'pokedex-next-rho.vercel.app', href: POKEDEX },
      },
      {
        name: 'Damn Vulnerable Containers',
        desc: 'Plataforma autoalojada de entrenamiento en seguridad ofensiva: aplicaciones intencionalmente vulnerables en contenedores Docker aislados para practicar CTF.',
        stack: 'Flask, Docker, TypeScript',
        link: { label: 'github.com/markmysler/dvc', href: repo('dvc') },
      },
      {
        name: 'wpair-cli',
        desc: 'Escáner defensivo para CVE-2025-36911, una vulnerabilidad Bluetooth de Google Fast Pair.',
        stack: 'Python',
        link: { label: 'github.com/markmysler/wpair-cli', href: repo('wpair-cli') },
      },
      {
        name: 'snake-ai',
        desc: 'Un laboratorio donde redes aprenden a jugar al Snake (algoritmo genético, DQN, agente LLM), con un curso de 9 lecciones.',
        stack: 'Python',
        link: { label: 'github.com/markmysler/snake-ai', href: repo('snake-ai') },
      },
    ],
    educationTitle: 'Educación',
    education: [
      'Ingeniería en Informática, Universidad de Belgrano, Buenos Aires · mar. 2025 – 2029 (previsto)',
      'Certificación Profesional en Inteligencia Artificial, ITBA · abr. – jul. 2024',
    ],
    certsTitle: 'Certificaciones',
    certs: ['ISC2 Certified in Cybersecurity (CC) · oct. 2024', 'Fundamentos de Hacking y Defensa (FOHD), Ekoparty Hackademy · ene. 2026'],
    awardsTitle: 'Premios',
    awards: [
      'Finalista (top 10), UC Berkeley Innovation Intelligence Hackathon, SCET y DECODE · oct. 2026',
      'Premio a la Excelencia Académica, Rotary Club Belgrano, por uno de los mejores promedios de primer año de Ingeniería en Informática en la Universidad de Belgrano · sep. 2026',
    ],
    skillsTitle: 'Habilidades',
    skills: [
      ['Lenguajes', 'Python, TypeScript, JavaScript, SQL, C#'],
      ['Backend', 'FastAPI, Django REST Framework, Flask, Node.js, APIs REST, WebSockets, Keycloak'],
      ['Nube y DevOps', 'AWS (Lambda, SQS, EventBridge, RDS, S3, CloudFront, Cognito), Terraform, Docker, Nginx, GitLab CI, GitHub Actions, Linux'],
      ['Datos e IA', 'PostgreSQL, pgvector, Supabase, Firebase, LLMs, LangGraph, embeddings, HDBSCAN, evaluación de LLMs'],
      ['Frontend', 'React, Next.js, Vue 3, Nuxt, Angular, Tailwind CSS'],
      ['Seguridad', 'Hacking ético, evaluación de vulnerabilidades, seguridad de redes, autenticación y control de acceso'],
    ],
    languagesTitle: 'Idiomas',
    languages: 'Español (nativo), inglés (nativo)',
    playCta: '¿Preferís explorar? Entrá a la estación',
  },
};
