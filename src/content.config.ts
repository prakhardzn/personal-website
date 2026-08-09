import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";


/* =========================================================
   WORK / PORTFOLIO
========================================================= */

const work = defineCollection({
  loader: glob({
    base: "./src/content/work",
    pattern: "**/*.md",
  }),

  schema: z.object({
    number: z.string(),

    title: z.string(),

    metadata: z.string(),

    description: z.string(),

    status: z.string(),

    statusType: z.enum([
      "completed",
      "working",
    ]),

    order: z.number(),

    draft: z.boolean(),

    /* -----------------------------------------------------
       YOUTUBE VIDEO
    ----------------------------------------------------- */

    youtubeUrl: z
      .string()
      .default(""),

    /* -----------------------------------------------------
       LOCAL VIDEO

       Example:
       /assets/work/zoo-title-sequence/zoo-title-sequence.mp4
    ----------------------------------------------------- */

    localVideo: z
      .string()
      .default(""),

    videoTitle: z
      .string()
      .default(""),

    /* -----------------------------------------------------
       PROJECT GALLERY
    ----------------------------------------------------- */

    gallery: z
      .array(
        z.object({
          src: z.string(),

          alt: z.string(),

          caption: z
            .string()
            .default(""),

          orientation: z
            .enum([
              "landscape",
              "portrait",
              "square",
            ])
            .default("landscape"),
        })
      )
      .default([]),
  }),
});


/* =========================================================
   MOVIES
========================================================= */

const movies = defineCollection({
  loader: glob({
    base: "./src/content/movies",
    pattern: "**/*.md",
  }),

  schema: z.object({
    title: z.string(),

    year: z.string(),

    imdbId: z.string(),

    director: z
      .string()
      .nullable()
      .default(null),

    runtime: z
      .string()
      .nullable()
      .default(null),

    genre: z
      .array(z.string())
      .default([]),

    actors: z
      .array(z.string())
      .default([]),

    plot: z
      .string()
      .nullable()
      .default(null),

    language: z
      .array(z.string())
      .default([]),

    country: z
      .array(z.string())
      .default([]),

    awards: z
      .string()
      .nullable()
      .default(null),

    poster: z
      .string()
      .nullable()
      .default(null),

    imdbRating: z
      .string()
      .nullable()
      .default(null),

    imdbVotes: z
      .string()
      .nullable()
      .default(null),

    rated: z
      .string()
      .nullable()
      .default(null),

    released: z
      .string()
      .nullable()
      .default(null),

    type: z
      .string()
      .default("movie"),

    status: z
      .enum([
        "watched",
        "watchlist",
      ])
      .default("watchlist"),

    favourite: z
      .boolean()
      .default(false),

    myRating: z
      .number()
      .min(0)
      .max(10)
      .nullable()
      .default(null),

    shelf: z
      .string()
      .default("Unsorted"),

    tags: z
      .array(z.string())
      .default([]),

    addedAt: z.string(),
  }),
});


/* =========================================================
   MUSIC
========================================================= */

const music = defineCollection({
  loader: glob({
    base: "./src/content/music",
    pattern: "**/*.md",
  }),

  schema: z.object({
    title: z.string(),

    artist: z.string(),

    album: z
      .string()
      .nullable()
      .default(null),

    year: z
      .string()
      .nullable()
      .default(null),

    recordingId: z.string(),

    artistId: z.string(),

    releaseId: z
      .string()
      .nullable()
      .default(null),

    releaseGroupId: z
      .string()
      .nullable()
      .default(null),

    durationMs: z
      .number()
      .nullable()
      .default(null),

    cover: z
      .string()
      .nullable()
      .default(null),

    status: z
      .enum([
        "saved",
        "discover-later",
      ])
      .default("saved"),

    favourite: z
      .boolean()
      .default(false),

    myRating: z
      .number()
      .min(0)
      .max(10)
      .nullable()
      .default(null),

    shelf: z
      .string()
      .default("Unsorted"),

    tags: z
      .array(z.string())
      .default([]),

    addedAt: z.string(),
  }),
});


/* =========================================================
   MASTER REGISTRY
========================================================= */

export const collections = {
  work,
  movies,
  music,
};