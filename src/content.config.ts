import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
  }),
});

export const collections = {
  work,
};