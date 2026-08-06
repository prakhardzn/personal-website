export type LibraryCategoryKey = "movies" | "games" | "music";

export type LibraryEntryState = "completed" | "pending";

export type LibraryCoverTone =
  | "green"
  | "pink"
  | "cyan"
  | "purple"
  | "yellow"
  | "orange"
  | "blue"
  | "red"
  | "mint";

export interface LibraryFact {
  label: string;
  value: string;
}

export interface LibraryCategory {
  key: LibraryCategoryKey;
  number: string;
  title: string;
  shortTitle: string;
  secondaryLabel: string;
  description: string;
  countLabel: string;
  actionLabel: string;
  systemStatus: string;
  firstStatLabel: string;
  secondStatLabel: string;
  completedFilterLabel: string;
  pendingFilterLabel: string;
}

export interface LibraryEntry {
  id: string;
  category: LibraryCategoryKey;

  title: string;
  creator: string;
  year: string;
  mediaType: string;

  state: LibraryEntryState;
  statusLabel: string;

  favourite: boolean;
  rating: number | null;

  note: string;
  synopsis: string;
  shelf: string;

  coverCode: string;
  coverCaption: string;
  coverTone: LibraryCoverTone;

  tags: string[];
  facts: LibraryFact[];
}

export const libraryCategories: LibraryCategory[] = [
  {
    key: "movies",
    number: "01",
    title: "MOVIE FILES",
    shortTitle: "MOVIES",
    secondaryLabel: "Cinema storage unit",
    description:
      "Films, short films and moving images that survived my attention span.",
    countLabel: "FILES",
    actionLabel: "OPEN MOVIE FILES",
    systemStatus: "PROJECTOR ONLINE",
    firstStatLabel: "WATCHED",
    secondStatLabel: "WATCHLIST",
    completedFilterLabel: "WATCHED",
    pendingFilterLabel: "WATCHLIST",
  },
  {
    key: "games",
    number: "02",
    title: "GAME VAULT",
    shortTitle: "GAMES",
    secondaryLabel: "Interactive memory chamber",
    description:
      "Games I played, completed, abandoned or watched someone else finish.",
    countLabel: "CARTRIDGES",
    actionLabel: "ENTER GAME VAULT",
    systemStatus: "CONTROLLER DETECTED",
    firstStatLabel: "COMPLETED",
    secondStatLabel: "BACKLOG",
    completedFilterLabel: "COMPLETED",
    pendingFilterLabel: "BACKLOG",
  },
  {
    key: "music",
    number: "03",
    title: "AUDIO SIGNALS",
    shortTitle: "MUSIC",
    secondaryLabel: "Unstable frequency archive",
    description:
      "Songs, albums and artists repeatedly transmitted into my headphones.",
    countLabel: "SIGNALS",
    actionLabel: "TUNE INTO SIGNALS",
    systemStatus: "FREQUENCY STABLE",
    firstStatLabel: "SAVED",
    secondStatLabel: "DISCOVER LATER",
    completedFilterLabel: "SAVED",
    pendingFilterLabel: "DISCOVER LATER",
  },
];

export const libraryEntries: LibraryEntry[] = [
  {
    id: "the-truman-show",
    category: "movies",

    title: "The Truman Show",
    creator: "Peter Weir",
    year: "1998",
    mediaType: "FILM",

    state: "completed",
    statusLabel: "WATCHED",

    favourite: true,
    rating: 9,

    note:
      "Made me suspicious of every conveniently placed camera.",

    synopsis:
      "Truman Burbank slowly discovers that his ordinary life may be an enormous television production constructed around him. The film turns a surreal premise into a story about control, performance and the frightening freedom of choosing an uncertain life.",

    shelf: "Films That Stayed With Me",

    coverCode: "TS",
    coverCaption:
      "GOOD AFTERNOON, GOOD EVENING, AND GOOD NIGHT",
    coverTone: "cyan",

    tags: [
      "Satire",
      "Existential",
      "Media",
      "Identity",
    ],

    facts: [
      {
        label: "DIRECTOR",
        value: "Peter Weir",
      },
      {
        label: "FORMAT",
        value: "Feature Film",
      },
      {
        label: "STATUS",
        value: "Watched",
      },
      {
        label: "RATING",
        value: "9 / 10",
      },
    ],
  },

  {
    id: "spider-verse",
    category: "movies",

    title: "Spider-Man: Into the Spider-Verse",
    creator:
      "Bob Persichetti, Peter Ramsey and Rodney Rothman",
    year: "2018",
    mediaType: "FILM",

    state: "completed",
    statusLabel: "WATCHED",

    favourite: true,
    rating: 9,

    note:
      "Proof that an animated frame can have more personality than I do.",

    synopsis:
      "Miles Morales becomes Spider-Man while several alternate Spider-people are pulled into his universe. Its visual language combines comic printing, animation mistakes, halftone textures and expressive frame rates into something that feels genuinely handmade.",

    shelf: "Visually Delicious",

    coverCode: "SV",
    coverCaption: "ANYONE CAN WEAR THE MASK",
    coverTone: "pink",

    tags: [
      "Animation",
      "Superhero",
      "Coming of Age",
      "Multiverse",
    ],

    facts: [
      {
        label: "STUDIO",
        value: "Sony Pictures Animation",
      },
      {
        label: "FORMAT",
        value: "Animated Film",
      },
      {
        label: "STATUS",
        value: "Watched",
      },
      {
        label: "RATING",
        value: "9 / 10",
      },
    ],
  },

  {
    id: "dune-part-two",
    category: "movies",

    title: "Dune: Part Two",
    creator: "Denis Villeneuve",
    year: "2024",
    mediaType: "FILM",

    state: "pending",
    statusLabel: "WATCHLIST",

    favourite: false,
    rating: null,

    note:
      "Currently stored in the part of my brain labelled watch this soon.",

    synopsis:
      "Paul Atreides continues his journey among the Fremen while confronting prophecy, political power and the consequences of revenge. This file is currently waiting for a proper viewing rather than fragmented clips and internet discussions.",

    shelf: "Watchlist Purgatory",

    coverCode: "D2",
    coverCaption: "THE DESERT REMAINS UNBOTHERED",
    coverTone: "orange",

    tags: [
      "Science Fiction",
      "Epic",
      "Politics",
      "Watchlist",
    ],

    facts: [
      {
        label: "DIRECTOR",
        value: "Denis Villeneuve",
      },
      {
        label: "FORMAT",
        value: "Feature Film",
      },
      {
        label: "STATUS",
        value: "Watchlist",
      },
      {
        label: "RATING",
        value: "Unrated",
      },
    ],
  },

  {
    id: "undertale",
    category: "games",

    title: "Undertale",
    creator: "Toby Fox",
    year: "2015",
    mediaType: "GAME",

    state: "completed",
    statusLabel: "COMPLETED",

    favourite: true,
    rating: 10,

    note:
      "A game that made pressing the attack button feel morally suspicious.",

    synopsis:
      "A child falls into an underground world inhabited by monsters. Undertale remembers the player's behaviour, questions familiar role-playing conventions and repeatedly turns jokes into emotional consequences.",

    shelf: "Games That Emotionally Attacked Me",

    coverCode: "UT",
    coverCaption: "THE UNDERGROUND REMEMBERS",
    coverTone: "red",

    tags: [
      "RPG",
      "Choice",
      "Pixel Art",
      "Emotional Damage",
    ],

    facts: [
      {
        label: "CREATOR",
        value: "Toby Fox",
      },
      {
        label: "PLATFORM",
        value: "PC",
      },
      {
        label: "STATUS",
        value: "Completed",
      },
      {
        label: "RATING",
        value: "10 / 10",
      },
    ],
  },

  {
    id: "pokemon-emerald",
    category: "games",

    title: "Pokémon Emerald",
    creator: "Game Freak",
    year: "2004",
    mediaType: "GAME",

    state: "completed",
    statusLabel: "COMPLETED",

    favourite: true,
    rating: 9,

    note:
      "My earliest experience with unpaid wildlife management.",

    synopsis:
      "A journey across the Hoenn region involving badges, rival teams, legendary creatures and an unreasonable amount of time spent deciding which Pokémon deserves the final team slot.",

    shelf: "Games That Raised Me",

    coverCode: "PE",
    coverCaption: "HOENN SAVE FILE DETECTED",
    coverTone: "mint",

    tags: [
      "Pokémon",
      "RPG",
      "Nostalgia",
      "Game Boy Advance",
    ],

    facts: [
      {
        label: "DEVELOPER",
        value: "Game Freak",
      },
      {
        label: "PLATFORM",
        value: "Game Boy Advance",
      },
      {
        label: "STATUS",
        value: "Completed",
      },
      {
        label: "RATING",
        value: "9 / 10",
      },
    ],
  },

  {
    id: "gta-san-andreas",
    category: "games",

    title: "Grand Theft Auto: San Andreas",
    creator: "Rockstar North",
    year: "2004",
    mediaType: "GAME",

    state: "pending",
    statusLabel: "BACKLOG",

    favourite: false,
    rating: null,

    note:
      "Mostly remembered through cheat codes and extremely responsible driving.",

    synopsis:
      "Carl Johnson returns to Los Santos and becomes involved in family conflicts, gang politics and an increasingly absurd chain of missions. My archive mostly remembers chaos, bicycles, jetpacks and cheat-code sheets.",

    shelf: "Return Someday",

    coverCode: "SA",
    coverCaption: "MISSION PROGRESS QUESTIONABLE",
    coverTone: "yellow",

    tags: [
      "Open World",
      "Action",
      "Nostalgia",
      "Backlog",
    ],

    facts: [
      {
        label: "DEVELOPER",
        value: "Rockstar North",
      },
      {
        label: "PLATFORM",
        value: "PC",
      },
      {
        label: "STATUS",
        value: "Backlog",
      },
      {
        label: "RATING",
        value: "Unrated",
      },
    ],
  },

  {
    id: "bohemian-rhapsody",
    category: "music",

    title: "Bohemian Rhapsody",
    creator: "Queen",
    year: "1975",
    mediaType: "TRACK",

    state: "completed",
    statusLabel: "SAVED",

    favourite: true,
    rating: 10,

    note:
      "Six minutes of refusing to select a single genre.",

    synopsis:
      "A theatrical rock composition that moves between ballad, opera and hard rock without behaving like those shifts require permission. It is dramatic, excessive and completely committed to its own strange structure.",

    shelf: "Songs I Never Skip",

    coverCode: "BR",
    coverCaption: "IS THIS THE REAL SIGNAL",
    coverTone: "purple",

    tags: [
      "Rock",
      "Opera",
      "Drama",
      "Queen",
    ],

    facts: [
      {
        label: "ARTIST",
        value: "Queen",
      },
      {
        label: "TYPE",
        value: "Track",
      },
      {
        label: "STATUS",
        value: "Saved",
      },
      {
        label: "RATING",
        value: "10 / 10",
      },
    ],
  },

  {
    id: "random-access-memories",
    category: "music",

    title: "Random Access Memories",
    creator: "Daft Punk",
    year: "2013",
    mediaType: "ALBUM",

    state: "completed",
    statusLabel: "SAVED",

    favourite: true,
    rating: 9,

    note:
      "Music for pretending every ordinary walk has expensive cinematography.",

    synopsis:
      "Daft Punk combines electronic production with live instrumentation, disco and carefully polished nostalgia. The album feels futuristic and strangely old at the same time.",

    shelf: "Main Character Transit Music",

    coverCode: "RAM",
    coverCaption: "GIVE LIFE BACK TO MUSIC",
    coverTone: "yellow",

    tags: [
      "Electronic",
      "Disco",
      "Album",
      "Night Travel",
    ],

    facts: [
      {
        label: "ARTIST",
        value: "Daft Punk",
      },
      {
        label: "TYPE",
        value: "Album",
      },
      {
        label: "STATUS",
        value: "Saved",
      },
      {
        label: "RATING",
        value: "9 / 10",
      },
    ],
  },

  {
    id: "currents",
    category: "music",

    title: "Currents",
    creator: "Tame Impala",
    year: "2015",
    mediaType: "ALBUM",

    state: "pending",
    statusLabel: "DISCOVER LATER",

    favourite: false,
    rating: null,

    note:
      "Filed under albums I keep promising to listen to properly.",

    synopsis:
      "A psychedelic pop album concerned with change, relationships and unstable internal monologues. This file is waiting for a complete uninterrupted listen instead of isolated tracks.",

    shelf: "Future Frequency",

    coverCode: "CU",
    coverCaption: "LET THE SIGNAL HAPPEN",
    coverTone: "blue",

    tags: [
      "Psychedelic",
      "Pop",
      "Album",
      "Discover Later",
    ],

    facts: [
      {
        label: "ARTIST",
        value: "Tame Impala",
      },
      {
        label: "TYPE",
        value: "Album",
      },
      {
        label: "STATUS",
        value: "Discover Later",
      },
      {
        label: "RATING",
        value: "Unrated",
      },
    ],
  },
];

export const defaultLibraryCategory =
  libraryCategories.find(
    (category) => category.key === "movies"
  ) ?? libraryCategories[0];

export const getLibraryEntries = (
  category: LibraryCategoryKey
): LibraryEntry[] => {
  return libraryEntries.filter(
    (entry) => entry.category === category
  );
};