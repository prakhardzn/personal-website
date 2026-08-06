export type ExploreCategoryKey =
  | "planets"
  | "zodiac-signs"
  | "nakshatras"
  | "houses";


export type AstrologySectionKey =
  | "case-studies"
  | "questions"
  | "blogs";


export interface AstrologyFact {
  label: string;
  value: string;
}


export interface AstrologyEntrySection {
  heading: string;
  body: string;
}


export interface AstrologyEntry {
  slug: string;
  name: string;
  alternate?: string;
  subtitle: string;
  summary: string;
  keywords: string[];
  facts: AstrologyFact[];
  sections: AstrologyEntrySection[];
  background: string;
  border: string;
}


export interface AstrologyCategory {
  key: ExploreCategoryKey;
  number: string;
  label: string;
  singularLabel: string;
  eyebrow: string;
  description: string;
  shortDescription: string;
  href: string;
  entries: AstrologyEntry[];
  background: string;
  border: string;
}


export interface AstrologyArticle {
  slug: string;
  number: string;
  title: string;
  eyebrow: string;
  summary: string;
  status: string;
  date: string;
  readTime: string;
  paragraphs: string[];
  takeaways: string[];
  background: string;
  border: string;
}


export interface AstrologyArticleCollection {
  key: AstrologySectionKey;
  label: string;
  singularLabel: string;
  eyebrow: string;
  description: string;
  entries: AstrologyArticle[];
}


const palettes = [
  {
    background: "#8e3033",
    border: "#ff7278",
  },
  {
    background: "#214d65",
    border: "#6bdcff",
  },
  {
    background: "#56366a",
    border: "#d49dff",
  },
  {
    background: "#275241",
    border: "#65efae",
  },
  {
    background: "#715025",
    border: "#ffc968",
  },
  {
    background: "#55283e",
    border: "#ff78b4",
  },
];


function getPalette(
  index: number
): {
  background: string;
  border: string;
} {
  return palettes[
    index % palettes.length
  ];
}


interface EntryInput {
  slug: string;
  name: string;
  alternate?: string;
  subtitle: string;
  summary: string;
  keywords: string[];
  facts: AstrologyFact[];
  sections?: AstrologyEntrySection[];
}


function createEntry(
  input: EntryInput,
  index: number
): AstrologyEntry {
  const palette =
    getPalette(index);


  return {
    ...input,

    sections:
      input.sections ?? [
        {
          heading: "Overview",

          body:
            `${input.name} can be studied through its core themes, symbolic associations and relationship with the rest of the birth chart.`,
        },

        {
          heading: "What to observe",

          body:
            `Look at placement, rulership, aspects, dignity and repetition before drawing a conclusion. One placement should never be interpreted completely on its own.`,
        },

        {
          heading: "Creative note",

          body:
            `This entry can later include personal observations, chart examples, film-character references and visual diagrams.`,
        },
      ],

    background:
      palette.background,

    border:
      palette.border,
  };
}


/* =========================================================
   PLANETS
========================================================= */

const planetEntries: AstrologyEntry[] = [
  createEntry(
    {
      slug: "sun",
      name: "Sun",
      alternate: "Surya",
      subtitle:
        "Identity · vitality · authority · purpose",
      summary:
        "The Sun represents identity, direction, visibility, vitality and the need to develop a stable sense of purpose.",
      keywords: [
        "identity",
        "authority",
        "purpose",
        "vitality",
      ],
      facts: [
        {
          label: "TYPE",
          value: "Luminary",
        },
        {
          label: "RULERSHIP",
          value: "Leo",
        },
        {
          label: "DAY",
          value: "Sunday",
        },
      ],
    },
    0
  ),

  createEntry(
    {
      slug: "moon",
      name: "Moon",
      alternate: "Chandra",
      subtitle:
        "Mind · emotion · memory · care",
      summary:
        "The Moon describes emotional responses, habits, memory, comfort, instinct and the way a person processes experience.",
      keywords: [
        "mind",
        "emotion",
        "memory",
        "comfort",
      ],
      facts: [
        {
          label: "TYPE",
          value: "Luminary",
        },
        {
          label: "RULERSHIP",
          value: "Cancer",
        },
        {
          label: "DAY",
          value: "Monday",
        },
      ],
    },
    1
  ),

  createEntry(
    {
      slug: "mars",
      name: "Mars",
      alternate: "Mangala",
      subtitle:
        "Action · courage · conflict · drive",
      summary:
        "Mars shows how energy is directed, how conflict is approached and how courage, competition and decisive action operate.",
      keywords: [
        "action",
        "courage",
        "drive",
        "conflict",
      ],
      facts: [
        {
          label: "TYPE",
          value: "Planet",
        },
        {
          label: "RULERSHIP",
          value: "Aries and Scorpio",
        },
        {
          label: "DAY",
          value: "Tuesday",
        },
      ],
    },
    2
  ),

  createEntry(
    {
      slug: "mercury",
      name: "Mercury",
      alternate: "Budha",
      subtitle:
        "Speech · intellect · learning · analysis",
      summary:
        "Mercury describes communication, learning, pattern recognition, language, negotiation, curiosity and practical intelligence.",
      keywords: [
        "speech",
        "learning",
        "analysis",
        "communication",
      ],
      facts: [
        {
          label: "TYPE",
          value: "Planet",
        },
        {
          label: "RULERSHIP",
          value: "Gemini and Virgo",
        },
        {
          label: "DAY",
          value: "Wednesday",
        },
      ],
    },
    3
  ),

  createEntry(
    {
      slug: "jupiter",
      name: "Jupiter",
      alternate: "Guru / Brihaspati",
      subtitle:
        "Wisdom · expansion · belief · teaching",
      summary:
        "Jupiter represents growth, knowledge, belief systems, guidance, generosity, teaching and the search for meaning.",
      keywords: [
        "wisdom",
        "growth",
        "belief",
        "teaching",
      ],
      facts: [
        {
          label: "TYPE",
          value: "Planet",
        },
        {
          label: "RULERSHIP",
          value: "Sagittarius and Pisces",
        },
        {
          label: "DAY",
          value: "Thursday",
        },
      ],
    },
    4
  ),

  createEntry(
    {
      slug: "venus",
      name: "Venus",
      alternate: "Shukra",
      subtitle:
        "Relationships · beauty · value · pleasure",
      summary:
        "Venus describes relationships, attraction, aesthetics, pleasure, artistic sensitivity, agreements and personal values.",
      keywords: [
        "relationships",
        "beauty",
        "value",
        "pleasure",
      ],
      facts: [
        {
          label: "TYPE",
          value: "Planet",
        },
        {
          label: "RULERSHIP",
          value: "Taurus and Libra",
        },
        {
          label: "DAY",
          value: "Friday",
        },
      ],
    },
    5
  ),

  createEntry(
    {
      slug: "saturn",
      name: "Saturn",
      alternate: "Shani",
      subtitle:
        "Time · discipline · duty · limitation",
      summary:
        "Saturn represents time, effort, responsibility, delay, boundaries, consequences and the structures built through repetition.",
      keywords: [
        "time",
        "discipline",
        "duty",
        "limits",
      ],
      facts: [
        {
          label: "TYPE",
          value: "Planet",
        },
        {
          label: "RULERSHIP",
          value: "Capricorn and Aquarius",
        },
        {
          label: "DAY",
          value: "Saturday",
        },
      ],
    },
    0
  ),

  createEntry(
    {
      slug: "rahu",
      name: "Rahu",
      alternate: "North Lunar Node",
      subtitle:
        "Desire · amplification · obsession · unfamiliarity",
      summary:
        "Rahu can describe intense desire, amplification, unfamiliar experiences, ambition and the urge to move beyond established boundaries.",
      keywords: [
        "desire",
        "amplification",
        "obsession",
        "ambition",
      ],
      facts: [
        {
          label: "TYPE",
          value: "Lunar node",
        },
        {
          label: "MOVEMENT",
          value: "Retrograde",
        },
        {
          label: "AXIS",
          value: "Opposite Ketu",
        },
      ],
    },
    1
  ),

  createEntry(
    {
      slug: "ketu",
      name: "Ketu",
      alternate: "South Lunar Node",
      subtitle:
        "Detachment · release · memory · inwardness",
      summary:
        "Ketu can describe separation, detachment, old patterns, inward experience and areas where external certainty becomes difficult.",
      keywords: [
        "detachment",
        "release",
        "memory",
        "inwardness",
      ],
      facts: [
        {
          label: "TYPE",
          value: "Lunar node",
        },
        {
          label: "MOVEMENT",
          value: "Retrograde",
        },
        {
          label: "AXIS",
          value: "Opposite Rahu",
        },
      ],
    },
    2
  ),
];


/* =========================================================
   ZODIAC SIGNS
========================================================= */

const zodiacData = [
  {
    slug: "aries",
    name: "Aries",
    alternate: "Mesha",
    element: "Fire",
    modality: "Cardinal",
    ruler: "Mars",
    keywords: [
      "initiative",
      "action",
      "directness",
    ],
  },
  {
    slug: "taurus",
    name: "Taurus",
    alternate: "Vrishabha",
    element: "Earth",
    modality: "Fixed",
    ruler: "Venus",
    keywords: [
      "stability",
      "resources",
      "persistence",
    ],
  },
  {
    slug: "gemini",
    name: "Gemini",
    alternate: "Mithuna",
    element: "Air",
    modality: "Mutable",
    ruler: "Mercury",
    keywords: [
      "curiosity",
      "language",
      "adaptability",
    ],
  },
  {
    slug: "cancer",
    name: "Cancer",
    alternate: "Karka",
    element: "Water",
    modality: "Cardinal",
    ruler: "Moon",
    keywords: [
      "care",
      "memory",
      "protection",
    ],
  },
  {
    slug: "leo",
    name: "Leo",
    alternate: "Simha",
    element: "Fire",
    modality: "Fixed",
    ruler: "Sun",
    keywords: [
      "expression",
      "visibility",
      "leadership",
    ],
  },
  {
    slug: "virgo",
    name: "Virgo",
    alternate: "Kanya",
    element: "Earth",
    modality: "Mutable",
    ruler: "Mercury",
    keywords: [
      "analysis",
      "craft",
      "refinement",
    ],
  },
  {
    slug: "libra",
    name: "Libra",
    alternate: "Tula",
    element: "Air",
    modality: "Cardinal",
    ruler: "Venus",
    keywords: [
      "balance",
      "relationships",
      "negotiation",
    ],
  },
  {
    slug: "scorpio",
    name: "Scorpio",
    alternate: "Vrishchika",
    element: "Water",
    modality: "Fixed",
    ruler: "Mars",
    keywords: [
      "intensity",
      "transformation",
      "privacy",
    ],
  },
  {
    slug: "sagittarius",
    name: "Sagittarius",
    alternate: "Dhanu",
    element: "Fire",
    modality: "Mutable",
    ruler: "Jupiter",
    keywords: [
      "meaning",
      "exploration",
      "belief",
    ],
  },
  {
    slug: "capricorn",
    name: "Capricorn",
    alternate: "Makara",
    element: "Earth",
    modality: "Cardinal",
    ruler: "Saturn",
    keywords: [
      "structure",
      "responsibility",
      "achievement",
    ],
  },
  {
    slug: "aquarius",
    name: "Aquarius",
    alternate: "Kumbha",
    element: "Air",
    modality: "Fixed",
    ruler: "Saturn",
    keywords: [
      "systems",
      "collectives",
      "distance",
    ],
  },
  {
    slug: "pisces",
    name: "Pisces",
    alternate: "Meena",
    element: "Water",
    modality: "Mutable",
    ruler: "Jupiter",
    keywords: [
      "imagination",
      "sensitivity",
      "surrender",
    ],
  },
] as const;


const zodiacEntries: AstrologyEntry[] =
  zodiacData.map(
    (
      sign,
      index
    ) =>
      createEntry(
        {
          slug:
            sign.slug,

          name:
            sign.name,

          alternate:
            sign.alternate,

          subtitle:
            `${sign.element} · ${sign.modality} · Ruled by ${sign.ruler}`,

          summary:
            `${sign.name} expresses energy through the themes of ${sign.keywords.join(", ")} and is traditionally associated with ${sign.element.toLowerCase()} and ${sign.modality.toLowerCase()} qualities.`,

          keywords: [
            ...sign.keywords,
          ],

          facts: [
            {
              label: "ELEMENT",
              value:
                sign.element,
            },
            {
              label: "MODALITY",
              value:
                sign.modality,
            },
            {
              label: "RULER",
              value:
                sign.ruler,
            },
          ],
        },
        index
      )
  );


/* =========================================================
   NAKSHATRAS
========================================================= */

const nakshatraData = [
  ["ashwini", "Ashwini", "Ketu", "beginnings", "speed", "recovery"],
  ["bharani", "Bharani", "Venus", "responsibility", "containment", "transition"],
  ["krittika", "Krittika", "Sun", "clarity", "separation", "refinement"],
  ["rohini", "Rohini", "Moon", "growth", "beauty", "creation"],
  ["mrigashira", "Mrigashira", "Mars", "searching", "curiosity", "movement"],
  ["ardra", "Ardra", "Rahu", "intensity", "change", "release"],
  ["punarvasu", "Punarvasu", "Jupiter", "return", "renewal", "restoration"],
  ["pushya", "Pushya", "Saturn", "nourishment", "support", "discipline"],
  ["ashlesha", "Ashlesha", "Mercury", "entanglement", "strategy", "perception"],
  ["magha", "Magha", "Ketu", "ancestry", "authority", "legacy"],
  ["purva-phalguni", "Purva Phalguni", "Venus", "pleasure", "creativity", "rest"],
  ["uttara-phalguni", "Uttara Phalguni", "Sun", "agreements", "support", "continuity"],
  ["hasta", "Hasta", "Moon", "skill", "craft", "control"],
  ["chitra", "Chitra", "Mars", "design", "form", "brilliance"],
  ["swati", "Swati", "Rahu", "independence", "movement", "adaptation"],
  ["vishakha", "Vishakha", "Jupiter", "focus", "ambition", "achievement"],
  ["anuradha", "Anuradha", "Saturn", "friendship", "devotion", "cooperation"],
  ["jyeshtha", "Jyeshtha", "Mercury", "seniority", "protection", "responsibility"],
  ["mula", "Mula", "Ketu", "roots", "investigation", "dismantling"],
  ["purva-ashadha", "Purva Ashadha", "Venus", "conviction", "renewal", "declaration"],
  ["uttara-ashadha", "Uttara Ashadha", "Sun", "endurance", "principle", "victory"],
  ["shravana", "Shravana", "Moon", "listening", "learning", "transmission"],
  ["dhanishta", "Dhanishta", "Mars", "rhythm", "resources", "participation"],
  ["shatabhisha", "Shatabhisha", "Rahu", "privacy", "healing", "systems"],
  ["purva-bhadrapada", "Purva Bhadrapada", "Jupiter", "intensity", "idealism", "transformation"],
  ["uttara-bhadrapada", "Uttara Bhadrapada", "Saturn", "depth", "stability", "reflection"],
  ["revati", "Revati", "Mercury", "completion", "guidance", "safe passage"],
] as const;


const nakshatraEntries: AstrologyEntry[] =
  nakshatraData.map(
    (
      [
        slug,
        name,
        ruler,
        firstKeyword,
        secondKeyword,
        thirdKeyword,
      ],
      index
    ) =>
      createEntry(
        {
          slug,
          name,

          alternate:
            `Nakshatra ${String(
              index + 1
            ).padStart(
              2,
              "0"
            )}`,

          subtitle:
            `Ruled by ${ruler}`,

          summary:
            `${name} can be explored through the themes of ${firstKeyword}, ${secondKeyword} and ${thirdKeyword}.`,

          keywords: [
            firstKeyword,
            secondKeyword,
            thirdKeyword,
          ],

          facts: [
            {
              label: "SEQUENCE",
              value:
                `${index + 1} of 27`,
            },
            {
              label: "RULER",
              value:
                ruler,
            },
            {
              label: "CATEGORY",
              value:
                "Lunar mansion",
            },
          ],
        },
        index
      )
  );


/* =========================================================
   HOUSES
========================================================= */

const houseData = [
  {
    slug: "first-house",
    name: "First House",
    alternate: "Self and identity",
    keywords: [
      "body",
      "appearance",
      "beginnings",
      "identity",
    ],
  },
  {
    slug: "second-house",
    name: "Second House",
    alternate: "Resources and values",
    keywords: [
      "speech",
      "family",
      "money",
      "possessions",
    ],
  },
  {
    slug: "third-house",
    name: "Third House",
    alternate: "Communication and effort",
    keywords: [
      "skills",
      "writing",
      "siblings",
      "courage",
    ],
  },
  {
    slug: "fourth-house",
    name: "Fourth House",
    alternate: "Home and foundations",
    keywords: [
      "home",
      "mother",
      "comfort",
      "inner life",
    ],
  },
  {
    slug: "fifth-house",
    name: "Fifth House",
    alternate: "Creativity and expression",
    keywords: [
      "creativity",
      "children",
      "romance",
      "intelligence",
    ],
  },
  {
    slug: "sixth-house",
    name: "Sixth House",
    alternate: "Work and problem-solving",
    keywords: [
      "routine",
      "service",
      "health",
      "conflict",
    ],
  },
  {
    slug: "seventh-house",
    name: "Seventh House",
    alternate: "Partnership and exchange",
    keywords: [
      "relationships",
      "contracts",
      "partners",
      "public interaction",
    ],
  },
  {
    slug: "eighth-house",
    name: "Eighth House",
    alternate: "Transformation and shared matters",
    keywords: [
      "change",
      "secrets",
      "shared resources",
      "vulnerability",
    ],
  },
  {
    slug: "ninth-house",
    name: "Ninth House",
    alternate: "Belief and higher learning",
    keywords: [
      "philosophy",
      "teachers",
      "travel",
      "meaning",
    ],
  },
  {
    slug: "tenth-house",
    name: "Tenth House",
    alternate: "Career and public role",
    keywords: [
      "career",
      "responsibility",
      "reputation",
      "authority",
    ],
  },
  {
    slug: "eleventh-house",
    name: "Eleventh House",
    alternate: "Networks and aspirations",
    keywords: [
      "friends",
      "communities",
      "gains",
      "long-term goals",
    ],
  },
  {
    slug: "twelfth-house",
    name: "Twelfth House",
    alternate: "Retreat and release",
    keywords: [
      "solitude",
      "loss",
      "imagination",
      "withdrawal",
    ],
  },
] as const;


const houseEntries: AstrologyEntry[] =
  houseData.map(
    (
      house,
      index
    ) =>
      createEntry(
        {
          slug:
            house.slug,

          name:
            house.name,

          alternate:
            house.alternate,

          subtitle:
            house.keywords.join(
              " · "
            ),

          summary:
            `${house.name} focuses on ${house.keywords.join(", ")} and the way these areas become active inside a birth chart.`,

          keywords: [
            ...house.keywords,
          ],

          facts: [
            {
              label: "HOUSE",
              value:
                `${index + 1} of 12`,
            },
            {
              label: "TYPE",
              value:
                index % 3 === 0
                  ? "Angular"
                  : index % 3 === 1
                    ? "Succedent"
                    : "Cadent",
            },
            {
              label: "FOCUS",
              value:
                house.alternate,
            },
          ],
        },
        index
      )
  );


/* =========================================================
   EXPLORE CATEGORIES
========================================================= */

export const astrologyCategories:
AstrologyCategory[] = [
  {
    key: "planets",
    number: "ASTRO FILE 001",
    label: "Planets",
    singularLabel: "Planet",
    eyebrow: "NAVAGRAHA ARCHIVE",
    description:
      "Explore nine planetary forces, their significations, rulerships and relationships inside a birth chart.",
    shortDescription:
      "Nine planetary forces and their significations.",
    href:
      "/astrology/explore/planets",
    entries:
      planetEntries,
    background:
      "#8e3033",
    border:
      "#ff7278",
  },

  {
    key: "zodiac-signs",
    number: "ASTRO FILE 002",
    label: "Zodiac Signs",
    singularLabel: "Zodiac sign",
    eyebrow: "SIGN ARCHIVE",
    description:
      "Explore twelve zodiac signs through element, modality, rulership and recurring behavioural themes.",
    shortDescription:
      "Twelve signs and the ways energy is expressed.",
    href:
      "/astrology/explore/zodiac-signs",
    entries:
      zodiacEntries,
    background:
      "#214d65",
    border:
      "#6bdcff",
  },

  {
    key: "nakshatras",
    number: "ASTRO FILE 003",
    label: "Nakshatras",
    singularLabel: "Nakshatra",
    eyebrow: "LUNAR ARCHIVE",
    description:
      "Explore twenty-seven lunar constellations through their ruling planets, symbolic tone and interpretive themes.",
    shortDescription:
      "Twenty-seven lunar constellations and their symbolism.",
    href:
      "/astrology/explore/nakshatras",
    entries:
      nakshatraEntries,
    background:
      "#56366a",
    border:
      "#d49dff",
  },

  {
    key: "houses",
    number: "ASTRO FILE 004",
    label: "Houses",
    singularLabel: "House",
    eyebrow: "BHAVA ARCHIVE",
    description:
      "Explore twelve houses and the different areas of life represented inside a birth chart.",
    shortDescription:
      "Twelve areas of life represented in a chart.",
    href:
      "/astrology/explore/houses",
    entries:
      houseEntries,
    background:
      "#275241",
    border:
      "#65efae",
  },
];


/* =========================================================
   CASE STUDIES
========================================================= */

const caseStudies: AstrologyArticle[] = [
  {
    slug:
      "career-patterns",

    number:
      "CASE FILE 001",

    title:
      "Reading Career Patterns",

    eyebrow:
      "BIRTH CHART CASE STUDY",

    summary:
      "A structured way to examine career themes without relying on a single planet, sign or house.",

    status:
      "STARTER",

    date:
      "AUGUST 2026",

    readTime:
      "7 MIN READ",

    paragraphs: [
      "Career analysis becomes clearer when several repeating signals point toward the same theme. The tenth house is important, but it should not be read in isolation.",

      "This case study begins with the tenth house, its ruler and the planets influencing it. It then compares those observations with the second, sixth and eleventh houses.",

      "The goal is not to predict one permanent profession. The goal is to understand patterns involving responsibility, skill, resources, public visibility and motivation.",
    ],

    takeaways: [
      "Look for repetition across several chart factors.",
      "Separate personal ambition from external expectations.",
      "Avoid reducing career analysis to one placement.",
    ],

    background:
      "#8e3033",

    border:
      "#ff7278",
  },

  {
    slug:
      "saturn-and-repetition",

    number:
      "CASE FILE 002",

    title:
      "Saturn and Repetition",

    eyebrow:
      "PATTERN CASE STUDY",

    summary:
      "An examination of how repetition, delay and responsibility can appear through Saturn-related chart patterns.",

    status:
      "STARTER",

    date:
      "AUGUST 2026",

    readTime:
      "6 MIN READ",

    paragraphs: [
      "Saturn is often described only through fear, punishment or delay. This misses its relationship with structure, time and repeated effort.",

      "A useful Saturn analysis asks what must be practised, where responsibility keeps returning and which boundaries cannot be avoided.",

      "The same Saturn placement can feel restrictive at one stage of life and stabilising at another.",
    ],

    takeaways: [
      "Delay and denial are not always the same thing.",
      "Repetition can gradually become competence.",
      "Context changes how Saturn is experienced.",
    ],

    background:
      "#214d65",

    border:
      "#6bdcff",
  },

  {
    slug:
      "fictional-character-archetypes",

    number:
      "CASE FILE 003",

    title:
      "A Fictional Character Reading",

    eyebrow:
      "STORYTELLING CASE STUDY",

    summary:
      "Using astrological archetypes to analyse motivation, conflict and transformation in a fictional character.",

    status:
      "EXPERIMENT",

    date:
      "AUGUST 2026",

    readTime:
      "5 MIN READ",

    paragraphs: [
      "A fictional character does not need an official birth chart for astrology to become a useful storytelling tool.",

      "Planetary and zodiac archetypes can be used to study what a character wants, what they fear and how they respond to conflict.",

      "This approach is interpretive rather than literal. It works best when it deepens the story instead of replacing ordinary character analysis.",
    ],

    takeaways: [
      "Begin with motivation rather than labels.",
      "Use archetypes to add contrast and conflict.",
      "Let the story remain more important than the system.",
    ],

    background:
      "#56366a",

    border:
      "#d49dff",
  },
];


/* =========================================================
   QUESTIONS
========================================================= */

const questions: AstrologyArticle[] = [
  {
    slug:
      "why-do-i-abandon-projects",

    number:
      "QUESTION FILE 001",

    title:
      "Why Do I Abandon Projects After Starting Them?",

    eyebrow:
      "CHART QUESTION",

    summary:
      "A focused way to examine motivation, repetition, attention and unfinished creative work through a birth chart.",

    status:
      "ANSWERED",

    date:
      "AUGUST 2026",

    readTime:
      "4 MIN READ",

    paragraphs: [
      "This question should not be answered through one placement. Motivation can involve Mars, the Moon, Mercury, the fifth house, the sixth house and Saturn.",

      "The first step is to separate excitement from endurance. Some placements describe the beginning of an idea, while others describe the ability to organise and complete it.",

      "The chart can help identify patterns, but it cannot replace practical systems, realistic timelines and honest reflection.",
    ],

    takeaways: [
      "Starting energy and finishing energy are different.",
      "Look for repeated themes rather than one placement.",
      "Astrology should support practical action.",
    ],

    background:
      "#275241",

    border:
      "#65efae",
  },

  {
    slug:
      "is-saturn-always-negative",

    number:
      "QUESTION FILE 002",

    title:
      "Is Saturn Always Negative?",

    eyebrow:
      "BEGINNER QUESTION",

    summary:
      "A simple explanation of why Saturn cannot be understood only as punishment, delay or bad luck.",

    status:
      "ANSWERED",

    date:
      "AUGUST 2026",

    readTime:
      "3 MIN READ",

    paragraphs: [
      "Saturn can describe limitation, delay and pressure, but it can also describe endurance, responsibility, maturity and structure.",

      "A difficult Saturn period may expose weak systems. The same process can eventually create stronger boundaries and greater competence.",

      "The result depends on placement, rulership, timing, context and the choices made by the person.",
    ],

    takeaways: [
      "Saturn is not automatically negative.",
      "Structure can feel uncomfortable before it feels useful.",
      "Context matters more than a single keyword.",
    ],

    background:
      "#715025",

    border:
      "#ffc968",
  },

  {
    slug:
      "what-does-a-strong-moon-mean",

    number:
      "QUESTION FILE 003",

    title:
      "What Does a Strong Moon Mean?",

    eyebrow:
      "PLACEMENT QUESTION",

    summary:
      "A beginner-friendly look at emotional regulation, memory, care and instinct through the Moon.",

    status:
      "ANSWERED",

    date:
      "AUGUST 2026",

    readTime:
      "4 MIN READ",

    paragraphs: [
      "A strong Moon does not simply mean that a person is emotional. It may describe greater access to instinct, care, memory and emotional awareness.",

      "Strength should be examined through sign, house, dignity, aspects, lunar phase and the broader chart.",

      "Emotional sensitivity can become supportive or overwhelming depending on context and regulation.",
    ],

    takeaways: [
      "Sensitivity and instability are not the same thing.",
      "The Moon must be interpreted in context.",
      "Emotional awareness can become a practical strength.",
    ],

    background:
      "#55283e",

    border:
      "#ff78b4",
  },
];


/* =========================================================
   BLOGS
========================================================= */

const blogs: AstrologyArticle[] = [
  {
    slug:
      "saturn-is-not-only-punishment",

    number:
      "BLOG FILE 001",

    title:
      "Saturn Is Not Only a Punishment Planet",

    eyebrow:
      "ASTROLOGY BLOG",

    summary:
      "Why fear-based interpretations of Saturn often miss its relationship with time, craft and responsibility.",

    status:
      "NEW",

    date:
      "AUGUST 2026",

    readTime:
      "6 MIN READ",

    paragraphs: [
      "Saturn is one of the easiest planets to describe dramatically. Words like delay, restriction and punishment immediately create fear.",

      "But Saturn also appears wherever repetition becomes skill, responsibility becomes authority and limitation creates form.",

      "A balanced interpretation should make room for difficulty without treating difficulty as permanent doom.",
    ],

    takeaways: [
      "Avoid interpretations built only around fear.",
      "Saturn can describe mastery through repetition.",
      "Difficulty and meaning can exist together.",
    ],

    background:
      "#8e3033",

    border:
      "#ff7278",
  },

  {
    slug:
      "reading-a-chart-without-reading-everything",

    number:
      "BLOG FILE 002",

    title:
      "Reading a Chart Without Reading Everything",

    eyebrow:
      "LEARNING NOTE",

    summary:
      "A practical method for avoiding information overload when beginning a birth-chart interpretation.",

    status:
      "NEW",

    date:
      "AUGUST 2026",

    readTime:
      "5 MIN READ",

    paragraphs: [
      "A chart becomes overwhelming when every planet, house, sign and aspect is given equal importance at the same time.",

      "A better approach begins with the question being asked. The reader can then identify the few chart factors directly connected with that question.",

      "After those factors are understood, supporting placements can be added gradually.",
    ],

    takeaways: [
      "Begin with the question.",
      "Prioritise before adding detail.",
      "Repetition is more useful than isolated symbolism.",
    ],

    background:
      "#214d65",

    border:
      "#6bdcff",
  },

  {
    slug:
      "astrology-and-character-writing",

    number:
      "BLOG FILE 003",

    title:
      "Astrology and Character Writing",

    eyebrow:
      "STORYTELLING BLOG",

    summary:
      "How planetary archetypes can help create fictional characters without turning them into stereotypes.",

    status:
      "ARCHIVED",

    date:
      "JULY 2026",

    readTime:
      "7 MIN READ",

    paragraphs: [
      "Astrology becomes useful for writing when it creates questions rather than fixed answers.",

      "Mars can suggest how a character acts under pressure. Saturn can suggest where fear, duty or delay becomes important. Venus can suggest what the character values.",

      "A character becomes believable when several impulses conflict with one another.",
    ],

    takeaways: [
      "Use astrology to create tension, not stereotypes.",
      "Contradictory traits make characters more human.",
      "The character must remain larger than the archetype.",
    ],

    background:
      "#56366a",

    border:
      "#d49dff",
  },
];


/* =========================================================
   ARTICLE COLLECTIONS
========================================================= */

export const astrologyArticleCollections:
Record<
  AstrologySectionKey,
  AstrologyArticleCollection
> = {
  "case-studies": {
    key:
      "case-studies",

    label:
      "Case Studies",

    singularLabel:
      "Case study",

    eyebrow:
      "APPLIED ASTROLOGY",

    description:
      "Detailed investigations that demonstrate how several chart factors can be interpreted together.",

    entries:
      caseStudies,
  },

  questions: {
    key:
      "questions",

    label:
      "Questions",

    singularLabel:
      "Question",

    eyebrow:
      "FOCUSED ANSWERS",

    description:
      "Specific astrological questions answered in a direct and conversational format.",

    entries:
      questions,
  },

  blogs: {
    key:
      "blogs",

    label:
      "Blogs",

    singularLabel:
      "Blog",

    eyebrow:
      "LONG-FORM TRANSMISSIONS",

    description:
      "Long-form writing about astrology, storytelling, learning and interpretation.",

    entries:
      blogs,
  },
};