export type WeeklyCardVariant =
  | "one"
  | "two"
  | "three";

export interface WeeklyPost {
  slug: string;
  title: string;
  summary: string;
  variant: WeeklyCardVariant;
}

export const weeklyPosts: WeeklyPost[] = [
  {
    slug: "spiderman-bnd-review",
    title: "Spiderman BND Review",
    summary:
      "A closer look at the film, its ideas, its choices and the things that stayed after the screen went dark.",
    variant: "one",
  },
  {
    slug: "codes-over-coffee",
    title: "Codes Over Coffee",
    summary:
      "Notes from building strange websites, fighting CSS and learning to enjoy the confusion.",
    variant: "two",
  },
  {
    slug: "weekend-with-dj",
    title: "Weekend With DJ",
    summary:
      "A weekly transmission about music, discoveries and whatever survived the weekend.",
    variant: "three",
  },
];