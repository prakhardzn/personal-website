export type WeeklyCardVariant =
  | "one"
  | "two"
  | "three";

export type WeeklyPostStatus =
  | "NEW"
  | "ARCHIVED";

export type WeeklyPostStatusTone =
  | "new"
  | "archived";

export interface WeeklyPost {
  number: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
  status: WeeklyPostStatus;
  statusTone: WeeklyPostStatusTone;

  /*
    Preserved so any older code that still refers to
    card variants does not break.
  */
  variant: WeeklyCardVariant;
}

export const weeklyPosts: WeeklyPost[] = [
  {
    number: "WEEKLY FILE 001",

    slug: "spiderman-bnd-review",

    title: "Spider-Man BND Review",

    summary:
      "A closer look at Spider-Man: Brand New Day, what its title could mean and where the next film might take Peter Parker.",

    category: "MOVIE BREAKDOWN",

    date: "AUGUST 2026",

    readTime: "6 MIN READ",

    status: "NEW",

    statusTone: "new",

    variant: "one",
  },

  {
    number: "WEEKLY FILE 002",

    slug: "codes-over-coffee",

    title: "Codes Over Coffee",

    summary:
      "A weekly transmission about learning code, surviving documentation and discovering that most errors are caused by one missing character.",

    category: "THIS WEEK I DISCOVERED",

    date: "AUGUST 2026",

    readTime: "4 MIN READ",

    status: "ARCHIVED",

    statusTone: "archived",

    variant: "two",
  },

  {
    number: "WEEKLY FILE 003",

    slug: "weekend-with-dj",

    title: "Weekend With DJ",

    summary:
      "A small story about music, people, an unusually long weekend and the strange details that remained after everything ended.",

    category: "STORY FROM MY WEEK",

    date: "JULY 2026",

    readTime: "5 MIN READ",

    status: "ARCHIVED",

    statusTone: "archived",

    variant: "three",
  },
];